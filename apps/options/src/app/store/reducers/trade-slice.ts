import { loadState } from "@fantohm/shared-web3";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ethers, BigNumber } from "ethers";
import { loadEnvVariable } from "../../core/constants/network";
import BinaryMarketABI from "../../core/abi/BinaryMarket.json";
import { ContractCallContext, ContractCallResults } from "ethereum-multicall";
import { RootState } from "..";
import { formatUnits } from "ethers/lib/utils";
import {
  calcEpoch,
  getBettingTimeframeWithId,
  getRoundTime,
} from "../../helpers/data-translations";
import { getCurrentPrice } from "../../core/api/price";
import {
  Betting_CryptoCurrencies,
  BettingTimeframes,
  Underlying_Token,
} from "../../core/constants/basic";
import { getUnixTimestampInSeconds } from "../../helpers/axios";
import { getLedger, multicall } from "../../helpers/contractHelpers";
import retry from "async-retry";
import { CryptoCurrency, IBettingTimeframe } from "../../core/types/basic.types";
import { currentNetworkChain } from "../../context/NetworkContext";

const AyncRetryCount = 5;

interface Round {
  epoch: number;
  lockPrice: number;
  closePrice: number;
  position: number;
  amount: number;
  maxAmntLimit?: number;
}

interface OHLCData {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
}
export interface TimeFrame {
  rounds: Round[];
  remainingTime: number;
  isBetting: boolean;
}
export interface TradeData {
  genesisStartTimestamps: Record<string, number>;
  genesisTime: number;
  isInitializing: boolean;
  currentTimeframeId: number;
  timeframe: TimeFrame;
  latestOHLCData: Record<string, OHLCData>;
  underlyingToken: CryptoCurrency;
  maintenanceMode: boolean;
  tradingFee: number;
  userWalletAddress: string;
  operatorWalletBalance: Record<string, number>;
  bettingCryptoCurrencies: Array<CryptoCurrency>;
  bettingTimeframes: Array<IBettingTimeframe>;
}

const defaultRound: Round = {
  epoch: 0,
  lockPrice: 0,
  closePrice: 0,
  position: 0,
  amount: 0,
};

const defaultGenesisTime: Record<string, number> = {};
Betting_CryptoCurrencies.forEach((currency) => {
  defaultGenesisTime[currency.symbol] = 0;
});

const defaultTimeframe: TimeFrame = {
  rounds: [
    { ...defaultRound },
    { ...defaultRound },
    { ...defaultRound },
    { ...defaultRound },
  ],
  isBetting: false,
  remainingTime: 0,
};

let calls = [] as any;

