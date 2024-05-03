import { useEffect, useRef, useState } from "react";
import { EXPLORER_LINKS } from "../../../../core/constants/network";
import { HistoryData } from "../../../../core/types/basic.types";
import {
  convertTime,
  getOneMillionForBera,
  numberWithCommas,
  roundTimeToString,
} from "../../../../helpers/data-translations";
import { Skeleton } from "@mui/material";
import { ReactComponent as GiftSvg } from "../../../../../assets/icons/gift.svg";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";
import { Underlying_Token } from "../../../../../app/core/constants/basic";

type Props = {
  item: HistoryData;
  globalTime: number;
  loading?: boolean;
};

const OpenedRoundDetail = ({ item, globalTime }: Props) => {
  const [historyData, setHistoryData] = useState<HistoryData>({ ...item });

  const { currentNetworkChainId } = useNetworkContext();

  const dataRef = useRef<HistoryData>();
  dataRef.current = historyData;

  useEffect(() => {
    setHistoryData(item);
  }, [item]);

  return (
    <div className="flex justify-between w-full min-w-[1400px]">
      <div className="flex w-[150%] gap-10 pl-5 border-b-[1px] py-20 md:py-35 border-btnBlackStrokeColor">
        <div className="round min-w-100 w-[8%]">
          <p className="text-grayTxtColor xs:text-14 sm:text-16">Round</p>
          <p className="xs:text-15 sm:text-18 text-btnBlackTxtColor">
            #{historyData.round.epoch}
          </p>
        </div>
        <div className="type min-w-100 w-[8%]">
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
              ? historyData.amount.toFixed(6)
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
            {historyData.round.lockPrice ? (
              numberWithCommas(historyData.round.lockPrice)
            ) : historyData.round.lockAt >= globalTime ? (
              "-"
            ) : (
              <Skeleton width={60} height={25} sx={{ backgroundColor: "#48565d" }} />
            )}
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
          <span className="text-brandColor font-semibold">In progress</span>
        </div>
        <div className="claim flex items-center min-w-100 w-[10%] justify-center"></div>
      </div>
    </div>
  );
};

export default OpenedRoundDetail;
