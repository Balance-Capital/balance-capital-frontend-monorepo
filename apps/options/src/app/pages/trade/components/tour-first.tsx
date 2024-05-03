import Button from "@mui/material/Button";
import React from "react";

type Props = {
  handleOk: () => void;
  handleCancel: () => void;
};

const TourFirst = ({ handleOk, handleCancel }: Props) => {
  return (
    <div>
      <div className="w-screen h-screen fixed top-0 left-0 z-[999] bg-[#0003] backdrop-blur-[1px]"></div>
      <div className="fixed top-100 left-20 md:left-50 z-[1000] bg-btnBlackBgColor rounded-2xl border-2 border-btnBlackStrokeColor px-20 py-15 flex flex-col gap-10">
        <div className="flex items-center gap-10">
          <div className="flashing-dot"></div>
          <div className="text-grayTxtColor">Welcome to Ryze.fi</div>
        </div>
        <div className="text-grayTxtColor/80 text-14">
          One-tap crypto trading platform. <br />
          Would you like a guided walkthrough?
        </div>
        <div className="flex gap-15">
          <Button size="small" className="text-brandColor normal-case" onClick={handleOk}>
            Continue
          </Button>
          <Button
            size="small"
            className="text-grayTxtColor normal-case"
            onClick={handleCancel}
          >
            No, thanks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TourFirst;
