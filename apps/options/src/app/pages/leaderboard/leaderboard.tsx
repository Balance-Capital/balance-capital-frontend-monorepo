/* eslint-disable node/no-unsupported-features/es-syntax */
import { useDispatch, useSelector } from "react-redux";
import LeaderboardRow from "../../components/leaderboard-row/leaderboard-row";

import {
  clearLeaderboardData,
  getLeaderboardData,
  LeaderboardOrderbyFields,
  LeaderboardUserData,
  loadLeaderboardData,
  setLeaderboardOrderby,
  setLeaderboardSearchText,
  setShowAll,
} from "../../store/reducers/leaderboard-slice";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "../../store";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactComponent as WinnerCup } from "../../../assets/icons/winner-cup.svg";
import { activeCompetitionData } from "../competitions/mock";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { isActiveForChain } from "../../helpers/data-translations";
import { useNetworkContext } from "../../context/NetworkContext";

export const Leaderboard = (): JSX.Element => {
  const dispatch = useDispatch();
  const data = useSelector(getLeaderboardData);
  const searchText = useSelector((state: RootState) => state.leaderboard.searchText);
  const loadMore = useSelector((state: RootState) => state.leaderboard.loadMore);
  const loading = useSelector((state: RootState) => state.leaderboard.loading);
  const orderBy = useSelector((state: RootState) => state.leaderboard.orderBy);
  const showAll = useSelector((state: RootState) => state.leaderboard.showAll);
  const { currentNetworkChainId } = useNetworkContext();

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const tiemrId = setTimeout(() => {
      dispatch(clearLeaderboardData());
      dispatch(loadLeaderboardData());
    }, 300);
    return () => clearTimeout(tiemrId);
  }, [searchText, orderBy, showAll, currentNetworkChainId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const showAll = params.get("showAll");
    if (showAll?.toLowerCase() === "true") {
      dispatch(setShowAll(true));
    } else {
      dispatch(setShowAll(false));
    }
  }, [location]);

  const orderByROI = () => {
    dispatch(setLeaderboardOrderby(LeaderboardOrderbyFields.roi));
  };

  const orderByPNL = () => {
    dispatch(setLeaderboardOrderby(LeaderboardOrderbyFields.pnl));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between customize-scrollbar">
      <div className="xs:px-5 sm:px-40 md:px-90 mt-30 grow cursor-default">
        <div className="sm:block">
          <div className="title xs:flex flex-col items-center sm:block xs:px-20 sm:px-40 py-20 xs:mt-10 xs:mb-40 sm:my-10 sm:mb-50 bg-cover sm:bg-[url('./assets/images/bg-leaderboard-sm.png')] lg:bg-[url('./assets/images/bg-leaderboard-lg.png')] bg-no-repeat  rounded-2xl">
            <p className="xs:text-34 sm:text-40 text-primary">Leaderboard</p>
            <p className="xs:text-18 sm:text-22 text-second">Top traders globally</p>
          </div>
          <div className="my-15 flex gap-10 flex-wrap items-center">
            <button
              className="h-40 flex items-center justify-center gap-5 px-10 rounded-lg bg-obsidianBlack text-textGray xs:grow md:grow-0"
              onClick={orderByPNL}
            >
              <img src="./assets/icons/graph-arrow.svg" alt="graph" /> Top payouts
            </button>
            <button
              className="h-40 flex items-center justify-center gap-5 px-10 rounded-lg bg-obsidianBlack text-textGray xs:grow md:grow-0"
              onClick={orderByROI}
            >
              % Top ROI
            </button>
            {isActiveForChain(currentNetworkChainId) && (
              <Link
                className="h-40 flex items-center justify-center gap-5 px-10 rounded-lg bg-obsidianBlack text-textGray xs:grow md:grow-0 xs:mr-0 md:mr-15"
                to={`/competitions/${activeCompetitionData?.id}`}
              >
                <WinnerCup className="text-textGray" />
                Trading Competition
              </Link>
            )}
            <div className="flex items-center bg-deepSea rounded-lg py-10 px-15 ml-auto grow md:max-w-400 gap-5 xs:w-full md:w-0 xs:mt-10 md:mt-0">
              <SearchRoundedIcon className="opacity-50" />
              <input
                type="text"
                className="text-textWhite bg-transparent outline-none w-0 grow"
                value={searchText}
                onChange={(e) => dispatch(setLeaderboardSearchText(e.target.value))}
                placeholder="Search for an address"
              />
            </div>
          </div>
          <div className="overflow-auto">
            <table className="xs:min-w-[750px] xl:min-w-[1280px] w-full border-separate borderSpacing">
              <thead>
                <tr className="text-left font-InterRegular xs:text-16 lg:text-17 text-second [&>th]:font-normal">
                  <th className="pl-30 w-[11%]">Rank</th>
                  <th className="w-[30%]">User</th>
                  <th className="text-left w-[12%]">P&L</th>
                  <th className="text-right w-[15%]">ROI(%)</th>
                  <th className="pr-30"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((user: LeaderboardUserData, index: number) => (
                  <LeaderboardRow user={user} ranking={index + 1} key={index} />
                ))}
              </tbody>
            </table>
          </div>
          {!loading && data.length === 0 && (
            <div className="text-textGray mt-30 flex flex-col items-center justify-center gap-10 ">
              <div className="text-textGray bg-textGray/10 w-30 h-30 flex justify-center items-center rounded-full">
                <HelpOutlineOutlinedIcon className="text-textGray text-22" />
              </div>
              <div className="text-18 text-textGray">No results found</div>
            </div>
          )}
          {loading && (
            <div className="mt-30 flex justify-center items-center">
              <CircularProgress sx={{ color: "#00B6A9" }} />
            </div>
          )}
          {loadMore && !loading && (
            <div className="mt-30 flex justify-center">
              <button
                className="mx-auto px-20 py-10 rounded-lg bg-deepSea"
                onClick={() => dispatch(loadLeaderboardData())}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
