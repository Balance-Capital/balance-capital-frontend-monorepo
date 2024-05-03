import { configureStore, createSelector } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { appReducer } from "./reducers/app-slice";
import { chatReducer } from "./reducers/chat-slice";
import { saveState } from "@fantohm/shared-web3";
import { accountReducer } from "./reducers/account-slice";
import pendingTxReducer from "./reducers/pendingTx-slice";
import { tradeReducer } from "./reducers/trade-slice";
import { marketStateReducer } from "./reducers/market-state-slice";
import { leaderboardReducer } from "./reducers/leaderboard-slice";
import { openRoundsReducer } from "./reducers/openedRounds-slice";
import { vaultReducer } from "./reducers/vault-slice";
import { closedRoundsReducer } from "./reducers/closedRounds-slice";
import { binaryConfigReducer } from "./reducers/config-slice";
import { swapReducer } from "./reducers/swap-slice";
import { referralsReducer } from "./reducers/referrals-slice";
import { ryzeCreditReducer } from "./reducers/credit-slice";
import { widgetReducer } from "./reducers/widget-slice";
import { rewardReducer } from "./reducers/reward-slice";

const store = configureStore({
  reducer: {
    app: appReducer,
    account: accountReducer,
    chat: chatReducer,
    pendingTx: pendingTxReducer,
    trade: tradeReducer,
    marketState: marketStateReducer,
    leaderboard: leaderboardReducer,
    ryzecredit: ryzeCreditReducer,
    openRounds: openRoundsReducer,
    closedRounds: closedRoundsReducer,
    vault: vaultReducer,
    binaryConfig: binaryConfigReducer,
    swap: swapReducer,
    referrals: referralsReducer,
    widget: widgetReducer,
    reward: rewardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

store.subscribe(() => {
  saveState("app", store.getState().app);
  saveState("account", store.getState().account);
  saveState("chat", store.getState().chat);
  saveState("trade", store.getState().trade);
  saveState("marketState", store.getState().marketState);
  saveState("leaderboard", store.getState().leaderboard);
  saveState("openRounds", store.getState().openRounds);
  saveState("vault", store.getState().vault);
  saveState("widget", store.getState().widget);
});

const accountInfo = (state: RootState) => state.account;
export const getAccountState = createSelector(accountInfo, (account) => account);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
