import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { HistoryData } from "../../core/types/basic.types";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { bettingHistory } from "../../core/apollo/query";
import { GRAPH_URL } from "../../core/constants/basic";
import { RootState } from "..";
import { loadEnvVariable } from "../../core/constants/network";
import { getRoundsMulticall } from "../../helpers/contractHelpers";
import { currentNetworkChain } from "../../context/NetworkContext";
// import { getLedgers } from "../../hooks/useMarketContract";
// import { BINARY_ADDRESSES } from "../../core/constants/network";

const pageSize = 5;

export const loadClosedRounds = createAsyncThunk(
  "closedRounds/loadClosedRounds",
  async (
    { page, pageSize, account }: { page: number; pageSize: number; account: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const curRootState = getState() as RootState;
      const timestampOffset = curRootState.app.timestampOffset;

      const currentTime = Math.floor((Date.now() + timestampOffset.offset) / 1000);
      const underlyingToken = curRootState.trade.underlyingToken;

      const query = bettingHistory(
        account,
        page,
        pageSize,
        currentTime,
        `${underlyingToken.symbol}USD`
      );

      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });
      const res = await client.query({ query });

      const bets: HistoryData[] = [];
      for (let i = 0; i < res.data.bets.length; i++) {
        const bet = JSON.parse(JSON.stringify(res.data.bets[i]));

        bet.amount = parseFloat(bet.amount + "");
        bet.timeframeId = parseFloat(bet.timeframeId + "");

        bet.round.lockPrice = parseFloat(bet.round.lockPrice + "");
        bet.round.closePrice = parseFloat(bet.round.closePrice + "");
        bet.round.lockAt = parseFloat(bet.round.lockAt + "");
        bet.round.endAt = parseFloat(bet.round.endAt + "");
        bet.round.epoch = parseFloat(bet.round.epoch + "");

        bet.market = bet.market.id;
        bet.isReverted = bet.isReverted === true;
        bet.claimed = bet.claimed === true;

        bets.push(bet);
      }

      // const ledgers = await getLedgers(
      //   BINARY_ADDRESSES.MARKET_ADDRESS[underlyingToken.symbol],
      //   bets.map((bet) => bet.timeframeId),
      //   bets.map((bet) => bet.round.epoch),
      //   account
      // );

      // for (let i = 0; i < bets.length; i++) {
      //   if (ledgers[i]) {
      //     bets[i].isReverted = ledgers[i][2];
      //     bets[i].claimed = ledgers[i][3];
      //   }
      // }

      return { bets, page };
    } catch (error) {
      console.error("[loadHistory] ", error);
      return rejectWithValue("");
    }
  }
);

export const insertRevertedRoundToClosedPositions = createAsyncThunk(
  "closedRounds/insertRevertedRoundToClosedPositions",
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

    if (currentState.closedRounds.page !== 1) {
      return rejectWithValue("");
    }

    let round = currentState.openRounds.rounds.find(
      (r) => r.timeframeId === values.timeframeId && r.round.epoch === values.epoch
    );

    if (!round) {
      return rejectWithValue("");
    }

    round = {
      ...round,
      isReverted: true,
    };

    const newRounds = [round, ...currentState.closedRounds.rounds].slice(
      0,
      currentState.closedRounds.rounds.length
    );

    return newRounds;
  }
);

export const loadRoundInformationFromContract = createAsyncThunk(
  "closedRounds/loadRoundInformationFromContract",
  async (_, { rejectWithValue, getState }) => {
    try {
      const currentState = getState() as RootState;

      if (currentState.closedRounds.page !== 1) {
        return rejectWithValue("");
      }

      const underlyingToken = currentState.trade.underlyingToken;

      const marketAddress = loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChain.id}_${underlyingToken.symbol}_ADDRESS`
      );

      const epochs: number[] = [];
      const timeframeIds: number[] = [];

      for (let i = 0; i < currentState.closedRounds.rounds.length; i++) {
        const round = currentState.closedRounds.rounds[i];
        if (!round.round.lockPrice) {
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
      console.error("closedRounds/loadRoundInformationFromContract", error);
      return rejectWithValue("");
    }
  }
);

interface ClosedRoundsState {
  rounds: HistoryData[];
  page: number;
  claimingRounds: {
    epoch: number;
    timeframeId: number;
  }[];
  claimedRounds: Record<
    string,
    {
      epoch: number;
      timeframeId: number;
      claimedHash: string;
    }[]
  >;
}

const InitialState: ClosedRoundsState = {
  rounds: [],
  page: 1,
  claimingRounds: [],
  claimedRounds: {
    BTC: [],
    ETH: [],
    // BNB: [],
    // XRP: [],
    // MATIC: [],
    // DOGE: [],
    SOL: [],
    // LINK: [],
  },
};

const closedRoundsSlice = createSlice({
  name: "closedRounds",
  initialState: InitialState,
  reducers: {
    setRoundClosePrice: (
      state,
      action: PayloadAction<{ closePrice: number; timeframeId: number; epoch: number }>
    ) => {
      const { closePrice, timeframeId, epoch } = action.payload;
      for (let i = 0; i < state.rounds.length; i++) {
        if (
          state.rounds[i].timeframeId === timeframeId &&
          state.rounds[i].round.epoch === epoch
        ) {
          state.rounds[i].round.closePrice = closePrice;
          break;
        }
      }
    },
    setClaimingRounds: (
      state,
      action: PayloadAction<
        {
          epoch: number;
          timeframeId: number;
        }[]
      >
    ) => {
      state.claimingRounds = action.payload;
    },
    addClaimedRounds: (
      state,
      action: PayloadAction<{
        underlyingToken: string;
        claimedRounds: {
          epoch: number;
          timeframeId: number;
          claimedHash: string;
        }[];
      }>
    ) => {
      state.claimedRounds[action.payload.underlyingToken]?.push(
        ...action.payload.claimedRounds
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadClosedRounds.fulfilled, (state, action) => {
      // const res: HistoryData[] = [];
      // for (let i = 0; i < action.payload.length; i++) {
      //   let j = 0;
      //   for (; j < state.rounds.length; j++) {
      //     if (isSameRound(action.payload[i], state.rounds[j])) {
      //       res.push(mergeTwoPositions(state.rounds[j], action.payload[i]));
      //       break;
      //     }
      //   }
      //   if (j === state.rounds.length) {
      //     res.push(action.payload[i]);
      //   }
      // }
      state.rounds = action.payload.bets;
      state.page = action.payload.page;
    });

    builder.addCase(insertRevertedRoundToClosedPositions.fulfilled, (state, action) => {
      state.rounds = action.payload;
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
  },
});

export const closedRoundsReducer = closedRoundsSlice.reducer;
export const { setRoundClosePrice, setClaimingRounds, addClaimedRounds } =
  closedRoundsSlice.actions;
