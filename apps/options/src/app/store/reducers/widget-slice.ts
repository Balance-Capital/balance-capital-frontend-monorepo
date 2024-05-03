import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ethers } from "ethers";

interface IAffiliateSetting {
  fee?: string | number;
  address: string;
}

interface IUnderlyingToken {
  symbol: string;
}

interface ITimeFrames {
  min: number;
}

interface ITypography {
  fontFamily: string;
}

interface IWidgetData {
  affiliateData: IAffiliateSetting;
  underlyingTokens: Array<IUnderlyingToken>;
  timeFrames: Array<ITimeFrames>;
  typoGraphy: ITypography;
}

const initialState: IWidgetData = {
  affiliateData: {
    address: ethers.constants.AddressZero,
    fee: 0,
  },
  underlyingTokens: [
    {
      symbol: "BTC",
    },
    {
      symbol: "ETH",
    },
  ],
  timeFrames: [{ min: 1 }, { min: 3 }, { min: 5 }],
  typoGraphy: { fontFamily: "Inter" },
};

const widgetSlice = createSlice({
  name: "widget",
  initialState,
  reducers: {
    setAffiliateSetting: (state, action: PayloadAction<IAffiliateSetting>) => {
      state.affiliateData = action.payload;
    },
    setUnderlyingTokens: (state, action: PayloadAction<IUnderlyingToken[]>) => {
      state.underlyingTokens = action.payload;
    },
    setTimeFrames: (state, action: PayloadAction<ITimeFrames[]>) => {
      state.timeFrames = action.payload;
    },
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.typoGraphy.fontFamily = action.payload;
    },
  },
});

export const widgetReducer = widgetSlice.reducer;
export const { setAffiliateSetting, setUnderlyingTokens, setTimeFrames, setFontFamily } =
  widgetSlice.actions;
