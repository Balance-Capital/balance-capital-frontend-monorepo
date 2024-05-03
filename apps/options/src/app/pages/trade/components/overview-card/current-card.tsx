import { useSelector } from "react-redux";
import { numberWithCommas } from "@fantohm/shared-web3";
import LockIcon from "@mui/icons-material/Lock";
import { RootState } from "../../../../store";
import Skeleton from "@mui/material/Skeleton";
import PriceWidget from "../round-card/price-widget";
import { isEpoch } from "apps/options/src/app/helpers/data-translations";

const CurrentCard = ({
  currentPrice,
  cardId,
}: {
  currentPrice: number;
  cardId: number;
}) => {
  const roundData = useSelector((state: RootState) => state.trade.timeframe.rounds[1]);
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);

  return (
    <div
      className={`h-[fit-content] bg-charcoalGray rounded-3xl xs:p-10 xl:p-15 2xl:p-20 flex flex-col gap-20 border-2 transition-all ${
        cardId === 0 ? "border-success" : "border-obsidianBlack hover:border-deepGray"
      } hover:cursor-pointer active:border-success relative overflow-hidden`}
      id="current-card"
    >
      <div className="w-full card-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <span className="absolute inline-flex w-5 h-5 rounded-full opacity-75 animate-ping bg-success" />
            <p className="ml-20 text-18 2xl:text-22 text-primary">In-progress</p>
            {roundData.amount !== 0 && !isInitializing && (
              <div
                className={`flex items-center justify-center py-[2px] w-150 rounded-full xs:text-16 2xl:text-20 absolute bottom-20 right-[-37px] -rotate-45 ${
                  roundData.position
                    ? "bg-[#522531] text-danger"
                    : "bg-[#095550] text-success"
                }`}
              >
                <LockIcon className="xs:text-14 2xl:text-19 my-[3px] " />
                {roundData.position ? "Down" : "Up"}
              </div>
            )}
          </div>
          <div className="relative">
            {(isInitializing || isEpoch(roundData?.epoch)) && (
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
              #{numberWithCommas(roundData.epoch)}
            </p>
          </div>
        </div>
      </div>
      <PriceWidget
        priceTitle1="Open Price"
        priceTitle2="Current Price"
        openPrice={roundData.lockPrice}
        closePrice={currentPrice}
      />
    </div>
  );
};

export default CurrentCard;
