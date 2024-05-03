import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { loadEnvVariable } from "../../core/constants/network";
import {
  GRAPH_URL,
  LoadVaultBalanceInterval,
  Underlying_Token,
} from "../../core/constants/basic";
import {
  getVaultData,
  getVaultTotalInvestedAmount,
  getVaultUserPositions,
} from "../../core/apollo/query";
import retry from "async-retry";
import { getVaultContract, multicall } from "../../helpers/contractHelpers";
import { BigNumber } from "ethers";
import { PositionData } from "../../core/types/basic.types";
import { ContractCallContext } from "ethereum-multicall";
import BinaryVaultABI from "../../core/abi/BinaryVault.json";
import ERC20ABI from "../../core/abi/ERC20.json";
import { formatUtoken } from "../../helpers/data-translations";
import { currentNetworkChain } from "../../context/NetworkContext";

const AsyncRetryCount = 5;

interface VaultData {
  address: string;
  balance: number;
  totalShares: number;
  totalStakedAmount: number;
  totalInvestedAmount: number;
  withdrawalLockTime: number;
  positions: PositionData[];
  sharePrice7DAgo: number;
  lastUpdatedTime: number;
}

const defaultVaultData: VaultData = {
  address: "",
  balance: -1,
  totalShares: 0,
  positions: [],
  totalStakedAmount: -1,
  withdrawalLockTime: -1,
  sharePrice7DAgo: 0,
  totalInvestedAmount: -1,
  lastUpdatedTime: 0,
};

const initialState: VaultData = {
  ...defaultVaultData,
};

export const setVaultData = createAsyncThunk(
  "vault/setVaultData",
  async (_, { dispatch, getState }) => {
    const newState: VaultData = { ...defaultVaultData };
    newState.address = loadEnvVariable(
      `NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`
    );
    newState.balance = -1;

    const timeOffset = (getState() as RootState).app.timestampOffset;

    const client = new ApolloClient({
      uri: GRAPH_URL(),
      cache: new InMemoryCache(),
    });
    const query = getVaultData(
      newState.address,
      Math.floor((timeOffset.offset + Date.now()) / 1000)
    );
    try {
      const { data: res } = await retry(async () => await client.query({ query }), {
        retries: AsyncRetryCount,
      });

      newState.totalShares = parseFloat(res.vault.totalShares);
      newState.totalStakedAmount = parseFloat(res.vault.totalStakedAmount);
      newState.totalInvestedAmount = parseFloat(res.vault.totalInvestedAmount);

      newState.sharePrice7DAgo =
        parseFloat(res.vault.snapshots[0].totalStakedAmount) /
        parseFloat(res.vault.snapshots[0].totalShares);
    } catch (err) {
      console.error("vault/setVaultData/getVaultData", err);
    }

    dispatch(loadVaultBalance(true));

    const vaultContract = getVaultContract(undefined);
    newState.withdrawalLockTime = parseInt(
      (await vaultContract["withdrawalDelayTime"]()) + ""
    );

    return newState;
  }
);

