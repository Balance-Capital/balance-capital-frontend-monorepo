import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useSelector } from "react-redux";
import { getCurrentTimeFrame } from "../../../../store/reducers/trade-slice";
import { useEffect, useState } from "react";
import { Underlying_Token, getDecimal } from "../../../../core/constants/basic";
import { RootState } from "../../../../store";
import BorderLinearProgress from "./border-linear-progress";
import PriceWidget from "./price-widget";
import { useSwiper } from "swiper/react";
import {
  numberWithCommas,
  getBettingTimeframeWithId,
  isEpoch,
} from "../../../../helpers/data-translations";
import { useNetworkContext } from "apps/options/src/app/context/NetworkContext";

const CurrentRoundCard = ({ setCardId }: { setCardId?: (id: number) => void }) => {
  const swiper = useSwiper();
  const { currentNetworkChainId } = useNetworkContext();

  const currentTimeFrame = useSelector(getCurrentTimeFrame);
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const currentPrice = useSelector(
    (state: RootState) =>
      state.app.latestPrice[underlyingToken.symbol.toUpperCase()]?.price || 0
  );

  const [progressVal, setProgressVal] = useState(0);
  const [percent, setPercent] = useState<number | string | Array<number | string>>(20);

  useEffect(() => {
    setProgressVal(
      currentTimeFrame.remainingTime >
        getBettingTimeframeWithId(currentTimeframeId).minute * 60
        ? 100
        : (currentTimeFrame.remainingTime * 100) /
            (getBettingTimeframeWithId(currentTimeframeId).minute * 60)
    );
  }, [currentTimeFrame]);

  useEffect(() => {
    if (currentTimeFrame.rounds[1].maxAmntLimit)
      setPercent(
        (currentTimeFrame.rounds[1].amount * 100) /
          currentTimeFrame.rounds[1].maxAmntLimit
      );
  }, [currentTimeFrame.rounds[1].amount]);

  return (
    <div
      className="w-full max-w-450 xl:w-450 bg-btnBlackBgColor rounded-3xl xs:p-15 xl:p-20 2xl:p-25 flex flex-col xs:gap-15 2xl:gap-20 border-2 border-btnBlackStrokeColor"
      id="current-round-card"
    >
      <div className="w-full card-title">
        <div className="flex items-center justify-between h-30 2xl:h-35">
          <div className="flex items-center justify-start">
            <span className="absolute inline-flex w-5 h-5 rounded-full opacity-75 animate-ping bg-successTxtColor" />
            <p className="ml-20 xs:text-20 2xl:text-22 text-btnBlackTxtColor">
              Round in-progress
            </p>
          </div>
          <p className="xs:text-20 xl:text-18 2xl:text-22 text-grayTxtColor">
            #
            {isEpoch(currentTimeFrame?.rounds[2]?.epoch)
              ? "--"
              : numberWithCommas(currentTimeFrame.rounds[1].epoch).split(".")[0]}
          </p>
        </div>
        <BorderLinearProgress
          variant="determinate"
          value={progressVal}
          className="mt-10 xl:mt-20 hidden md:block !bg-btnUnselectBgColor [&>.MuiLinearProgress-barColorPrimary]:!bg-brandColor"
        />
      </div>
      <PriceWidget
        priceTitle1="Open price"
        priceTitle2="Current price"
        openPrice={currentTimeFrame.rounds[1].lockPrice}
        closePrice={currentPrice}
        size="lg"
      />
      <div className="w-full bg-pageBgColor border-btnBlackStrokeColor border-2 p-15 rounded-3xl flex flex-row items-center">
        <input
          type="number"
          max={1000}
          min={0}
          value={getDecimal(currentTimeFrame.rounds[1].amount)}
          readOnly
          className="w-0 grow text-24 xl:text-24 2xl:text-26 ml-10 text-btnBlackTxtColor outline-none bg-transparent"
        />

        <div className="xs:px-10 xs:py-5 2xl:px-15 2xl:py-10 bg-btnBlackBgColor border-2 border-btnBlackStrokeColor xs:rounded-2xl 2xl:rounded-3xl">
          <div className="h-auto flex gap-10 items-center">
            <img
              src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
              alt={`${Underlying_Token[currentNetworkChainId].symbol} logo`}
              className="xs:w-20 xs:h-20 2xl:w-[24px] 2xl:h-[24px]"
            />
            <div className="text-20 2xl:text-22 text-btnBlackTxtColor">
              {Underlying_Token[currentNetworkChainId].symbol}
            </div>
          </div>
        </div>
      </div>
      <div className="amount-slider hidden md:block">
        <Slider
          value={typeof percent === "number" ? percent : 0}
          aria-label="percent"
          valueLabelDisplay="off"
          className="!text-unselectTxtColor"
        />
        <div className="grid grid-cols-5 gap-10 cursor-default">
          {["10%", "20%", "50%", "75%", "Max"].map((title) => (
            <div
              className="bg-btnUnselectBgColor text-unselectTxtColor rounded-3xl px-0 py-5 normal-case xs:text-14 2xl:text-16 text-center"
              key={title}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
      {currentTimeFrame.rounds[1].amount === 0 ? (
        <>
          <Button
            variant="outlined"
            onClick={() => setCardId && setCardId(1)}
            className="hidden md:flex w-full xs:h-[60px] 2xl:h-[70px] text-center normal-case bg-brandColor rounded-2xl text-btnTxtColor hover:opacity-90 button-loadingleading-tight xs:text-20 2xl:text-24 font-semibold border-none"
          >
            Next round
            <ArrowForwardRoundedIcon className="xs:text-28 2xl:text-32" />
          </Button>
          <Button
            variant="outlined"
            onClick={() => swiper.slideNext()}
            className="flex md:hidden w-full xs:h-[60px] 2xl:h-[70px] text-center normal-case bg-brandColor rounded-2xl text-btnTxtColor hover:opacity-90 button-loading border-none"
          >
            <span className="mx-10 leading-tight xs:text-20 2xl:text-24 font-semibold">
              Next round
            </span>
            <ArrowForwardRoundedIcon className="xs:text-28 2xl:text-32" />
          </Button>
        </>
      ) : (
        <div className="betting">
          <Button
            disabled
            variant="contained"
            className="flex w-full h-60 xl:h-[70px] text-center normal-case bg-btnUnselectBgColor rounded-3xl text-btnUnselectTxtColor py-15 border-none"
          >
            <LockIcon className="mr-10 text-32" />
            <span className="leading-tight text-24 font-bold">
              {currentTimeFrame.rounds[1].position ? "Down - " : "Up - "}
              {`${getDecimal(currentTimeFrame.rounds[1].amount)} ${
                Underlying_Token[currentNetworkChainId].symbol
              }`}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CurrentRoundCard;
