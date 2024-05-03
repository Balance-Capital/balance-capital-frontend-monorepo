import React from "react";
import AvatarPlaceholder from "../../../../assets/images/temp-avatar.png";
import { addressEllipsis } from "@fantohm/shared-helpers";
import { numberWithCommas } from "../../../helpers/data-translations";
import LoadingSkeleton from "../../trade/components/round-card/loading-skeleton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CompetitionTermsLimit } from "../../../core/constants/basic";
import { ILeaderboardData } from "../../../core/types/basic.types";
import ToolTip from "../../../components/tooltip/ToolTip";
import { useAccount } from "../../../hooks/useAccount";

interface Props {
  ranking: number;
  loading: boolean;
  userData?: ILeaderboardData;
}

const YourPosition = ({ ranking, userData, loading }: Props) => {
  const { address } = useAccount();

  return (
    <div className="px-40 py-40 rounded-3xl bg-deepSea border-2 border-obsidianBlack space-y-20">
      <div className="text-24 text-lightwhite flex items-center justify-between">
        Your position
        <ToolTip title="Refresh for latest results">
          <div
            className="bg-obsidianBlack rounded-xl p-10 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24.081"
              height="23.52"
              viewBox="0 0 24.081 23.52"
            >
              <path
                id="_5402417_refresh_rotate_sync_update_reload_icon"
                data-name="5402417_refresh_rotate_sync_update_reload_icon"
                d="M24.4,4.351a1.125,1.125,0,0,0-1.2.18l-1.53,1.361A11.036,11.036,0,0,0,13.251,2a11.25,11.25,0,1,0,10.6,15,1.126,1.126,0,1,0-2.126-.743,9,9,0,1,1-8.471-12A8.843,8.843,0,0,1,20,7.378L18.134,9.031A1.126,1.126,0,0,0,18.876,11h5.063a1.125,1.125,0,0,0,1.125-1.125v-4.5A1.125,1.125,0,0,0,24.4,4.351Z"
                transform="translate(-1.483 -1.5)"
                fill="#5b7481"
                stroke="#5b7481"
                strokeLinecap="round"
                strokeWidth="1"
              />
            </svg>
          </div>
        </ToolTip>
      </div>
      <div>
        <div className="flex gap-10">
          <div className="bg-obsidianBlack flex justify-center items-center rounded-2xl text-22 text-second w-90 relative">
            {ranking === -1 ? "N/A" : `#${ranking + 1}`}

            {loading && (
              <LoadingSkeleton className="absolute rounded-2xl inset-0 overflow-hidden bg-woodsmoke" />
            )}
          </div>
          <div className="grow p-10 border-2 border-obsidianBlack rounded-2xl space-y-5">
            <div className="flex items-center gap-10">
              <img src={AvatarPlaceholder} alt="profile pic" className="w-18 h-15" />
              <div className="w-full">{address && addressEllipsis(address)}</div>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-14 text-success relative overflow-hidden rounded-md">
                ${userData ? numberWithCommas(userData.totalBet) : 0}
                {loading && (
                  <LoadingSkeleton className="absolute inset-0 overflow-hidden bg-woodsmoke" />
                )}
              </div>
              <div
                className={`text-14 rounded-md relative overflow-hidden ${
                  userData === undefined ||
                  parseFloat((userData.roi * 100).toFixed(2)) >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {userData ? (userData.roi * 100).toFixed(2) : 0}%
                {loading && (
                  <LoadingSkeleton className="absolute inset-0 overflow-hidden bg-woodsmoke" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`rounded-2xl bg-success/10 flex text-14 px-15 items-center transition-all overflow-hidden ${
            ranking === -1 && !loading ? "mt-10 h-60" : "h-0 mt-0"
          }`}
        >
          <div className="grow text-success text-center mr-5 justify-center">
            <InfoOutlinedIcon className="text-18 translate-y-[-1px] mr-5" />$
            {(CompetitionTermsLimit - (userData ? userData.totalBet : 0)).toFixed(2)} away
            from entering the leaderboard
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourPosition;
