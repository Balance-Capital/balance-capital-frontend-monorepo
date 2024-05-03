/* eslint-disable node/no-unsupported-features/es-syntax */
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { lazy, useCallback, useEffect, useRef, useState } from "react";

import {
  clearAccountLedgers,
  getAccountLedgers,
  setMaintenanceMode,
  setUnderlyingToken,
} from "../../store/reducers/trade-slice";
import { getInitialTimeFrame, updateTimeframe } from "../../store/reducers/trade-slice";
import {
  convertTime,
  getCurrencyDetail,
  getTimezoneDisplayName,
} from "../../helpers/data-translations";

import { RootState } from "../../store";
import { OperatorWalletMinBalance, RefreshTimeLimit } from "../../core/constants/basic";
import { LoadingBoundary } from "../../components/LoadingBoundary/LoadingBoundary";
import MobileBetCards from "./components/round-card/mobile-bet-cards";
import { setTimestampOffset } from "../../store/reducers/app-slice";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import HowToBet from "../../components/how-to-bet/how-to-bet";
import { filterOpenPositions } from "../../store/reducers/openedRounds-slice";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";

const TradingViewChart = lazy(async () => import("./components/tradingview-chart"));
const ExpiredCard = lazy(async () => import("./components/overview-card/expired-card"));
const CurrentCard = lazy(async () => import("./components/overview-card/current-card"));
const StartCard = lazy(async () => import("./components/overview-card/start-card"));
const UpcomingRoundCard = lazy(
  async () => import("./components/overview-card/upcoming-card")
);
const PositionPad = lazy(async () => import("./components/position-pan"));
const TradingHistory = lazy(async () => import("./components/trading-history"));

let lastTime = Date.now();

