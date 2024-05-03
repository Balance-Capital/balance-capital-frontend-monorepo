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
import { useDisconnect } from "wagmi";
import { setTimestampOffset } from "../../store/reducers/app-slice";
import NextRound from "./components/next-round";
import ConnectWallet from "../../components/navbar/connect-wallet";
import useWidgetParams from "../../hooks/useWidgetParams";
import { filterOpenPositions } from "../../store/reducers/openedRounds-slice";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";

const TradingViewChart = lazy(
  async () => import("../trade/components/tradingview-chart")
);

const PositionPad = lazy(async () => import("../trade/components/position-pan"));
const TradingHistory = lazy(async () => import("../trade/components/trading-history"));

const MobileBetCards = lazy(
  async () => import("../trade/components/round-card/mobile-bet-cards")
);

let lastTime = Date.now();

export default function TradeWidget() {
  useWidgetParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();
  const { disconnect } = useDisconnect();
  const [cardId, setCardId] = useState(1); //-1: expired, 0: current, 1: starting, 1+: upcoming
  const [globalTime, setGlobalTime] = useState(Date.now());

  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const timestampOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const currentPrice = useSelector(
    (state: RootState) =>
      state.app.latestPrice[underlyingToken.symbol.toUpperCase()]?.price || 0
  );
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const operatorWalletBalance = useSelector(
    (state: RootState) => state.trade.operatorWalletBalance[underlyingToken.symbol]
  );
  const openedRounds = useSelector((state: RootState) => state.openRounds.rounds);

  const currentPriceRef = useRef<any>();
  currentPriceRef.current = currentPrice;
  const timestampOffsetRef = useRef<any>();
  timestampOffsetRef.current = timestampOffset;

  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastTime > RefreshTimeLimit) {
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
  }, [address, underlyingToken, currentTimeframeId, currentNetworkChainId]);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timer = {} as any;
    timer = setInterval(() => {
      update();
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [update]);

  useEffect(() => {
    dispatch(setMaintenanceMode(operatorWalletBalance < OperatorWalletMinBalance));
  }, [operatorWalletBalance]);

  useEffect(() => {
    const timeInSec = Math.floor(globalTime / 1000);
    if (openedRounds.filter((r) => r.round.endAt < timeInSec).length > 0) {
      dispatch(filterOpenPositions(timeInSec));
    }
  }, [globalTime]);

  const setSelectedCard = (_index: number, _isInitializing: boolean) => {
    if (!_isInitializing) {
      setCardId(_index);
    }
  };
  return (
    <div className="p-40 space-y-20">
      <div className="bg-btnBlackBgColor border-2 border-btnBlackStrokeColor w-220 rounded-lg px-10 py-5 font-bold text-18 flex items-center gap-10 translate-y--20">
        <div className="w-10 h-10 rounded-full bg-greenIconColor"></div>
        <div className="grow text-center text-btnBlackTxtColor">
          {convertTime(new Date(globalTime)).time}{" "}
          {getTimezoneDisplayName(new Date(globalTime))}
        </div>
      </div>
      <div className="flex justify-between gap-40">
        <LoadingBoundary>
          <TradingViewChart showChart={true} />
        </LoadingBoundary>
        <div className="min-w-[380px] hidden xl:block space-y-40">
          <div className="flex items-center justify-end">
            <ConnectWallet />
          </div>
          <div className="w-full flex gap-5 flex-wrap items-center">
            <button
              onClick={() => setSelectedCard(-1, isInitializing)}
              className={`flex items-center gap-10 font-InterMedium text-16 text-btnBlackTxtColor bg-btnBlackBgColor px-10 py-5 border-2 ${
                cardId === -1 ? "border-btnUnselectBgColor" : "border-btnBlackStrokeColor"
              } rounded-3xl`}
            >
              <span className="inline-flex w-10 h-10 rounded-full opacity-75 bg-redIconColor" />
              Previous
            </button>
            <button
              onClick={() => setSelectedCard(0, isInitializing)}
              className={`flex items-center gap-10 font-InterMedium text-16 text-btnBlackTxtColor bg-btnBlackBgColor px-10 py-5 border-2 ${
                cardId === 0 ? "border-brandColor" : "border-btnBlackStrokeColor"
              } rounded-3xl`}
            >
              <span className="inline-flex w-5 h-5 rounded-full opacity-75 animate-ping bg-greenIconColor" />
              Current
            </button>
            <NextRound
              handleOnClick={() => setSelectedCard(1, isInitializing)}
              cardId={cardId}
            />
          </div>
          <LoadingBoundary>
            <PositionPad
              cardId={cardId}
              currentPrice={currentPrice}
              setCardId={setCardId}
            />
          </LoadingBoundary>
        </div>
      </div>
      <div className="block xl:hidden space-y-20">
        <div className="flex items-center justify-end">
          <ConnectWallet />
        </div>
        <MobileBetCards />
      </div>
      <div className="w-full overflow-hidden customize-scrollbar">
        <LoadingBoundary>
          <TradingHistory account={address || ""} />
        </LoadingBoundary>
      </div>
    </div>
  );
}
