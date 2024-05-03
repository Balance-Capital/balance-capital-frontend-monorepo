import { loadState } from "@fantohm/shared-web3";
import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../index";
import { CurrentLatestPrice } from "../../core/types/price.types";
import { AppMode } from "../../components/tvchart/api/types";

interface AppData {
  readonly loading: boolean;
  readonly checkedConnection: boolean;
  readonly confirmModalShow: boolean;
  readonly growlNotifications: GrowlNotification[];
  readonly latestPrice: Record<string, CurrentLatestPrice>;
  readonly txPending: boolean;
  showGuide: boolean;
  appLaunchedAddresses: string[];
  whitelistAddresses: string[];
  backendHealth: boolean;
  networkHealth: boolean;
  tourStepIndex: number;
  showPlatformNotice: boolean;
  termsAccepted: boolean;
  readonly timestampOffset: {
    flag: boolean;
    offset: number;
  };
}

export type GrowlNotification = {
  title?: string;
  message: string;
  duration: number;
  severity?: string;
  open: boolean;
  startSeconds: number;
};

const previousState = loadState("app");
const initialState: AppData = {
  confirmModalShow: true,
  appLaunchedAddresses: [],
  whitelistAddresses: [],
  showPlatformNotice: true,
  showGuide: true,
  termsAccepted: false,
  ...previousState,
  tourStepIndex: 1,
  backendHealth: true,
  networkHealth: true,
  txPending: false,
  loading: false,
  checkedConnection: false,
  latestPrice: {
    ETH: 0,
    BTC: 0,
    // BNB: 0,
    // XRP: 0,
    // MATIC: 0,
    // DOGE: 0,
    SOL: 0,
    // LINK: 0,
  },
  genesisMarketStartTime: {
    ETH: 0,
    BTC: 0,
    // BNB: 0,
    // XRP: 0,
    // MATIC: 0,
    // DOGE: 0,
    SOL: 0,
    // LINK: 0,
  },
  timestampOffset: {
    flag: false,
    offset: 0,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTxPending: (state, action: PayloadAction<boolean>) => {
      state.txPending = action.payload;
    },
    setCheckedConnection: (state, action: PayloadAction<boolean>) => {
      state.checkedConnection = action.payload;
    },
    setLatestPrice: (
      state,
      action: PayloadAction<{ token: string; price: CurrentLatestPrice }>
    ) => {
      state.latestPrice[action.payload.token] = action.payload.price;
    },
    setShowGuide: (state, action: PayloadAction<boolean>) => {
      state.showGuide = action.payload;
    },
    setTimestampOffset: (
      state,
      action: PayloadAction<{
        flag: boolean;
        offset: number;
      }>
    ) => {
      state.timestampOffset = action.payload;
    },
    setShowPlatformNotice: (state, action: PayloadAction<boolean>) => {
      state.showPlatformNotice = action.payload;
    },
    clearAlert: (state, action: PayloadAction<number>) => {
      state.growlNotifications = [
        ...state.growlNotifications.map((alert: GrowlNotification) => {
          if (alert.startSeconds !== action.payload) return alert;
          return { ...alert, open: false };
        }),
      ];
    },
    setConfirmModalShow: (state, action: PayloadAction<boolean>) => {
      state.confirmModalShow = action.payload;
    },
    toogleConfirmModalShow: (state) => {
      state.confirmModalShow = !state.confirmModalShow;
    },
    addAppLaunchedAddress: (state, action: PayloadAction<string>) => {
      const address = action.payload.toLowerCase();
      if (!state.appLaunchedAddresses.includes(address)) {
        state.appLaunchedAddresses.push(address);
      }
    },
    setBackendHealth: (state, action: PayloadAction<boolean>) => {
      state.backendHealth = action.payload;
    },
    setNetworkHealth: (state, action: PayloadAction<boolean>) => {
      state.networkHealth = action.payload;
    },
    addWhitelistAddress: (state, action: PayloadAction<string>) => {
      const address = action.payload.toLowerCase();
      if (!state.whitelistAddresses.includes(address)) {
        state.whitelistAddresses.push(address);
      }
    },
    removeWhitelistAddress: (state, action: PayloadAction<string>) => {
      const address = action.payload.toLowerCase();
      if (state.whitelistAddresses.includes(address)) {
        state.whitelistAddresses = state.whitelistAddresses.filter(
          (addr) => addr !== address
        );
      }
    },
    setTourStepIndex: (state, action: PayloadAction<number>) => {
      state.tourStepIndex = action.payload;
    },
    setTermsAccepted: (state, action: PayloadAction<boolean>) => {
      state.termsAccepted = action.payload;
    },
  },
});

const baseInfo = (state: RootState) => state.app;

export const appReducer = appSlice.reducer;
export const {
  setLoading,
  setTxPending,
  setLatestPrice,
  setCheckedConnection,
  clearAlert,
  setConfirmModalShow,
  toogleConfirmModalShow,
  setTimestampOffset,
  setShowGuide,
  addAppLaunchedAddress,
  setBackendHealth,
  setNetworkHealth,
  addWhitelistAddress,
  removeWhitelistAddress,
  setTourStepIndex,
  setShowPlatformNotice,
  setTermsAccepted,
} = appSlice.actions;
export const getAppState = createSelector(baseInfo, (app) => app);

export const getAppMode = createSelector(
  (state: RootState) => state,
  (state) => {
    if (!state.app.networkHealth) {
      return AppMode.OfflineMode;
    }
    if (state.trade.maintenanceMode || !state.app.backendHealth) {
      return AppMode.MaintenanceMode;
    }
    return AppMode.Success;
  }
);
