import { ChangeEvent, useCallback, useRef, useState } from "react";
import { TabId } from "../tabs/my-positions";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  useERC20Allowance,
  useERC20Approve,
  useERC20TokenBalanceOf,
} from "../../../hooks/useERC20Contract";
import {
  convertNumbertoShortenForm,
  formatUtoken,
  numberWithCommas,
  parseUtoken,
} from "../../../helpers/data-translations";
import { ethers } from "ethers";
import Skeleton from "../../../components/skeleton/skeleton";
import { loadEnvVariable } from "../../../core/constants/network";
import { useDispatch, useSelector } from "react-redux";
import { setTxPending } from "../../../store/reducers/app-slice";
import { NotifyType } from "../../../core/constants/notification";
import { useAddLiquidity } from "../../../hooks/useVaultContract";
import {
  loadVaultBalance,
  removePosition,
  setVaultData,
  updateTotalInvestedAmount,
} from "../../../store/reducers/vault-slice";
import { PositionData } from "../../../core/types/basic.types";
import { RootState } from "../../../store";
import {
  Underlying_Token,
  ValidNumberInputKeyCodes,
} from "../../../core/constants/basic";
import { enqueueSnackbar } from "notistack";
import {
  PageTitles,
  emitEarnExistingVaultPositionAdjustedTrack,
  emitEarnNewVaultPositionAddedTrack,
} from "../../../helpers/analytics";
import { convertToLocaleString } from "@fantohm/shared-helpers";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

type Props = {
  position: PositionData | undefined;
  setSelectedPosition: (position: PositionData | undefined) => void;
  setSelectedTab: (tabId: TabId) => void;
};

