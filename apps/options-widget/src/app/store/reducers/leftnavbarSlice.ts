import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ChangeEvent } from "react";

export interface IUnderlyingToken {
  name: string;
  img: string;
  symbol: string;
  isChecked: boolean;
}

export interface ITimeframe {
  name: string;
  min: number;
  isChecked: boolean;
}

export interface IBackgroundItem {
  name: string;
  hexValue: string;
  id: string;
  isDark: boolean;
}

export interface ITypography {
  colors: Array<IBackgroundItem>;
  fontFamilys: Array<{ name: string; isSelected: boolean }>;
  fontSize: string;
}

export interface IAffiliateSetting {
  fee: number;
  address: string;
}

interface ILeftNavBarState {
  isDarkMode: boolean;
  underlyingTokens: Array<IUnderlyingToken>;
  timeFrames: Array<ITimeframe>;
  backgroundItems: Array<IBackgroundItem>;
  typoGraphy: ITypography;
  affiliateSetting: IAffiliateSetting;
  referralCode: string;
  queryParam: string;
}

const initialState: ILeftNavBarState = {
  isDarkMode: false,
  underlyingTokens: [
    {
      name: "Bitcoin",
      symbol: "BTC",
      img: "./assets/svgs/btc.svg",
      isChecked: true,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      img: "./assets/svgs/eth.svg",
      isChecked: true,
    },
  ],
  timeFrames: [
    {
      name: "1m",
      min: 1,
      isChecked: true,
    },
    {
      name: "3m",
      min: 3,
      isChecked: true,
    },
    {
      name: "5m",
      min: 5,
      isChecked: true,
    },
  ],
  backgroundItems: [
    {
      name: "Background",
      hexValue: "#060b0b",
      id: "main-color-dark",
      isDark: true,
    },
    {
      name: "Panel color",
      hexValue: "#080d0e",
      id: "panel-color-dark",
      isDark: true,
    },
    {
      name: "Modal color",
      hexValue: "#080d0e",
      id: "modal-color-dark",
      isDark: true,
    },
    {
      name: "Border color",
      hexValue: "#0d181a",
      id: "border-color-dark",
      isDark: true,
    },
    {
      name: "Brand color",
      hexValue: "#13c9bd",
      id: "brand-color-dark",
      isDark: true,
    },
    {
      name: "Background",
      hexValue: "#fdffff",
      id: "main-color-light",
      isDark: false,
    },
    {
      name: "Panel color",
      hexValue: "#f9fcfc",
      id: "panel-color-light",
      isDark: false,
    },
    {
      name: "Modal color",
      hexValue: "#fafcfc",
      id: "modal-color-light",
      isDark: false,
    },
    {
      name: "Border color",
      hexValue: "#e7f2f4",
      id: "border-color-light",
      isDark: false,
    },
    {
      name: "Brand color",
      hexValue: "#13c9bd",
      id: "brand-color-light",
      isDark: false,
    },
  ],
  typoGraphy: {
    colors: [
      {
        name: "Primary color",
        hexValue: "#bde0eb",
        id: "primary-color-dark",
        isDark: true,
      },
      {
        name: "Secondary color",
        hexValue: "#5b7481",
        id: "secondary-color-dark",
        isDark: true,
      },
      {
        name: "Primary color",
        hexValue: "#060b0b",
        id: "primary-color-light",
        isDark: false,
      },
      {
        name: "Secondary color",
        hexValue: "#5b7481",
        id: "secondary-color-light",
        isDark: false,
      },
    ],
    fontFamilys: [
      { name: "Inter", isSelected: true },
      { name: "Roboto", isSelected: false },
      { name: "Montserrat", isSelected: false },
      { name: "Lato", isSelected: false },
      { name: "Poppins", isSelected: false },
    ],
    fontSize: "",
  },
  affiliateSetting: {
    fee: 3,
    address: "",
  },
  queryParam: "",
  referralCode: "",
};

export const leftNavBarSlice = createSlice({
  name: "leftNavBar",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    handleTokenChecked: (state, action: PayloadAction<number>) => {
      state.underlyingTokens[action.payload].isChecked =
        !state.underlyingTokens[action.payload].isChecked;
    },
    handleTimeframeChecked: (state, action: PayloadAction<number>) => {
      state.timeFrames[action.payload].isChecked =
        !state.timeFrames[action.payload].isChecked;
    },
    handleBackgroundItemHexChange: (
      state,
      action: PayloadAction<{ e: ChangeEvent<HTMLInputElement>; index: number }>
    ) => {
      state.backgroundItems[action.payload.index].hexValue =
        action.payload.e.target.value;
    },
    handleTypoColorsHexChange: (
      state,
      action: PayloadAction<{ e: ChangeEvent<HTMLInputElement>; index: number }>
    ) => {
      state.typoGraphy.colors[action.payload.index].hexValue =
        action.payload.e.target.value;
    },
    handleTypoFontFamilyChange: (state, action: PayloadAction<string>) => {
      state.typoGraphy.fontFamilys = state.typoGraphy.fontFamilys.map((item) => ({
        ...item,
        isSelected: item.name === action.payload,
      }));
    },
    handleTypoFontSize: (state, action: PayloadAction<string>) => {
      state.typoGraphy.fontSize = action.payload;
    },
    handleAffiliateFee: (state, action: PayloadAction<number>) => {
      state.affiliateSetting.fee = action.payload;
    },
    handleAffiliateAddress: (state, action: PayloadAction<string>) => {
      state.affiliateSetting.address = action.payload;
    },
    setQueryParam: (state, action: PayloadAction<string>) => {
      state.queryParam = action.payload;
    },
    setReferralCode: (state, action: PayloadAction<string>) => {
      state.referralCode = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  handleTokenChecked,
  handleTimeframeChecked,
  handleBackgroundItemHexChange,
  handleTypoColorsHexChange,
  handleTypoFontFamilyChange,
  handleTypoFontSize,
  handleAffiliateAddress,
  handleAffiliateFee,
  setQueryParam,
  setReferralCode,
} = leftNavBarSlice.actions;

export default leftNavBarSlice.reducer;
