import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getCreditInfo } from "../../helpers/axios";
import { getRyzeCreditContract, multicall } from "../../helpers/contractHelpers";
import { loadEnvVariable } from "../../core/constants/network";
import ryzeCreditABI from "../../core/abi/RyzeCredit.json";
import { ethers } from "ethers";
import { Underlying_Token } from "../../core/constants/basic";
import { currentNetworkChain } from "../../context/NetworkContext";

export const CreditTimeframes = {
  t0: true, // 1min
  t1: false, // 5min
  t3: true, // 3min
} as any;

interface ICreditInfo {
  isEligible: boolean;
  address: string;
  tokenId: string;
  totalClaimedAmount: string;
  generatedAt: number;
  amount: string;
  signature: string;
}

interface ICreditToken {
  totalCredits: string | undefined;
}

interface ICreditDropdown {
  selected: {
    img: string;
    name: string;
  };
  creditArr: Array<{
    img: string;
    name: string;
  }>;
}

interface IRyzeCredit {
  creditInfo: ICreditInfo;
  creditToken: ICreditToken;
  creditDropdown: ICreditDropdown;
}

const initialState: IRyzeCredit = {
  creditInfo: {} as ICreditInfo,
  creditToken: {
    totalCredits: undefined,
  } as ICreditToken,
  creditDropdown: {
    selected: {
      img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
      name: Underlying_Token[currentNetworkChain.id].symbol,
    },
    creditArr: [
      {
        img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
        name: Underlying_Token[currentNetworkChain.id].symbol,
      },
      { img: "./assets/icons/usdc-credits.svg", name: "CREDITS" },
    ],
  },
};

interface IFetchCreditInfo {
  address: string;
}
export const fetchCreditInfo = createAsyncThunk(
  "ryzeCredit/CreditInfo",
  async ({ address }: IFetchCreditInfo) => {
    const response = await getCreditInfo(address);
    return response as ICreditInfo;
  }
);

export const fetchCreditTokenTotalCredits = createAsyncThunk(
  "ryzeCredit/CreditTokenTotalCredits",
  async ({ address }: { address: string }) => {
    const lastTokenId = (await getRyzeCreditContract()["nextTokenId"]()).toNumber();

    if (lastTokenId > 1) {
      const context = {
        reference: "RyzeCreditToken",
        contractAddress: loadEnvVariable(
          `NX_BINARY_${currentNetworkChain.id}_CREDIT_TOKEN_ADDRESS`
        ),
        abi: ryzeCreditABI,
        calls: [] as any,
      };

      for (let i = 1; i < lastTokenId; i++) {
        context.calls.push({
          reference: "RyzeCreditToken",
          methodName: "balanceOf",
          methodParameters: [address, i],
        });
      }

      const res = await multicall().call(context);
      const records = res.results["RyzeCreditToken"].callsReturnContext.map((record) => {
        return record.returnValues;
      });

      let totalCredits = 0;
      for (let i = 0; i < records.length; i++) {
        totalCredits += ethers.BigNumber.from(records[i][0]).toNumber();
      }

      return totalCredits.toString();
    }
    return "0";
  }
);

const ryzeCreditSlice = createSlice({
  name: "ryzeCredit",
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<{ img: string; name: string }>) => {
      state.creditDropdown.selected = action.payload;
    },
    setCreditArrAndSelected: (
      state,
      action: PayloadAction<{
        balance: number;
        totalCredits: number;
        currentTimeframeId: number;
      }>
    ) => {
      const { balance, totalCredits, currentTimeframeId } = action.payload;

      if (
        CreditTimeframes[`t${currentTimeframeId}`] === true &&
        balance > 0 &&
        totalCredits > 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [
            {
              img: `./assets/images/${
                Underlying_Token[currentNetworkChain.id].symbol
              }.png`,
              name: Underlying_Token[currentNetworkChain.id].symbol,
            },
            { img: "./assets/icons/usdc-credits.svg", name: "CREDITS" },
          ],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === true &&
        balance > 0 &&
        totalCredits <= 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [
            {
              img: `./assets/images/${
                Underlying_Token[currentNetworkChain.id].symbol
              }.png`,
              name: Underlying_Token[currentNetworkChain.id].symbol,
            },
          ],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === true &&
        balance <= 0 &&
        totalCredits > 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [{ img: "./assets/icons/usdc-credits.svg", name: "CREDITS" }],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === true &&
        balance <= 0 &&
        totalCredits <= 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === false &&
        balance > 0 &&
        totalCredits > 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [
            {
              img: `./assets/images/${
                Underlying_Token[currentNetworkChain.id].symbol
              }.png`,
              name: Underlying_Token[currentNetworkChain.id].symbol,
            },
          ],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === false &&
        balance > 0 &&
        totalCredits <= 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [
            {
              img: `./assets/images/${
                Underlying_Token[currentNetworkChain.id].symbol
              }.png`,
              name: Underlying_Token[currentNetworkChain.id].symbol,
            },
          ],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === false &&
        balance <= 0 &&
        totalCredits > 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [],
        };
      } else if (
        CreditTimeframes[`t${currentTimeframeId}`] === false &&
        balance <= 0 &&
        totalCredits <= 0
      ) {
        state.creditDropdown = {
          selected: {
            img: `./assets/images/${Underlying_Token[currentNetworkChain.id].symbol}.png`,
            name: Underlying_Token[currentNetworkChain.id].symbol,
          },
          creditArr: [],
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchCreditInfo.fulfilled,
      (state, action: PayloadAction<ICreditInfo>) => {
        state.creditInfo = action.payload;
      }
    );
    builder.addCase(fetchCreditTokenTotalCredits.pending, (state, action) => {
      state.creditToken.totalCredits = undefined;
    });
    builder.addCase(
      fetchCreditTokenTotalCredits.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.creditToken.totalCredits = action.payload;
      }
    );
  },
});

export const ryzeCreditReducer = ryzeCreditSlice.reducer;
export const { setCreditArrAndSelected, setSelected } = ryzeCreditSlice.actions;
