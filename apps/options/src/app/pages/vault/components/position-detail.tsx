import React, { useEffect, useState } from "react";
import { TabId } from "../tabs/my-positions";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { PositionData } from "../../../core/types/basic.types";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  calcVaultPositionBalance,
  convertBase64ToJSON,
  convertSecondsToString,
  formatUtoken,
  numberWithCommas,
  withdrawLocktimeToString,
} from "../../../helpers/data-translations";
import Skeleton from "../../../components/skeleton/skeleton";
import { vaultTokenUri } from "../../../contract-methods/vault";
import { setTxPending } from "../../../store/reducers/app-slice";
import {
  useCancelWithdrawal,
  useExecuteWithdrawal,
} from "../../../hooks/useVaultContract";
import { NotifyType } from "../../../core/constants/notification";
import {
  loadVaultBalance,
  removePosition,
  removeWithdrawalRequest,
  setVaultData,
  updatePositionShareInfo,
  updateTotalInvestedAmount,
} from "../../../store/reducers/vault-slice";
import {
  loadEnvVariable,
  EXPLORER_LINKS,
  OPENSEA_LINKS,
} from "../../../core/constants/network";
import { enqueueSnackbar } from "notistack";
import {
  PageTitles,
  emitEarnVaultPositionViewedOnExplorerTrack,
  emitEarnVaultPostitionListedOnOpenSeaTrack,
} from "../../../helpers/analytics";
import { getVaultSharesOfToken } from "../../../helpers/contractHelpers";
import { ReactComponent as ListOnOpenseaIcon } from "../../../../assets/icons/ListOnOpenseaIcon.svg";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

type Props = {
  position: PositionData;
  setSelectedPosition: (position: PositionData | undefined) => void;
  setSelectedTab: (tabId: TabId) => void;
};

