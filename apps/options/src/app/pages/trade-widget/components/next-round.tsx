import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentTimeFrame } from "../../../store/reducers/trade-slice";
import { minuteTimer } from "../../../helpers/data-translations";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

function NextRound({
  handleOnClick,
  cardId,
}: {
  handleOnClick: () => void;
  cardId?: number;
}) {
  const timeframe = useSelector(getCurrentTimeFrame);
  const [timerValue, setTimerValue] = useState("");

  useEffect(() => {
    const time = minuteTimer(timeframe.remainingTime);
    setTimerValue(time);
  }, [timeframe]);

  return (
    <button
      onClick={handleOnClick}
      className={`flex gap-5 font-InterMedium text-16 text-btnBlackTxtColor bg-btnBlackBgColor px-10 py-5 border-2 ${
        cardId === 1 ? "border-brandColor" : "border-btnBlackStrokeColor"
      } rounded-3xl`}
    >
      <ArrowForwardRoundedIcon className="text-second" /> Next in {timerValue}
    </button>
  );
}

export default NextRound;
