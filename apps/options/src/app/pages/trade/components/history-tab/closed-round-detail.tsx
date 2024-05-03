import CircularProgress from "@mui/material/CircularProgress";
import { loadEnvVariable, EXPLORER_LINKS } from "../../../../core/constants/network";
import { HistoryData } from "../../../../core/types/basic.types";
import { getRound } from "../../../../helpers/contractHelpers";
import {
  calcBettingReward,
  convertTime,
  getBettingTimeframeWithId,
  getOneMillionForBera,
  numberWithCommas,
  roundTimeToString,
} from "../../../../helpers/data-translations";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import {
  addClaimedRounds,
  setRoundClosePrice,
} from "../../../../store/reducers/closedRounds-slice";
import { useClaim } from "../../../../hooks/useMarketContract";
import { NotifyType, NotifyMessage } from "../../../../core/constants/notification";
import { enqueueSnackbar } from "notistack";
import {
  PageTitles,
  emitProfitClaimedTrack,
  emitTradeRefundClicked,
} from "../../../../helpers/analytics";
import { ReactComponent as ClaimedButtonArrowIcon } from "../../../../../assets/icons/ClaimedButtonArrowIcon.svg";
import { ReactComponent as GiftSvg } from "../../../../../assets/icons/gift.svg";
import { useAccount } from "../../../../../app/hooks/useAccount";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";
import { Underlying_Token } from "../../../../../app/core/constants/basic";

const pendingTime = 60;

enum RoundStatus {
  Success = "Success",
  InProgress = "InProgress",
  Failed = "Failed",
  Reverted = "Reverted",
}

type Props = {
  item: HistoryData;
};

