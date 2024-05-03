import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

const TxPendingSpinner = () => {
  return (
    <div className="w-screen h-screen z-[100000] fixed left-0 top-0 bg-disable/10 flex justify-center items-center backdrop-blur-sm">
      <div className="border-2 border-disable/50 bg-woodsmoke flex flex-col items-center justify-center gap-10 w-350 h-300 rounded-3xl">
        <CircularProgress sx={{ color: "#12b3a8", marginBottom: "20px" }} size={70} />
        <div className="text-textWhite text-18">Waiting for confirmation</div>
        <div className="text-second">Confirm this transaction in your wallet</div>
      </div>
    </div>
  );
};

export default TxPendingSpinner;
