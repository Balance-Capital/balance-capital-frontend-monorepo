import { memo, useEffect, useMemo, useState } from "react";
import { convertNumbertoDouble } from "../../../helpers/data-translations";
import { ICompetiton } from "../mock";
import { unstable_batchedUpdates } from "react-dom";

interface Props {
  currentCompetitionData: ICompetiton;
  participants: number;
}

const labels = ["Days", "Hours", "Minutes", "Seconds"];

const TournamentTimer = ({ currentCompetitionData, participants }: Props) => {
  const [currentTime, setCurrentTime] = useState(Math.floor(new Date().getTime() / 1000));
  const [timeDifference, setTimeDifference] = useState(
    currentCompetitionData.startTimestamp > currentTime
      ? currentCompetitionData.startTimestamp - currentTime
      : currentCompetitionData.endTimestamp - currentTime
  );

  const time = useMemo(() => {
    let timeDiff = timeDifference;
    const sec = timeDiff % 60;
    timeDiff = Math.floor(timeDiff / 60);
    const min = timeDiff % 60;
    timeDiff = Math.floor(timeDiff / 60);
    const hr = timeDiff % 24;
    const day = Math.floor(timeDiff / 24);
    return [day, hr, min, sec];
  }, [timeDifference]);

  useEffect(() => {
    const id = setInterval(() => {
      const currentTime = Math.floor(new Date().getTime() / 1000);
      unstable_batchedUpdates(() => {
        if (currentCompetitionData.startTimestamp > currentTime) {
          setTimeDifference(currentCompetitionData.startTimestamp - currentTime);
        } else {
          setTimeDifference(currentCompetitionData.endTimestamp - currentTime);
        }
        setCurrentTime(currentTime);
      });
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [currentCompetitionData.endTimestamp]);

  return (
    <div className="px-40 py-40 rounded-3xl bg-deepSea border-2 border-obsidianBlack space-y-20">
      <div className="text-24 text-lightwhite xs:text-center md:text-start">
        {currentCompetitionData.endTimestamp < currentTime
          ? "Tournament has ended"
          : currentCompetitionData.startTimestamp > currentTime
          ? "Tournament starts"
          : "Tournament ends"}
      </div>
      {currentCompetitionData.endTimestamp < currentTime ? (
        <div className="space-y-10">
          <div className="bg-[#0D181A] p-10 rounded-xl flex items-center justify-between">
            <div className="text-[#BFA94B] font-InterMedium">1st place</div>
            <div className="text-[#BFA94B] font-InterMedium">
              {currentCompetitionData.winners.first.symbol === "$"
                ? `$${currentCompetitionData.winners.first.price.toLocaleString("en-US")}`
                : `${currentCompetitionData.winners.first.price.toLocaleString(
                    "en-US"
                  )} ${currentCompetitionData.winners.first.symbol}`}
            </div>
          </div>
          <div className="bg-[#0D181A] p-10 rounded-xl flex items-center justify-between">
            <div className="text-[#C3C3C3] font-InterMedium">2nd place</div>
            <div className="text-[#C3C3C3] font-InterMedium">
              {currentCompetitionData.winners.second.symbol === "$"
                ? `$${currentCompetitionData.winners.second.price.toLocaleString(
                    "en-US"
                  )}`
                : `${currentCompetitionData.winners.second.price.toLocaleString(
                    "en-US"
                  )} ${currentCompetitionData.winners.second.symbol}`}
            </div>
          </div>
          <div className="bg-[#0D181A] p-10 rounded-xl flex items-center justify-between">
            <div className="text-[#BF734B] font-InterMedium">3rd place</div>
            <div className="text-[#BF734B] font-InterMedium">
              {currentCompetitionData.winners.third.symbol === "$"
                ? `$${currentCompetitionData.winners.third.price.toLocaleString("en-US")}`
                : `${currentCompetitionData.winners.third.price.toLocaleString(
                    "en-US"
                  )} ${currentCompetitionData.winners.third.symbol}`}
            </div>
          </div>
          <div className="bg-[#0D181A] p-10 rounded-xl flex items-center justify-between">
            <div className="text-second font-InterMedium">Participants</div>
            <div className="text-second font-InterMedium">{participants}</div>
          </div>
        </div>
      ) : (
        <div className="flex xs:justify-around md:justify-between">
          {time.map((val, ind) => (
            <div key={`${ind}-timer`} className="flex flex-col items-center">
              <div className="xs:w-50 xs:h-50 sm:w-60 sm:h-60 bg-obsidianBlack rounded-xl flex items-center justify-center text-20 text-second">
                {convertNumbertoDouble(val)}
              </div>
              <div className="text-second text-14 mt-10">{labels[ind]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(TournamentTimer);