export const loadVaultUserPositions = createAsyncThunk(
  "vault/loadVaultUserPositions",
  async (address: string, { rejectWithValue }) => {
    try {
      const vaultAddress = loadEnvVariable(
        `NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`
      );
      const query = getVaultUserPositions(vaultAddress, address);

      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });
      const { data: res } = await retry(async () => await client.query({ query }), {
        retries: AsyncRetryCount,
      });

      const positions = (res.vaultPositions as any[]).map((position: any) => {
        const tmp: PositionData = {
          ...position,
          investAmount: parseFloat(position.investAmount),
          shareAmount: parseFloat(position.shareAmount),
          tokenId: parseInt(position.tokenId),
          timestamp: parseInt(position.timestamp),
          shares: "",
          tokenValue: "",
          netValue: "",
          fee: "",
        };
        if (position.withdrawal !== null) {
          tmp.withdrawal = {
            shareAmount: parseFloat(position.withdrawal.shareAmount),
            startTime: parseInt(position.withdrawal.startTime),
          };
        }
        return tmp;
      });

      const context = {
        reference: "BinaryVault",
        contractAddress: loadEnvVariable(
          `NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`
        ),
        abi: BinaryVaultABI,
        calls: [],
      };

      const calls: any[] = [];

      for (let i = 0; i < positions.length; i++) {
        calls.push({
          reference: "BinaryVault",
          methodName: "getSharesOfToken",
          methodParameters: [positions[i].tokenId],
        });
      }

      context.calls = calls as any;
      const data = await multicall().call(context);

      positions.forEach((pos, ind) => {
        const sharesOfToken =
          data.results["BinaryVault"].callsReturnContext[ind].returnValues;
        pos.shares = BigNumber.from(sharesOfToken[0]).toString();
        pos.tokenValue = BigNumber.from(sharesOfToken[1]).toString();
        pos.netValue = BigNumber.from(sharesOfToken[2]).toString();
        pos.fee = BigNumber.from(sharesOfToken[3]).toString();
      });

      return positions;
    } catch (error) {
      console.error("vault/loadVaultUserPositions", error);
      return rejectWithValue("");
    }
  }
);

