import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import style from "./competitionbar.module.scss";
import { activeCompetitionData } from "../../pages/competitions/mock";
import { useNetworkContext } from "../../context/NetworkContext";
import { isActiveForChain } from "../../helpers/data-translations";

function CompetitionBar() {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isEnded, setEnded] = useState(false);
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    const id = setInterval((): any => {
      if (
        activeCompetitionData &&
        activeCompetitionData.endTimestamp < Math.floor(new Date().getTime() / 1000)
      ) {
        setEnded(true);
        clearTimeout(id);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [activeCompetitionData?.endTimestamp]);

  return isActive && isActiveForChain(currentNetworkChainId) ? (
    <div className="w-full py-10 px-10 bg-[#12B3A8]/10 flex items-center justify-center gap-15">
      <Link
        to={`/competitions/${activeCompetitionData?.id}`}
        className="w-full flex items-center justify-center gap-15"
      >
        {isEnded ? null : (
          <span className="font-InterMedium rounded-lg bg-[#12B3A8]/10 px-10 text-14 text-success">
            LIVE
          </span>
        )}
        <img src="./assets/images/cup.svg" alt="" />
        <div className="max-w-500 flex overflow-hidden relative select-none gap-[1rem]">
          {isEnded ? (
            <>
              <div
                className={`${style.linearScroll} shrink-0 flex justify-around min-w-full font-InterMedium text-18 text-success`}
              >
                Trading Competition #{activeCompetitionData?.id} has now ended
              </div>
              <div
                className={`${style.linearScroll} shrink-0 flex justify-around min-w-full font-InterMedium text-18 text-success`}
              >
                Trading Competition #{activeCompetitionData?.id} has now ended
              </div>
            </>
          ) : (
            <>
              <div
                className={`${style.linearScroll} shrink-0 flex justify-around min-w-full font-InterMedium text-18 text-success`}
              >
                Trading Competition #{activeCompetitionData?.id} —{" "}
                {activeCompetitionData?.winners.first.symbol === "$"
                  ? `$${activeCompetitionData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")}`
                  : `$${activeCompetitionData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")} ${
                      activeCompetitionData?.winners.first.symbol
                    }`}{" "}
                Prize Pool to Be Won
              </div>
              <div
                className={`${style.linearScroll} shrink-0 flex justify-around min-w-full font-InterMedium text-18 text-success`}
              >
                Trading Competition #{activeCompetitionData?.id} —{" "}
                {activeCompetitionData?.winners.first.symbol === "$"
                  ? `$${activeCompetitionData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")}`
                  : `$${activeCompetitionData
                      ?.totalWinningPrice()
                      .toLocaleString("en-US")} ${
                      activeCompetitionData?.winners.first.symbol
                    }`}{" "}
                Prize Pool to Be Won
              </div>
            </>
          )}
        </div>
      </Link>
      <button
        onClick={() => setIsActive(false)}
        className="ml-auto rounded-full bg-[#12B3A8]/10 p-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14.826"
          height="15.826"
          viewBox="0 0 14.826 15.826"
        >
          <g id="Group_13412" data-name="Group 13412" transform="translate(1.469 1.699)">
            <line
              id="Line_184"
              data-name="Line 184"
              x1="12"
              y2="13"
              transform="translate(-0.056 -0.286)"
              fill="none"
              stroke="#13c9bd"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              id="Line_185"
              data-name="Line 185"
              x2="12"
              y2="13"
              transform="translate(-0.056 -0.286)"
              fill="none"
              stroke="#13c9bd"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      </button>
    </div>
  ) : null;
}

export default CompetitionBar;
