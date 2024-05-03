import { useCallback, useEffect, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CircularProgress from "@mui/material/CircularProgress";

import { fromUnixTime } from "date-fns";
import { ICompetiton } from "../mock";
import { ILeaderboardData } from "../../../core/types/basic.types";
import { unstable_batchedUpdates } from "react-dom";
import YourPosition from "./your-position";
import Terms from "./terms";
import { Underlying_Token } from "../../../core/constants/basic";
import LeaderboardRow from "../../../components/leaderboard-row/leaderboard-row";
import { EXPLORER_LINKS } from "../../../core/constants/network";
import TournamentTimer from "./tournament-timer";
import { useAccount } from "../../../hooks/useAccount";
import Pagination from "../../../components/pagination/pagination";
import { useNetworkContext } from "../../../context/NetworkContext";

const pageSize = 10;

function ShowCompetition({
  currentCompetitonData,
}: {
  currentCompetitonData: ICompetiton;
}) {
  const [, setEnded] = useState(false);
  const [tabId, setTabId] = useState(0);
  const { address } = useAccount();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ILeaderboardData[]>([]);
  const [myPosition, setMyPosition] = useState<ILeaderboardData>();

  const { currentNetworkChainId } = useNetworkContext();

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (currentCompetitonData.id) {
      setLoading(true);
      const { list, yourPosition } = await currentCompetitonData.getData(address);
      unstable_batchedUpdates(() => {
        setData(list);
        setMyPosition(yourPosition);
        setLoading(false);
      });
    }
  }, [address, currentCompetitonData.id, currentNetworkChainId]);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearTimeout(id);
  }, [currentCompetitonData.endTimestamp]);

  useEffect(() => {
    const id = setInterval((): any => {
      if (currentCompetitonData.endTimestamp < Math.floor(new Date().getTime() / 1000)) {
        setEnded(true);
        clearTimeout(id);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [currentCompetitonData.endTimestamp]);

  return (
    <div className="min-h-screen flex flex-col justify-between customize-scrollbar">
      <div className="xs:px-15 sm:px-40 md:px-90 mt-30 grow cursor-default">
        <div>
          <div className="title xs:flex flex-col items-center sm:block xs:px-20 sm:px-40 py-20 xs:mt-10 xs:mb-40 sm:my-10 sm:mb-50 bg-cover sm:bg-[url('./assets/images/bg-leaderboard-sm.png')] lg:bg-[url('./assets/images/bg-leaderboard-lg.png')] bg-no-repeat  rounded-2xl">
            <p className="xs:text-34 sm:text-40 text-lightwhite text-center md:text-left">
              Ryze.fi Trading Tournament #{currentCompetitonData.id}
            </p>
            <p className="xs:text-18 sm:text-22 text-second text-center md:text-left">
              Up to{" "}
              <span className="text-success">
                {currentCompetitonData?.winners.first.symbol === "$"
                  ? `$${currentCompetitonData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")}`
                  : `$${currentCompetitonData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")} ${
                      currentCompetitonData?.winners.first.symbol
                    }`}
              </span>{" "}
              to be won, ending{" "}
              {`${fromUnixTime(
                currentCompetitonData.endTimestamp
              ).toDateString()} ${fromUnixTime(
                currentCompetitonData.endTimestamp
              ).toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="px-20 py-15 rounded-xl text-center bg-success/10">
          <div className="w-[fit-content] mx-auto text-success">
            <InfoOutlinedIcon sx={{ mr: 1, mt: -0.3 }} />
            Become the no.1 trader before the competition ends to win the grand prize
          </div>
        </div>
        <div className="xs:flex md:hidden mt-20">
          {["Timer", `My position`].map((text, ind) => (
            <button
              className={`w-0 grow py-20 border-b-2 text-18 sm:text-20 ${
                ind === tabId
                  ? "border-b-success text-textWhite"
                  : "border-b-second text-second"
              }`}
              onClick={() => setTabId(ind)}
              key={text}
            >
              {text}
            </button>
          ))}
        </div>
        {tabId === 0 ? (
          <div className="my-40 flex flex-col md:flex-row gap-40">
            <div className="md:w-400 flex flex-col gap-30">
              <TournamentTimer
                currentCompetitionData={currentCompetitonData}
                participants={data.length}
              />
              <div className="hidden md:block space-y-30">
                <YourPosition
                  ranking={data.findIndex((v) => v.user === address?.toLowerCase())}
                  userData={myPosition}
                  loading={loading}
                />
                <Terms currentCompetitionData={currentCompetitonData} />
              </div>
            </div>
            {loading ? (
              <div className="md:w-0 grow h-400 flex justify-center items-center">
                <CircularProgress sx={{ color: "#00B6A9" }} />
              </div>
            ) : (
              <div className="md:w-0 grow">
                <div className="overflow-auto">
                  {data.length === 0 ? (
                    <div className="text-second text-20 text-center h-200 flex items-center justify-center">
                      There are no traders yet with volume {">="}{" "}
                      {currentCompetitonData.competitionTermLimit}{" "}
                      {Underlying_Token[currentNetworkChainId].symbol} within this month
                    </div>
                  ) : (
                    <table className="xs:min-w-[750px] xl:min-w-[700px] w-full border-separate borderSpacing">
                      <thead>
                        <tr className="text-left font-InterRegular xs:text-16 lg:text-17 text-second [&>th]:font-normal">
                          <th className="pl-30">Rank</th>
                          <th>User</th>
                          <th className="text-left">P&L</th>
                          <th className="text-right">ROI (%)</th>
                          <th className="pr-30"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .slice(pageSize * (page - 1), pageSize * page)
                          .map((user, index: number) => (
                            <LeaderboardRow
                              user={{
                                address: user.user,
                                link: `${EXPLORER_LINKS[currentNetworkChainId]}/address/${user.user}`,
                                p_and_l: user.pNl,
                                roi: user.roi,
                                wholeBetAmount: user.totalBet,
                              }}
                              ranking={index + pageSize * (page - 1) + 1}
                              key={index}
                              showPositions={
                                currentCompetitonData.endTimestamp <
                                Math.floor(new Date().getTime() / 1000)
                              }
                            />
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {data.length > pageSize && (
                  <Pagination
                    currentPage={page}
                    onPageChange={(page: number) => setPage(page)}
                    totalPages={Math.ceil(data.length / pageSize)}
                  />
                )}
              </div>
            )}
            <div className="md:hidden">
              <Terms currentCompetitionData={currentCompetitonData} />
            </div>
          </div>
        ) : (
          <div className="my-40">
            <YourPosition
              ranking={data.findIndex((v) => v.user === address?.toLowerCase())}
              userData={myPosition}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowCompetition;