export const loadGenesisTime = createAsyncThunk(
  "trade/loadGenesisTime",
  async (_, { getState, rejectWithValue }) => {
    const currentState = getState() as RootState;
    try {
      const GenesisTimestampABI = [
        {
          inputs: [],
          name: "genesisStartBlockTimestamp",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ];
      const contractCallContext: ContractCallContext[] =
        currentState.trade.bettingCryptoCurrencies.map((currnecy) => ({
          reference: currnecy.symbol,
          contractAddress: loadEnvVariable(
            `NX_BINARY_MARKET_${currentNetworkChain.id}_${currnecy.symbol}_ADDRESS`
          ),
          abi: GenesisTimestampABI,
          calls: [
            {
              reference: "genesisStartBlockTimestamp",
              methodName: "genesisStartBlockTimestamp",
              methodParameters: [],
            },
          ],
        }));

      const results: ContractCallResults = await multicall().call(contractCallContext);
      const genesisStartTimestamps: Record<string, number> = {};

      currentState.trade.bettingCryptoCurrencies.forEach((currency) => {
        const startTime: number = results.results[currency.symbol].callsReturnContext[0]
          .returnValues[0]?.hex
          ? parseInt(
              results.results[currency.symbol].callsReturnContext[0].returnValues[0].hex,
              16
            )
          : 0;
        genesisStartTimestamps[currency.symbol] = startTime;
      });
      return genesisStartTimestamps;
    } catch (error) {
      console.error("trade/loadGenesisTime", error);
      return rejectWithValue("");
    }
  }
);

export const getInitialTimeFrame = createAsyncThunk(
  "trade/getInitialTimeFrame",
  async (_, { getState, rejectWithValue }) => {
    const curState = getState() as RootState;
    const currentTimeframeId = curState.trade.currentTimeframeId;
    const symbol = curState.trade.underlyingToken.symbol;

    const genesisStartTime = curState.trade.genesisTime;

    const currentTime = await getUnixTimestampInSeconds();

    const pricePromisses: Promise<string>[] = [];

    const roundID = calcEpoch(genesisStartTime, currentTime, currentTimeframeId);

    const expiredRoundTime = getRoundTime(
      genesisStartTime,
      roundID - 2,
      currentTimeframeId
    );
    pricePromisses.push(
      getCurrentPrice(expiredRoundTime.lockTime / 1000, `${symbol}USD`),
      getCurrentPrice(expiredRoundTime.closeTime / 1000, `${symbol}USD`)
    );

    const prices = await Promise.all(pricePromisses);
    const expiredLockPrice = parseFloat(prices[0]);
    const expiredClosePrice = parseFloat(prices[1]);

    const underlyingToken = (getState() as RootState).trade.underlyingToken;
    if (underlyingToken.symbol !== symbol) {
      return rejectWithValue("");
    }

    return {
      roundID,
      expiredLockPrice,
      expiredClosePrice,
    };
  }
);

export const getAccountLedgers = createAsyncThunk(
  "trade/getAccountLedgers",
  async (address: string, { rejectWithValue, getState }) => {
    const curState = (getState() as RootState).trade;
    const symbol = curState.underlyingToken.symbol;
    const currentTimeframeId = curState.currentTimeframeId;

    const genesisStartTime = curState.genesisTime;

    if (!genesisStartTime) {
      return rejectWithValue("");
    }

    const currentTime = await getUnixTimestampInSeconds();
    const roundID = calcEpoch(genesisStartTime, currentTime, currentTimeframeId);

    const context = {
      reference: "BinaryMarket",
      contractAddress: loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChain.id}_${symbol}_ADDRESS`
      ),
      abi: BinaryMarketABI,
      calls: [],
    };

    calls = [];

    for (let j = 2; j >= -1; j--) {
      calls.push({
        reference: "BinaryMarket",
        methodName: "ledger",
        methodParameters: [currentTimeframeId, roundID - j, address],
      });
    }

    const userLedgers: Array<{ amount: number; position: number }> = [];

    try {
      context.calls = calls;
      const data = await retry(async () => await multicall().call(context), {
        retries: AyncRetryCount,
      });
      const ledgers = data.results["BinaryMarket"].callsReturnContext.map((record) => {
        return record.returnValues;
      });

      for (let i = 0; i < 4; i++) {
        userLedgers.push({
          amount: parseFloat(
            formatUnits(ledgers[i][1], Underlying_Token[currentNetworkChain.id].decimals)
          ),
          position: ledgers[i][0],
        });
      }
    } catch (error) {
      console.error("getInitialTimeframe/multicall", error);
    }

    const underlyingToken = (getState() as RootState).trade.underlyingToken;
    if (underlyingToken.symbol !== symbol) {
      return rejectWithValue("");
    }

    const userAddress = (getState() as RootState).trade.userWalletAddress;
    if (userAddress !== address) {
      return rejectWithValue("");
    }
    const timeframeId = (getState() as RootState).trade.currentTimeframeId;
    if (timeframeId !== currentTimeframeId) {
      return rejectWithValue("");
    }

    return userLedgers;
  }
);

export const updateCurrentRoundLedger = createAsyncThunk(
  "trade/updateCurrentRoundLedger",
  async ({ address, round }: { address: string; round: number }, { getState }) => {
    const currentState = getState() as RootState;
    const ledger = await getLedger(
      address,
      loadEnvVariable(
        `NX_BINARY_MARKET_${
          currentNetworkChain.id
        }_${currentState.trade.underlyingToken.symbol.toUpperCase()}_ADDRESS`
      ),
      currentState.trade.currentTimeframeId,
      round + 1
    );
    const amount = parseFloat(
      ethers.utils.formatUnits(
        BigNumber.from(ledger.amount),
        Underlying_Token[currentNetworkChain.id].decimals
      )
    );
    return {
      amount: amount,
      position: ledger.position,
    };
  }
);

export const updateTimeframe = createAsyncThunk(
  "trade/updateTimeframe",
  (
    {
      _currentPrice,
      address,
      currentTime,
    }: {
      _currentPrice: number;
      currentTime: number;
      address?: string;
    },
    { getState, rejectWithValue, dispatch }
  ) => {
    const currentState = getState() as RootState;
    const resultState = JSON.parse(JSON.stringify(currentState.trade)) as TradeData;

    if (currentState.trade.isInitializing) {
      return rejectWithValue("");
    }

    const marketAge = currentTime - currentState.trade.genesisTime;

    const currentPrice = _currentPrice;
    const currentTimeframeId = currentState.trade.currentTimeframeId;
    const roundTime = getBettingTimeframeWithId(currentTimeframeId).minute * 60;
    resultState.timeframe.remainingTime = roundTime - (marketAge % roundTime);

    const round = Math.floor(marketAge / roundTime);

    if (resultState.timeframe.rounds[2].epoch === round - 1) {
      resultState.timeframe.rounds.shift();
      resultState.timeframe.rounds.push({ ...defaultRound });

      resultState.timeframe.rounds[0].closePrice =
        resultState.timeframe.rounds[1].lockPrice = currentPrice;

      if (address) {
        dispatch(updateCurrentRoundLedger({ address, round }));
      }
    }

    for (let i = 0; i < 4; i++) {
      resultState.timeframe.rounds[i].epoch = round + i - 2;
    }

    return resultState.timeframe;
  }
);

const previousState = loadState("trade");
const initialState: TradeData = {
  underlyingToken: Betting_CryptoCurrencies[0],
  currentTimeframeId: 1,
  tradingFee: 1,
  ...previousState,
  isInitializing: false,
  timeframe: JSON.parse(JSON.stringify(defaultTimeframe)) as TimeFrame,
  latestOHLCData: {
    ETH: {
      time: 0,
      open: 0,
      close: 0,
      high: 0,
      low: 0,
    },
    BTC: {
      time: 0,
      open: 0,
      close: 0,
      high: 0,
      low: 0,
    },
    // BNB: {
    //   time: 0,
    //   open: 0,
    //   close: 0,
    //   high: 0,
    //   low: 0,
    // },
    // XRP: {
    //   time: 0,
    //   open: 0,
    //   close: 0,
    //   high: 0,
    //   low: 0,
    // },
    // MATIC: {
    //   time: 0,
    //   open: 0,
    //   close: 0,
    //   high: 0,
    //   low: 0,
    // },
    // DOGE: {
    //   time: 0,
    //   open: 0,
    //   close: 0,
    //   high: 0,
    //   low: 0,
    // },
    SOL: {
      time: 0,
      open: 0,
      close: 0,
      high: 0,
      low: 0,
    },
    // LINK: {
    //   time: 0,
    //   open: 0,
    //   close: 0,
    //   high: 0,
    //   low: 0,
    // },
  },
  genesisStartTimestamps: defaultGenesisTime,
  genesisTime: 0,
  maintenanceMode: false,
  userWalletAddress: "",
  operatorWalletBalance: {
    BTC: 100,
    ETH: 100,
    // BNB: 100,
    // XRP: 100,
    // DOGE: 100,
    // MATIC: 100,
    SOL: 100,
    // LINK: 100,
  },
  bettingCryptoCurrencies: Betting_CryptoCurrencies,
  bettingTimeframes: BettingTimeframes,
};

const tradeSlice = createSlice({
  name: "trade",
  initialState,
  reducers: {
    setCurrentTimeframeId: (state, action: PayloadAction<number>) => {
      state.currentTimeframeId = action.payload;
    },
    setIsBetting: (state, action: PayloadAction<boolean>) => {
      state.timeframe.isBetting = action.payload;
    },
    recordSuccessBetting: (
      state,
      action: PayloadAction<{
        epoch: number;
        betAmount: number;
        maxAmntLimit: number;
        position: number;
        userAddress: string;
      }>
    ) => {
      if (state.userWalletAddress === action.payload.userAddress) {
        const { epoch, betAmount, position, maxAmntLimit } = action.payload;
        for (let i = 0; i < 4; i++) {
          if (state.timeframe.rounds[i].epoch === epoch) {
            state.timeframe.rounds[i].amount = betAmount;
            state.timeframe.rounds[i].position = position;
            state.timeframe.rounds[i].maxAmntLimit = maxAmntLimit;
          }
        }
      }
    },
    updateLatestOHLC: (state, action: PayloadAction<{ ohlc: any }>) => {
      const { ohlc } = action.payload;
      const symbol = (ohlc.symbol as string)
        .slice(0, (ohlc.symbol as string).length - 3)
        .toUpperCase();
      if (state.latestOHLCData[symbol].time < ohlc.time) {
        state.latestOHLCData[symbol] = ohlc;
      }
    },
    updateOperatorWalletBalance: (
      state,
      action: PayloadAction<{
        BTC: number;
        ETH: number;
        // BNB: number;
        // XRP: number;
        // MATIC: number;
        // DOGE: number;
        SOL: number;
        // LINK: number;
      }>
    ) => {
      state.operatorWalletBalance.BTC = action.payload.BTC;
      state.operatorWalletBalance.ETH = action.payload.ETH;
      // state.operatorWalletBalance.BNB = action.payload.BNB;
      // state.operatorWalletBalance.XRP = action.payload.XRP;
      // state.operatorWalletBalance.MATIC = action.payload.MATIC;
      // state.operatorWalletBalance.DOGE = action.payload.DOGE;
      state.operatorWalletBalance.SOL = action.payload.SOL;
      // state.operatorWalletBalance.LINK = action.payload.LINK;
    },
    setUnderlyingToken: (state, action: PayloadAction<CryptoCurrency>) => {
      state.underlyingToken = action.payload;
      state.genesisTime = state.genesisStartTimestamps[action.payload.symbol];
    },
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.maintenanceMode = action.payload;
    },
    clearAccountLedgers: (state) => {
      for (let i = 0; i < 4; i++) {
        state.timeframe.rounds[i].position = 0;
        state.timeframe.rounds[i].amount = 0;
      }
    },
    setUserwallet: (state, action: PayloadAction<string>) => {
      state.userWalletAddress = action.payload;
    },
    setBettingCryptoCurrencies: (state, action: PayloadAction<CryptoCurrency[]>) => {
      state.underlyingToken = action.payload[0];
      state.bettingCryptoCurrencies = action.payload;
    },
    setBettingTimeframes: (state, action: PayloadAction<IBettingTimeframe[]>) => {
      state.currentTimeframeId = action.payload[0].id;
      state.bettingTimeframes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getInitialTimeFrame.pending, (state: TradeData, action) => {
      state.isInitializing = true;
    });
    builder.addCase(getInitialTimeFrame.fulfilled, (state: TradeData, action) => {
      state.isInitializing = false;

      for (let i = 0; i < 4; i++) {
        state.timeframe.rounds[i].epoch = action.payload.roundID - 2 + i;
      }

      state.timeframe.rounds[0].lockPrice = action.payload.expiredLockPrice;
      state.timeframe.rounds[0].closePrice = action.payload.expiredClosePrice;
      state.timeframe.rounds[1].lockPrice = action.payload.expiredClosePrice;
    });
    builder.addCase(getAccountLedgers.fulfilled, (state: TradeData, action) => {
      for (let i = 0; i < 4; i++) {
        state.timeframe.rounds[i].position = action.payload[i].position;
        state.timeframe.rounds[i].amount = action.payload[i].amount;
      }
    });
    builder.addCase(updateTimeframe.fulfilled, (state: TradeData, action) => {
      state.timeframe = action.payload;

      const expiredRoundTime = getRoundTime(
        state.genesisTime,
        state.timeframe.rounds[0].epoch,
        state.currentTimeframeId
      );

      const symbol = state.underlyingToken.symbol;
      if (expiredRoundTime.closeTime - 60000 === state.latestOHLCData[symbol]?.time) {
        state.timeframe.rounds[0].closePrice = state.timeframe.rounds[1].lockPrice =
          state.latestOHLCData[symbol].close;
      }

      return state;
    });
    builder.addCase(updateCurrentRoundLedger.fulfilled, (state: TradeData, action) => {
      state.timeframe.rounds[3].position = action.payload.position;
      state.timeframe.rounds[3].amount = action.payload.amount;
    });
    builder.addCase(loadGenesisTime.fulfilled, (state: TradeData, action) => {
      state.genesisStartTimestamps = action.payload;
      state.genesisTime = action.payload[state.underlyingToken.symbol];
    });
  },
});

export const getCurrentTimeFrame = createSelector(
  (state: RootState) => state.trade,
  (trade: TradeData) => {
    const timeframe = trade.timeframe;
    return timeframe;
  }
);

export const tradeReducer = tradeSlice.reducer;
export const {
  setCurrentTimeframeId,
  setIsBetting,
  recordSuccessBetting,
  setUnderlyingToken,
  updateLatestOHLC,
  setMaintenanceMode,
  clearAccountLedgers,
  setUserwallet,
  updateOperatorWalletBalance,
  setBettingCryptoCurrencies,
  setBettingTimeframes,
} = tradeSlice.actions;
