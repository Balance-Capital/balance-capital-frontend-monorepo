import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { registerUserProfile } from "../../helpers/axios";

interface IUserProfile {
  address: string;
  referralId: string;
}

export interface IReferralsSlice {
  userProfile: IUserProfile;
  referralCode: string;
  refCode: string;
}

const EmptyUserProfile = {
  address: "",
  referralId: "",
};

export const loadUserProfileThunk = createAsyncThunk(
  "referrals/loadUserProfile",
  async (
    { address, referralCode }: { address: string; referralCode: string },
    { rejectWithValue }
  ) => {
    try {
      const profile = await registerUserProfile(address, referralCode);
      if (profile === "") {
        return rejectWithValue("");
      }
      return {
        address: address.toLowerCase,
        ...profile,
      };
    } catch (error) {
      console.error("referrals/loadUserProfile", error);
      return rejectWithValue("");
    }
  }
);

const initialState: IReferralsSlice = {
  userProfile: EmptyUserProfile,
  referralCode: "",
  refCode: "",
};

const referralsSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.userProfile = EmptyUserProfile;
    },
    setUserProfile: (state, action: PayloadAction<IUserProfile>) => {
      state.userProfile = action.payload;
    },
    setReferralCode: (state, action: PayloadAction<string>) => {
      state.referralCode = action.payload;
    },
    setRefCode: (state, action: PayloadAction<string>) => {
      state.refCode = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(loadUserProfileThunk.rejected, (state) => {
      state.userProfile = EmptyUserProfile;
    });
    builder.addCase(loadUserProfileThunk.fulfilled, (state, action) => {
      state.userProfile.address = action.payload.address;
      state.userProfile.referralId = action.payload.referralId
        ? action.payload.referralId
        : "";
    });
  },
});

export const { clearUserProfile, setUserProfile, setReferralCode, setRefCode } =
  referralsSlice.actions;

export const referralsReducer = referralsSlice.reducer;