export const loadVaultBalance = createAsyncThunk(
  "vault/loadVaultBalance",
  async (loadInvestAmount: boolean, { getState, rejectWithValue }) => {
    const currentState = (getState() as RootState).vault;

    const vaultAddress = loadEnvVariable(
      `NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`
    );

    const contractCallContext: ContractCallContext[] = [
      {
        reference: "UnderlyingToken",
        contractAddress: Underlying_Token[currentNetworkChain.id].address,
        abi: ERC20ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [vaultAddress],
          },
        ],
      },
      {
        reference: "BinaryVault",
        contractAddress: vaultAddress,
        abi: BinaryVaultABI,
        calls: [
          {
            reference: "totalShareSupply",
            methodName: "totalShareSupply",
            methodParameters: [],
          },
          {
            reference: "totalDepositedAmount",
            methodName: "totalDepositedAmount",
            methodParameters: [],
          },
        ],
      },
    ];

    const { results } = await multicall().call(contractCallContext);

    const balance = formatUtoken(
      BigNumber.from(results["UnderlyingToken"].callsReturnContext[0].returnValues[0].hex)
    );

    const totalShares = formatUtoken(
      BigNumber.from(results["BinaryVault"].callsReturnContext[0].returnValues[0].hex)
    );
    const totalStakedAmount = formatUtoken(
      BigNumber.from(results["BinaryVault"].callsReturnContext[1].returnValues[0].hex)
    );

    let totalInvestedAmount = currentState.totalInvestedAmount;
    if (loadInvestAmount) {
      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });
      const query = getVaultTotalInvestedAmount(
        loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`)
      );
      try {
        const { data: res } = await retry(async () => await client.query({ query }), {
          retries: AsyncRetryCount,
        });
        totalInvestedAmount = parseFloat(res.vault.totalInvestedAmount);
      } catch (error) {
        console.error("loadVaultBalances/totalInvestedAmount", error);
      }
    }

    return [balance, totalShares, totalStakedAmount, totalInvestedAmount];
  }
);

export const addNewPosition = createAsyncThunk(
  "vault/loadLastPosition",
  async (
    {
      userAddress,
      tokenId,
    }: {
      userAddress: string;
      tokenId: number;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const vaultContract = getVaultContract(undefined);
      let positions = (getState() as RootState).vault.positions;

      if (positions.filter((pos) => pos.tokenId === tokenId).length > 0) {
        return rejectWithValue("");
      }

      const investAmount: BigNumber = await vaultContract["initialInvestments"](tokenId);
      const sharesOfToken = await vaultContract["getSharesOfToken"](tokenId);

      const position: PositionData = {
        tokenId,
        investAmount: formatUtoken(investAmount),
        withdrawal: null,
        timestamp: 0,
        owner: userAddress.toLowerCase(),
        shares: sharesOfToken.shares.toString(),
        tokenValue: sharesOfToken.tokenValue.toString(),
        netValue: sharesOfToken.netValue.toString(),
        fee: sharesOfToken.fee.toString(),
      };

      positions = (getState() as RootState).vault.positions;
      if (positions.filter((pos) => pos.tokenId === tokenId).length > 0) {
        return rejectWithValue("");
      }

      return position;
    } catch (error) {
      console.error("vault/loadLastPosition: ", error);
      return rejectWithValue("");
    }
  }
);

const vaultSlice = createSlice({
  name: "vault",
  initialState,
  reducers: {
    removePosition: (state, action: PayloadAction<number>) => {
      const tokenId = action.payload;
      state.positions = state.positions.filter((pos) => pos.tokenId !== tokenId);
    },
    addWithdrawalRequest: (
      state,
      action: PayloadAction<{
        shareAmount: number;
        tokenId: number;
        currentTime: number;
      }>
    ) => {
      for (let i = 0; i < state.positions.length; i++) {
        if (state.positions[i].tokenId === action.payload.tokenId) {
          state.positions[i].withdrawal = {
            shareAmount: action.payload.shareAmount,
            startTime: Math.floor(action.payload.currentTime / 1000),
          };
        }
      }
    },
    removeWithdrawalRequest: (state, action: PayloadAction<number>) => {
      for (let i = 0; i < state.positions.length; i++) {
        if (state.positions[i].tokenId === action.payload) {
          state.positions[i].withdrawal = null;
        }
      }
    },
    emptyUserPosotions: (state) => {
      state.positions = [];
    },
    updatePositionShareInfo: (
      state,
      action: PayloadAction<{
        shares: string;
        tokenValue: string;
        netValue: string;
        fee: string;
        tokenId: number;
      }>
    ) => {
      for (let i = 0; i < state.positions.length; i++) {
        if (state.positions[i].tokenId === action.payload.tokenId) {
          state.positions[i].shares = action.payload.shares;
          state.positions[i].tokenValue = action.payload.tokenValue;
          state.positions[i].netValue = action.payload.netValue;
          state.positions[i].fee = action.payload.fee;
        }
      }
    },
    updateTotalInvestedAmount: (state, action: PayloadAction<number>) => {
      state.totalInvestedAmount += action.payload;
      state.lastUpdatedTime = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      setVaultData.fulfilled,
      (state: VaultData, action: PayloadAction<VaultData>) => {
        state.address = action.payload.address;
        state.sharePrice7DAgo = action.payload.sharePrice7DAgo;
        state.totalShares = action.payload.totalShares;
        // state.totalStakedAmount = action.payload.totalStakedAmount;
        state.totalInvestedAmount = action.payload.totalInvestedAmount;
        state.withdrawalLockTime = action.payload.withdrawalLockTime;
      }
    );
    builder.addCase(
      loadVaultBalance.fulfilled,
      (state: VaultData, action: PayloadAction<number[]>) => {
        if (Date.now() - state.lastUpdatedTime > LoadVaultBalanceInterval / 2) {
          state.balance = action.payload[0];
          state.totalShares = action.payload[1];
          state.totalStakedAmount = action.payload[2];
          state.totalInvestedAmount = action.payload[3];
        }
      }
    );
    builder.addCase(
      addNewPosition.fulfilled,
      (state: VaultData, action: PayloadAction<PositionData>) => {
        state.positions = [...state.positions, action.payload];
      }
    );
    builder.addCase(loadVaultUserPositions.fulfilled, (state, action) => {
      state.positions = action.payload;
    });
  },
});

export const vaultReducer = vaultSlice.reducer;
export const {
  removePosition,
  addWithdrawalRequest,
  removeWithdrawalRequest,
  emptyUserPosotions,
  updatePositionShareInfo,
  updateTotalInvestedAmount,
} = vaultSlice.actions;
