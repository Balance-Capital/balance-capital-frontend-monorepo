import { configureStore } from "@reduxjs/toolkit";
import leftNavBarReducer from "./reducers/leftnavbarSlice";

export const store = configureStore({
  reducer: {
    leftnavbar: leftNavBarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
