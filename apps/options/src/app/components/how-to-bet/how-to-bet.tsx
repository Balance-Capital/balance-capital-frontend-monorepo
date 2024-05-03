import React from "react";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

const HowToBet = () => {
  return (
    <a
      href="https://ryze.fi/docs/how-to-place-a-trade"
      target="_blank"
      rel="noopener noreferrer"
      className="text-grayTxtColor flex items-center justify-center gap-5"
    >
      <div className="text-center text-16 w-25 h-25 flex justify-center items-center rounded-full bg-grayTxtColor">
        <HelpOutlineOutlinedIcon className="text-center text-16" />
      </div>
      How to place a trade?
    </a>
  );
};

export default HowToBet;