const PositionDetail = ({ position, setSelectedPosition, setSelectedTab }: Props) => {
  const { totalStakedAmount: vaultTotalStackedAmount, withdrawalLockTime } = useSelector(
    (state: RootState) => state.vault
  );
  const timeOffset = useSelector((state: RootState) => state.app.timestampOffset);

  const { currentNetworkChainId } = useNetworkContext();

  const dispatch = useDispatch();
  const { address } = useAccount();

  const [metadata, setMetadata] = useState<any>();
  const [remainingTime, setRemainingTime] = useState(0);

  const [netValue, setNetValue] = useState(position.netValue);

  const cancelWithdraw = useCancelWithdrawal();
  const executeWithdraw = useExecuteWithdrawal();

  useEffect(() => {
    loadPositionMetadata();

    const timerId = setInterval(loadPositionMetadata, 60000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (position) {
      const func = async () => {
        const res = await getVaultSharesOfToken(position.tokenId);
        setNetValue(res.netValue.toString());
        dispatch(
          updatePositionShareInfo({
            shares: res.shares.toString(),
            tokenValue: res.tokenValue.toString(),
            netValue: res.netValue.toString(),
            fee: res.fee.toString(),
            tokenId: position.tokenId,
          })
        );
      };

      func();
    }
  }, [position]);

  const loadPositionMetadata = async () => {
    const tokenUri = await vaultTokenUri(position.tokenId);
    const metadata = convertBase64ToJSON(tokenUri);
    setMetadata(metadata);
  };

  useEffect(() => {
    const func = () => {
      const currentTime = Math.floor((Date.now() + timeOffset.offset) / 1000);
      if (position.withdrawal) {
        setRemainingTime(
          position.withdrawal.startTime + withdrawalLockTime - currentTime
        );
      }
    };

    func();

    let timerId: any;
    if (position.withdrawal) {
      timerId = setInterval(func, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeOffset]);

  const handleGoBack = () => {
    setSelectedPosition(undefined);
    setSelectedTab(TabId.POSITION_LIST);
  };

  const handleWithdraw = () => {
    setSelectedPosition(position);
    setSelectedTab(TabId.POSITION_WITHDRAW);
  };

  const handleDeposit = () => {
    setSelectedPosition(position);
    setSelectedTab(TabId.POSITION_DEPOSIT);
  };

  const handleCancelWithdraw = async () => {
    dispatch(setTxPending(true));

    const cancelResult = await cancelWithdraw(position.tokenId);
    enqueueSnackbar(cancelResult.message, { variant: cancelResult.severity });
    if (cancelResult.severity === NotifyType.DEFAULT) {
      dispatch(removeWithdrawalRequest(position.tokenId));
      setSelectedPosition({ ...position, withdrawal: null });
      loadPositionMetadata();
    }

    dispatch(setTxPending(false));
  };

  const handleExecuteWithdraw = async () => {
    if (!position.withdrawal || !address) {
      return;
    }
    dispatch(setTxPending(true));

    const executeResult = await executeWithdraw(position.tokenId);
    enqueueSnackbar(executeResult.message, { variant: executeResult.severity });

    if (executeResult.severity === NotifyType.DEFAULT) {
      await dispatch(loadVaultBalance(false));
      dispatch(
        updateTotalInvestedAmount(
          (position.investAmount * position.withdrawal.shareAmount * -1) /
            formatUtoken(position.shares)
        )
      );
      dispatch(removePosition(position.tokenId));
      setTimeout(() => dispatch(setVaultData()), 30000);
      handleGoBack();
    }

    dispatch(setTxPending(false));
  };

  const handleListOnOpenseaClick = () => {
    if (address) {
      emitEarnVaultPostitionListedOnOpenSeaTrack(
        PageTitles.Earn,
        address,
        calcVaultPositionBalance(position),
        position.investAmount,
        position.tokenId,
        formatUtoken(position.shares)
      );
    }
  };

  const handleViewOnExplorerClick = () => {
    if (address) {
      emitEarnVaultPositionViewedOnExplorerTrack(
        PageTitles.Earn,
        address,
        position.tokenId
      );
    }
  };

  return (
    <div className="h-full flex flex-col justify-between gap-30">
      <div className="text-second items-center justify-between flex gap-15 text-20">
        <div className="flex items-center gap-10">
          <div
            className="h-35 w-35 sm:h-40 sm:w-40 rounded-full border-2 border-second flex items-center justify-center cursor-pointer hover:bg-second/10"
            onClick={handleGoBack}
          >
            <ArrowBackRoundedIcon className="text-second" />
          </div>
          Back
        </div>
        <a
          href={`${EXPLORER_LINKS[currentNetworkChainId]}/token/${loadEnvVariable(
            `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
          )}?a=${position.tokenId}`}
          target="_blank"
          rel="noreferrer"
          className="text-second text-16 sm:text-18 leading-6 flex items-center gap-5"
          onClick={handleViewOnExplorerClick}
        >
          View on explorer <OpenInNewRoundedIcon className="text-16 sm:text-18" />
        </a>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-15 md:gap-30 lg:gap-15 items-center justify-around">
        <div className="xs:order-2 lg:order-1 rounded-3xl relative flex items-center justify-center">
          <img
            src={metadata ? metadata.image : "./assets/images/position-default-image.svg"}
            alt="position default"
            className="w-full h-full max-w-340 lg:w-240 xl:w-full"
          />
        </div>
        <div className="xs:order-1 lg:order-2 w-full h-full border-2 border-bunker rounded-3xl p-20 2xl:p-30 gap-20 lg:gap-10 xl:gap-20 flex flex-wrap [&>div]:grow xs:[&>div]:w-full lg:[&>div]:w-1/3 xl:[&>div]:w-full">
          <div>
            <div className="text-second">Return</div>
            <div className="flex items-center gap-10 relative">
              <div
                className={`text-20 lg:text-22 2xl:text-24 font-bold transition-all relative group ${
                  calcVaultPositionBalance(position, netValue) < 100
                    ? "text-danger"
                    : "text-success"
                }`}
              >
                {calcVaultPositionBalance(position, netValue) >= 100 ? "+ " : ""}
                {(calcVaultPositionBalance(position, netValue) - 100).toFixed(3)} %
                <div
                  className={`absolute -bottom-50 w-150 bg-light-woodsmoke rounded-lg text-center py-[2px] left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all text-16 font-normal ${
                    calcVaultPositionBalance(position, netValue) < 100
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {calcVaultPositionBalance(position, netValue) >= 100 ? "+ " : ""}
                  {parseFloat(
                    (calcVaultPositionBalance(position, netValue) - 100).toFixed(7)
                  )}{" "}
                  %
                </div>
                <div className="w-20 h-20 border-[10px] border-transparent border-b-light-woodsmoke absolute -bottom-[22px] left-1/2 -translate-x-1/2 invisible  group-hover:visible opacity-0 group-hover:opacity-100 transition-all"></div>
              </div>
              {vaultTotalStackedAmount === 0 && (
                <div className="absolute h-full w-full left-0 top-0">
                  <Skeleton />
                </div>
              )}
            </div>
          </div>
          {position.withdrawal ? (
            <div>
              <div className="text-second">Time remaining</div>
              <div className="flex items-center gap-5">
                <AccessTimeRoundedIcon
                  className={`font-InterMedium xs:text-20 lg:text-22 2xl:text-24 leading-9 transition-all ${
                    remainingTime <= 0 ? "text-success" : "text-second"
                  }`}
                />
                <div
                  className={`font-InterMedium xs:text-20 lg:text-22 2xl:text-24 leading-9 transition-all ${
                    remainingTime <= 0 ? "text-success" : "text-lightgrape"
                  }`}
                >
                  {convertSecondsToString(Math.max(remainingTime, 0))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-second">Lock duration</div>
              <div className="flex items-center gap-5">
                <AccessTimeRoundedIcon className="text-18 xl:text-20 text-second" />
                <div className="text-20 lg:text-22 2xl:text-24 font-bold text-lightgrape">
                  {withdrawLocktimeToString(withdrawalLockTime)}
                </div>
              </div>
            </div>
          )}

          {position.withdrawal && (
            <div>
              <div className="text-second">Withdrawal Amount</div>
              <div className="text-20 lg:text-22 2xl:text-24 leading-6 text-lightgrape">
                {numberWithCommas(
                  Math.min(
                    (position.withdrawal.shareAmount / formatUtoken(position.shares)) *
                      100,
                    100
                  )
                )}{" "}
                %
              </div>
            </div>
          )}

          <div className="hidden sm:block">
            <div className="text-second text-16 flex gap-5 items-center">Trade</div>
            <a
              href={`${OPENSEA_LINKS[currentNetworkChainId]}/${loadEnvVariable(
                `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
              )}/${position.tokenId}`}
              target={"_blank"}
              className="text-lightgrape underline text-18 2xl:text-20 leading-6 flex items-center gap-5 mt-5"
              rel="noreferrer"
              onClick={handleListOnOpenseaClick}
            >
              List on Opensea
              <ListOnOpenseaIcon className="w-16" />
            </a>
          </div>
        </div>
      </div>
      {!position.withdrawal ? (
        <div className="flex font-InterMedium text-22 leading-8 xs:flex-col sm:flex-row gap-15 md:gap-30">
          <button
            className="w-full py-15 bg-success hover:bg-success-hover rounded-2xl h-full text-buttontext"
            onClick={handleDeposit}
          >
            Deposit
          </button>
          <button
            className="w-full py-15 bg-success hover:bg-success-hover rounded-2xl h-full text-buttontext"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        </div>
      ) : (
        <div className="flex font-InterMedium text-20 leading-8 xs:flex-col sm:flex-row gap-15 md:gap-30">
          <button
            className="w-full py-15 bg-danger hover:bg-danger-hover rounded-2xl h-full text-buttontext transition-all"
            onClick={handleCancelWithdraw}
          >
            Cancel Withdraw
          </button>
          <button
            className="w-full py-15 bg-success hover:bg-success-hover rounded-2xl h-full text-buttontext disabled:bg-disable disabled:text-second transition-all"
            onClick={handleExecuteWithdraw}
            disabled={remainingTime > 0}
          >
            Execute Withdraw
          </button>
        </div>
      )}
      <a
        href={`${OPENSEA_LINKS[currentNetworkChainId]}/${loadEnvVariable(
          `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
        )}/${position.tokenId}`}
        target={"_blank"}
        className="sm:hidden w-full py-15 font-InterMedium text-second text-22 leading-8 rounded-[22px] border-2 border-[#0F1617] xs:flex items-center justify-center gap-5"
        rel="noreferrer"
      >
        List on Opensea
        <OpenInNewRoundedIcon className="text-22" />
      </a>
    </div>
  );
};

export default PositionDetail;
