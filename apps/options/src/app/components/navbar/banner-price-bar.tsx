import React, { useEffect, useRef, useState } from "react";
import { MarketDetail } from "../../core/types/basic.types";
import { getCoinsPriceHistory } from "../../helpers/axios";

const BannerPriceBar = () => {
  const [currencies, setCurrencies] = useState<MarketDetail[]>([]);
  // const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  const timerIdRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const func = async () => {
      try {
        setCurrencies(await getCoinsPriceHistory());
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
        }
      } catch (error) {
        console.error("getCoinsPriceHistory: ", error);
      }
    };

    func();

    timerIdRef.current = setInterval(func, 60000);
  }, []);

  return (
    <div
      className={`px-15 border-b-[1px] border-b-btnBlackBgColor overflow-hidden h-50 relative ${
        currencies.length > 0 ? "max-h-50" : "max-h-0"
      }`}
    >
      <div className="h-50 flex gap-30 items-center flow-animation absolute left-0 top-0">
        {Array(4)
          .fill(0)
          .map((_, ind) =>
            currencies.map((currency) => (
              <div className="flex gap-15 align-items" key={`${ind}-${currency.symbol}`}>
                <div className="text-grayTxtColor">{currency.symbol}/USD</div>
                <div className="text-btnBlackTxtColor">${currency.price}</div>
                <div
                  className={`px-5 py-[2px] rounded-md ${
                    currency.priceChange < 0
                      ? "text-warnTxtColor bg-warnttext-warnTxtColor/20"
                      : "text-successTxtColor bg-txtsuctext-successTxtColor/20"
                  }`}
                >
                  {currency.priceChange > 0 && "+"}
                  {currency.priceChange}%
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
};

export default BannerPriceBar;
