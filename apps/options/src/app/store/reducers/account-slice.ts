import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { Underlying_Token } from "../../core/constants/basic";
import { loadEnvVariable, MULTICALL2_ADDRESS } from "../../core/constants/network";
import { multicall } from "../../helpers/contractHelpers";
import ERC20ABI from "../../core/abi/ERC20.json";
import MulticallABI from "../../core/abi/Multicall.json";

import { RootState } from "../index";
import { ContractCallContext } from "ethereum-multicall";
import { formatEther } from "ethers/lib/utils.js";
import { BigNumber } from "ethers";
import { updateOperatorWalletBalance } from "./trade-slice";
import { currentNetworkChain } from "../../context/NetworkContext";
export interface AccountState {
  ethBalance: number;
  uTokenBalance?: string;
}

const initialState: AccountState = {
  ethBalance: -1,
  uTokenBalance: undefined,
};

export const loadAccountBalances = createAsyncThunk(
  "account/loadAccountBalances",
  async (address: string, { dispatch, rejectWithValue }) => {
    try {
      if (address === "") {
        return rejectWithValue("");
      }
      const contractCallContext: ContractCallContext[] = [
        {
          reference: "UnderlyingToken",
          contractAddress: Underlying_Token[currentNetworkChain.id].address,
          abi: ERC20ABI,
          calls: [
            {
              reference: "balanceOf",
              methodName: "balanceOf",
              methodParameters: [address],
            },
          ],
        },
        {
          reference: "Multicall",
          contractAddress: MULTICALL2_ADDRESS(),
          abi: MulticallABI,
          calls: [
            {
              reference: "getEthBalance",
              methodName: "getEthBalance",
              methodParameters: [address],
            },
            {
              reference: "getEthBalance",
              methodName: "getEthBalance",
              methodParameters: [
                loadEnvVariable(
                  `NX_BINARY_${currentNetworkChain.id}_OPERATOR_BTC_ADDRESS`
                ),
              ],
            },
            {
              reference: "getEthBalance",
              methodName: "getEthBalance",
              methodParameters: [
                loadEnvVariable(
                  `NX_BINARY_${currentNetworkChain.id}_OPERATOR_ETH_ADDRESS`
                ),
              ],
            },
            // {
            //   reference: "getEthBalance",
            //   methodName: "getEthBalance",
            //   methodParameters: [BINARY_ADDRESSES.OPERATOR_WALLETS.BNB],
            // },
            // {
            //   reference: "getEthBalance",
            //   methodName: "getEthBalance",
            //   methodParameters: [BINARY_ADDRESSES.OPERATOR_WALLETS.XRP],
            // },
            // {
            //   reference: "getEthBalance",
            //   methodName: "getEthBalance",
            //   methodParameters: [BINARY_ADDRESSES.OPERATOR_WALLETS.MATIC],
            // },
            // {
            //   reference: "getEthBalance",
            //   methodName: "getEthBalance",
            //   methodParameters: [BINARY_ADDRESSES.OPERATOR_WALLETS.DOGE],
            // },
            {
              reference: "getEthBalance",
              methodName: "getEthBalance",
              methodParameters: [
                loadEnvVariable(
                  `NX_BINARY_${currentNetworkChain.id}_OPERATOR_SOL_ADDRESS`
                ),
              ],
            },
            // {
            //   reference: "getEthBalance",
            //   methodName: "getEthBalance",
            //   methodParameters: [BINARY_ADDRESSES.OPERATOR_WALLETS.LINK],
            // },
          ],
        },
      ];

      const { results } = await multicall().call(contractCallContext);
      const uTokenBalance = BigNumber.from(
        results["UnderlyingToken"].callsReturnContext[0].returnValues[0].hex
      ).toString();
      const ethBalance = parseFloat(
        formatEther(
          BigNumber.from(results["Multicall"].callsReturnContext[0].returnValues[0].hex)
        )
      );

      const operatorBTCBalance = parseFloat(
        formatEther(
          BigNumber.from(results["Multicall"].callsReturnContext[1].returnValues[0].hex)
        )
      );

      const operatorETHBalance = parseFloat(
        formatEther(
          BigNumber.from(results["Multicall"].callsReturnContext[2].returnValues[0].hex)
        )
      );

      // const operatorBNBBalance = parseFloat(
      //   formatEther(
      //     BigNumber.from(results["Multicall"].callsReturnContext[3].returnValues[0].hex)
      //   )
      // );

      // const operatorXRPBalance = parseFloat(
      //   formatEther(
      //     BigNumber.from(results["Multicall"].callsReturnContext[4].returnValues[0].hex)
      //   )
      // );

      // const operatorMATICBalance = parseFloat(
      //   formatEther(
      //     BigNumber.from(results["Multicall"].callsReturnContext[5].returnValues[0].hex)
      //   )
      // );

      // const operatorDOGEBalance = parseFloat(
      //   formatEther(
      //     BigNumber.from(results["Multicall"].callsReturnContext[6].returnValues[0].hex)
      //   )
      // );

      const operatorSOLBalance = parseFloat(
        formatEther(
          BigNumber.from(results["Multicall"].callsReturnContext[3].returnValues[0].hex)
        )
      );

      // const operatorLINKBalance = parseFloat(
      //   formatEther(
      //     BigNumber.from(results["Multicall"].callsReturnContext[8].returnValues[0].hex)
      //   )
      // );

      dispatch(
        updateOperatorWalletBalance({
          BTC: operatorBTCBalance,
          ETH: operatorETHBalance,
          // BNB: operatorBNBBalance,
          // XRP: operatorXRPBalance,
          // MATIC: operatorMATICBalance,
          // DOGE: operatorDOGEBalance,
          SOL: operatorSOLBalance,
          // LINK: operatorLINKBalance,
        })
      );

      return { ethBalance, uTokenBalance };
    } catch (error) {
      console.error("account/loadAccountBalances: ", error);
      rejectWithValue("");
    }
    return { ethBalance: -1, uTokenBalance: "" };
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadAccountBalances.pending, (state: AccountState, action) => {
      state.ethBalance = -1;
      state.uTokenBalance = undefined;
    });
    builder.addCase(loadAccountBalances.rejected, (state: AccountState, action) => {
      state.ethBalance = -1;
      state.uTokenBalance = undefined;
    });
    builder.addCase(loadAccountBalances.fulfilled, (state: AccountState, action) => {
      state.ethBalance = action.payload.ethBalance;
      state.uTokenBalance = action.payload.uTokenBalance;
    });
  },
});

const baseInfo = (state: RootState) => state.account;

export const accountReducer = accountSlice.reducer;
export const getAccountState = createSelector(baseInfo, (account) => account);
