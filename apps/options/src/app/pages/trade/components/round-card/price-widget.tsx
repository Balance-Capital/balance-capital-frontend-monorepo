import { RootState } from "../../../../store";
import React from "react";
import { useSelector } from "react-redux";
import LoadingSkeleton from "./loading-skeleton";
import { numberWithCommas } from "../../../../helpers/data-translations";
import { getAllSymbols } from "../../../../components/tvchart/api/api";

type Props = {
  priceTitle1: string;
  priceTitle2: string;
  openPrice?: number;
  closePrice: number;
  size?: "sm" | "lg";
};

const PriceWidget = ({
  priceTitle1,
  priceTitle2,
  openPrice,
  closePrice,
  size = "sm",
}: Props) => {
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const symbolName = `${underlyingToken.symbol}/USD`;
  const symbols = getAllSymbols();
  const symbolItem = symbols.find(({ symbol }) => symbol === symbolName);

  // const { update } = useCountUp({
  //   ref: "startingRoundCounter",
  //   decimals: 2,
  //   duration: 0.1,
  //   start: 0,
  //   end: closePrice || 0,
  //   separator: ",",
  //   enableScrollSpy: true,
  //   scrollSpyDelay: 500,
  // });

  // useEffect(() => {
  //   if (closePrice) {
  //     update(closePrice);
  //   }
  // }, [closePrice]);

  return (
    <div className="bg-pageBgColor border-btnBlackStrokeColor border-2 p-20 rounded-3xl flex justify-between items-center">
      <div className={size === "sm" ? "w-110 2xl:w-120" : "w-120 2xl:w-150"}>
        <p className="xs:text-15 2xl:text-16 text-grayTxtColor">{priceTitle1}</p>
        <div className="relative">
          {isInitializing && (
            <LoadingSkeleton className="absolute rounded-md w-full h-full overflow-hidden z-30 right-0 top-0 bg-btnBlackBgColor" />
          )}
          <p
            className={`text-btnBlackTxtColor ${
              size === "sm"
                ? " xs:text-18 2xl:text-22"
                : " xs:text-22 2xl:text-26 font-bold"
            }`}
          >
            {openPrice ? numberWithCommas(openPrice, symbolItem?.decimals) : "-"}
          </p>
        </div>
      </div>
      <div className={size === "sm" ? "w-110 2xl:w-120" : "w-120 2xl:w-150"}>
        <p className="xs:text-15 2xl:text-16 text-grayTxtColor">{priceTitle2}</p>
        <div className="relative">
          {isInitializing && (
            <LoadingSkeleton className="absolute rounded-md w-full h-full overflow-hidden z-30 right-0 top-0 bg-btnBlackBgColor" />
          )}
          <p
            className={`transition-all ${
              openPrice
                ? closePrice > openPrice
                  ? "text-successTxtColor"
                  : "text-warnTxtColor"
                : "text-btnBlackTxtColor"
            } ${
              size === "sm"
                ? " xs:text-18 2xl:text-22"
                : " xs:text-22 2xl:text-26 font-bold"
            }`}
          >
            {numberWithCommas(closePrice, symbolItem?.decimals)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceWidget;
