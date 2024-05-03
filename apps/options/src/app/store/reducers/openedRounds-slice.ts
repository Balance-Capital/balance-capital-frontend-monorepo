import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { openedBetting } from "../../core/apollo/query";
import { GRAPH_URL } from "../../core/constants/basic";
import { loadEnvVariable } from "../../core/constants/network";
import { HistoryData } from "../../core/types/basic.types";
import { getRoundTime } from "../../helpers/data-translations";
import { getRoundsMulticall } from "../../helpers/contractHelpers";
import { currentNetworkChain } from "../../context/NetworkContext";

const mergeTwoPositions = (pos1: HistoryData, pos2: HistoryData) => {
  const res: HistoryData = JSON.parse(JSON.stringify(pos1));
  if (pos2.hash && pos2.hash !== "") {
    res.hash = pos2.hash;
  }
  res.round.lockPrice = Math.max(pos1.round.lockPrice, pos2.round.lockPrice);
  res.round.closePrice = Math.max(pos1.round.closePrice, pos2.round.closePrice);

  res.isReverted = pos1.isReverted || pos2.isReverted;

  return res;
};

const isSameRound = (pos1: HistoryData, pos2: HistoryData) => {
  return pos1.timeframeId === pos2.timeframeId && pos1.round.epoch === pos2.round.epoch;
};

export const loadOpenedRounds = createAsyncThunk(
  "rounds/loadOpenedRounds",
  async ({ address }: { address: string }, { getState, rejectWithValue }) => {
    try {
      const currentState = getState() as RootState;
      if (currentState.trade.genesisTime === 0) {
        return rejectWithValue("");
      }
      let latestRevertedRoundTime = currentState.openRounds.latestRevertedRoundTime;
      const underlyingToken = currentState.trade.underlyingToken;

      const marketAddress = loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChain.id}_${underlyingToken.symbol}_ADDRESS`
      );
      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });

      const currentTime = Math.floor(
        (Date.now() + currentState.app.timestampOffset.offset) / 1000
      );
      const query = openedBetting(address, marketAddress, currentTime);
      const res = await client.query({ query });

      const bets: HistoryData[] = [];
      for (let i = 0; i < res.data.bets.length; i++) {
        const bet = JSON.parse(JSON.stringify(res.data.bets[i]));
        bet.amount = parseFloat(bet.amount + "");
        bet.round.lockPrice = bet.round.lockPrice
          ? parseFloat(bet.round.lockPrice + "")
          : 0;
        bet.round.closePrice = bet.round.closePrice
          ? parseFloat(bet.round.closePrice + "")
          : 0;
        bet.round.lockAt = parseFloat(bet.round.lockAt + "");
        bet.round.endAt = parseFloat(bet.round.endAt + "");
        bet.round.epoch = parseInt(bet.round.epoch + "");
        bet.timeframeId = parseInt(bet.timeframeId + "");
        bet.market = bet.market.id;
        bet.isReverted = bet.isReverted === true;
        bets.push(bet);
      }

      let currentBets: HistoryData[] = [...(getState() as RootState).openRounds.rounds];
      for (let i = 0; i < bets.length; i++) {
        let j = 0;
        for (; j < currentBets.length; j++) {
          if (isSameRound(bets[i], currentBets[j])) {
            currentBets[j] = mergeTwoPositions(currentBets[j], bets[i]);
            break;
          }
        }
        if (j === currentBets.length) {
          currentBets.push(bets[i]);
        }
      }
      try {
        const localData = localStorage.getItem(
          `openedRounds-${underlyingToken.symbol.toLowerCase()}-${address.toLowerCase()}-${
            currentNetworkChain.id
          }`
        );
        if (localData) {
          const localBets: HistoryData[] = JSON.parse(localData);

          for (let i = 0; i < localBets.length; i++) {
            localBets[i].amount = parseFloat(localBets[i].amount + "");
            localBets[i].round.lockPrice = parseFloat(localBets[i].round.lockPrice + "");
            localBets[i].round.closePrice = parseFloat(
              localBets[i].round.closePrice + ""
            );
            localBets[i].round.lockAt = parseFloat(localBets[i].round.lockAt + "");
            localBets[i].round.endAt = parseFloat(localBets[i].round.endAt + "");
            localBets[i].round.epoch = parseInt(localBets[i].round.epoch + "");
            localBets[i].timeframeId = parseInt(localBets[i].timeframeId + "");
          }

          for (let i = 0; i < localBets.length; i++) {
            let j = 0;
            for (; j < currentBets.length; j++) {
              if (isSameRound(localBets[i], currentBets[j])) {
                currentBets[j] = mergeTwoPositions(currentBets[j], localBets[i]);
                break;
              }
            }
            if (j === currentBets.length) {
              currentBets.push(localBets[i]);
            }
          }
        }

        latestRevertedRoundTime = currentState.openRounds.latestRevertedRoundTime;
        if (
          res.data.latest.length > 0 &&
          parseInt(res.data.latest[0].createdAt) > latestRevertedRoundTime
        ) {
          latestRevertedRoundTime = parseInt(res.data.latest[0].createdAt);
        }
      } catch (error) {
        console.error("rounds/loadOpenedRounds/load Local Storage: ", error);
      }

      currentBets = currentBets.filter(
        (bet) => bet.round.endAt >= currentTime && !bet.isReverted
      );
      currentBets = currentBets.sort((a, b) => a.round.endAt - b.round.endAt);

      const currentSymbol = (getState() as RootState).trade.underlyingToken.symbol;
      if (underlyingToken.symbol !== currentSymbol) {
        return rejectWithValue("");
      }

      localStorage.setItem(
        `openedRounds-${underlyingToken.symbol.toLowerCase()}-${address.toLowerCase()}-${
          currentNetworkChain.id
        }`,
        JSON.stringify(currentBets)
      );

      return { currentBets, latestRevertedRoundTime };
    } catch (error) {
      console.error("[rounds/loadOpenedRounds] ", error);
      return rejectWithValue("");
    }
  }
);

export const loadRoundInformationFromContract = createAsyncThunk(
  "openedRounds/loadRoundInformationFromContract",
  async (_, { rejectWithValue, getState }) => {
    try {
      const currentState = getState() as RootState;
      const underlyingToken = currentState.trade.underlyingToken;

      const currentTime = Math.floor(
        (Date.now() + currentState.app.timestampOffset.offset) / 1000
      );

      const marketAddress = loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChain.id}_${underlyingToken.symbol}_ADDRESS`
      );

      const epochs: number[] = [];
      const timeframeIds: number[] = [];

      for (let i = 0; i < currentState.openRounds.rounds.length; i++) {
        const round = currentState.openRounds.rounds[i];
        if (round.round.lockAt < currentTime && !round.round.lockPrice) {
          epochs.push(round.round.epoch);
          timeframeIds.push(round.timeframeId);
        }
      }

      if (epochs.length === 0) {
        return rejectWithValue("");
      }

      const roundPrices = await getRoundsMulticall(marketAddress, timeframeIds, epochs);

      return { roundPrices, epochs, timeframeIds };
    } catch (error) {
      console.error("openedRounds/loadRoundInformationFromContract", error);
      return rejectWithValue("");
    }
  }
);

