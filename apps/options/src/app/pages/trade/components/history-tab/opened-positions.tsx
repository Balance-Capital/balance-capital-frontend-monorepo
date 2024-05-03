import { RootState } from "../../../../store";
import { useSelector } from "react-redux";
import { HistoryData } from "../../../../core/types/basic.types";
import OpenedRoundDetail from "./opened-round-detail";
import { useEffect, useState } from "react";

const OpenedPositions = () => {
  const openedRounds = useSelector((state: RootState) => state.openRounds.rounds);
  const timestampOffset = useSelector((state: RootState) => state.app.timestampOffset);

  const [globalTime, setGlobalTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const func = () => {
      const timestamp =
        Date.now() + (timestampOffset.offset ? timestampOffset.offset : 0);
      setGlobalTime(Math.floor(timestamp / 1000));
    };
    func();
    const timerId = setInterval(func, 500);
    return () => clearInterval(timerId);
  }, [timestampOffset]);

  return (
    <div role="tabpanel" className=" w-[100%] overflow-auto max-w-[100vw]">
      {openedRounds.map((item: HistoryData) => (
        <OpenedRoundDetail
          key={`${item.timeframeId}-${item.round.epoch}`}
          item={item}
          globalTime={globalTime}
        />
      ))}
      {openedRounds.length === 0 && (
        <div className="h-200 flex justify-center items-center text-grayTxtColor gap-5 border-b-[1px] border-btnBlackStrokeColor">
          Your open positions will show up here
        </div>
      )}
    </div>
  );
};

export default OpenedPositions;