const ClosedRoundDetail = ({ item }: Props) => {
  const dispatch = useDispatch();
  const { claim } = useClaim();
  const { address } = useAccount();

  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const timestampOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const claimingRounds = useSelector(
    (state: RootState) => state.closedRounds.claimingRounds
  );
  const claimedRounds = useSelector(
    (state: RootState) => state.closedRounds.claimedRounds
  );

  const tradingFee = useSelector((state: RootState) => state.binaryConfig.tradingFee);
  const { currentNetworkChainId } = useNetworkContext();

  const [historyData, setHistoryData] = useState<HistoryData>({ ...item });
  const [loadingRound, setLoadingRound] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(item.claimed);
  const [claimedHash, setClaimedHash] = useState(item.claimedHash);

  const dataRef = useRef<HistoryData>();
  dataRef.current = historyData;

  const status = useMemo(() => {
    if (historyData.round.lockPrice === 0) {
      return RoundStatus.Failed;
    }
    if (historyData.isReverted) {
      return RoundStatus.Reverted;
    }
    if (historyData.round.lockPrice && historyData.round.closePrice) {
      return RoundStatus.Success;
    }
    if (loadingRound) {
      return RoundStatus.InProgress;
    }
    return RoundStatus.Failed;
  }, [historyData, timestampOffset, loadingRound]);

  const isWin = useMemo(() => {
    if (status !== RoundStatus.Success) {
      return false;
    }
    const lockPrice = historyData.round.lockPrice;
    const closePrice = historyData.round.closePrice;
    if (lockPrice < closePrice && historyData.position === "Bull") {
      return true;
    }
    if (lockPrice > closePrice && historyData.position === "Bear") {
      return true;
    }
    return false;
  }, [status, historyData]);

  const isClaiming = useMemo(() => {
    if (claiming) return true;
    // if (
    //   claimingRounds.find(
    //     (r) => r.timeframeId === item.timeframeId && r.epoch === item.round.epoch
    //   )
    // ) {
    //   return true;
    // }
    return false;
  }, [claimingRounds, claiming, item]);

  const handleClaim = async (isClaim: boolean) => {
    setClaiming(true);
    const result = await claim(item.market, item.timeframeId, item.round.epoch);
    if (result.severity === NotifyType.DEFAULT) {
      setClaimed(true);
      setClaimedHash(result.data);

      dispatch(
        addClaimedRounds({
          underlyingToken: underlyingToken.symbol,
          claimedRounds: [
            {
              claimedHash: result.data,
              epoch: item.round.epoch,
              timeframeId: item.timeframeId,
            },
          ],
        })
      );

      if (isClaim) {
        enqueueSnackbar(NotifyMessage.ClaimSucceed, { variant: NotifyType.SUCCESS });

        if (address) {
          emitProfitClaimedTrack(
            PageTitles.Trade,
            address,
            historyData.position === "Bear" ? "Down" : "Up",
            historyData.amount,
            historyData.round.epoch,
            historyData.round.lockPrice,
            historyData.round.closePrice
          );
        }
      } else {
        enqueueSnackbar(NotifyMessage.RefundSucceed, { variant: NotifyType.SUCCESS });

        if (address) {
          emitTradeRefundClicked(
            PageTitles.Trade,
            address,
            historyData.position === "Bear" ? "Down" : "Up",
            getBettingTimeframeWithId(historyData.timeframeId).minute,
            underlyingToken.symbol + "USD",
            historyData.amount,
            historyData.round.epoch
          );
        }
      }
    } else {
      enqueueSnackbar(result.message, { variant: result.severity });
    }
    setClaiming(false);
  };

  useEffect(() => {
    if (item.claimed) {
      setClaimed(true);
      setClaimedHash(item.claimedHash);
    } else {
      const sr = claimedRounds[underlyingToken.symbol].find(
        (r) => r.timeframeId === item.timeframeId && r.epoch === item.round.epoch
      );
      if (sr) {
        setClaimed(true);
        setClaimedHash(sr.claimedHash);
      } else {
        setClaimed(false);
        setClaimedHash("");
      }
    }
  }, [claimedRounds, item, underlyingToken]);

  useEffect(() => {
    const loadData = async (endLoading?: boolean) => {
      if (
        dataRef.current &&
        (!dataRef.current.round.lockPrice || !dataRef.current.round.closePrice)
      ) {
        const marketAddress = loadEnvVariable(
          `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
        );
        const round = await getRound(marketAddress, item.timeframeId, item.round.epoch);
        if (round.closePrice && round.lockPrice) {
          const tmp: HistoryData = {
            ...historyData,
            round: { ...historyData.round, ...round },
          };
          setHistoryData(tmp);
          dispatch(
            setRoundClosePrice({
              timeframeId: dataRef.current.timeframeId,
              epoch: dataRef.current.round.epoch,
              closePrice: round.closePrice,
            })
          );
        }
      }
      if (endLoading) {
        setLoadingRound(false);
      }
    };

    if (
      dataRef.current &&
      (!dataRef.current.round.lockPrice || !dataRef.current.round.closePrice)
    ) {
      const currentTime = Math.floor((timestampOffset.offset + Date.now()) / 1000);

      const roundCloseTime = item.round.endAt;

      const pastTime = currentTime - roundCloseTime;
      if (pastTime <= pendingTime && pastTime >= 0) {
        const diff = pendingTime - pastTime;

        setLoadingRound(true);
        for (let i = 0; i < diff; i += 2) {
          setTimeout(() => {
            loadData();
          }, i * 1000);
        }
        setTimeout(() => {
          loadData(true);
        }, diff * 1000);
      }
    }
  }, [timestampOffset, currentNetworkChainId]);

  useEffect(() => {
    setHistoryData(item);
  }, [item]);

  return (
    <div className="flex justify-between w-full min-w-[1300px]">
      <div className="flex w-[150%] gap-10 pl-5 border-b-[1px] py-20 md:py-35 border-btnBlackStrokeColor">
        <div className="round min-w-80 w-[8%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Round</p>
          <p className="text-btnBlackTxtColor xs:text-15 sm:text-18">
            #{historyData.round.epoch}
          </p>
        </div>
        <div className="type min-w-70 w-[6%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Type</p>
          <p
            className={`xs:text-15 sm:text-18 font-semibold ${
              historyData.position === "Bull"
                ? "text-successTxtColor"
                : "text-warnTxtColor"
            } `}
          >
            {historyData.position === "Bull" ? "UP" : "DOWN"}
          </p>
        </div>
        <div className="position min-w-160 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Position</p>
          <p className="text-btnBlackTxtColor xs:text-15 sm:text-18 flex items-center gap-5">
            {historyData.amount * getOneMillionForBera() < 0.1
              ? numberWithCommas(historyData.amount, 6)
              : parseFloat((historyData.amount * getOneMillionForBera()).toFixed(2))}
            &nbsp;
            {historyData.creditUsed ? (
              <GiftSvg className="w-15" />
            ) : (
              Underlying_Token[currentNetworkChainId].symbol
            )}
          </p>
        </div>
        <div className="open min-w-100 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Open</p>
          <p className="text-btnBlackTxtColor xs:text-15 sm:text-18">
            {historyData.round.lockPrice
              ? numberWithCommas(historyData.round.lockPrice)
              : "-"}
          </p>
        </div>
        <div className="close min-w-100 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Close</p>
          <p className="text-btnBlackTxtColor xs:text-15 sm:text-18">
            {historyData.round.closePrice
              ? numberWithCommas(historyData.round.closePrice)
              : "-"}
          </p>
        </div>
        <div className="timeframe min-w-100 w-[4%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Timeframe</p>
          <p className="text-btnBlackTxtColor xs:text-15 sm:text-18">
            {roundTimeToString(historyData.round.endAt - historyData.round.lockAt)}
          </p>
        </div>
        <div className="round-start min-w-130 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Round start</p>
          <p className="break-all text-btnBlackTxtColor xs:text-15 sm:text-18">
            {convertTime(new Date(historyData.round.lockAt * 1000)).time}
          </p>
        </div>
        <div className="round-end min-w-130 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Round end</p>
          <p className="break-all text-btnBlackTxtColor xs:text-15 sm:text-18">
            {convertTime(new Date(historyData.round.endAt * 1000)).time}
          </p>
        </div>
        <div className="transaction min-w-80">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Tx</p>
          <a
            href={`${EXPLORER_LINKS[currentNetworkChainId]}/tx/${historyData.hash}`}
            className="sub-value text-btnBlackTxtColor"
            target={"_blank"}
            rel="noreferrer"
          >
            #{historyData.round.epoch}
          </a>
        </div>
        <div className="status min-w-160 w-[10%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Status</p>
          {status === RoundStatus.InProgress ? (
            <span className="text-brandColor font-semibold">In progress</span>
          ) : status === RoundStatus.Success ? (
            <span
              className={`xs:text-14 sm:text-16 py-5 px-[8px] rounded-md font-semibold ${
                isWin
                  ? "text-successTxtColor bg-success/20"
                  : "text-warnTxtColor bg-warnTxtColor/20"
              }`}
            >
              {isWin ? "Win" : "Loss"}
              {" - "}
              {isWin
                ? historyData.amount * getOneMillionForBera() < 0.1
                  ? numberWithCommas(
                      calcBettingReward(false, historyData.amount, tradingFee),
                      6
                    )
                  : parseFloat(
                      calcBettingReward(
                        historyData.creditUsed,
                        historyData.amount * getOneMillionForBera(),
                        tradingFee
                      ).toFixed(2)
                    )
                : historyData.amount * getOneMillionForBera() < 0.1
                ? numberWithCommas(historyData.amount, 6)
                : parseFloat((historyData.amount * getOneMillionForBera()).toFixed(2))}
            </span>
          ) : status === RoundStatus.Failed ? (
            <span className="text-warnTxtColor">Failed</span>
          ) : (
            <span className="text-grayTxtColor bg-grayTxtColor/20 xs:text-14 sm:text-16 py-5 px-[8px] rounded-md font-semibold">
              Round full
            </span>
          )}
        </div>

        <div className="claim flex items-center min-w-100 w-[10%] justify-center">
          {!isClaiming &&
            !claimed &&
            (status !== RoundStatus.InProgress ? (
              <button
                className="flex items-center justify-center rounded-2xl xs:text-15 xl:text-20 text-whiteTxtColor xs:w-80 xl:w-110 xs:h-30 xl:h-50 bg-brandColor disabled:bg-btnUnselectBgColor disabled:text-grayTxtColor transition-all font-semibold disabled:hidden"
                disabled={status === RoundStatus.Success && !isWin}
                onClick={() => handleClaim(status === RoundStatus.Success)}
              >
                {status === RoundStatus.Success ? "Claim" : "Refund"}
              </button>
            ) : (
              ""
            ))}
          {isClaiming && <CircularProgress size={30} />}
          {claimed && (
            <a
              href={`${EXPLORER_LINKS[currentNetworkChainId]}/tx/${claimedHash}`}
              className="flex items-center justify-center gap-5 rounded-full hover:opacity-85 xs:text-16 xl:text-18 text-grayTxtColor xs:w-80 xl:w-120 xs:h-30 xl:h-50 underline"
              target={"_blank"}
              rel="noreferrer"
            >
              {status === RoundStatus.Failed || status === RoundStatus.Reverted
                ? "Refunded "
                : "Claimed "}
              <ClaimedButtonArrowIcon className="w-[14px]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClosedRoundDetail;
