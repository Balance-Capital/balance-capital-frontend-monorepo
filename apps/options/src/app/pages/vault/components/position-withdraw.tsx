import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { TabId } from "../tabs/my-positions";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { PositionData } from "../../../core/types/basic.types";
import {
  Underlying_Token,
  ValidNumberInputKeyCodes,
} from "../../../core/constants/basic";
import { formatUtoken, parseUtoken } from "../../../helpers/data-translations";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useRequestWithdrawal } from "../../../hooks/useVaultContract";
import { NotifyType } from "../../../core/constants/notification";
import {
  addWithdrawalRequest,
  updatePositionShareInfo,
} from "../../../store/reducers/vault-slice";
import { setTxPending } from "../../../store/reducers/app-slice";
import { enqueueSnackbar } from "notistack";
import { getVaultSharesOfToken } from "../../../helpers/contractHelpers";
import {
  PageTitles,
  emitEarnExistingVaultPositionAdjustedTrack,
} from "../../../helpers/analytics";
import { BigNumber } from "ethers";
import { convertToLocaleString } from "@fantohm/shared-helpers";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

type Props = {
  position: PositionData;
  setSelectedPosition: (position: PositionData | undefined) => void;
  setSelectedTab: (tabId: TabId) => void;
};

const PositionWithdraw = ({ position, setSelectedTab, setSelectedPosition }: Props) => {
  const { currentNetworkChainId } = useNetworkContext();
  const [inputAmount, setInputAmount] = useState(BigNumber.from(0));

  const [netValue, setNetValue] = useState(BigNumber.from(position.netValue));

  const requestWithdrawal = useRequestWithdrawal();

  const timeOffset = useSelector((state: RootState) => state.app.timestampOffset);
  const dispatch = useDispatch();
  const { address } = useAccount();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (position) {
      const func = async () => {
        const res = await getVaultSharesOfToken(position.tokenId);
        setNetValue(res.netValue);

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

  const handleGoBack = () => {
    setSelectedPosition(undefined);
    setSelectedTab(TabId.POSITION_LIST);
  };

  const handleWithdraw = async () => {
    setSelectedPosition(undefined);
    dispatch(setTxPending(true));

    let shareAmount = "";
    if (formatUtoken(netValue) - formatUtoken(inputAmount) < 0.1) {
      shareAmount = position.shares;
    } else {
      shareAmount = inputAmount
        .mul(BigNumber.from(position.shares))
        .div(BigNumber.from(netValue))
        .toString();
    }

    const requestResult = await requestWithdrawal(shareAmount, position.tokenId);
    enqueueSnackbar(requestResult.message, { variant: requestResult.severity });
    if (requestResult.severity === NotifyType.DEFAULT) {
      dispatch(
        addWithdrawalRequest({
          shareAmount: formatUtoken(shareAmount),
          tokenId: position.tokenId,
          currentTime: Date.now() + timeOffset.offset,
        })
      );
      if (address) {
        emitEarnExistingVaultPositionAdjustedTrack(
          PageTitles.Earn,
          address,
          formatUtoken(inputAmount),
          "Withdraw"
        );
      }
    }
    dispatch(setTxPending(false));
    setSelectedTab(TabId.POSITION_LIST);
  };

  const onInputAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { numValue, strValue } = convertToLocaleString(event.target.value);
      const value = event.target.value;

      if (!numValue) {
        setInputAmount(BigNumber.from(0));
        event.target.value = "0";
      } else if (value === "") {
        setInputAmount(BigNumber.from(0));
        event.target.value = "0";
      } else if (parseUtoken(numValue).gt(netValue)) {
        setInputAmount(netValue);
        event.target.value = convertToLocaleString(formatUtoken(netValue) + "").strValue;
      } else {
        setInputAmount(parseUtoken(numValue));
        event.target.value = strValue;
      }
    },
    [netValue]
  );

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
        <div className="mb-15 font-InterRegular leading-6 text-second xs:text-22">
          Your Position
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
              {Intl.NumberFormat("en-US", {
                maximumFractionDigits: Underlying_Token[currentNetworkChainId].decimals,
                minimumFractionDigits: Underlying_Token[currentNetworkChainId].decimals,
              }).format(formatUtoken(netValue))}
            </div>
          </div>
        </div>

        <div className="font-InterRegular leading-6 text-second xs:text-22 mb-15 mt-40">
          Amount to withdraw
        </div>
        <div className="bg-deepSea rounded-xl md:rounded-2xl p-15 md:p-30">
          <div className="flex items-center justify-between gap-10">
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
            <input
              type="text"
              className="font-InterMedium text-lightgrape text-[23px] bg-transparent w-0 grow text-right outline-none"
              placeholder="Input Amount"
              onChange={onInputAmountChange}
              ref={inputRef}
              onKeyDown={(e) => {
                if (!ValidNumberInputKeyCodes.includes(e.keyCode)) {
                  e.preventDefault();
                }
                if (
                  (e.keyCode === 190 || e.keyCode === 110) &&
                  inputRef.current?.value.includes(".")
                ) {
                  e.preventDefault();
                }
                if (e.keyCode === 69 || e.keyCode === 188) e.preventDefault();
              }}
            />
          </div>
          <div className="mt-10 text-textWhite flex flex-col sm:flex-row gap-5 md:gap-10 flex-wrap">
            <div className="flex gap-5 md:gap-[8px]">
              {[10, 20, 50, 75, 100].map((num) => (
                <button
                  className="text-success cursor-pointer text-14 bg-charcoalGray px-[8px] py-[4px] rounded-md"
                  onClick={() => {
                    if (inputRef.current) {
                      if (num === 100) {
                        setInputAmount(netValue);
                        inputRef.current.value = convertToLocaleString(
                          formatUtoken(netValue) + ""
                        ).strValue;
                      } else {
                        const amount = netValue
                          .mul(BigNumber.from(num))
                          .div(BigNumber.from(100));
                        setInputAmount(amount);
                        inputRef.current.value = convertToLocaleString(
                          formatUtoken(amount) + ""
                        ).strValue;
                      }
                    }
                  }}
                  key={num}
                >
                  {num < 100 ? `${num}%` : "MAX"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="font-InterMedium text-[22px] w-full py-[15px] rounded-[22px] bg-success hover:bg-success-hover disabled:bg-second/30 disabled:hover:bg-second/30 text-buttontext disabled:text-second disabled:cursor-not-allowed transition-all"
        onClick={handleWithdraw}
        disabled={inputAmount.toNumber() === 0}
      >
        Withdraw
      </button>
    </div>
  );
};

export default PositionWithdraw;
