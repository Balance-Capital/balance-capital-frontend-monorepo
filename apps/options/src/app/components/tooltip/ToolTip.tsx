import { Tooltip } from "@mui/material";
import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  title: string;
}

export default function ToolTip({ children, title }: IProps) {
  return (
    <Tooltip
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "#0C181A",
            color: "#5b7481",
            fontFamily: "InterRegular",
            fontSize: "0.70rem",
            padding: "0.65rem",
            borderRadius: "0.5rem",
          },
        },
      }}
      title={title}
    >
      <div className="flex items-center justify-center">{children ? children : null}</div>
    </Tooltip>
  );
}
