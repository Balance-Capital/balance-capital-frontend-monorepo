import { addressEllipsis } from "@fantohm/shared-helpers";
import { LeaderboardUserData } from "../../store/reducers/leaderboard-slice";
import { PageTitles, emitLeaderboardExplorerViewedTrack } from "../../helpers/analytics";
import { ReactComponent as ViewOnExplorerLeaderboardIcon } from "../../../assets/icons/ViewOnExplorerLeaderboardIcon.svg";
import { ReactComponent as WinnerCup } from "../../../assets/icons/winner-cup.svg";
import { useAccount } from "../../hooks/useAccount";

const cellConfig = {
  0: {
    bg: "[&>td]:bg-deepSea",
    txtColor: "text-success",
    rank: {
      txtColor: "text-lightWhite",
      borderColor: "border-lightWhite",
    },
  },
  1: {
    bg: "[&>td]:bg-[#CEB64E]/10",
    txtColor: "text-[#CEB64E]",
    rank: {
      txtColor: "text-[#CEB64E]",
      borderColor: "border-[#CEB64E]",
    },
  },
  2: {
    bg: "[&>td]:bg-[#D9D9D9]/10",
    txtColor: "text-[#D9D9D9]",
    rank: {
      txtColor: "text-[#D9D9D9]",
      borderColor: "border-[#D9D9D9]",
    },
  },
  3: {
    bg: "[&>td]:bg-[#D68052]/10",
    txtColor: "text-[#D68052]",
    rank: {
      txtColor: "text-[#D68052]",
      borderColor: "border-[#D68052]",
    },
  },
} as {
  [key: number]: {
    bg: string;
    txtColor: string;
    rank: { txtColor: string; borderColor: string };
  };
};

const LeaderboardRow = (props: {
  user: LeaderboardUserData;
  ranking: number;
  showPositions?: boolean;
}) => {
  const { user, ranking, showPositions } = props;
  const { address } = useAccount();
  const cellObj = (showPositions && cellConfig[ranking]) || cellConfig[0];

  const handleClickViewOnExplorer = () => {
    if (address) {
      emitLeaderboardExplorerViewedTrack(
        PageTitles.Leaderboard,
        address,
        ranking,
        user.address,
        user.p_and_l || 0,
        user.roi * 100
      );
    }
  };

  return (
    <tr
      className={`${cellObj.bg} font-InterRegular xs:text-16 lg:text-18 xs:[&>td]:py-15 lg:[&>td]:py-20`}
    >
      <td className="rounded-l-2xl pl-25">
        <div className={`${cellObj.rank.txtColor} flex items-center gap-20`}>
          {showPositions && ranking < 4 && (
            <div
              className={`border-2 p-5 rounded-full ${cellObj.rank.borderColor} ${cellObj.rank.txtColor}`}
            >
              <WinnerCup />
            </div>
          )}
          <span>{ranking}</span>
        </div>
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
          {addressEllipsis(user.address)}
        </div>
      </td>
      <td className={`text-left ${user.p_and_l >= 0 ? cellObj.txtColor : "text-danger"}`}>
        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
          user.p_and_l || 0
        )}
      </td>
      <td className={`text-right ${user.roi >= 0 ? cellObj.txtColor : "text-danger"}`}>
        {user.roi >= 0 ? "+" : ""}
        {(user.roi * 100).toFixed(2)}%
      </td>
      <td className="text-primary rounded-r-2xl pr-25">
        <a
          className="flex items-center gap-5 justify-end underline"
          href={user.link}
          target="_blank"
          rel="noreferrer"
          onClick={handleClickViewOnExplorer}
        >
          View on Explorer
          <ViewOnExplorerLeaderboardIcon className="w-[12px]" />
        </a>
      </td>
    </tr>
  );
};

export default LeaderboardRow;
