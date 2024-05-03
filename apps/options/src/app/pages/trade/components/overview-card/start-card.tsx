import ArrowForwardTwoToneIcon from "@mui/icons-material/ArrowForwardTwoTone";
import { useEffect, useState } from "react";

import { getCurrentTimeFrame } from "../../../../store/reducers/trade-slice";
import { numberWithCommas } from "@fantohm/shared-web3";
import LockIcon from "@mui/icons-material/Lock";
import { useSelector } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import { RootState } from "../../../../store";
import { isEpoch, minuteTimer } from "../../../../helpers/data-translations";
import PriceWidget from "../round-card/price-widget";

const StartCard = ({
  currentPrice,
  cardId,
}: {
  currentPrice: number;
  cardId: number;
}) => {
  const currentTimeFrame = useSelector(getCurrentTimeFrame);
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const [timerValue, setTimerValue] = useState("");

  useEffect(() => {
    const time = minuteTimer(currentTimeFrame.remainingTime);
    setTimerValue(time);
  }, [currentTimeFrame]);

  return (
    <div
      className={`art-round-card h-[fit-content] bg-charcoalGray rounded-3xl xs:p-10 xl:p-15 2xl:p-20 flex flex-col gap-20 border-2 transition-all ${
        cardId === 1 ? "border-success" : "border-obsidianBlack hover:border-deepGray"
      } hover:cursor-pointer active:border-success relative overflow-hidden`}
      id="start-card"
    >
      <div className="w-full card-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <ArrowForwardTwoToneIcon className="rounded-full bg-heavybunker text-second border-[#0f1617] w-26 h-26" />
            <div className="ml-[5px] text-18 2xl:text-22 text-primary flex gap-10">
              <div>Lock in</div>
              <div className="relative">
                {isInitializing && (
                  <div className="absolute rounded-md min-w-65 w-full overflow-hidden h-full z-30 left-0 top-0 bg-woodsmoke">
                    <div className="w-full h-full opacity-20">
                      <Skeleton
                        variant="rectangular"
                        height={"100%"}
                        width={"100%"}
                        sx={{ backgroundColor: "#48565d" }}
                      />
                    </div>
                  </div>
                )}
                {timerValue}
              </div>
            </div>
            {currentTimeFrame.rounds[2].amount !== 0 && !isInitializing && (
              <div
                className={`flex items-center justify-center py-[2px] w-150 rounded-full xs:text-16 2xl:text-20 absolute bottom-20 right-[-37px] -rotate-45 ${
                  currentTimeFrame.rounds[2].position
                    ? "bg-[#522531] text-danger"
                    : "bg-[#095550] text-success"
                }`}
              >
                <LockIcon className="xs:text-16 2xl:text-20 my-[3px] " />
                {currentTimeFrame.rounds[2].position ? "Down" : "Up"}
              </div>
            )}
          </div>
          <div className="relative">
            {(isInitializing || isEpoch(currentTimeFrame?.rounds[2]?.epoch)) && (
              <div className="absolute rounded-md w-80 min-w-full overflow-hidden h-full z-30 right-0 top-0 bg-woodsmoke">
                <div className="w-full h-full opacity-20">
                  <Skeleton
                    variant="rectangular"
                    height={"100%"}
                    width={"100%"}
                    sx={{ backgroundColor: "#48565d" }}
                  />
                </div>
              </div>
            )}
            <p className="text-18 2xl:text-20 text-second">
              #{numberWithCommas(currentTimeFrame.rounds[2].epoch)}
            </p>
          </div>
        </div>
      </div>
      <PriceWidget
        priceTitle1="Open price"
        priceTitle2="Current price"
        closePrice={currentPrice}
      />
    </div>
  );
};

export default StartCard;
