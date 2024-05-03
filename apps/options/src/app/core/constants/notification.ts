import { styled } from "@mui/material";
import { MaterialDesignContent } from "notistack";

declare module "notistack" {
  interface VariantOverrides {
    warning: true;
    betResult: {
      currency?: string;
      position?: number;
      isWin?: boolean;
      roundId?: number;
      isReverted?: boolean;
      timeframeId?: number;
    };
  }
}

export const Notify_Duration = 5000; // 5s

export enum NotifyType {
  DEFAULT = "success",
  SUCCESS = "success",
  INFO = "info",
  WARN = "warning",
  ERROR = "error",
  BET_RESULT = "betResult",
}

export const NotifyMessage = {
  AmountInsufficient: "Trade amount should be more than ",
  AllowanceInsufficient: "Allowance should be more than trade amount",
  BetSucceed: "Trade successfully placed",
  ClaimSucceed: "Successfully claimed",
  RefundSucceed: "Successfully refunded",
  ApproveSuccess: "Successfully approved",
  DepositSuccess: "Successfully deposited",
  RequestWithdrawalSuccess: "Withdrawal successfully requested",
  CancelWithdrawalSuccess: "Withdrawal successfully canceled",
  ExecuteWithdrawalSuccess: "Withdrawal successfully executed",
  MergePositionsSuccess: "Successfully merged.",
  NotBettable: "The round isn't tradable",
  AmountNotEnough: "Insufficient funds.",
  WrongNetwork: "Please change your network.",
  DefaultError: "Something went wrong. Please try again.",
  InsufficientETHBalance: "You don't have any ETH for gas.",
  NoRoundToClaim: "No round to claim.",
  FutureBettingNotAvailable: "Future trade is not available.",
  BetNotSuccess: "Trade was not successfully placed.",
  TransferSucceed: "Sucessfully transfered",
  TransferError: "Failed transfer",
  MintSuccess: "Mint sucessfully",
  WrapSuccess: "Wrap successfully",
  UnwrapSuccess: "Unwrap successfully",
};

export const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  borderRadius: "15px",
  maxWidth: "350px",
  backgroundColor: "rgb(var(--color-btn-black-bgColor))",
  "&.notistack-MuiContent-success": {
    border: "2px solid rgb(var(--color-success-txtColor))",
    "#notistack-snackbar": {
      color: "rgb(var(--color-success-txtColor))",
    },
  },
  "&.notistack-MuiContent-error": {
    border: "2px solid rgb(var(--color-warn-txtColor))",
    "#notistack-snackbar": {
      color: "rgb(var(--color-warn-txtColor))",
    },
  },
  "&.notistack-MuiContent-warning": {
    border: "2px solid #ffb300",
    "#notistack-snackbar": {
      color: "#ffb300 !important",
    },
  },
  "&.notistack-MuiContent-info": {
    border: "2px solid #1e88e5",
    "#notistack-snackbar": {
      color: "#1e88e5",
    },
  },
}));
