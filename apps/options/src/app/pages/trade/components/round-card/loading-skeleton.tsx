import Skeleton from "@mui/material/Skeleton";
import React from "react";

type Props = {
  className: string;
};

const LoadingSkeleton = ({ className }: Props) => {
  return (
    <div className={className}>
      <div className="w-full h-full opacity-20">
        <Skeleton
          variant="rectangular"
          height={"100%"}
          width={"100%"}
          className="!bg-grayTxtColor"
        />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
