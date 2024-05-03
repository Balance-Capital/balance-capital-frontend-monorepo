import Tooltip from "@mui/material/Tooltip";
import { ChangeEvent, useCallback, useDeferredValue, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadRewardLeaderboardThunk } from "../../../store/reducers/reward-slice";
import { RootState } from "../../../store";
import { addressEllipsis } from "@fantohm/shared-helpers";
import { unstable_batchedUpdates } from "react-dom";
import Pagination from "../../../components/pagination/pagination";

const pageSize = 10;

function LeaderBoardTable() {
  const dispatch = useDispatch();
  const { data, length } = useSelector((state: RootState) => state.reward.leaderboard);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const deferredValue = useDeferredValue(searchValue);

  useEffect(() => {
    dispatch(
      loadRewardLeaderboardThunk({
        skip: (page - 1) * pageSize,
        take: pageSize,
        address: deferredValue,
      })
    );
  }, [page, deferredValue]);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    unstable_batchedUpdates(() => {
      setPage(1);
      setSearchValue(e.target.value);
    });
  }, []);

  return (
    <>
      <div className="border-obsidianBlack border-2 rounded-3xl overflow-hidden">
        <div className="px-25 pt-25 flex items-center xs:justify-center md:justify-between">
          <h2 className="font-InterMedium text-25 text-lightwhite">Leaderboard</h2>
          <label
            htmlFor="search-record"
            className="border-obsidianBlack border-2 rounded-2xl p-10 xs:hidden md:flex items-center gap-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21.285"
              height="21.284"
              viewBox="0 0 21.285 21.284"
            >
              <path
                id="_2867938_search_icon"
                data-name="2867938_search_icon"
                d="M17.283,15.768l5.753,5.763a1.067,1.067,0,0,1-1.516,1.494l-5.742-5.742a8.538,8.538,0,1,1,1.5-1.5Zm-6.745,1.174a6.4,6.4,0,1,0-6.4-6.4A6.4,6.4,0,0,0,10.538,16.941Z"
                transform="translate(-2.002 -2.002)"
                fill="#2d3f41"
              />
            </svg>
            <input
              className="outline-none bg-transparent text-second placeholder:text-second/50"
              placeholder="Search for a wallet"
              type="text"
              name="search-record"
              id="search-record"
              onChange={handleSearch}
            />
          </label>
        </div>
        <div className="overflow-auto">
          <table className="xs:min-w-[750px] xl:min-w-[1280px] w-full borderSpacing">
            <thead>
              <tr className="text-left font-InterRegular xs:text-16 lg:text-17 text-second [&>th]:font-normal [&>*]:py-10">
                <th className="pl-25 w-[25%]">Rank</th>
                <th className="w-[30%]">User</th>
                <th className="text-left w-[30%]">Points</th>
                <th className="w-[15%]">
                  <div className="mx-auto w-[fit-content] flex items-center gap-5 font-InterRegular xs:text-16 lg:text-17 text-second">
                    Multiplier
                    <Tooltip
                      enterTouchDelay={0}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: 15,
                            p: 2,
                            borderRadius: "10px",
                            textAlign: "center",
                            bgcolor: "#0E1415",
                            color: "#BDE0EB",
                            "& .MuiTooltip-arrow": {
                              color: "#0E1415",
                            },
                          },
                        },
                      }}
                      title="Top 20 users earn a 2.5x bonus multiplier on all rewards earned"
                      arrow
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-[13px] h-[13px]"
                        viewBox="0 0 16.312 16.312"
                      >
                        <path
                          id="Path_2922"
                          data-name="Path 2922"
                          d="M10.156,18.313a8.156,8.156,0,1,1,8.156-8.156A8.156,8.156,0,0,1,10.156,18.313Zm0-1.631a6.525,6.525,0,1,0-6.525-6.525,6.525,6.525,0,0,0,6.525,6.525ZM9.34,6.082h1.631V7.709H9.341Zm0,3.262h1.631v4.894H9.341Z"
                          transform="translate(-2 -2.001)"
                          fill="#5b7481"
                        />
                      </svg>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((obj, index) => (
                <tr
                  key={obj.user}
                  className={`font-InterRegular xs:text-16 lg:text-18 ${
                    index % 2 === 0 ? "[&>td]:bg-[#0E1415]" : "[&>td]:bg-charcoalGray"
                  } xs:[&>td]:py-15 lg:[&>td]:py-20`}
                >
                  <td className="text-primary pl-25">
                    {obj?.rank || index + pageSize * (page - 1) + 1}
                  </td>
                  <td className="text-primary">
                    <div className="flex items-center gap-10">
                      <div className="p-[8px] bg-[#151A1C] rounded-[50%]">
                        <img
                          className="h-20 w-20"
                          src={`./assets/images/temp-avatar.png`}
                          alt={`account logo`}
                        />
                      </div>{" "}
                      {addressEllipsis(obj.user)}
                    </div>
                  </td>
                  <td>{obj.point.toLocaleString("en-US")}</td>
                  <td className="text-center text-primary pr-25">{obj.boost}x</td>
                </tr>
              ))}
              {!data.length ? (
                <tr className="font-InterRegular xs:text-16 lg:text-18 [&>td]:bg-[#0E1415] xs:[&>td]:py-15 lg:[&>td]:py-20">
                  <td colSpan={4} className="text-primary pl-25 text-center">
                    No record found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {length > pageSize && (
        <Pagination
          currentPage={page}
          onPageChange={(page: number) => setPage(page)}
          totalPages={Math.ceil(length / pageSize)}
        />
      )}
    </>
  );
}

export default LeaderBoardTable;
