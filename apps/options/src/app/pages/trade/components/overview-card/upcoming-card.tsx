import Skeleton from "@mui/material/Skeleton";
import SvgIcon from "@mui/material/SvgIcon";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCurrentTimeFrame } from "../../../../store/reducers/trade-slice";
import LockIcon from "@mui/icons-material/Lock";
import { MaxBettableFutureTime } from "../../../../core/constants/basic";
import { RootState } from "../../../../store";
import { getRoundTime, minuteTimer } from "../../../../helpers/data-translations";
import { getTimezoneDisplayName } from "../../../../helpers/data-translations";
import {
  convertTime,
  getBettingTimeframeWithId,
} from "../../../../helpers/data-translations";

const pageSize = 3;

const UpcomingRoundCard = ({
  cardId,
  setCardId,
}: {
  cardId?: number;
  setCardId?: (id: number) => void;
}) => {
  const [page, setPage] = useState(0);
  const [rounds, setRounds] = useState<number[]>([]);
  const timeframe = useSelector(getCurrentTimeFrame);
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const openRounds = useSelector((state: RootState) => state.openRounds.rounds);
  const genesisTime = useSelector((state: RootState) => state.trade.genesisTime);
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);

  useEffect(() => {
    const rounds = Array(3).fill(timeframe.rounds[2].epoch + page * 3 + 1);
    setRounds(rounds);

    if (cardId && cardId > 1 && cardId <= timeframe.rounds[2].epoch && setCardId) {
      setCardId(1);
    }

    return () => {
      setRounds([]);
    };
  }, [timeframe.rounds[2].epoch, page]);

  useEffect(() => {
    if (setCardId) {
      setCardId(1);
    }
    setPage(0);
  }, [currentTimeframeId, underlyingToken]);

  return (
    <div className="grid gap-20 start-round-card bg-charcoalGray rounded-3xl xs:p-10 xl:p-15 2xl:p-20 h-full relative border-2 border-obsidianBlack">
      <div className="w-full card-title">
        <div className="flex justify-between ">
          <div className="flex items-center justify-start">
            <SvgIcon
              component={CalendarMonthOutlinedIcon}
              className="xs:w-24 2xl:w-32 xs:h-24 2xl:h-32 text-second"
            />
            <p className="ml-10 text-18 2xl:text-22 text-primary">Upcoming</p>
          </div>
          <div className="flex items-center gap-15 text-second">
            <ArrowBackIcon
              onClick={() =>
                setPage((prev: number) => {
                  if (prev === 0) return 0;
                  return prev - 1;
                })
              }
              className="w-[32px] h-[32px] rounded-lg border-2 border-obsidianBlack p-[3px] hover:text-primary hover:cursor-pointer"
            />
            <ArrowForwardIcon
              onClick={() => {
                if (
                  getBettingTimeframeWithId(currentTimeframeId).minute *
                    (pageSize * (page + 1) + 2) >
                  MaxBettableFutureTime
                ) {
                  return;
                }
                setPage((prev: number) => prev + 1);
              }}
              className="w-[32px] h-[32px] rounded-lg border-2 border-obsidianBlack p-[3px] hover:text-primary hover:cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-10">
        {rounds &&
          rounds.map(
            (round, index) =>
              (page * 3 + index + 2) *
                getBettingTimeframeWithId(currentTimeframeId).minute <=
                MaxBettableFutureTime && (
                <div
                  key={index}
                  className={`border-2 xs:rounded-2xl 2xl:rounded-3xl py-20 hover:cursor-pointer transition-all bg-midnightBlue hover:border-darkGray grid gap-5 justify-center group ${
                    round + index === cardId
                      ? "border-success hover:border-success/90"
                      : "border-obsidianBlack"
                  }`}
                  onClick={() => setCardId && setCardId(round + index)}
                >
                  <div className="flex justify-between relative items-center">
                    {isInitializing && (
                      <div className="absolute rounded-md w-full overflow-hidden h-full z-30 left-0 top-0 bg-woodsmoke">
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
                    <p className="text-14 2xl:text-16 text-second">#{round + index}</p>
                    {openRounds.find(
                      (openRound) =>
                        openRound.timeframeId === currentTimeframeId &&
                        openRound.round.epoch === round + index
                    ) ? (
                      <LockIcon className="xs:text-15 2xl:text-17 my-[3px] text-second" />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="flex items-center justify-start relative">
                    <SvgIcon
                      component={AccessTimeOutlinedIcon}
                      className="w-16 h-16 2xl:w-24 2xl:h-24 text-second"
                    />
                    <p className="text-14 2xl:text-16 text-primary ml-5">
                      {minuteTimer(
                        (page * 3 + index + 2) *
                          getBettingTimeframeWithId(currentTimeframeId).minute *
                          60
                      )}
                    </p>
                    <div className="text-textWhite absolute -bottom-50 w-220 bg-light-woodsmoke rounded-lg text-center py-[2px] left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                      Ending at{" "}
                      {
                        convertTime(
                          new Date(
                            getRoundTime(
                              genesisTime,
                              round + index,
                              currentTimeframeId
                            ).closeTime
                          )
                        ).time
                      }{" "}
                      {getTimezoneDisplayName(new Date())}
                    </div>
                    <div className="w-20 h-20 border-[10px] border-transparent border-b-light-woodsmoke absolute -bottom-[22px] left-1/2 -translate-x-1/2 invisible  group-hover:visible opacity-0 group-hover:opacity-100 transition-all"></div>
                  </div>
                </div>
              )
          )}
      </div>
    </div>
  );
};

export default UpcomingRoundCard;
