import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { rangoClient } from "../../pages/swap/rango";
import { MetaResponse } from "rango-sdk-basic";

export function setAll(state: any, properties: any) {
  const props = Object.keys(properties);
  props.forEach((key) => {
    state[key] = properties[key];
  });
}

export const loadSwapMetaData = createAsyncThunk("swap/loadMetaData", async () => {
  let result: MetaResponse | null = null;
  try {
    result = await rangoClient.meta();
  } catch (e) {
    console.log(e);
  }
  return {
    value: result,
  };
});

const initialState: {
  loading: boolean;
  value: MetaResponse | null;
} = {
  loading: false,
  value: null,
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    fetchSwapSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSwapMetaData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSwapMetaData.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadSwapMetaData.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export const swapReducer = swapSlice.reducer;
export const { fetchSwapSuccess } = swapSlice.actions;