export const insertOpenPosition = createAsyncThunk(
  "openPosition/insertOpenPosition",
  (
    position: {
      amount: number;
      hash: string;
      position: number;
      address: string;
      timeframeId: number;
      epoch: number;
      genesisTime: number;
      symbol: string;
      marketName?: string;
      creditUsed?: boolean;
    },
    { rejectWithValue, getState }
  ) => {
    const curState = getState() as RootState;

    if (position.marketName) {
      if (
        position.marketName
          .toLowerCase()
          .includes(curState.trade.underlyingToken.symbol.toLowerCase())
      ) {
        position.genesisTime = curState.trade.genesisTime;
        position.symbol = curState.trade.underlyingToken.symbol;
      } else {
        return rejectWithValue("");
      }
    }

    if (position.address !== curState.trade.userWalletAddress) {
      return rejectWithValue("");
    }

    const roundTime = getRoundTime(
      position.genesisTime,
      position.epoch,
      position.timeframeId
    );
    const newPosition: HistoryData = {
      amount: position.amount,
      hash: position.hash,
      claimed: false,
      claimedAmount: null,
      claimedHash: null,
      timeframeId: position.timeframeId,
      position: position.position ? "Bear" : "Bull",
      market: loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChain.id}_${position.symbol}_ADDRESS`
      ),
      isReverted: false,
      creditUsed: position?.creditUsed ? true : false,
      round: {
        epoch: position.epoch,
        bullBets: 0,
        lockPrice: 0,
        closePrice: 0,
        lockAt: roundTime.lockTime / 1000,
        endAt: roundTime.closeTime / 1000,
      },
    };

    return { position: newPosition, address: position.address, symbol: position.symbol };
  }
);

export const removeRevertedPosition = createAsyncThunk(
  "openedRounds-slice/removeRevertedPosition",
  (
    values: {
      timeframeId: number;
      epoch: number;
      currency: "ETH" | "BTC" | "SOL"; // | "BNB" | "XRP" | "MATIC" | "DOGE" | "SOL" | "LINK"
    },
    { getState, rejectWithValue }
  ) => {
    const currentState = getState() as RootState;

    if (currentState.trade.underlyingToken.symbol !== values.currency) {
      return rejectWithValue("");
    }

    return currentState.openRounds.rounds.filter(
      (r) => r.timeframeId !== values.timeframeId || r.round.epoch !== values.epoch
    );
  }
);

interface OpenedRoundsSliceType {
  rounds: HistoryData[];
  latestRevertedRoundTime: number;
}

const initialState: OpenedRoundsSliceType = {
  rounds: [],
  latestRevertedRoundTime: 0,
};

const openRoundsSlice = createSlice({
  name: "openRounds",
  initialState: initialState,
  reducers: {
    insertOpenPosition: (
      state,
      action: PayloadAction<{
        amount: number;
        hash: string;
        position: number;
        address: string;
        timeframeId: number;
        epoch: number;
        genesisTime: number;
        symbol: string;
      }>
    ) => {
      const roundTime = getRoundTime(
        action.payload.genesisTime,
        action.payload.epoch,
        action.payload.timeframeId
      );
      const newPosition: HistoryData = {
        amount: action.payload.amount,
        hash: action.payload.hash,
        claimed: false,
        claimedAmount: null,
        claimedHash: null,
        timeframeId: action.payload.timeframeId,
        position: action.payload.position ? "Bear" : "Bull",
        market: loadEnvVariable(
          `NX_BINARY_MARKET_${currentNetworkChain.id}_${action.payload.symbol}_ADDRESS`
        ),
        isReverted: false,
        creditUsed: false,
        round: {
          epoch: action.payload.epoch,
          bullBets: 0,
          lockPrice: 0,
          closePrice: 0,
          lockAt: roundTime.lockTime / 1000,
          endAt: roundTime.closeTime / 1000,
        },
      };
      if (state.rounds.filter((h) => isSameRound(newPosition, h)).length === 0) {
        state.rounds.push(newPosition);

        state.rounds = state.rounds.sort((a, b) => a.round.lockAt - b.round.lockAt);

        localStorage.setItem(
          `openedRounds-${action.payload.symbol.toLowerCase()}-${action.payload.address.toLowerCase()}-${
            currentNetworkChain.id
          }`,
          JSON.stringify(state)
        );
      }
    },
    filterOpenPositions: (state, action: PayloadAction<number>) => {
      const globalTime = action.payload;
      state.rounds = state.rounds.filter((r) => r.round.endAt >= globalTime);
    },
    clearOpenPositions: (state) => {
      state.rounds = [];
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      loadOpenedRounds.fulfilled,
      (
        state,
        action: PayloadAction<{
          currentBets: HistoryData[];
          latestRevertedRoundTime: number;
        }>
      ) => {
        if (JSON.stringify(state.rounds) !== JSON.stringify(action.payload.currentBets)) {
          state.rounds = action.payload.currentBets.filter(
            (round) => !round.round.closePrice || !round.round.lockPrice
          );
        }
        state.latestRevertedRoundTime = action.payload.latestRevertedRoundTime;
      }
    );

    builder.addCase(insertOpenPosition.fulfilled, (state, action) => {
      const newPosition = action.payload.position;
      if (state.rounds.filter((h) => isSameRound(newPosition, h)).length === 0) {
        state.rounds.push(newPosition);

        state.rounds = state.rounds.sort((a, b) => a.round.lockAt - b.round.lockAt);

        localStorage.setItem(
          `openedRounds-${action.payload.symbol.toLowerCase()}-${action.payload.address.toLowerCase()}-${
            currentNetworkChain.id
          }`,
          JSON.stringify(state)
        );
      }
    });

    builder.addCase(loadRoundInformationFromContract.fulfilled, (state, action) => {
      const roundPrices = action.payload.roundPrices;
      const timeframeIds = action.payload.timeframeIds;
      const epochs = action.payload.epochs;

      roundPrices.forEach((prices, index) => {
        for (let i = 0; i < state.rounds.length; i++) {
          if (
            state.rounds[i].timeframeId === timeframeIds[index] &&
            state.rounds[i].round.epoch === epochs[index] &&
            !state.rounds[i].round.lockPrice
          ) {
            state.rounds[i].round.lockPrice = prices.lockPrice;
          }
        }
      });
    });

    builder.addCase(removeRevertedPosition.fulfilled, (state, action) => {
      state.rounds = action.payload;
    });
  },
});

export const openRoundsReducer = openRoundsSlice.reducer;
export const { clearOpenPositions, filterOpenPositions } = openRoundsSlice.actions;
