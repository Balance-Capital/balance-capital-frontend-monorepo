import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Pagination from "@mui/material/Pagination";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import { useCallback, useEffect, useRef, useState } from "react";

import { Betting_History_Tabs, GRAPH_URL } from "../../../core/constants/basic";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { bettingHistoryCount, getAllUnclaimedBets } from "../../../core/apollo/query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { TradeData } from "../../../store/reducers/trade-slice";
import { HistoryTab } from "./history-tab/history-tab";
import OpenedPositions from "./history-tab/opened-positions";
import {
  clearOpenPositions,
  loadOpenedRounds,
  loadRoundInformationFromContract,
} from "../../../store/reducers/openedRounds-slice";
import { loadRoundInformationFromContract as loadRoundInformationFromContractInClosedRounds } from "../../../store/reducers/closedRounds-slice";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";
import { NetworkStatus } from "../../../core/types/basic.types";
import ConnectWallet from "../../../components/navbar/connect-wallet";
import ClaimAllButton from "./history-tab/claim-all";
import { loadClosedRounds } from "../../../store/reducers/closedRounds-slice";
import { EventNames, PageTitles, emitNormalTrack } from "../../../helpers/analytics";
import { loadEnvVariable } from "../../../core/constants/network";
import { getLedger, getRound } from "../../../helpers/contractHelpers";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

let lastUpdateTime = Date.now();

