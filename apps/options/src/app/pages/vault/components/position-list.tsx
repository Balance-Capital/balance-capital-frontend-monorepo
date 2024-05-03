import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "../../../components/skeleton/skeleton";
import { Underlying_Token } from "../../../core/constants/basic";
import { PositionData } from "../../../core/types/basic.types";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  calcVaultPositionBalance,
  convertNumbertoShortenForm,
  convertSecondsToString,
} from "../../../helpers/data-translations";
import { RootState } from "../../../store";
import { TabId } from "../tabs/my-positions";
import { useMergePositions } from "../../../hooks/useVaultContract";
import { setTxPending } from "../../../store/reducers/app-slice";
import { NotifyType } from "../../../core/constants/notification";
import { removePosition } from "../../../store/reducers/vault-slice";
import { enqueueSnackbar } from "notistack";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

enum PageMode {
  LIST,
  MERGE,
}

type Props = {
  setSelectedPosition: (position: PositionData | undefined) => void;
  setSelectedTab: (tabId: TabId) => void;
};

const PositionList = ({ setSelectedPosition, setSelectedTab }: Props) => {
  const { address } = useAccount();
  const mergePositions = useMergePositions();
  const dispatch = useDispatch();

  const userPositions = useSelector((state: RootState) => state.vault.positions);
  const vaultTotalStackedAmount = useSelector(
    (state: RootState) => state.vault.totalStakedAmount
  );
  const timeOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const withdrawLockTime = useSelector(
    (state: RootState) => state.vault.withdrawalLockTime
  );

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [pageMode, setPageMode] = useState(PageMode.LIST);
  const [activePositions, setActivePositions] = useState<number[]>([]);
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    setCurrentTime(Math.floor((Date.now() + timeOffset.offset) / 1000));

    const intervalId = setInterval(
      () => setCurrentTime(Math.floor((Date.now() + timeOffset.offset) / 1000)),
      1000
    );

    return () => clearInterval(intervalId);
  }, [timeOffset]);

  const changeToManageTab = (position: PositionData) => {
    setSelectedPosition(position);
    setSelectedTab(TabId.POSITION_DETAIL);
  };

  const handleNewPosition = () => {
    setSelectedPosition(undefined);
    setSelectedTab(TabId.POSITION_DEPOSIT);
  };

  const handleClickMergeAll = () => {
    handleMerge(userPositions.map((pos) => pos.tokenId));
  };

  const handleMerge = async (tokenIds: number[]) => {
    if (!address) return;
    dispatch(setTxPending(true));
    const result = await mergePositions(tokenIds);
    if (result.severity === NotifyType.DEFAULT) {
      tokenIds.forEach((tokenId) => dispatch(removePosition(tokenId)));

      setActivePositions([]);
      setPageMode(PageMode.LIST);
    }
    enqueueSnackbar(result.message, { variant: result.severity });
    dispatch(setTxPending(false));
  };

  return (
    <div className="h-full">
      {pageMode === PageMode.LIST ? (
        <div className="flex items-center justify-center flex-wrap">
          <div className="text-24 lg:text-20 xl:text-24 text-textWhite hidden lg:block mr-auto">
            My Positions
            {address ? `(${userPositions.length})` : ""}
          </div>
          <div className="flex gap-20 lg:gap-10 xl:gap-20">
            {userPositions.length > 1 && (
              <button
                className="h-45 px-20 lg:px-10 xl:px-20 bg-transparent hover:bg-success border-2 border-success rounded-xl text-buttontext transition-all"
                onClick={() => {
                  setPageMode(PageMode.MERGE);
                  setActivePositions([]);
                }}
              >
                Merge
              </button>
            )}
            <button
              className={`h-45 px-20 lg:px-10 xl:px-20 bg-success hover:bg-success-hover rounded-xl text-buttontext border-2 border-success ${
                userPositions.length === 0 ? "hidden" : "block"
              } lg:block transition-all`}
              onClick={handleNewPosition}
            >
              + New Position
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="text-second items-center flex gap-15 text-20 mr-auto">
            <div
              className="h-40 w-40 rounded-full border-2 border-second flex items-center justify-center cursor-pointer hover:bg-second/10"
              onClick={() => setPageMode(PageMode.LIST)}
            >
              <ArrowBackRoundedIcon className="text-second" />
            </div>
            Back
          </div>
          <div className="flex gap-20">
            <button
              className="h-45 px-20 bg-transparent hover:bg-success border-2 border-success rounded-xl text-textWhite transition-all disabled:border-disable disabled:text-disable disabled:hover:bg-transparent disabled:cursor-not-allowed"
              disabled={activePositions.length < 2}
              onClick={() => handleMerge(activePositions)}
            >
              Merge
            </button>
            <button
              className={`h-45 px-20 bg-success rounded-xl text-textWhite border-2 border-success ${
                userPositions.length === 0 ? "hidden" : "block"
              } lg:block`}
              onClick={handleClickMergeAll}
            >
              Merge All
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-15 lg:h-[calc(100%-90px)] xs:mt-20 xl:mt-40 overflow-y-auto lg:w-[calc(100%+15px)] lg:pr-10">
        {userPositions.length > 0 &&
          userPositions.map((position) => (
            <div
              className="flex flex-wrap items-center border-obsidianBlack border-2 hover:bg-deepSea rounded-3xl py-15 px-20 color-white transition-all"
              key={position.tokenId}
              onClick={() => {
                if (pageMode === PageMode.LIST) {
                  changeToManageTab(position);
                } else {
                  if (activePositions.includes(position.tokenId)) {
                    setActivePositions((prev) =>
                      prev.filter((tokenId) => tokenId !== position.tokenId)
                    );
                  } else {
                    setActivePositions((prev) => [...prev, position.tokenId]);
                  }
                }
              }}
            >
              <div
                className={`overflow-hidden transition-all ${
                  pageMode === PageMode.MERGE ? "w-30" : "w-0"
                }`}
              >
                <div
                  className={`w-20 h-20 flex justify-center items-center rounded-md cursor-pointer transition-all ${
                    activePositions.includes(position.tokenId)
                      ? "bg-success"
                      : "bg-disable hover:bg-second"
                  }`}
                >
                  {activePositions.includes(position.tokenId) && (
                    <CheckRoundedIcon className="text-textWhite text-20" />
                  )}
                </div>
              </div>
              <div className="w-80 sm:w-100 mr-auto sm:mr-0 lg:mr-auto xl:mr-0">
                <div className="text-second mb-5 text-16">Position</div>
                <div className="flex items-center gap-5 text-textWhite text-18">
                  <img
                    src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                    alt={Underlying_Token[currentNetworkChainId].symbol}
                    className="h-[22px] w-[22px]"
                  />
                  {convertNumbertoShortenForm(position.investAmount, true)}
                </div>
              </div>
              <div className="w-80 sm:w-100 mr-auto sm:mr-0 lg:mr-auto xl:mr-0">
                <div className="text-second mb-5">Return</div>
                <div className="flex items-center gap-5 text-textWhite text-18 relative">
                  <div
                    className={`grow transition-all ${
                      calcVaultPositionBalance(position) < 100
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {(calcVaultPositionBalance(position) - 100).toFixed(3)} %
                  </div>
                  {vaultTotalStackedAmount <= 0 && (
                    <div className="absolute h-full w-full left-0 top-0">
                      <Skeleton />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-90">
                <div className="text-second mb-5 text-16">Status</div>
                {position.withdrawal ? (
                  <div
                    className={`text-14 py-[3px] rounded-md text-center transition-all font-bold ${
                      withdrawLockTime + position.withdrawal.startTime > currentTime
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {withdrawLockTime + position.withdrawal.startTime > currentTime
                      ? convertSecondsToString(
                          Math.max(
                            position.withdrawal.startTime +
                              withdrawLockTime -
                              currentTime,
                            0
                          )
                        )
                      : "Unlocked"}
                    {/* {withdrawLockTime + position.withdrawal.startTime > currentTime
                      ? "Pending"
                      : "Unlocked"} */}
                  </div>
                ) : (
                  <div className="text-14 py-[3px] rounded-md text-center bg-disable/20 text-second font-bold">
                    Locked
                  </div>
                )}
              </div>
              {/* {position.withdrawal && (
                <div className="">
                  <div className="text-second mb-5 text-16">Time Remaining</div>
                  <div className="rounded-md transition-all text-textWhite text-18">
                    {convertSecondsToString(
                      Math.max(
                        position.withdrawal.startTime + withdrawLockTime - currentTime,
                        0
                      )
                    )}
                  </div>
                </div>
              )} */}
              <button
                className="xs:hidden sm:block lg:hidden h-50 rounded-xl border-2 border-success hover:bg-success px-20 text-buttontext transition-all ml-auto"
                onClick={() => changeToManageTab(position)}
              >
                Manage
              </button>
              <button
                className="hidden xl:block h-50 rounded-xl border-2 border-success hover:bg-success px-20 text-buttontext transition-all ml-auto"
                onClick={() => changeToManageTab(position)}
              >
                Manage
              </button>
            </div>
          ))}
        {!userPositions.length && (
          <div className="h-full flex flex-col justify-center items-center gap-20 pt-20 pb-120 grow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="49"
              height="49"
              viewBox="0 0 49 49"
            >
              <g
                id="Group_13346"
                data-name="Group 13346"
                transform="translate(-7.607 -8.607)"
              >
                <circle
                  id="Ellipse_1037"
                  data-name="Ellipse 1037"
                  cx="24.5"
                  cy="24.5"
                  r="24.5"
                  transform="translate(7.607 8.607)"
                  fill="rgba(75,97,108,0.13)"
                />
                <path
                  id="Path_2922"
                  data-name="Path 2922"
                  d="M14.929,27.858A12.929,12.929,0,1,1,27.858,14.929,12.929,12.929,0,0,1,14.929,27.858Zm0-2.586A10.343,10.343,0,1,0,4.586,14.929,10.343,10.343,0,0,0,14.929,25.273ZM13.636,8.465h2.586V11.05H13.636Zm0,5.172h2.586v7.758H13.636Z"
                  transform="translate(17.607 18.607)"
                  fill="#4b616c"
                />
              </g>
            </svg>
            <div className="font-InterMedium text-18 2xl:text-24 leading-7 text-second text-center">
              Your active positions will appear here
            </div>
            <button
              className="xs:p-[10px_18px] 2xl:p-[20px_36px] font-InterMedium xs:text-16 2xl:text-20 leading-6 bg-success hover:bg-success-hover xs:rounded-[14px] 2xl:rounded-[22px] text-buttontext border-2 border-success transaction-all block lg:hidden"
              onClick={handleNewPosition}
            >
              + New Position
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionList;