const Trade = () => {
  const [cardId, setCardId] = useState(1); //-1: expired, 0: current, 1: starting, 1+: upcoming
  const [globalTime, setGlobalTime] = useState(Date.now());
  const [showChart, setShowChart] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const { address } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const timestampOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const genesisStartTime = useSelector((state: RootState) => state.trade.genesisTime);
  const openedRounds = useSelector((state: RootState) => state.openRounds.rounds);

  const operatorWalletBalance = useSelector(
    (state: RootState) => state.trade.operatorWalletBalance[underlyingToken.symbol]
  );

  const currentPrice = useSelector(
    (state: RootState) =>
      state.app.latestPrice[underlyingToken.symbol.toUpperCase()]?.price || 0
  );
  const currentPriceRef = useRef<any>();
  currentPriceRef.current = currentPrice;

  const timestampOffsetRef = useRef<any>();
  timestampOffsetRef.current = timestampOffset;

  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastTime > RefreshTimeLimit) {
        // window.location.reload();
        dispatch(
          setTimestampOffset({
            flag: false,
            offset: 0,
          })
        );
        dispatch(getInitialTimeFrame());
        dispatch(getAccountLedgers(address || ""));
      }
    };
    const onBlur = () => {
      lastTime = Date.now();
    };

    window.scrollTo({ top: 0, behavior: "smooth" });

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    // Calls onFocus when the window first loads
    onFocus();
    // Specify how to clean up after this effect:
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const symbol = params.get("underlyingToken");
    if (symbol) {
      dispatch(setUnderlyingToken(getCurrencyDetail(symbol)));
    }
  }, [location]);

  useEffect(() => {
    setCardId(1);
  }, [underlyingToken]);

  useEffect(() => {
    dispatch(clearAccountLedgers());
    if (address) {
      dispatch(getAccountLedgers(address));
    }
  }, [
    address,
    underlyingToken,
    currentTimeframeId,
    genesisStartTime,
    currentNetworkChainId,
  ]);

  useEffect(() => {
    dispatch(getInitialTimeFrame());
  }, [underlyingToken, currentTimeframeId]);

  const update = useCallback(async () => {
    const timestamp =
      Date.now() +
      (timestampOffsetRef.current.offset ? timestampOffsetRef.current.offset : 0);
    setGlobalTime(timestamp);

    dispatch(
      updateTimeframe({
        currentTime: Math.floor(timestamp / 1000),
        _currentPrice: currentPriceRef.current || 0,
        address,
      })
    );
  }, [dispatch, address, timestampOffsetRef, currentNetworkChainId]);

  useEffect(() => {
    let timer = setInterval(() => {
      update();
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [update]);

  useEffect(() => {
    const timeInSec = Math.floor(globalTime / 1000);
    if (openedRounds.filter((r) => r.round.endAt < timeInSec).length > 0) {
      dispatch(filterOpenPositions(timeInSec));
    }
  }, [globalTime]);

  useEffect(() => {
    dispatch(setMaintenanceMode(operatorWalletBalance < OperatorWalletMinBalance));
  }, [operatorWalletBalance]);

  const setSelectedCard = (_index: number, _isInitializing: boolean) => {
    if (!_isInitializing) {
      setCardId(_index);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen relative">
      <div className="w-full xs:px-[12px] xl:px-[90px] grid gap-40 mt-30">
        <div className="gap-20 flex-wrap hidden md:flex">
          <div
            onClick={() => setSelectedCard(-1, isInitializing)}
            className="grow xs:w-full lg:w-1/3 1xl:w-1/5"
          >
            <LoadingBoundary>
              <ExpiredCard cardId={cardId} />
            </LoadingBoundary>
          </div>
          <div
            onClick={() => setSelectedCard(0, isInitializing)}
            className="grow xs:w-full lg:w-1/3 1xl:w-1/5"
          >
            <LoadingBoundary>
              <CurrentCard cardId={cardId} currentPrice={currentPrice} />
            </LoadingBoundary>
          </div>
          <div
            onClick={() => setSelectedCard(1, isInitializing)}
            className="grow xs:w-full lg:w-1/3 1xl:w-1/5"
          >
            <LoadingBoundary>
              <StartCard cardId={cardId} currentPrice={currentPrice} />
            </LoadingBoundary>
          </div>
          <div className="grow xs:w-full lg:w-1/3 1xl:w-1/5">
            <LoadingBoundary>
              <UpcomingRoundCard cardId={cardId} setCardId={setCardId} />
            </LoadingBoundary>
          </div>
        </div>
        <div className="flex items-end gap-40 xs:flex-col xl:flex-row">
          <LoadingBoundary>
            <TradingViewChart showChart={showChart} />
          </LoadingBoundary>
          <LoadingBoundary>
            <PositionPad
              cardId={cardId}
              currentPrice={currentPrice}
              setCardId={setCardId}
            />
          </LoadingBoundary>
        </div>
        <div className="text-second bg-charcoalGray border-2 border-obsidianBlack w-220 rounded-lg px-10 py-5 font-bold text-18 flex items-center gap-10 translate-y--20">
          <div className="w-10 h-10 rounded-full bg-success"></div>
          <div className="grow text-center">
            {convertTime(new Date(globalTime)).time}{" "}
            {getTimezoneDisplayName(new Date(globalTime))}
          </div>
        </div>

        <div className="overflow-hidden block md:hidden">
          <MobileBetCards />
        </div>

        <div className="flex justify-center md:hidden">
          <HowToBet />
        </div>

        <div className="mt-20 w-full overflow-hidden customize-scrollbar">
          <LoadingBoundary>
            <TradingHistory account={address || ""} />
          </LoadingBoundary>
        </div>
      </div>
      <div
        className="xs:flex sm:hidden fixed bottom-0 w-screen h-60 gap-5 items-center justify-center text-lightwhite bg-[#121a1b] z-10"
        onClick={() => setShowChart((s) => !s)}
      >
        {showChart ? "Hide Chart" : "Show Chart"}
        {showChart ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowUpRoundedIcon />}
      </div>
    </div>
  );
};

export default Trade;
