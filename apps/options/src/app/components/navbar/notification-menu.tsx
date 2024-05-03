import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import { useCallback, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { NetworkIds, chains, loadState, saveState } from "@fantohm/shared-web3";
import { EXPLORER_LINKS, loadEnvVariable } from "../../core/constants/network";
import BinaryMarketABI from "../../core/abi/BinaryMarket.json";
import { Underlying_Token } from "../../core/constants/basic";
import { loadBetHistoryforNotificationQuery } from "../../core/apollo/query";
import { runQuery } from "../../helpers/graphqlHelpers";
import { getUnixTimestampInSeconds } from "../../helpers/axios";
import { getLedger, getRound } from "../../helpers/contractHelpers";
import {
  calcBettingReward,
  convertTime,
  formatUtoken,
  getBettingTimeframeWithId,
  getOneMillionForBera,
  getRoundTime,
  numberWithCommas,
} from "../../helpers/data-translations";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import { enqueueSnackbar } from "notistack";
import { NotifyType } from "../../core/constants/notification";
import usePageTitle from "../../hooks/usePageTitle";
import { EventNames, emitNormalTrack } from "../../helpers/analytics";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { loadAccountBalances } from "../../store/reducers/account-slice";
import { fetchCreditInfo } from "../../store/reducers/credit-slice";
import {
  insertOpenPosition,
  loadOpenedRounds,
  removeRevertedPosition,
} from "../../store/reducers/openedRounds-slice";
import { insertRevertedRoundToClosedPositions } from "../../store/reducers/closedRounds-slice";
import { ReactComponent as GiftSvg } from "../../../assets/icons/gift.svg";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";

type BetHistory = {
  amount: number;
  claimed: boolean;
  timeframeId: number;
  position: number;
  createdAt: number;
  endAt: number;
  epoch: number;
  lockPrice: number;
  closePrice: number;
  market: string;
  win: boolean;
  notiTime: string;
  txHash: string;
  isReverted: boolean;
  creditUsed?: boolean;
};

const isSameRound = (r1: BetHistory, r2: BetHistory) => {
  return (
    r1.market === r2.market && r1.timeframeId === r2.timeframeId && r1.epoch === r2.epoch
  );
};

const NotificationMenu = () => {
  const { address } = useAccount();
  const pageTitle = usePageTitle();
  const dispatch = useDispatch();
  const { currentNetworkChainId } = useNetworkContext();

  const genesisStarttime = useSelector(
    (state: RootState) => state.trade.genesisStartTimestamps
  );

  const [flagAccountDropDown, setFlagAccountDropDown] = useState<null | HTMLElement>(
    null
  );
  const [notiHistory, setNotiHistory] = useState<BetHistory[]>([]);

  const tradingFee = useSelector((state: RootState) => state.binaryConfig.tradingFee);

  const PositionOpened = ({ address, user }: any) => {
    if (address?.toLowerCase() === user.toLowerCase()) {
      dispatch(loadAccountBalances(address));
    }
  };

  useEffect(() => {
    const hideNoti = () => {
      setFlagAccountDropDown(null);
    };

    window.addEventListener("scroll", hideNoti);

    return () => {
      window.removeEventListener("scroll", hideNoti);
    };
  }, []);

  useEffect(() => {
    if (!address) {
      return;
    }
    const lastSeenTime = parseInt(
      loadState(`${currentNetworkChainId}-lastSeenTime`) || "0"
    );
    loadHistory(address, lastSeenTime);
  }, [address, currentNetworkChainId]);

  useEffect(() => {
    let wssProvider;
    if (
      currentNetworkChainId === NetworkIds.Berachain ||
      currentNetworkChainId === NetworkIds.Blast ||
      currentNetworkChainId === NetworkIds.BlastMainnet
    ) {
      wssProvider = new ethers.providers.JsonRpcProvider(
        chains[currentNetworkChainId].rpcUrls[0]
      );
    } else {
      wssProvider = new ethers.providers.WebSocketProvider(
        chains[currentNetworkChainId].wssUrls[0]
      );
    }

    const ethMarketContract = new ethers.Contract(
      loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_ETH_ADDRESS`),
      BinaryMarketABI,
      wssProvider
    );

    ethMarketContract.on(
      "PositionOpened",
      (
        marketName: string,
        user: string,
        amount: BigNumber,
        timeframeId: number,
        roundId: BigNumber,
        position: number,
        _
      ) => {
        if (address?.toLowerCase() === user.toLowerCase()) {
          dispatch(
            insertOpenPosition({
              amount: formatUtoken(amount),
              address: user.toLowerCase(),
              epoch: roundId.toNumber(),
              genesisTime: 0,
              hash: "",
              position,
              symbol: "",
              timeframeId,
              marketName: marketName,
            })
          );
        }
        PositionOpened({ address, user });
      }
    );

    ethMarketContract.on("Claimed", (_, user: string) => {
      if (address?.toLowerCase() === user.toLowerCase()) {
        dispatch(loadAccountBalances(address));
      }
    });

    ethMarketContract.on(
      "EndRound",
      (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber, ...rest) => {
        const epoch = _epoch.toNumber();
        const startTime = _startTime.toNumber();
        onEndRound(
          _timeframeId,
          epoch,
          startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
          startTime,
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_ETH_ADDRESS`),
          "ETH"
        );
        setTimeout(() => {
          const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
          loadHistory(address || "", lastSeenTime);
        }, 20000);
      }
    );
    ethMarketContract.on(
      "BetReverted",
      (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
        const timeframeId = _timeframeId;
        const epoch = _epoch.toNumber();

        if (
          address &&
          users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
        ) {
          const params = {
            timeframeId,
            epoch,
            currency: "ETH",
          };
          console.log(params);
          dispatch(insertRevertedRoundToClosedPositions(params as any));
          dispatch(removeRevertedPosition(params as any));
        }

        onEndRound(
          timeframeId,
          epoch,
          0,
          Math.floor(Date.now() / 1000),
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_ETH_ADDRESS`),
          "ETH"
        );
      }
    );

    const btcMarketContract = new ethers.Contract(
      loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_BTC_ADDRESS`),
      BinaryMarketABI,
      wssProvider
    );

    btcMarketContract.on(
      "PositionOpened",
      (
        marketName: string,
        user: string,
        amount: BigNumber,
        timeframeId: number,
        roundId: BigNumber,
        position: number,
        _
      ) => {
        if (address?.toLowerCase() === user.toLowerCase()) {
          dispatch(
            insertOpenPosition({
              amount: formatUtoken(amount),
              address: user.toLowerCase(),
              epoch: roundId.toNumber(),
              genesisTime: 0,
              hash: "",
              position,
              symbol: "",
              timeframeId,
              marketName: marketName,
            })
          );
        }
        PositionOpened({ address, user });
      }
    );

    btcMarketContract.on("Claimed", (_, user: string) => {
      if (address?.toLowerCase() === user.toLowerCase()) {
        dispatch(loadAccountBalances(address));
      }
    });

    btcMarketContract.on(
      "EndRound",
      (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber) => {
        const epoch = _epoch.toNumber();
        const startTime = _startTime.toNumber();
        onEndRound(
          _timeframeId,
          epoch,
          startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
          startTime,
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_BTC_ADDRESS`),
          "BTC"
        );
        setTimeout(() => {
          const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
          loadHistory(address || "", lastSeenTime);
        }, 20000);
      }
    );

    btcMarketContract.on(
      "BetReverted",
      (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
        const timeframeId = _timeframeId;
        const epoch = _epoch.toNumber();

        if (
          address &&
          users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
        ) {
          const params = {
            timeframeId,
            epoch,
            currency: "BTC",
          };
          dispatch(insertRevertedRoundToClosedPositions(params as any));
          dispatch(removeRevertedPosition(params as any));
        }
        onEndRound(
          timeframeId,
          epoch,
          0,
          Math.floor(Date.now() / 1000),
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_BTC_ADDRESS`),
          "BTC"
        );
      }
    );

    // const bnbMarketContract = new ethers.Contract(
    //   BINARY_ADDRESSES.MARKET_ADDRESS["BNB"],
    //   BinaryMarketABI,
    //   wssProvider
    // );

    // bnbMarketContract.on(
    //   "PositionOpened",
    //   (
    //     marketName: string,
    //     user: string,
    //     amount: BigNumber,
    //     timeframeId: number,
    //     roundId: BigNumber,
    //     position: number,
    //     _
    //   ) => {
    //     if (address?.toLowerCase() === user.toLowerCase()) {
    //       dispatch(
    //         insertOpenPosition({
    //           amount: formatUtoken(amount),
    //           address: user.toLowerCase(),
    //           epoch: roundId.toNumber(),
    //           genesisTime: 0,
    //           hash: "",
    //           position,
    //           symbol: "",
    //           timeframeId,
    //           marketName: marketName,
    //         })
    //       );
    //     }
    //     PositionOpened({ address, user });
    //   }
    // );

    // bnbMarketContract.on("Claimed", (_, user: string) => {
    //   if (address?.toLowerCase() === user.toLowerCase()) {
    //     dispatch(loadAccountBalances(address));
    //   }
    // });

    // bnbMarketContract.on(
    //   "EndRound",
    //   (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber) => {
    //     const epoch = _epoch.toNumber();
    //     const startTime = _startTime.toNumber();
    //     onEndRound(
    //       _timeframeId,
    //       epoch,
    //       startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
    //       startTime,
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["BNB"],
    //       "BNB"
    //     );
    //     setTimeout(() => {
    //       const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
    //       loadHistory(address || "", lastSeenTime);
    //     }, 20000);
    //   }
    // );

    // bnbMarketContract.on(
    //   "BetReverted",
    //   (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
    //     const timeframeId = _timeframeId;
    //     const epoch = _epoch.toNumber();

    //     if (
    //       address &&
    //       users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
    //     ) {
    //       const params = {
    //         timeframeId,
    //         epoch,
    //         currency: "BNB",
    //       };
    //       dispatch(insertRevertedRoundToClosedPositions(params as any));
    //       dispatch(removeRevertedPosition(params as any));
    //     }
    //     onEndRound(
    //       timeframeId,
    //       epoch,
    //       0,
    //       Math.floor(Date.now() / 1000),
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["BNB"],
    //       "BNB"
    //     );
    //   }
    // );

    // const xrpMarketContract = new ethers.Contract(
    //   BINARY_ADDRESSES.MARKET_ADDRESS["XRP"],
    //   BinaryMarketABI,
    //   wssProvider
    // );

    // xrpMarketContract.on(
    //   "PositionOpened",
    //   (
    //     marketName: string,
    //     user: string,
    //     amount: BigNumber,
    //     timeframeId: number,
    //     roundId: BigNumber,
    //     position: number,
    //     _
    //   ) => {
    //     if (address?.toLowerCase() === user.toLowerCase()) {
    //       dispatch(
    //         insertOpenPosition({
    //           amount: formatUtoken(amount),
    //           address: user.toLowerCase(),
    //           epoch: roundId.toNumber(),
    //           genesisTime: 0,
    //           hash: "",
    //           position,
    //           symbol: "",
    //           timeframeId,
    //           marketName: marketName,
    //         })
    //       );
    //     }
    //     PositionOpened({ address, user });
    //   }
    // );

    // xrpMarketContract.on("Claimed", (_, user: string) => {
    //   if (address?.toLowerCase() === user.toLowerCase()) {
    //     dispatch(loadAccountBalances(address));
    //   }
    // });

    // xrpMarketContract.on(
    //   "EndRound",
    //   (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber) => {
    //     const epoch = _epoch.toNumber();
    //     const startTime = _startTime.toNumber();
    //     onEndRound(
    //       _timeframeId,
    //       epoch,
    //       startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
    //       startTime,
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["XRP"],
    //       "XRP"
    //     );
    //     setTimeout(() => {
    //       const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
    //       loadHistory(address || "", lastSeenTime);
    //     }, 20000);
    //   }
    // );

    // xrpMarketContract.on(
    //   "BetReverted",
    //   (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
    //     const timeframeId = _timeframeId;
    //     const epoch = _epoch.toNumber();

    //     if (
    //       address &&
    //       users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
    //     ) {
    //       const params = {
    //         timeframeId,
    //         epoch,
    //         currency: "XRP",
    //       };
    //       dispatch(insertRevertedRoundToClosedPositions(params as any));
    //       dispatch(removeRevertedPosition(params as any));
    //     }
    //     onEndRound(
    //       timeframeId,
    //       epoch,
    //       0,
    //       Math.floor(Date.now() / 1000),
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["XRP"],
    //       "XRP"
    //     );
    //   }
    // );

    // const maticMarketContract = new ethers.Contract(
    //   BINARY_ADDRESSES.MARKET_ADDRESS["MATIC"],
    //   BinaryMarketABI,
    //   wssProvider
    // );

    // maticMarketContract.on(
    //   "PositionOpened",
    //   (
    //     marketName: string,
    //     user: string,
    //     amount: BigNumber,
    //     timeframeId: number,
    //     roundId: BigNumber,
    //     position: number,
    //     _
    //   ) => {
    //     if (address?.toLowerCase() === user.toLowerCase()) {
    //       dispatch(
    //         insertOpenPosition({
    //           amount: formatUtoken(amount),
    //           address: user.toLowerCase(),
    //           epoch: roundId.toNumber(),
    //           genesisTime: 0,
    //           hash: "",
    //           position,
    //           symbol: "",
    //           timeframeId,
    //           marketName: marketName,
    //         })
    //       );
    //     }
    //     PositionOpened({ address, user });
    //   }
    // );

    // maticMarketContract.on("Claimed", (_, user: string) => {
    //   if (address?.toLowerCase() === user.toLowerCase()) {
    //     dispatch(loadAccountBalances(address));
    //   }
    // });

    // maticMarketContract.on(
    //   "EndRound",
    //   (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber) => {
    //     const epoch = _epoch.toNumber();
    //     const startTime = _startTime.toNumber();
    //     onEndRound(
    //       _timeframeId,
    //       epoch,
    //       startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
    //       startTime,
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["MATIC"],
    //       "MATIC"
    //     );
    //     setTimeout(() => {
    //       const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
    //       loadHistory(address || "", lastSeenTime);
    //     }, 20000);
    //   }
    // );

    // maticMarketContract.on(
    //   "BetReverted",
    //   (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
    //     const timeframeId = _timeframeId;
    //     const epoch = _epoch.toNumber();

    //     if (
    //       address &&
    //       users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
    //     ) {
    //       const params = {
    //         timeframeId,
    //         epoch,
    //         currency: "MATIC",
    //       };
    //       dispatch(insertRevertedRoundToClosedPositions(params as any));
    //       dispatch(removeRevertedPosition(params as any));
    //     }
    //     onEndRound(
    //       timeframeId,
    //       epoch,
    //       0,
    //       Math.floor(Date.now() / 1000),
    //       address || "",
    //       BINARY_ADDRESSES.MARKET_ADDRESS["MATIC"],
    //       "MATIC"
    //     );
    //   }
    // );

    const solMarketContract = new ethers.Contract(
      loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_SOL_ADDRESS`),
      BinaryMarketABI,
      wssProvider
    );

    solMarketContract.on(
      "PositionOpened",
      (
        marketName: string,
        user: string,
        amount: BigNumber,
        timeframeId: number,
        roundId: BigNumber,
        position: number,
        _
      ) => {
        if (address?.toLowerCase() === user.toLowerCase()) {
          dispatch(
            insertOpenPosition({
              amount: formatUtoken(amount),
              address: user.toLowerCase(),
              epoch: roundId.toNumber(),
              genesisTime: 0,
              hash: "",
              position,
              symbol: "",
              timeframeId,
              marketName: marketName,
            })
          );
        }
        PositionOpened({ address, user });
      }
    );

    solMarketContract.on("Claimed", (_, user: string) => {
      if (address?.toLowerCase() === user.toLowerCase()) {
        dispatch(loadAccountBalances(address));
      }
    });

    solMarketContract.on(
      "EndRound",
      (_timeframeId: number, _epoch: BigNumber, _startTime: BigNumber) => {
        const epoch = _epoch.toNumber();
        const startTime = _startTime.toNumber();
        onEndRound(
          _timeframeId,
          epoch,
          startTime - getBettingTimeframeWithId(_timeframeId).minute * 60,
          startTime,
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_SOL_ADDRESS`),
          "SOL"
        );
        setTimeout(() => {
          const lastSeenTime = parseInt(loadState("lastSeenTime") || "0");
          loadHistory(address || "", lastSeenTime);
        }, 20000);
      }
    );

    solMarketContract.on(
      "BetReverted",
      (_timeframeId: number, _epoch: BigNumber, users: string[]) => {
        const timeframeId = _timeframeId;
        const epoch = _epoch.toNumber();

        if (
          address &&
          users.map((u) => u.toLowerCase()).includes(address.toLowerCase())
        ) {
          const params = {
            timeframeId,
            epoch,
            currency: "SOL",
          };
          dispatch(insertRevertedRoundToClosedPositions(params as any));
          dispatch(removeRevertedPosition(params as any));
        }
        onEndRound(
          timeframeId,
          epoch,
          0,
          Math.floor(Date.now() / 1000),
          address || "",
          loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_SOL_ADDRESS`),
          "SOL"
        );
      }
    );

    return () => {
      if (ethMarketContract) {
        ethMarketContract.removeAllListeners("EndRound");
        ethMarketContract.removeAllListeners("BetReverted");

        ethMarketContract.removeAllListeners("PositionOpened");
        ethMarketContract.removeAllListeners("Claimed");
      }
      if (btcMarketContract) {
        btcMarketContract.removeAllListeners("EndRound");
        btcMarketContract.removeAllListeners("BetReverted");

        btcMarketContract.removeAllListeners("PositionOpened");
        btcMarketContract.removeAllListeners("Claimed");
      }
      // if (bnbMarketContract) {
      //   bnbMarketContract.removeAllListeners("EndRound");
      //   bnbMarketContract.removeAllListeners("BetReverted");

      //   bnbMarketContract.removeAllListeners("PositionOpened");
      //   bnbMarketContract.removeAllListeners("Claimed");
      // }
      // if (xrpMarketContract) {
      //   xrpMarketContract.removeAllListeners("EndRound");
      //   xrpMarketContract.removeAllListeners("BetReverted");

      //   xrpMarketContract.removeAllListeners("PositionOpened");
      //   xrpMarketContract.removeAllListeners("Claimed");
      // }
      // if (maticMarketContract) {
      //   maticMarketContract.removeAllListeners("EndRound");
      //   maticMarketContract.removeAllListeners("BetReverted");

      //   maticMarketContract.removeAllListeners("PositionOpened");
      //   maticMarketContract.removeAllListeners("Claimed");
      // }
      if (solMarketContract) {
        solMarketContract.removeAllListeners("EndRound");
        solMarketContract.removeAllListeners("BetReverted");

        solMarketContract.removeAllListeners("PositionOpened");
        solMarketContract.removeAllListeners("Claimed");
      }
    };
  }, [address, currentNetworkChainId]);

  const onEndRound = useCallback(
    async (
      _timeframeId: number,
      _epoch: number,
      _startTime: number,
      _endTime: number,
      _address: string,
      _marketAddress: string,
      _market: string
    ) => {
      const ledger = await getLedger(
        _address,
        loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_${_market}_ADDRESS`),
        _timeframeId,
        _epoch
      );
      const amount = parseFloat(
        ethers.utils.formatUnits(
          BigNumber.from(ledger.amount),
          Underlying_Token[currentNetworkChainId].decimals
        )
      );
      if (amount === 0) return;
      const round = await getRound(_marketAddress, _timeframeId, _epoch);
      if (round.closePrice === 0 && !ledger.isReverted) return;
      const res: BetHistory = {
        amount,
        claimed: false,
        timeframeId: _timeframeId,
        position: ledger.position,
        createdAt: _startTime,
        endAt: _endTime,
        epoch: _epoch,
        lockPrice: round.lockPrice,
        closePrice: round.closePrice,
        market: _market,
        win: false,
        notiTime: "",
        txHash: "",
        isReverted: ledger.isReverted,
      };
      if (res.closePrice === res.lockPrice) {
        res.win = false;
      } else {
        if (
          typeof res.closePrice === "number" &&
          typeof res.lockPrice === "number" &&
          res.closePrice > 0 &&
          res.lockPrice > 0
        ) {
          res.win = res.closePrice - res.lockPrice < 0 === Boolean(res.position);
        } else {
          res.win = false;
        }
      }
      const dt = new Date(
        getRoundTime(genesisStarttime[res.market], res.epoch, res.timeframeId).closeTime
      );
      res.notiTime = `${convertTime(dt).time} ${convertTime(dt).date}`;

      if (notiHistory.filter((h) => isSameRound(h, res)).length === 0) {
        setNotiHistory((prev) => {
          const tmp = prev.map((h) => h);
          tmp.unshift(res);
          return tmp.sort((a, b) => b.endAt - a.endAt);
        });

        const DelayTime = 5000;

        if (res.isReverted) {
          setTimeout(() => {
            enqueueSnackbar("", {
              variant: NotifyType.BET_RESULT,
              currency: _market,
              position: res.position,
              isWin: res.win,
              roundId: _epoch,
              isReverted: res.isReverted,
              timeframeId: res.timeframeId,
            });
          }, DelayTime);
        } else {
          enqueueSnackbar("", {
            variant: NotifyType.BET_RESULT,
            currency: _market,
            position: res.position,
            isWin: res.win,
            roundId: _epoch,
            isReverted: res.isReverted,
          });
        }
      }
      if (address) dispatch(fetchCreditInfo({ address }));
    },
    [notiHistory, currentNetworkChainId, address]
  );

  const accountDrop = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setFlagAccountDropDown(event.currentTarget);

    if (address) {
      emitNormalTrack(pageTitle, address, EventNames.NotificationClicked);
    }
  };

  const onClickClearAll = async () => {
    let unixTime = Date.now();
    try {
      unixTime = await getUnixTimestampInSeconds();
    } catch (error) {
      unixTime = Date.now();
    }
    setNotiHistory([]);
    saveState(`${currentNetworkChainId}-lastSeenTime`, unixTime);
  };

  const loadHistory = async (_address: string, fromTimestamp: number) => {
    let unixTimestamp = Math.floor(Date.now() / 1000);
    try {
      unixTimestamp = await getUnixTimestampInSeconds();
    } catch (error) {
      console.error(error);
    }

    const query = loadBetHistoryforNotificationQuery(
      _address,
      fromTimestamp,
      unixTimestamp
    );
    try {
      const res = await runQuery(query);
      let history = (res.data.btcMarketHistory as Array<any>).map((_v: any) =>
        formatHistory(_v, "BTC")
      );
      history = history.concat(
        (res.data.ethMarketHistory as Array<any>).map((_v: any) =>
          formatHistory(_v, "ETH")
        )
      );
      // history = history.concat(
      //   (res.data.bnbMarketHistory as Array<any>).map((_v: any) =>
      //     formatHistory(_v, "BNB")
      //   )
      // );
      // history = history.concat(
      //   (res.data.xrpMarketHistory as Array<any>).map((_v: any) =>
      //     formatHistory(_v, "XRP")
      //   )
      // );
      // history = history.concat(
      //   (res.data.maticMarketHistory as Array<any>).map((_v: any) =>
      //     formatHistory(_v, "MATIC")
      //   )
      // );
      // history = history.concat(
      //   (res.data.dogeMarketHistory as Array<any>).map((_v: any) =>
      //     formatHistory(_v, "DOGE")
      //   )
      // );
      history = history.concat(
        (res.data.solMarketHistory as Array<any>).map((_v: any) =>
          formatHistory(_v, "SOL")
        )
      );
      // history = history.concat(
      //   (res.data.linkMarketHistory as Array<any>).map((_v: any) =>
      //     formatHistory(_v, "LINK")
      //   )
      // );
      history.sort((a, b) => b.endAt - a.endAt);
      setNotiHistory(history);
    } catch (error) {
      console.error(error);
    }
  };

  const formatHistory = (history: any, market: string) => {
    const res: BetHistory = {
      amount: parseFloat(history.amount),
      claimed: history.claimed,
      timeframeId: history.timeframeId,
      position: history.position === "Bull" ? 0 : 1,
      createdAt: parseInt(history.createdAt),
      endAt: parseInt(history.round.endAt),
      epoch: parseInt(history.round.epoch),
      lockPrice: parseFloat(history.round.lockPrice),
      closePrice: parseFloat(history.round.closePrice),
      notiTime: "",
      market,
      win: false,
      txHash: history.hash,
      isReverted: history.isReverted === true,
      creditUsed: history.creditUsed === true,
    };
    if (res.closePrice === res.lockPrice) {
      res.win = false;
    } else {
      res.win = res.closePrice - res.lockPrice < 0 === Boolean(res.position);
    }
    const dt = new Date(res.endAt);
    res.notiTime = `${convertTime(dt).time} ${convertTime(dt).date}`;
    return res;
  };

  const getNotitime = (history: BetHistory, genesisTime: Record<string, number>) => {
    const dt = new Date(
      getRoundTime(
        genesisTime[history.market],
        history.epoch,
        history.timeframeId
      ).closeTime
    );
    const notiTime = `${convertTime(dt).time} ${convertTime(dt).date}`;
    return notiTime;
  };

  return (
    <div className="rounded-2xl">
      <IconButton
        id="notification-menu-button"
        aria-controls={flagAccountDropDown ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={flagAccountDropDown ? "true" : undefined}
        className="border-2 border-bunker border-solid w-[36px] h-[36px] md:w-[50px] md:h-[50px] bg-woodsmoke rounded-[12px] md:rounded-[18px]"
        onClick={accountDrop}
        sx={{
          p: "0px",
          position: "relative",
          "& .Mui-focused": { backgroundColor: "#0B0F10" },
          "& .css-8je8zh-MuiTouchRipple-root": { display: "none" },
        }}
        size="large"
      >
        <NotificationsNone
          sx={{ color: "white" }}
          className="text-[20px] md:text-[26px]"
        />
        {notiHistory.length > 0 && <div className="noti-badge"></div>}
      </IconButton>
      <Popover
        id={"notification-menu"}
        open={Boolean(flagAccountDropDown)}
        anchorEl={flagAccountDropDown}
        onClose={() => setFlagAccountDropDown(null)}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableScrollLock={true}
        sx={{
          "& .MuiPopover-paper": {
            backgroundColor: "#0B0F10",
            borderRadius: "26px",
            width: "522px",
            marginTop: "10px",
          },
        }}
        className="[&>.MuiPopover-paper]:lg:mt-[19px] [&>.MuiPopover-paper]:sm:mt-[10px]"
      >
        <div className="px-[24px] py-[20px] bg-woodsmoke text-primary customize-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className="text-primary text-19">Notifications</h3>
            {notiHistory.length > 0 && (
              <button
                onClick={onClickClearAll}
                className="text-second px-10 py-[3px] hover:bg-second/10 transition-all rounded-lg"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="h-auto overflow-y-auto mt-15 min-h-150 max-h-300">
            <div className="flex flex-col justify-center gap-[18px]">
              {notiHistory.map((noti, index) => (
                <div
                  className="flex items-start justify-between overflow-visible"
                  key={`${noti.market}-${noti.epoch}`}
                >
                  <div
                    className="relative w-40 h-40 cursor-pointer xl:w-50 xl:h-50"
                    onClick={() =>
                      window.open(
                        `${EXPLORER_LINKS[currentNetworkChainId]}/tx/${noti.txHash}`,
                        "_blank"
                      )
                    }
                  >
                    <img
                      src={`./assets/images/${noti.market}.png`}
                      alt={noti.market}
                      className="w-[32px] h-[32px] xl:w-40 xl:h-40 m-[4px] xl:m-5"
                    />
                    <div className="absolute top-0 right-0 w-[16px] h-[16px] xl:w-20 xl:h-20">
                      {noti.closePrice > noti.lockPrice ? (
                        <div className="flex items-center justify-center w-full h-full border-2 rounded-full bg-success/80 border-success">
                          <NorthEastRoundedIcon className="block text-textWhite text-14 xl:text-16" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full border-2 rounded-full bg-danger/80 border-danger">
                          <SouthEastRoundedIcon className="block text-textWhite text-14 xl:text-16" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-second w-[calc(100%-50px)] xl:w-[calc(100%-60px)]">
                    <p className="capitalize text-14 font-InterMedium">
                      {noti.market} Market (
                      {getBettingTimeframeWithId(noti.timeframeId).minute}m) -{" "}
                      {getNotitime(noti, genesisStarttime)}
                    </p>
                    {noti.isReverted ? (
                      <div className="flex flex-wrap items-center gap-5 text-16 text-primary">
                        Round <span className="text-success">#{noti.epoch}</span> is full.
                        Please refund.
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-5 text-16 text-primary">
                        Round <span className="text-success">#{noti.epoch}</span> ended,
                        you{" "}
                        <div
                          className={
                            "rounded-md px-[10px] py-[1px] font-semibold flex items-center gap-5 " +
                            (noti.win
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger")
                          }
                        >
                          {noti.win
                            ? `won ${
                                noti.amount * getOneMillionForBera() < 0.1
                                  ? numberWithCommas(
                                      calcBettingReward(false, noti.amount, tradingFee),
                                      6
                                    )
                                  : numberWithCommas(
                                      calcBettingReward(
                                        noti?.creditUsed ? true : false,
                                        noti.amount * getOneMillionForBera(),
                                        tradingFee
                                      )
                                    )
                              }`
                            : `lost ${
                                noti.amount * getOneMillionForBera() < 0.1
                                  ? numberWithCommas(noti.amount, 6)
                                  : numberWithCommas(noti.amount * getOneMillionForBera())
                              }`}
                          {noti?.creditUsed ? (
                            <GiftSvg className="w-15" />
                          ) : (
                            ` ${Underlying_Token[currentNetworkChainId].symbol}`
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {notiHistory.length === 0 && (
                <div className="flex items-center justify-center w-full h-140 text-second">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default NotificationMenu;