const TradingHistory = ({ account }: { account: string }) => {
  const pageSize = 5;
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const tradeData = useSelector((state: RootState): TradeData => state.trade);
  const openRounds = useSelector((state: RootState) => state.openRounds.rounds);
  const closedRounds = useSelector((state: RootState) => state.closedRounds.rounds);
  const latestRevertedRoundTime = useSelector(
    (state: RootState) => state.openRounds.latestRevertedRoundTime
  );
  const claimedRounds = useSelector(
    (state: RootState) => state.closedRounds.claimedRounds
  );
  const timeOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const bettingTimeframes = useSelector(
    (state: RootState) => state.trade.bettingTimeframes
  );

  const dispatch = useDispatch();
  const { address } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();
  const networkStatus = useNetworkStatus();

  const [tapNo, setTapNo] = useState(0);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const firstUpdate = useRef<boolean>(false);

  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastUpdateTime > 60000) {
        dispatch(loadClosedRounds({ page, pageSize, account }));
        lastUpdateTime = Date.now();
      }
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (account && account !== "") {
      loadHistoryCount();
    }
  }, [account, underlyingToken, currentNetworkChainId]);

  useEffect(() => {
    if (account && account !== "" && tradeData.timeframe.remainingTime % 60 === 0) {
      loadHistoryCount();
    }
  }, [
    account,
    underlyingToken,
    tradeData.timeframe.remainingTime,
    currentNetworkChainId,
  ]);

  useEffect(() => {
    if (account && account !== "" && !tradeData.isInitializing) {
      dispatch(loadClosedRounds({ page, pageSize, account }));
      lastUpdateTime = Date.now();
    }
  }, [page, tradeData.isInitializing, latestRevertedRoundTime]);

  useEffect(() => {
    if (account && account !== "") {
      if (page === 1) {
        dispatch(loadClosedRounds({ page, pageSize, account }));
        lastUpdateTime = Date.now();
      }
      setPage(1);
    }
  }, [underlyingToken, account, currentNetworkChainId]);

  useEffect(() => {
    if (
      account &&
      account !== "" &&
      !tradeData.isInitializing &&
      tradeData.timeframe.remainingTime % 60 === 0
    ) {
      dispatch(loadClosedRounds({ page, pageSize, account }));
      lastUpdateTime = Date.now();
    }
  }, [tradeData.timeframe.remainingTime]);

  const loadHistoryCount = async () => {
    try {
      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });
      let len = 0;
      const pageSize = 500;
      // eslint-disable-next-line no-constant-condition
      while (1) {
        const query = bettingHistoryCount(account, underlyingToken.symbol, pageSize, len);
        const res = await client.query({ query });
        if (res.data.bets.length === 0) {
          break;
        } else {
          len += res.data.bets.length;
        }
      }
      setTotalCount(len);
    } catch (error) {
      console.error("[loadHistoryCount] ", error);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    dispatch(clearOpenPositions());
  }, [underlyingToken, address, currentNetworkChainId]);

  useEffect(() => {
    const func = async () => {
      if (address) {
        await dispatch(loadOpenedRounds({ address }));
        dispatch(loadRoundInformationFromContract());
      }
    };
    func();

    const intervalId = setInterval(() => {
      dispatch(loadRoundInformationFromContract());
      dispatch(loadRoundInformationFromContractInClosedRounds());
    }, 5000);

    return () => clearInterval(intervalId);
  }, [address, underlyingToken, tradeData.genesisTime, currentNetworkChainId]);

  const handleChange = (newValue: number) => {
    if (newValue === 1) {
      setPage(1);
    }
    setTapNo(newValue);

    if (address) {
      emitNormalTrack(
        PageTitles.Trade,
        address,
        [EventNames.TradeOpenPosViewed, EventNames.TradeClosePosViewed][newValue]
      );
    }
  };

  const getClaimable = async (timeframeId: number, epoch: number, position: number) => {
    const marketAddress = loadEnvVariable(
      `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
    );
    if (address) {
      const ledger = await getLedger(address, marketAddress, timeframeId, epoch);
      if (ledger.isReverted) {
        return false;
      }
      if (ledger.claimed) {
        return false;
      }
    }

    const round = await getRound(marketAddress, timeframeId, epoch);
    if (round.lockPrice && round.closePrice) {
      let result = false;
      if (position === 1 && round.closePrice < round.lockPrice) {
        result = true;
      }
      if (position === 0 && round.closePrice > round.lockPrice) {
        result = true;
      }
      return result;
    }
    return false;
  };

  const getAllClaimableRounds = useCallback(async () => {
    const bets: any[] = [];
    do {
      const query = getAllUnclaimedBets(
        address || "",
        bets.length,
        `${underlyingToken.symbol}USD`
      );
      const client = new ApolloClient({
        uri: GRAPH_URL(),
        cache: new InMemoryCache(),
      });
      const res = await client.query({ query });
      bets.push(...res.data.bets);
      if (res.data.bets.length === 0) {
        break;
      }
      // eslint-disable-next-line no-constant-condition
    } while (1);

    const currentTime = Date.now() + timeOffset.offset;

    const rounds: {
      epoch: number;
      timeframeId: number;
    }[] = [];

    const timeframeIds: number[][] = [];
    const epochs: Array<Array<Array<number>>> = [];
    const markets: string[] = [];
    let totalAmount = 0;

    const tradingMarkets: string[] = [];

    for (let i = 0; i < bets.length; i++) {
      if (markets.includes(bets[i].market.id)) continue;
      markets.push(bets[i].market.id);
    }

    for (let i = 0; i < markets.length; i++) {
      const ep: Array<Array<number>> = [];
      const tid: Array<number> = [];

      for (let j = 0; j < bettingTimeframes.length; j++) {
        const timeframeId = bettingTimeframes[j].id;
        const tBets = bets.filter(
          (bet: any) =>
            parseInt(bet.timeframeId) === timeframeId && bet.market.id === markets[i]
        );

        const e: number[] = [];
        for (const bet of tBets) {
          const closePrice = parseFloat(bet.round.closePrice);
          const lockPrice = parseFloat(bet.round.lockPrice);
          const position = bet.position === "Bear" ? 1 : 0;
          const epoch = parseInt(bet.round.epoch + "");

          if (bet.round.estimatedEndTime * 1000 > currentTime - 30000) {
            continue;
          }

          if (!closePrice || !lockPrice) {
            e.push(parseInt(bet.round.epoch));
            totalAmount += parseFloat(bet.amount + "");
            continue;
          }

          if (closePrice === lockPrice) {
            continue;
          }

          if (closePrice < lockPrice === Boolean(position) || bet.isReverted) {
            if (
              !claimedRounds[underlyingToken.symbol].find(
                (cr) => cr.timeframeId === timeframeId && cr.epoch === epoch
              )
            ) {
              e.push(epoch);
              totalAmount += parseFloat(bet.amount + "");
            }
          }
        }

        if (e.length) {
          tid.push(timeframeId);
          ep.push(e);
          rounds.push(...e.map((epoch) => ({ timeframeId, epoch })));
        }
      }
      if (tid.length) {
        timeframeIds.push(tid);
        epochs.push(ep);
        tradingMarkets.push(markets[i]);
      }
    }
    const filtered = bets.filter((obj) => obj.round.lockPrice);
    if (filtered.length) {
      const result = await getClaimable(
        filtered[0].timeframeId,
        filtered[0].round.epoch,
        filtered[0].position === "Bull" ? 0 : 1
      );
      if (result) {
        const isAvailable = rounds.some((obj) => +obj.epoch === +filtered[0].round.epoch);
        if (!isAvailable) {
          timeframeIds.push(filtered[0].timeframeId);
          epochs.push(filtered[0].round.epoch);
          rounds.push({
            timeframeId: filtered[0].timeframeId,
            epoch: filtered[0].round.epoch,
          });
        }
      }
    }
    return { timeframeIds, epochs, rounds, markets: tradingMarkets, totalAmount };
  }, [timeOffset, claimedRounds, underlyingToken, address, currentNetworkChainId]);

  const fetchIsClaimallButtonVisible = async () => {
    const { rounds } = await getAllClaimableRounds();
    setVisible(rounds.length > 1);
  };

  useEffect(() => {
    fetchIsClaimallButtonVisible();
  }, [timeOffset, underlyingToken, address, claimedRounds, currentNetworkChainId]);

  useEffect(() => {
    if (closedRounds[0]?.round?.closePrice && firstUpdate.current) {
      fetchIsClaimallButtonVisible();
    } else {
      firstUpdate.current = true;
    }
  }, [closedRounds[0]?.round?.closePrice]);

  return (
    <Box sx={{ width: "100%", color: "#c1d6eb" }}>
      <div className="border-b-2 border-brandColor/20 mb-30 flex relative">
        {Betting_History_Tabs.map((tab: string, index) => (
          <button
            key={index}
            className={`px-15 py-15 transition-all hover:bg-bunker/20 rounded-t-xl w-1/2 sm:w-160 ${
              index === tapNo ? "text-btnBlackTxtColor" : "text-grayTxtColor"
            }`}
            onClick={() => handleChange(index)}
            id={["open-positions-button", ""][index]}
          >
            {tab}
          </button>
        ))}
        <div
          className={`w-1/2 sm:w-160 h-[2px] bg-brandColor absolute bottom-[-2px] ${
            tapNo === 0 ? "left-0" : "left-1/2 sm:left-160"
          } transition-all`}
        ></div>
      </div>
      {networkStatus === NetworkStatus.Success ? (
        tapNo === 0 ? (
          <OpenedPositions />
        ) : totalCount - openRounds.length <= 0 ? (
          <div className="h-200 flex justify-center items-center text-grayTxtColor gap-5 border-b-[1px] border-btnBlackStrokeColor">
            Your closed positions will show up here
          </div>
        ) : (
          <>
            <HistoryTab data={closedRounds} fetchHistoryLoading={false} />
            <div className="flex justify-center mt-30 relative py-30 items-center flex-col gap-15">
              {totalCount - openRounds.length > pageSize && (
                <div>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <div className="block sm:hidden">
                      <Pagination
                        count={Math.ceil((totalCount - openRounds.length) / pageSize)}
                        variant="outlined"
                        shape="rounded"
                        onChange={(_, p) => setPage(p)}
                        size="small"
                        className="[&>ul>li>.MuiButtonBase-root]:text-btnBlackTxtColor [&>ul>li>.MuiButtonBase-root]:border-btnBlackStrokeColor [&>ul>li>.MuiButtonBase-root]:border-2"
                      />
                    </div>
                    <div className="hidden sm:block">
                      <Pagination
                        count={Math.ceil((totalCount - openRounds.length) / pageSize)}
                        variant="outlined"
                        shape="rounded"
                        onChange={(_, p) => setPage(p)}
                        className="[&>ul>li>.MuiButtonBase-root]:text-btnBlackTxtColor [&>ul>li>.MuiButtonBase-root]:border-btnBlackStrokeColor [&>ul>li>.MuiButtonBase-root]:border-2"
                      />
                    </div>
                  </ThemeProvider>
                </div>
              )}
              <div className="relative md:absolute right-0 top-0 h-full flex items-center px-15">
                <ClaimAllButton
                  getAllClaimableRounds={getAllClaimableRounds}
                  visible={visible}
                  setVisible={setVisible}
                  loadHistory={() => {
                    dispatch(loadClosedRounds({ page, pageSize, account }));
                    lastUpdateTime = Date.now();
                  }}
                />
              </div>
            </div>
          </>
        )
      ) : (
        <div className="flex flex-col py-60 items-center">
          <div className="flex gap-5 items-center text-18 xl:text-22 text-grayTxtColor py-40">
            {networkStatus === NetworkStatus.NotConnected
              ? "Connect your wallet"
              : "Change your network"}{" "}
            to start trading.
          </div>
          <ConnectWallet />
        </div>
      )}
    </Box>
  );
};

export default TradingHistory;
