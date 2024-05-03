/* eslint-disable node/no-unsupported-features/es-syntax */
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useCallback, useState, lazy, useMemo } from "react";

import {
  addWhitelistAddress,
  removeWhitelistAddress,
  setBackendHealth,
  setNetworkHealth,
  setLatestPrice,
  setTimestampOffset,
} from "./store/reducers/app-slice";
import { RootState } from "./store";
import { loadAccountBalances } from "./store/reducers/account-slice";
import { loadSwapMetaData } from "./store/reducers/swap-slice";
import { useMarketState } from "./hooks/useMarketState";

import Navbar from "./components/navbar/navbar";
import { LoadingBoundary } from "./components/LoadingBoundary/LoadingBoundary";
import Footer from "./components/footer/footer";
import TxPendingSpinner from "./components/tx-pending-spinner/tx-pending-spinner";
import {
  Account_Balance_Interval,
  BlockedCountries,
  getSocket,
} from "./core/constants/basic";
import {
  getInitialTimeFrame,
  loadGenesisTime,
  updateLatestOHLC,
} from "./store/reducers/trade-slice";
import { updateCandle, updateTradingView } from "./components/tvchart/api/stream";
import {
  getBackendhealth,
  getCurrentCountry,
  getIsWhitelisted,
  getUnixTimestampInSeconds,
  networkHealthCheck,
} from "./helpers/axios";
import { AccountWhitelistStatus } from "./core/types/basic.types";
import WhitelistPage from "./pages/whitelist/whitelist-page";
import { initBinaryConfigData } from "./store/reducers/config-slice";
import UpdateBar from "./components/UpdateBar/UpdateBar";
import BraveNotification from "./components/alerts/brave-notification";
import WalletHint from "./components/wallet-hint/WalletHint";
import PlatformNoticeModal from "./components/platform-notice-modal/platform-notice-modal";
import LocationBlockModal from "./components/location-block-modal/location-block-modal";
import Swap from "./pages/swap/swap";
import TradeWidget from "./pages/trade-widget/trade-widget";
import Competitions from "./pages/competitions/competitions";
import Rewards from "./pages/rewards/Rewards";
import useElementHeight from "./hooks/useElementHeight";
import "./app.module.scss";
import "./web3auth.css";
import { useAccount } from "./hooks/useAccount";
import { emitCampaignLanding, saveNewCampaign } from "./helpers/analytics";
import { useNetworkContext } from "./context/NetworkContext";

const Trade = lazy(async () => import("./pages/trade/TourContainer"));
const Markets = lazy(async () => import("./pages/markets/markets"));
const Leaderboard = lazy(async () => import("./pages/leaderboard/leaderboard"));
const Vault = lazy(async () => import("./pages/vault/vault"));
const HomePage = lazy(async () => import("./pages/home/home-page"));
const Referrals = lazy(async () => import("./pages/referrals/referrals"));
const Wallet = lazy(async () => import("./pages/wallet"));

