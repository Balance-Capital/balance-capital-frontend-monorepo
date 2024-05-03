import CircularProgress from "@mui/material/CircularProgress";

import { HistoryData } from "../../../../core/types/basic.types";
import ClosedRoundDetail from "./closed-round-detail";
import { useEffect, useState } from "react";

interface HistoryTapProps {
  children?: React.ReactNode;
  data: HistoryData[];
  fetchHistoryLoading: boolean;
}

export type Ledger = {
  amount: string;
  position: number;
  claimed: boolean;
};

export const HistoryTab = ({ data, fetchHistoryLoading }: HistoryTapProps) => {
  const [history, setHistory] = useState<HistoryData[]>([...data]);

  useEffect(() => {
    setHistory([...data]);
  }, [data]);

  if (fetchHistoryLoading)
    return (
      <div className="flex items-center justify-center w-full bg-btnBlackBgColor xs:h-200 xl:h-300 rounded-3xl">
        <div className="flex flex-col items-center gap-10">
          <CircularProgress sx={{ color: "#12b3a8" }} />
          <span className="text-grayTxtColor">Fetching round history...</span>
        </div>
      </div>
    );

  return (
    <div role="tabpanel" className="w-[100%] overflow-auto max-w-[100vw] pb-20">
      {history.map((item: HistoryData, index: number) => (
        <ClosedRoundDetail key={`${item.timeframeId}-${item.round.epoch}`} item={item} />
      ))}
    </div>
  );
};
