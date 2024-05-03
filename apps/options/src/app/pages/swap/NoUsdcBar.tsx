import React from "react";

function NoUsdcBar() {
  return (
    <div className="bg-btnGreenBgColor/10 text-successTxtColor text-14 p-15 rounded-3xl text-center">
      You need native USDC to trade. Don’t worry, you can get some USDC in 2 steps right{" "}
      <a
        target="_blank"
        className="underline"
        href="https://ryze.fi/docs/how-to-bridge-eth-to-arbitrum"
        rel="noreferrer"
      >
        here.
      </a>
    </div>
  );
}

export default NoUsdcBar;
