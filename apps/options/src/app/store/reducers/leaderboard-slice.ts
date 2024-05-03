import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { RootState } from "../index";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GRAPH_URL } from "../../core/constants/basic";
import { leaderboardQuery } from "../../core/apollo/query";
import { networks } from "@fantohm/shared-web3";
import { currentNetworkChain } from "../../context/NetworkContext";

const LoadCount = 10;

export enum LeaderboardOrderbyFields {
  pnl = "profit_lose",
  roi = "roi",
}

export type LeaderboardUserData = {
  address: string;
  wholeBetAmount: number;
  p_and_l: number;
  roi: number;
  link: string;
};

export interface LeaderboardData {
  users: LeaderboardUserData[];
  orderBy: LeaderboardOrderbyFields;
  loading: boolean;
  searchText: string;
  loadMore: boolean;
  showAll: boolean;
}

type User = {
  address: string;
  wholeBetAmount: string;
  wholePayoutAmount: string;
  invest: string;
  roi: string;
  profit_lose: string;
};

const initialState: LeaderboardData = {
  users: [],
  orderBy: LeaderboardOrderbyFields.roi,
  loading: false,
  searchText: "",
  loadMore: false,
  showAll: false,
};

export const loadLeaderboardData = createAsyncThunk(
  "leaderboard/loadLeaderboardData",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const searchText = state.leaderboard.searchText;
    const orderBy = state.leaderboard.orderBy;
    const showAll = state.leaderboard.showAll;
    const client = new ApolloClient({
      uri: GRAPH_URL(),
      cache: new InMemoryCache(),
    });
    const res = await client.query({
      query: leaderboardQuery(
        state.leaderboard.users.length,
        LoadCount,
        orderBy,
        showAll,
        searchText
      ),
    });
    if (res?.data?.users?.length > 0) {
      const data: LeaderboardUserData[] = res.data.users.map((user: User) => {
        return {
          address: user.address,
          wholeBetAmount: parseFloat(user.wholeBetAmount),
          p_and_l: parseFloat(user.profit_lose),
          roi: parseFloat(user.roi),
          link: networks[currentNetworkChain.id].getEtherscanAddress(user.address),
        };
      });
      // const profitUsers = data.filter((item) => item.p_and_l >= 0);
      const profitUsers = data.map((d) => d);

      const curState = getState() as RootState;
      if (
        orderBy !== curState.leaderboard.orderBy ||
        searchText !== curState.leaderboard.searchText ||
        showAll !== curState.leaderboard.showAll
      ) {
        return rejectWithValue("");
      }

      return profitUsers;
    } else {
      return [];
    }
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setLeaderboardOrderby: (state, action: PayloadAction<LeaderboardOrderbyFields>) => {
      state.orderBy = action.payload;
    },
    clearLeaderboardData: (state) => {
      state.loading = false;
      state.users = [];
      state.loadMore = true;
    },
    setLeaderboardSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLeaderboardData.rejected, (state) => {
      state.loadMore = false;
    });
    builder.addCase(loadLeaderboardData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      loadLeaderboardData.fulfilled,
      (state, action: PayloadAction<LeaderboardUserData[]>) => {
        state.users.push(...action.payload);
        if (action.payload.length < LoadCount) {
          state.loadMore = false;
        } else {
          state.loadMore = true;
        }
        state.loading = false;
      }
    );
  },
});

const baseInfo = (state: RootState) => state.leaderboard;

export const {
  setLeaderboardOrderby,
  clearLeaderboardData,
  setLeaderboardSearchText,
  setShowAll,
} = leaderboardSlice.actions;

export const leaderboardReducer = leaderboardSlice.reducer;
export const getLeaderboardData = createSelector(
  baseInfo,
  (leaderboard) => leaderboard.users
);
