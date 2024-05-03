import Skeleton from "@mui/material/Skeleton";
import { useDispatch, useSelector } from "react-redux";
import { Underlying_Token } from "../../core/constants/basic";
import {
  convertNumbertoShortenForm,
  formatUtoken,
  getOneMillionForBera,
  isActiveForChain,
} from "../../helpers/data-translations";
import { RootState } from "../../store";
import { BigNumber } from "ethers";
import BuyUSDCModal from "../buy-usdc-modal/buy-usdc-modal";
import { useEffect, useState } from "react";
import { ReactComponent as GiftSvg } from "../../../assets/icons/gift.svg";
import ClaimCreditsModal from "../claim-credits-modal/ClaimCreditsModal";
import {
  fetchCreditInfo,
  fetchCreditTokenTotalCredits,
} from "../../store/reducers/credit-slice";
import { useCreditMinter } from "../../hooks/useCreditMinter";
import { enqueueSnackbar } from "notistack";
import { NotifyMessage, NotifyType } from "../../core/constants/notification";
import ClaimBonusCreditModal from "../claim-bonus-credits-modal/ClaimBonusCreditsModal";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";
import { NetworkIds } from "@fantohm/shared-web3";
import WrapUnwrapModal from "../wrap-unwrap-modal/wrap-unwrap-modal";

const WalletBalance = () => {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const { claim } = useCreditMinter();
  const { currentNetworkChainId } = useNetworkContext();

  const creditInfo = useSelector((state: RootState) => state.ryzecredit.creditInfo);
  const totalCredits = useSelector((state: RootState) =>
    state.ryzecredit.creditToken.totalCredits
      ? formatUtoken(BigNumber.from(state.ryzecredit.creditToken.totalCredits))
      : -1
  );
  const balance = useSelector((state: RootState) =>
    state.account.uTokenBalance
      ? formatUtoken(BigNumber.from(state.account.uTokenBalance))
      : -1
  );

  const [open, setOpen] = useState(false);
  const [openMint, setOpenMint] = useState(false);
  const [toggleClaimModal, setToggleClaimModal] = useState(() => false);
  const [toggleClaimBonusModal, setToggleClaimBonusModal] = useState(() => false);

  const callCreditAndBalance = () => {
    if (address) {
      dispatch(fetchCreditInfo({ address }));
      dispatch(fetchCreditTokenTotalCredits({ address }));
    }
  };

  useEffect(() => {
    callCreditAndBalance();
    const id = setInterval(() => {
      callCreditAndBalance();
    }, 30000);
    return () => {
      clearInterval(id);
    };
  }, [address, currentNetworkChainId]);

  useEffect(() => {
    if (creditInfo.isEligible && +creditInfo?.amount) {
      setToggleClaimBonusModal(true);
    }
  }, [creditInfo.isEligible]);

  const handleClaim = async () => {
    try {
      if (address) {
        await claim({
          address: creditInfo.address,
          tokenId: +creditInfo.tokenId,
          amount: +creditInfo.amount,
          userTotalClaimed: +creditInfo.totalClaimedAmount,
          generatedAt: +creditInfo.generatedAt,
          signature: creditInfo.signature,
        });
        enqueueSnackbar(NotifyMessage.ClaimSucceed, { variant: NotifyType.SUCCESS });
        callCreditAndBalance();
      }
    } catch (error: any) {
      if (error?.data?.message) {
        enqueueSnackbar(error.data.message, { variant: NotifyType.ERROR });
      }
    }
  };

  return (
    <div className="flex items-center">
      <div
        className="block pr-[9px] cursor-pointer"
        id="currency-balance"
        onClick={() => {
          if (
            currentNetworkChainId === NetworkIds.Blast ||
            currentNetworkChainId === NetworkIds.BlastMainnet ||
            currentNetworkChainId === NetworkIds.Inevm ||
            currentNetworkChainId === NetworkIds.InevmMainnet
          ) {
            setOpenMint(true);
          } else {
            setOpen(true);
          }
        }}
      >
        {balance >= 0 ? (
          <p
            className={`${
              balance === 0 ? "text-warnTxtColor" : "text-btnBlackTxtColor"
            } xs:text-14 md:text-18 flex items-center gap-10`}
          >
            <img
              src={`../../assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
              alt={`${Underlying_Token[currentNetworkChainId].symbol} logo`}
              className="w-25 h-25"
            />
            {convertNumbertoShortenForm(balance * getOneMillionForBera())}
          </p>
        ) : (
          <div className="w-[60px] md:w-[100px] overflow-hidden rounded-[12px]">
            <Skeleton width={100} height={50} className="!bg-grayTxtColor" />
          </div>
        )}
      </div>
      {isActiveForChain(currentNetworkChainId) && (
        <div className="border-l-2 border-btnBlackStrokeColor px-[9px] flex items-center gap-10">
          {+creditInfo?.amount && +creditInfo.amount > 0 ? (
            <ClaimCreditsModal
              amount={
                +creditInfo.amount ? formatUtoken(BigNumber.from(creditInfo.amount)) : 0
              }
              address={address ? address : ""}
              open={toggleClaimModal}
              setOpen={setToggleClaimModal}
              claimBtn={handleClaim}
            />
          ) : null}
          {+creditInfo.tokenId ? (
            <ClaimBonusCreditModal
              open={toggleClaimBonusModal}
              tokenId={+creditInfo.tokenId}
              setOpen={setToggleClaimBonusModal}
              claimBtn={() => setToggleClaimModal(true)}
            />
          ) : null}
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (creditInfo.isEligible) setToggleClaimModal(true);
            }}
          >
            {+creditInfo.tokenId ? (
              <div className="noti-badge -top-[3px] left-[18px]"></div>
            ) : null}
            <GiftSvg />
          </div>
          {totalCredits >= 0 ? (
            <p className="xs:text-14 md:text-18 text-btnBlackTxtColor oneRowEllipsis">
              {convertNumbertoShortenForm(totalCredits)}
            </p>
          ) : (
            <div className="w-[60px] md:w-[70px] overflow-hidden rounded-[12px]">
              <Skeleton width={70} height={50} className="!bg-grayTxtColor" />
            </div>
          )}
        </div>
      )}
      <BuyUSDCModal open={open} setOpen={setOpen} />
      <WrapUnwrapModal open={openMint} setOpen={setOpenMint} />
    </div>
  );
};

export default WalletBalance;