export function App() {
  const dispatch = useDispatch();
  const { address, isConnected } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();
  const location = useLocation();

  const txLoading = useSelector((state: RootState) => state.app.txPending);
  const updateSocketDataRef = useRef<any>();
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const timestampOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const genesisTime = useSelector((state: RootState) => state.trade.genesisTime);
  const showPlatformNotice = useSelector(
    (state: RootState) => state.app.showPlatformNotice
  );

  const connectCount = useRef<number>(0);
  connectCount.current = 0;

  const [accountStatus, setAccountStatus] = useState(AccountWhitelistStatus.Disconnected);
  const [appLaunched, setAppLaunched] = useState(false);
  const whitelistAddresses = useSelector(
    (state: RootState) => state.app.whitelistAddresses
  );

  const [blocked, setBlocked] = useState(false);

  const addressRef = useRef(address);

  useMarketState();
  const [elementRef, elementHeight] = useElementHeight();

  useEffect(() => {
    addressRef.current = address;
  }, [address, currentNetworkChainId]);

  useEffect(() => {
    const checkWhitelist = async () => {
      if (!address || !isConnected) {
        setAppLaunched(false);
        setAccountStatus(AccountWhitelistStatus.Disconnected);
      } else {
        try {
          setAccountStatus(AccountWhitelistStatus.Checking);
          const whitelisted = await getIsWhitelisted(address);
          if (addressRef.current !== address) {
            console.info("Whitelist load rejected");
            return;
          }
          if (whitelisted) {
            dispatch(addWhitelistAddress(address));
            setAccountStatus(AccountWhitelistStatus.Whitelisted);
          } else {
            dispatch(removeWhitelistAddress(address));
            setAppLaunched(false);
            setAccountStatus(AccountWhitelistStatus.NotWhitelisted);
          }
        } catch (error) {
          if (whitelistAddresses.includes(address.toLocaleLowerCase())) {
            setAccountStatus(AccountWhitelistStatus.Whitelisted);
          }
        }
      }
    };

    // checkWhitelist();

    let timerId: any;
    if (address && isConnected) {
      dispatch(loadAccountBalances(address));
      timerId = setInterval(
        () => dispatch(loadAccountBalances(address)),
        Account_Balance_Interval
      );
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [address, whitelistAddresses, isConnected, currentNetworkChainId]);

  useEffect(() => {
    console.info(process.env["NX_BINARY_CHAIN_MODE"] as string);

    (async () => {
      const countryCode = await getCurrentCountry();
      const country = BlockedCountries.find(
        (c) => c.countryCode.toLowerCase() === countryCode.toLowerCase()
      );
      console.info("Country:", countryCode);
      setBlocked(country !== undefined);
    })();

    dispatch(initBinaryConfigData());

    const socket = getSocket();

    socket.on("connect", () => {
      console.info("socket connected: ", connectCount.current);
      if (connectCount.current > 0) {
        console.info("connection time out: getInitialTimeFrame");
        dispatch(getInitialTimeFrame());
      }
      connectCount.current++;
    });

    socket.on("disconnect", () => {
      console.info("socket disconnected: ");
    });

    socket.on(`latest-price-btcusd`, (latestPrice) => {
      updateSocketDataRef.current(latestPrice, "BTC");
    });

    socket.on(`latest-price-ethusd`, (latestPrice) => {
      updateSocketDataRef.current(latestPrice, "ETH");
    });

    // socket.on(`latest-price-bnbusd`, (latestPrice) => {
    //   updateSocketDataRef.current(latestPrice, "BNB");
    // });

    // socket.on(`latest-price-xrpusd`, (latestPrice) => {
    //   updateSocketDataRef.current(latestPrice, "XRP");
    // });

    // socket.on(`latest-price-maticusd`, (latestPrice) => {
    //   updateSocketDataRef.current(latestPrice, "MATIC");
    // });

    // socket.on(`latest-price-dogeusd`, (latestPrice) => {
    //   updateSocketDataRef.current(latestPrice, "DOGE");
    // });

    socket.on(`latest-price-solusd`, (latestPrice) => {
      updateSocketDataRef.current(latestPrice, "SOL");
    });

    // socket.on(`latest-price-linkusd`, (latestPrice) => {
    //   updateSocketDataRef.current(latestPrice, "LINK");
    // });

    socket.on("open-price-ethusd", (ohlc) => {
      dispatch(updateLatestOHLC({ ohlc }));
      updateCandle("ETH", "USD", ohlc);
    });

    socket.on("open-price-btcusd", (ohlc) => {
      dispatch(updateLatestOHLC({ ohlc }));
      updateCandle("BTC", "USD", ohlc);
    });

    // socket.on("open-price-bnbusd", (ohlc) => {
    //   dispatch(updateLatestOHLC({ ohlc }));
    //   updateCandle("BNB", "USD", ohlc);
    // });

    // socket.on("open-price-xrpusd", (ohlc) => {
    //   dispatch(updateLatestOHLC({ ohlc }));
    //   updateCandle("XRP", "USD", ohlc);
    // });

    // socket.on("open-price-maticusd", (ohlc) => {
    //   dispatch(updateLatestOHLC({ ohlc }));
    //   updateCandle("MATIC", "USD", ohlc);
    // });

    // socket.on("open-price-dogeusd", (ohlc) => {
    //   dispatch(updateLatestOHLC({ ohlc }));
    //   updateCandle("DOGE", "USD", ohlc);
    // });

    socket.on("open-price-solusd", (ohlc) => {
      dispatch(updateLatestOHLC({ ohlc }));
      updateCandle("SOL", "USD", ohlc);
    });

    // socket.on("open-price-linkusd", (ohlc) => {
    //   dispatch(updateLatestOHLC({ ohlc }));
    //   updateCandle("LINK", "USD", ohlc);
    // });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("latest-price-ethusd");
      socket.off("latest-price-btcusd");
      // socket.off("latest-price-bnbusd");
      // socket.off("latest-price-xrpusd");
      // socket.off("latest-price-maticusd");
      // socket.off("latest-price-dogeusd");
      socket.off("latest-price-solusd");
      // socket.off("latest-price-linkusd");
      socket.off("open-price-ethusd");
      socket.off("open-price-btcusd");
      // socket.off("open-price-bnbusd");
      // socket.off("open-price-xrpusd");
      // socket.off("open-price-maticusd");
      // socket.off("open-price-dogeusd");
      socket.off("open-price-solusd");
      // socket.off("open-price-linkusd");
    };
  }, [currentNetworkChainId]);

  const updateSocketData = useCallback(
    (latestPrice: any, token: any) => {
      dispatch(setLatestPrice({ price: latestPrice, token: token }));
      if (underlyingToken?.symbol?.toUpperCase() === token) {
        updateTradingView(token, "USD", latestPrice);
      }
      if (timestampOffset.flag === false) {
        dispatch(
          setTimestampOffset({
            flag: true,
            offset: latestPrice.timestamp - Date.now(),
          })
        );
      }
    },
    [underlyingToken, timestampOffset, currentNetworkChainId]
  );

  updateSocketDataRef.current = useMemo(() => updateSocketData, [updateSocketData]);

  useEffect(() => {
    const calcUnixtimestampOffset = async () => {
      let unixTime = Date.now();
      try {
        unixTime = await getUnixTimestampInSeconds();
      } catch (error) {
        unixTime = Date.now();
      }
      dispatch(setTimestampOffset({ flag: false, offset: unixTime * 1000 - Date.now() }));
    };
    calcUnixtimestampOffset();

    const checkBackendHealth = async () => {
      const backendHealth = await getBackendhealth();
      if (backendHealth) {
        dispatch(setBackendHealth(true));
        dispatch(setNetworkHealth(true));
      } else {
        dispatch(setBackendHealth(false));
        dispatch(setNetworkHealth(await networkHealthCheck()));
      }
    };

    dispatch(loadGenesisTime());
    checkBackendHealth();

    const timer = setInterval(checkBackendHealth, 10000);

    return () => {
      clearInterval(timer);
    };
  }, [currentNetworkChainId]);

  useEffect(() => {
    dispatch(loadSwapMetaData());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campId = params.get("utm_campaign");
    if (campId) {
      const page = location.pathname.split("/")[1];
      saveNewCampaign(campId);
      if (address) {
        emitCampaignLanding(address, campId, page);
      }
    }
  }, [location, address, currentNetworkChainId]);

  return (
    <div className="w-screen overflow-x-hidden bg-pageBgColor">
      {txLoading && <TxPendingSpinner />}
      <UpdateBar />
      <BraveNotification />
      <Navbar forwardRef={elementRef} forwardRefHeight={elementHeight} />
      <div style={{ marginTop: elementHeight }}>
        {/* <WhitelistPage
          status={accountStatus}
          appLaunched={appLaunched}
          setAppLaunched={setAppLaunched}
        /> */}
        <WalletHint />
        <LocationBlockModal open={blocked} setOpen={setBlocked} />
        {/* {appLaunched && genesisTime > 0 && ( */}
        <LoadingBoundary>
          {/* {showPlatformNotice && <PlatformNoticeModal open={true} />} */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/trade-widget" element={<TradeWidget />} />
            <Route path="/ambassador" element={<Referrals />} />
            <Route path="/competitions/:id" element={<Competitions />} />
            <Route path="/rewards" element={<Rewards />} />
            {address && <Route path="/funds" element={<Wallet />} />}
            <Route path="/:refCode" element={<HomePage />} />
          </Routes>
        </LoadingBoundary>
        {/* )} */}
      </div>
      <Footer />
    </div>
  );
}

export default App;
