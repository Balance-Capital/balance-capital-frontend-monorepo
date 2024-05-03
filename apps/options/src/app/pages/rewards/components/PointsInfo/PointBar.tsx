import Skeleton from "@mui/material/Skeleton";
import React from "react";

interface IProps {
  name: string;
  value: string | number;
}

function PointBar({ name, value }: IProps) {
  return (
    <div className="xs:bg-transparent lg:bg-charcoalGray rounded-2xl border-obsidianBlack border-2 p-20 flex items-center justify-between gap-5">
      <h2 className="text-second  break-all">{name}:</h2>
      {value ? (
        <p className="text-textWhite">
          {typeof value === "string" ? value : value.toLocaleString("es-US")}
        </p>
      ) : (
        <Skeleton width={42} height={33} className="!bg-grayTxtColor" />
      )}
    </div>
  );
}

export default PointBar;
