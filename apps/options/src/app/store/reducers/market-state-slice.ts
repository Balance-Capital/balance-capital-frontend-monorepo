import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { backendInstance } from "../../helpers/axios";
import { getCustomHeaders } from "../../components/tvchart/api/helper";
import { RootState } from "..";

export type MarketData = {
  symbol: string;
  price: number | string;
  oneDayChangeRate: number;
  oneDayVolume: number;
  trendLineSvg: string;
};

export interface MarketStateData {
  marketsData: MarketData[];
  genesisMarketStartTime: Record<string, number>;
}

const initialState: MarketStateData = {
  marketsData: [],
  genesisMarketStartTime: {
    BTC: 0,
    ETH: 0,
    // BNB: 0,
    // XRP: 0,
    // MATIC: 0,
    // DOGE: 0,
    SOL: 0,
    // LINK: 0,
  },
};

export const loadMarketState = createAsyncThunk(
  "marketState/loadMarketState",
  async () => {
    const headers = getCustomHeaders();
    const response = await backendInstance.get(`/market-status`, {
      headers: headers,
    });
    return response.data as MarketData[];
  }
);

const marketStateSlice = createSlice({
  name: "marketState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadMarketState.fulfilled,
      (state, action: PayloadAction<MarketData[]>) => {
        state.marketsData = action.payload;
      }
    );
  },
});

const baseInfo = (state: RootState) => state.marketState;

export const marketStateReducer = marketStateSlice.reducer;
export const getMarketState = createSelector(baseInfo, (marketState) => marketState);
