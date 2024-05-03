import { useNavigate } from "react-router-dom";
import React from "react";

import { CryptoCurrency } from "../../core/types/basic.types";
import usePageTitle from "../../hooks/usePageTitle";
import { emitHomeTeaserTradeClickTrack } from "../../helpers/analytics";
import { useAccount } from "../../hooks/useAccount";

export interface TrendingPadProps {
  sourceToken: string;
  underlyingToken: CryptoCurrency;
  isJackpot?: boolean;
}

const TrendingPad = (props: TrendingPadProps) => {
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
  const { address } = useAccount();

  const handleTradeClick = (underlyingToken: CryptoCurrency) => {
    navigate(`/trade?underlyingToken=${underlyingToken.symbol.toLowerCase()}`);
    window.scrollTo(0, 0);

    if (address) {
      emitHomeTeaserTradeClickTrack(pageTitle, address, `${underlyingToken.symbol}/USD`);
    }
  };

  return (
    <div className="w-[300px] h-[160px] md:w-[470px] md:h-[250px] backdrop-blur-[30px] bg-transparent backdrop-brightness-[1.1] rounded-[12px] flex flex-col">
      <div className="w-full h-[50%] rounded-[12px] bg-lightbunker/[0.42] backdrop-blur-[3px] flex items-center justify-between xs:px-20 md:px-40">
        <div className="flex items-center gap-20">
          <img
            className="xs:w-[32px] xs:h-[32px] md:w-50 md:h-50 rounded-full"
            src={`./assets/images/${props.underlyingToken.symbol}.png`}
            alt="ETH logo"
          />
          <div>
            <h2 className="font-OcrExtendedRegular text-9 md:text-15 text-second">
              {props.sourceToken}/{props.underlyingToken.symbol}
            </h2>
            <p className="text-19 md:text-30 text-primary">
              {props.underlyingToken.name}
            </p>
          </div>
        </div>
        <img
          className="w-[38%] md:w-auto"
          src="./assets/images/trading0.png"
          alt="ETH logo"
        />
      </div>
      <div className="w-full h-[50%] flex items-center justify-center">
        <button
          onClick={() => handleTradeClick(props.underlyingToken)}
          className="w-[122px] h-[32px] md:w-[187px] md:h-[49px] font-OcrExtendedRegular text-11 md:text-18 text-buttontext font-semibold bg-success rounded-[16px]"
        >
          TRADE
        </button>
      </div>
    </div>
  );
};

export default TrendingPad;
