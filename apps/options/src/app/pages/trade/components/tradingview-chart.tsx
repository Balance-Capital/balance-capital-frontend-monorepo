import { BettingCurrencyDropdown } from "../../../components/dropdown/betting-currency";
import { TimeframeDropdown } from "../../../components/dropdown/timeframe-dropdown";
import { TVChartContainer } from "../../../components/tvchart/tvchart";
import { ResolutionString } from "../../../../assets/tradingview_library/charting_library";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { setShowGuide } from "../../../store/reducers/app-slice";
import { useContext } from "react";
import { ShepherdTourContext } from "react-shepherd";
import Button from "@mui/material/Button";
import { getBettingTimeframeWithId } from "../../../helpers/data-translations";
import { useTheme } from "../../../context/ThemeProvider";

type Props = {
  showChart: boolean;
};

const TradingViewChart = ({ showChart }: Props) => {
  const tour = useContext(ShepherdTourContext);
  const { isDarkMode } = useTheme();

  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const bettingCryptoCurrencies = useSelector(
    (state: RootState) => state.trade.bettingCryptoCurrencies
  );
  const showGuide = useSelector((state: RootState) => state.app.showGuide);

  const dispatch = useDispatch();

  return (
    <div className="w-full xl:h-full flex flex-col gap-25">
      <div className="flex justify-between items-center">
        <BettingCurrencyDropdown bettingCurrencies={bettingCryptoCurrencies} />
        <TimeframeDropdown />
      </div>
      <div
        className={`xs:h-[350px] lg:h-[450px] grow max-w-[100%] relative xs:${
          showChart ? "block" : "hidden"
        } sm:block`}
        id="tv-chart"
      >
        {showGuide && (
          // <TourFirst
          //   handleCancel={() => dispatch(setShowGuide(false))}
          //   handleOk={() => {
          //     dispatch(setShowGuide(false));
          //     tour?.start();
          //   }}
          // />

          <div>
            <div className="w-screen h-screen fixed top-0 left-0 z-[999] bg-[#0003] backdrop-blur-[3px]"></div>
            <div className="z-[1000] bg-btnBlackBgColor rounded-2xl border-2 border-btnBlackStrokeColor px-20 py-15 flex flex-col gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-10">
                <div className="flashing-dot"></div>
                <div className="text-grayTxtColor">Welcome to Ryze.fi</div>
              </div>
              <div className="text-grayTxtColor/80 text-14">
                Binary options trading platform on Arbitrum. <br />
                Would you like a guided walkthrough?
              </div>
              <div className="flex gap-15">
                <Button
                  size="small"
                  className="text-brandColor normal-case"
                  onClick={() => {
                    dispatch(setShowGuide(false));
                    tour?.start();
                  }}
                >
                  Continue
                </Button>
                <Button
                  size="small"
                  className="text-grayTxtColor normal-case"
                  onClick={() => dispatch(setShowGuide(false))}
                >
                  No, thanks
                </Button>
              </div>
            </div>
          </div>
        )}
        <TVChartContainer
          key={isDarkMode ? "darkMode" : "lightMode"}
          interval={
            `${getBettingTimeframeWithId(currentTimeframeId).minute}` as ResolutionString
          }
          symbol={`${underlyingToken.symbol}/USD`}
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