const PositionDeposit = ({ position, setSelectedTab, setSelectedPosition }: Props) => {
  const { currentNetworkChainId } = useNetworkContext();
  const vaultAddress = loadEnvVariable(
    `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
  );

  const dispatch = useDispatch();
  const { address } = useAccount();

  const addLiquidity = useAddLiquidity();
  const userBalance = useERC20TokenBalanceOf();
  const { allowance, getAllowance } = useERC20Allowance(vaultAddress);
  const approveToken = useERC20Approve();

  const [inputBalance, setInputBalance] = useState(ethers.BigNumber.from("0"));

  const inputBalanceRef = useRef<HTMLInputElement>(null);
  const { totalShares, totalStakedAmount } = useSelector((state: RootState) => ({
    totalShares: state.vault.totalShares,
    totalStakedAmount: state.vault.totalStakedAmount,
  }));

  const handleGoBack = () => {
    setSelectedPosition(undefined);
    setSelectedTab(TabId.POSITION_LIST);
  };

  const handleApprove = async () => {
    dispatch(setTxPending(true));
    // if (!allowance.isZero()) {
    //   const result = await approveToken(vaultAddress, true);
    //   if (result.severity === NotifyType.ERROR) {
    //     enqueueSnackbar(result.message, { variant: result.severity });
    //     dispatch(setTxPending(false));
    //     getAllowance();
    //     return;
    //   }
    // }
    const approveResult = await approveToken(vaultAddress);
    enqueueSnackbar(approveResult.message, { variant: approveResult.severity });
    if (approveResult.severity === NotifyType.DEFAULT) {
      await getAllowance();
    }
    dispatch(setTxPending(false));
  };

  const handleDeposit = async () => {
    let depositResult: any;
    if (!address) return;
    dispatch(setTxPending(true));

    if (position === undefined) {
      depositResult = await addLiquidity(0, inputBalance, true);
    } else {
      depositResult = await addLiquidity(position.tokenId, inputBalance, false);
    }

    enqueueSnackbar(depositResult.message, { variant: depositResult.severity });

    if (depositResult.severity === NotifyType.DEFAULT) {
      if (position) {
        dispatch(removePosition(position.tokenId));
        emitEarnExistingVaultPositionAdjustedTrack(
          PageTitles.Earn,
          address,
          formatUtoken(inputBalance),
          "Deposit"
        );
      } else {
        emitEarnNewVaultPositionAddedTrack(
          PageTitles.Earn,
          address,
          formatUtoken(inputBalance)
        );
      }

      await dispatch(loadVaultBalance(false));
      dispatch(updateTotalInvestedAmount(formatUtoken(inputBalance)));
      setTimeout(() => dispatch(setVaultData()), 30000);
      setSelectedTab(TabId.POSITION_LIST);
    }
    dispatch(setTxPending(false));
  };

  const onInputBalanceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { strValue, numValue } = convertToLocaleString(event.target.value);
      if (!numValue) {
        setInputBalance(ethers.BigNumber.from("0"));
      } else if (numValue > userBalance.balance) {
        event.target.value = convertToLocaleString(
          userBalance.balance.toString()
        ).strValue;
        setInputBalance(userBalance.balanceInWei);
      } else {
        event.target.value = strValue;
        setInputBalance(
          ethers.utils.parseUnits(numValue.toString(), userBalance.decimals)
        );
      }
    },
    [userBalance]
  );

  const onClickMax = useCallback(() => {
    if (inputBalanceRef.current) {
      inputBalanceRef.current.value = convertToLocaleString(
        userBalance.balance.toString()
      ).strValue;
      setInputBalance(userBalance.balanceInWei);
    }
  }, [userBalance, inputBalanceRef]);

  return (
    <div className="h-full flex flex-col justify-between gap-30">
      <div className="text-second items-center flex gap-15 text-20">
        <div
          className="h-40 w-40 rounded-full border-2 border-second flex items-center justify-center cursor-pointer hover:bg-second/10"
          onClick={handleGoBack}
        >
          <ArrowBackRoundedIcon className="text-second" />
        </div>
        Back
      </div>
      <div>
        <div className="font-InterRegular leading-6 text-second mb-15 xs:text-22">
          Your wallet
        </div>
        <div className="bg-deepSea rounded-xl md:rounded-2xl p-15 md:p-30">
          <div className="flex items-center justify-between gap-20">
            <div className="bg-charcoalGray p-[9px_13px] rounded-xl flex items-center gap-10">
              <img
                src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                alt={Underlying_Token[currentNetworkChainId].symbol}
                className="w-[33px] h-[33px]"
              />
              <div className="font-InterMedium text-lightgrape text-[23px]">
                {Underlying_Token[currentNetworkChainId].symbol}
              </div>
            </div>
            <input
              className="w-[calc(100%-140px)] text-lightgrape text-right text-24 bg-transparent border-0 outline-none"
              type="text"
              defaultValue={0}
              onChange={onInputBalanceChange}
              ref={inputBalanceRef}
              onKeyDown={(e) => {
                if (!ValidNumberInputKeyCodes.includes(e.keyCode)) {
                  e.preventDefault();
                }
                if (
                  (e.keyCode === 190 || e.keyCode === 110) &&
                  inputBalanceRef.current?.value.includes(".")
                ) {
                  e.preventDefault();
                }
                if (e.keyCode === 69 || e.keyCode === 188) e.preventDefault();
              }}
            />
          </div>
          <div className="mt-15 text-textWhite flex gap-10 text-18">
            <div className="text-second">Balance:</div>
            <div className="font-InterMedium text-lightgrape relative flex gap-10 grow justify-between ">
              {userBalance.loading && (
                <div className="w-full min-w-150 h-full absolute left-0 top-0">
                  <Skeleton />
                </div>
              )}
              <div className="hidden md:block">
                {numberWithCommas(userBalance.balance)}{" "}
                {Underlying_Token[currentNetworkChainId].symbol}
              </div>
              <div className="block md:hidden">
                {convertNumbertoShortenForm(userBalance.balance)}{" "}
                {Underlying_Token[currentNetworkChainId].symbol}
              </div>
              <div className="text-success cursor-pointer" onClick={onClickMax}>
                (MAX)
              </div>
            </div>
          </div>
        </div>

        {position && (
          <>
            <div className="mb-15 mt-40 font-InterRegular leading-6 text-second xs:text-22">
              Your position
            </div>
            <div className="bg-deepSea rounded-xl md:rounded-2xl p-15 md:p-30">
              <div className="flex items-center justify-between">
                <div className="bg-charcoalGray p-[9px_13px] rounded-xl flex items-center gap-10">
                  <img
                    src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                    alt={Underlying_Token[currentNetworkChainId].symbol}
                    className="xs:w-[33px] xs:h-[33px]"
                  />
                  <div className="font-InterMedium text-lightgrape text-[23px]">
                    {Underlying_Token[currentNetworkChainId].symbol}
                  </div>
                </div>
                <div className="font-InterMedium text-lightgrape text-24">
                  {numberWithCommas(
                    parseFloat(
                      (
                        (totalStakedAmount * formatUtoken(position.shares)) /
                        totalShares
                      ).toFixed(3)
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex xs:flex-col sm:flex-row gap-15 mt-100">
        <button
          className="xs:w-[100%] lg:w-[50%] py-[15px] rounded-[0.95rem] bg-success hover:bg-success-hover disabled:bg-second/30 hover:disabled:bg-second/30 text-buttontext disabled:text-second disabled:cursor-not-allowed transition-all"
          disabled={
            parseFloat(ethers.utils.formatUnits(allowance, userBalance.decimals)) >=
            parseFloat(ethers.utils.formatUnits(inputBalance, userBalance.decimals))
          }
          onClick={handleApprove}
        >
          Approve
        </button>
        <button
          className="xs:w-[100%] lg:w-[50%] py-[15px] rounded-[0.95rem] bg-success hover:bg-success-hover disabled:bg-second/30 hover:disabled:bg-second/30 text-buttontext disabled:text-second disabled:cursor-not-allowed transition-all"
          disabled={
            parseFloat(ethers.utils.formatUnits(allowance, userBalance.decimals)) <
              parseFloat(ethers.utils.formatUnits(inputBalance, userBalance.decimals)) ||
            inputBalance.lt(parseUtoken(0.001))
          }
          onClick={handleDeposit}
        >
          Deposit
        </button>
      </div>
    </div>
  );
};

export default PositionDeposit;
