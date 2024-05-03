import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getConfigContract } from "../../helpers/contractHelpers";
import { loadEnvVariable } from "../../core/constants/network";
import { currentNetworkChain } from "../../context/NetworkContext";

export interface IBinaryConfigSlice {
  tradingFee: number;
}

export const initBinaryConfigData = createAsyncThunk(
  "binaryConfig/initBinaryConfigData",
  async (_, { rejectWithValue }) => {
    try {
      const configContract = getConfigContract(
        loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_CONFIG_ADDRESS`)
      );
      const tradingFee = (await configContract["tradingFee"]()).toNumber() / 100;
      return {
        tradingFee,
      };
    } catch (error) {
      console.error("initBinaryConfigData", error);
      return rejectWithValue("");
    }
  }
);

const initialState: IBinaryConfigSlice = {
  tradingFee: 1,
};

const binaryConfigSlice = createSlice({
  name: "binaryConfig",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initBinaryConfigData.fulfilled, (state, action) => {
      state.tradingFee = action.payload.tradingFee;
    });
  },
});

// export const { fetchPendingTxs, clearPendingTx } = pendingTxSlice.actions;

export const binaryConfigReducer = binaryConfigSlice.reducer;
