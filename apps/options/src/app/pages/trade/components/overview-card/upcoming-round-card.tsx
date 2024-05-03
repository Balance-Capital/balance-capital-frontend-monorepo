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
import {
  getBettingTimeframeWithId,
  minuteTimer,
} from "../../../../helpers/data-translations";
import StartRoundCard from "../round-card/start-round-card";

const pageSize = 9;

interface Props {
  setSwiperEnabled?: (enabled: boolean) => void;
}

const UpcomingRoundCardMobile = ({ setSwiperEnabled }: Props) => {
  const [page, setPage] = useState(0);
  const [rounds, setRounds] = useState<number[]>([]);
  const [cardId, setCardId] = useState(0);

  const timeframe = useSelector(getCurrentTimeFrame);
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const openRounds = useSelector((state: RootState) => state.openRounds.rounds);
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);

  useEffect(() => {
    const rounds = Array(pageSize).fill(timeframe.rounds[2].epoch + page * pageSize + 1);
    setRounds(rounds);

    return () => {
      setRounds([]);
    };
  }, [timeframe.rounds[2].epoch, page]);

  useEffect(() => {
    setPage(0);
  }, [currentTimeframeId, underlyingToken]);

  return (
    <div className="flex flex-col gap-20 start-round-card border-2 border-btnBlackStrokeColor bg-btnBlackBgColor rounded-3xl xs:p-10 xl:p-20 h-full relative max-w-450 w-full">
      {!isInitializing && cardId > 0 && (
        <div className="w-full h-full absolute left-0 top-0 z-10">
          <StartRoundCard
            cardId={cardId}
            onGoBack={() => setCardId(0)}
            setSwiperEnabled={setSwiperEnabled}
          />
        </div>
      )}
      <div className="w-full card-title">
        <div className="flex justify-between ">
          <div className="flex items-center justify-start">
            <SvgIcon
              component={CalendarMonthOutlinedIcon}
              className="xs:w-24 xl:w-32 xs:h-24 xl:h-32 text-grayTxtColor"
            />
            <p className="ml-10 text-18 xl:text-22 text-btnBlackTxtColor">Upcoming</p>
          </div>
          <div className="flex items-center gap-15 text-grayTxtColor">
            <ArrowBackIcon
              onClick={() =>
                setPage((prev: number) => {
                  if (prev === 0) return 0;
                  return prev - 1;
                })
              }
              className="w-[32px] h-[32px] rounded-lg border-2 border-btnBlackStrokeColor p-[3px] hover:text-btnBlackTxtColor hover:cursor-pointer"
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
              className="w-[32px] h-[32px] rounded-lg border-2 border-btnBlackStrokeColor p-[3px] hover:text-btnBlackTxtColor hover:cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-10">
        {rounds &&
          rounds.map((round, index) =>
            (page * pageSize + index + 2) *
              getBettingTimeframeWithId(currentTimeframeId).minute <=
            MaxBettableFutureTime ? (
              <div
                key={index}
                className={`border-2 xs:rounded-2xl xl:rounded-3xl py-20 hover:cursor-pointer hover:border-grayTxtColor grid gap-5 justify-center group border-btnBlackStrokeColor bg-pageBgColor`}
                onClick={() => setCardId(round + index)}
              >
                <div className="flex justify-between relative items-center">
                  {isInitializing && (
                    <div className="absolute rounded-md w-full overflow-hidden h-full z-30 left-0 top-0 bg-btnBlackBgColor">
                      <div className="w-full h-full opacity-20">
                        <Skeleton
                          variant="rectangular"
                          height={"100%"}
                          width={"100%"}
                          className="!bg-grayTxtColor"
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-14 xl:text-16 text-grayTxtColor">#{round + index}</p>
                  {openRounds.find(
                    (openRound) =>
                      openRound.timeframeId === currentTimeframeId &&
                      openRound.round.epoch === round + index
                  ) ? (
                    <LockIcon className="xs:text-15 xl:text-17 my-[3px] text-grayTxtColor" />
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex items-center justify-start relative">
                  <SvgIcon
                    component={AccessTimeOutlinedIcon}
                    className="w-16 h-16 xl:w-24 xl:h-24 text-grayTxtColor"
                  />
                  <p className="text-14 xl:text-16 text-btnBlackTxtColor ml-5">
                    {minuteTimer(
                      (page * pageSize + index + 2) *
                        getBettingTimeframeWithId(currentTimeframeId).minute *
                        60
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div key={index} className="min-h-90"></div>
            )
          )}
      </div>
    </div>
  );
};

export default UpcomingRoundCardMobile;
