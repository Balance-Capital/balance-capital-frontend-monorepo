import React from "react";
import { EXPLORER_LINKS, loadEnvVariable } from "../../../core/constants/network";
import Skeleton from "../../../components/skeleton/skeleton";
import {
  calcAPY,
  convertNumbertoShortenForm,
  numberWithCommas,
  withdrawLocktimeToString,
} from "../../../helpers/data-translations";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Underlying_Token } from "../../../core/constants/basic";
import {
  PageTitles,
  emitEarnVaultViewedOnExplorerTrack,
} from "../../../helpers/analytics";
import { ReactComponent as TopRightArrowIcon } from "../../../../assets/icons/arrow-top-right.svg";
import { ReactComponent as NewWindowIcon } from "../../../../assets/icons/out-link.svg";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

const VaultOverview = () => {
  const totalStakedAmount = useSelector(
    (state: RootState) => state.vault.totalStakedAmount
  );
  const totalInvestedAmount = useSelector(
    (state: RootState) => state.vault.totalInvestedAmount
  );
  const sharePrice = useSelector(
    (state: RootState) => state.vault.totalStakedAmount / state.vault.totalShares
  );
  const sharePrice7DAgo = useSelector((state: RootState) => state.vault.sharePrice7DAgo);
  const withdrawalLocktime = useSelector(
    (state: RootState) => state.vault.withdrawalLockTime
  );

  const { currentNetworkChainId } = useNetworkContext();
  const { address } = useAccount();

  const handleViewOnExplorer = () => {
    if (address) {
      emitEarnVaultViewedOnExplorerTrack(
        PageTitles.Earn,
        address,
        convertNumbertoShortenForm(totalStakedAmount),
        calcAPY(sharePrice, sharePrice7DAgo, totalStakedAmount, totalInvestedAmount)
          .value,
        withdrawLocktimeToString(withdrawalLocktime)
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-10 md:gap-20 flex-col md:flex-row justify-between mb-40 lg:mb-20 xl:mb-40">
        <div className="flex gap-10 items-center">
          <div className="relative">
            <div className="rounded-full w-45 h-45 border-2 border-success/50 flex justify-center items-center bg-success/20">
              <TopRightArrowIcon className="w-20 h-20 md:w-24 md:h-24 text-success font-weight" />
            </div>
            <img
              src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
              alt={Underlying_Token[currentNetworkChainId].symbol}
              className="w-20 h-20 rounded-full absolute -right-[2px] -top-[2px]"
            />
          </div>

          <div className="text-24 text-textWhite">Earn Vault</div>
        </div>

        <a
          href={`${EXPLORER_LINKS[currentNetworkChainId]}/address/${loadEnvVariable(
            `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="text-second text-16 flex items-center gap-5"
          onClick={handleViewOnExplorer}
        >
          View on explorer <NewWindowIcon className="w-[14px] h-[14px]" />
        </a>
      </div>

      <div className="flex gap-10 md:gap-15 flex-wrap px-20 md:px-0 py-10 md:py-0 border-2 md:border-none border-obsidianBlack rounded-2xl md:rounded-none bg-deepSea md:bg-transparent">
        <div className="flex flex-col lg:flex-row grow w-1/2 sm:w-1/3 md:w-0 lg:w-full h-70 md:h-110 sm:items-center justify-center lg:px-20 rounded-3xl md:bg-deepSea">
          <div className="text-textGray lg:mr-auto md:text-18 lg:text-16 xl:text-18">
            Total Value Locked
          </div>
          <div className="text-22 xl:text-26 text-textWhite relative sm:text-center lg:text-right w-full max-w-200 sm:mx-10 lg:mx-0">
            {totalStakedAmount < 0 && (
              <div className="absolute w-full max-w-150 h-full sm:left-1/2 top-0 sm:-translate-x-1/2 lg:left-[auto] lg:right-0 lg:translate-x-0">
                <Skeleton />
              </div>
            )}
            <span className="hidden lg:block">
              {`${numberWithCommas(totalStakedAmount)} ${
                Underlying_Token[currentNetworkChainId].symbol
              }`}
            </span>
            <span className="block lg:hidden">
              {`${convertNumbertoShortenForm(totalStakedAmount)} ${
                Underlying_Token[currentNetworkChainId].symbol
              }`}
            </span>
          </div>
        </div>
        <div className="h-70 md:h-110 w-120 grow-0 sm:w-1/3 md:w-0 lg:w-1/4 sm:grow flex flex-col sm:items-center justify-center rounded-3xl md:bg-deepSea sm:px-10">
          <div className="text-textGray md:text-18 lg:text-16 xl:text-18">
            Vault{" "}
            {calcAPY(sharePrice, sharePrice7DAgo, totalStakedAmount, totalInvestedAmount)
              .isAPY
              ? "APY"
              : "ROI"}
          </div>
          <div
            className={`text-22 xl:text-26 relative w-full sm:text-center ${
              calcAPY(sharePrice, sharePrice7DAgo, totalStakedAmount, totalInvestedAmount)
                .value > -0.0005
                ? "text-success"
                : "text-danger"
            }`}
          >
            {totalStakedAmount < 0 && (
              <div className="absolute w-full max-w-150 h-full left-1/2 top-0 -translate-x-1/2">
                <Skeleton />
              </div>
            )}
            {totalStakedAmount <= 0
              ? 0
              : calcAPY(
                  sharePrice,
                  sharePrice7DAgo,
                  totalStakedAmount,
                  totalInvestedAmount
                ).value.toFixed(3)}{" "}
            %
          </div>
        </div>
        <div className="h-70 md:h-110 w-1/2 sm:w-1/3 md:w-0 lg:w-1/4 grow flex flex-col sm:items-center justify-center rounded-3xl md:bg-deepSea relative group">
          <div className="text-textGray md:text-18 lg:text-16 xl:text-18">
            Lock duration
          </div>
          <div className="text-textWhite text-22 xl:text-26 relative w-full sm:text-center sm:px-10">
            {withdrawalLocktime < 0 && (
              <div className="absolute w-full max-w-150 h-full sm:left-1/2 top-0 sm:-translate-x-1/2">
                <Skeleton />
              </div>
            )}
            {withdrawLocktimeToString(withdrawalLocktime)}
          </div>
          <div className="text-textGray absolute -bottom-50 w-320 bg-light-woodsmoke rounded-lg text-center py-[4px] px-5 left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-10">
            Withdrawal is not immediate, you will wait{" "}
            {withdrawLocktimeToString(withdrawalLocktime).toLowerCase()} until you can
            claim money
          </div>
          <div className="w-20 h-20 border-[10px] border-transparent border-b-light-woodsmoke absolute bottom-[5px] left-1/2 -translate-x-1/2 invisible  group-hover:visible opacity-0 group-hover:opacity-100 transition-all"></div>
        </div>
        <div className="h-70 md:h-110 w-120 grow-0 sm:w-1/3 md:w-0 lg:w-1/4 sm:grow flex flex-col sm:items-center justify-center rounded-3xl md:bg-deepSea">
          <div className="text-textGray md:text-18 lg:text-16 xl:text-18">Currency</div>
          <div className="flex gap-5 text-textWhite text-22 xl:text-26 items-center">
            <img
              src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
              alt={Underlying_Token[currentNetworkChainId].symbol}
              className="w-20 h-20"
            />
            {Underlying_Token[currentNetworkChainId].symbol}
          </div>
        </div>
      </div>

      <div className="my-40 lg:my-auto">
        <div className="text-textWhite text-18 flex gap-5 items-center relative">
          Overview
        </div>
        <p className="text-second py-10">
          Depositing funds into this vault carries some risk. Rewards may increase
          consistently, although your deposit on the other hand may decrease or increase.
          You can lose a significant portion of your investment if traders are making
          large profits, understand that there are no reimbursements when this happens.
          <br /> <br />
          You are essentially acting as a market maker by staking in the vault.
          Specifically the LP will increase in value when traders unsuccessfully predict
          the market's direction, and it will decrease in value when traders successfully
          predict the direction.
        </p>
      </div>
    </div>
  );
};

export default VaultOverview;
