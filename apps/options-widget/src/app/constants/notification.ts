import { styled } from "@mui/material";
import { MaterialDesignContent } from "notistack";

declare module "notistack" {
  interface VariantOverrides {
    warning: true;
  }
}

export const Notify_Duration = 5000; // 5s

export enum NotifyType {
  DEFAULT = "success",
  SUCCESS = "success",
  INFO = "info",
  WARN = "warning",
  ERROR = "error",
}

export const NOTIFY_MSG = Object.freeze({
  CHECK_BOX: "One field must be checked!",
  COPIED: "Copied to clipboard!",
});

export const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  borderRadius: "15px",
  maxWidth: "350px",
  backgroundColor: "#0B0F10",
  "&.notistack-MuiContent-success": {
    border: "2px solid #13C9BD",
    color: "#13C9BD",
  },
  "&.notistack-MuiContent-error": {
    border: "2px solid #FF586C",
    color: "#FF586C",
  },
  "&.notistack-MuiContent-warning": {
    border: "2px solid #ffb300",
    color: "#ffb300",
  },
  "&.notistack-MuiContent-info": {
    border: "2px solid #1e88e5",
    color: "#1e88e5",
  },
}));
