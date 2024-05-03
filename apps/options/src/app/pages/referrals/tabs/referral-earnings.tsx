import React, { useEffect, useMemo, useState } from "react";
import { useSigner } from "wagmi";
import { getClaimableFeeAPI, getInvitedUserCountAPI } from "../../../helpers/axios";
import {
  convertNumbertoShortenForm,
  getDateTimeStringForReferrals,
  numberWithCommas,
  parseUtoken,
} from "../../../helpers/data-translations";
import { getEarningClaimsHistoryQuery } from "../../../core/apollo/query";
import { REFERRAL_THEGRAPH_URL, Underlying_Token } from "../../../core/constants/basic";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import useReferralContract from "../../../hooks/useReferralContract";
import { NotifyType } from "../../../core/constants/notification";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setTxPending } from "../../../store/reducers/app-slice";
import { EXPLORER_LINKS } from "../../../core/constants/network";
import { useAccount } from "../../../hooks/useAccount";
import { useNetworkContext } from "../../../context/NetworkContext";

interface IClaimHistory {
  amount: number;
  timestamp: number;
  txHash: string;
}

const ReferralEarnings = () => {
  const { address, signer } = useAccount();
  const dispatch = useDispatch();

  const [userCount, setUserCount] = useState(0);
  const [claimableFee, setClaimableFee] = useState({
    fee: 0,
    signature: "",
  });
  const [claimHistory, setClaimHistory] = useState<IClaimHistory[]>([]);

  const { claimReferralFee } = useReferralContract();

  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    const loadFunc = () => {
      if (!address) return;
      loadInvitedUserCount(address);
      loadClaimableFee(address);
      loadClaimHistory(address);
    };
    const timerId = setInterval(loadFunc, 60000);
    const timeoutId = setTimeout(loadFunc, 100);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(timerId);
    };
  }, [address, currentNetworkChainId]);

  const claimedAmount = useMemo(() => {
    return claimHistory.reduce((sum: number, claim) => sum + claim.amount, 0);
  }, [claimHistory]);

  const loadInvitedUserCount = async (userAddress: string) => {
    const userCount = await getInvitedUserCountAPI(userAddress);
    setUserCount(userCount);
  };

  const loadClaimableFee = async (userAddress: string) => {
    const fee = await getClaimableFeeAPI(userAddress);
    setClaimableFee(fee);
  };

  const loadClaimHistory = async (userAddress: string) => {
    const query = getEarningClaimsHistoryQuery(userAddress);
    const client = new ApolloClient({
      uri: REFERRAL_THEGRAPH_URL(),
      cache: new InMemoryCache(),
    });

    const result = await client.query({ query });
    const claims: IClaimHistory[] = result.data.claims.map(
      (claim: any) =>
        ({
          amount: parseFloat(claim.amount + ""),
          timestamp: parseInt(claim.timestamp + ""),
          txHash: claim.id + "",
        } as IClaimHistory)
    );
    setClaimHistory(claims.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleClaim = async () => {
    if (!address || !signer) {
      return;
    }

    const fee = await getClaimableFeeAPI(address);

    const amount = parseUtoken(fee.fee);

    dispatch(setTxPending(true));
    const res = await claimReferralFee(amount, fee.signature);
    dispatch(setTxPending(false));

    enqueueSnackbar(res.message, { variant: res.severity });

    if (res.severity === NotifyType.SUCCESS) {
      setClaimHistory((prev) =>
        [
          ...prev,
          {
            amount: fee.fee - claimedAmount,
            timestamp: Math.floor(Date.now() / 1000),
            txHash: res.data,
          },
        ].sort((a, b) => b.timestamp - a.timestamp)
      );
    }
  };

  return (
    <div className="flex flex-col h-full gap-35">
      <div className="space-y-20">
        <div className="text-24 md:text-28 font-InterMedium text-lightwhite">
          Earnings
        </div>
        <div className="xs:bg-transparent sm:bg-bunker lg:bg-transparent 1xl:bg-bunker sm:rounded-2xl xs:p-0 sm:p-10 lg:p-0 1xl:p-10 flex xs:items-start sm:items-center lg:items-start 1xl:items-center xs:flex-col sm:flex-row lg:flex-col 1xl:flex-row justify-center xs:gap-20 sm:gap-0 lg:gap-20 1xl:gap-0">
          <div className="bg-bunker rounded-2xl grow flex items-center justify-between xs:w-full sm:w-0 lg:w-full 1xl:w-0 py-15 px-20">
            <div className="text-second xs:text-18 md:text-22">Claimable fees</div>
            <div className="text-lightwhite font-InterMedium xs:text-18 md:text-22">
              ${numberWithCommas(Math.max(claimableFee.fee - claimedAmount, 0))}
            </div>
          </div>
          <button
            className="xs:w-full sm:w-160 lg:w-full 1xl:w-120 text-lightwhite py-10 rounded-2xl text-20 font-medium border-2 border-success hover:bg-success-hover disabled:bg-buttonDisable disabled:text-lightblue disabled:border-buttonDisable disabled:hover:bg-buttonDisable"
            disabled={parseFloat((claimableFee.fee - claimedAmount).toFixed(2)) <= 0}
            onClick={handleClaim}
          >
            Claim
          </button>
        </div>
        <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 1xl:grid-cols-2 gap-20">
          <div className="bg-bunker rounded-2xl grow flex items-center justify-between gap-10 xs:py-15 sm:py-25 lg:py-15 1xl:py-25 xs:px-20 sm:px-30 lg:px-20 1xl:px-30">
            <div className="text-second xs:text-18 md:text-22">Total earned</div>
            <div className="text-lightwhite font-InterMedium xs:text-18 md:text-22">
              ${convertNumbertoShortenForm(claimableFee.fee)}
            </div>
          </div>
          <div className="bg-bunker rounded-2xl grow flex items-center justify-between gap-10 xs:py-15 sm:py-25 lg:py-15 1xl:py-25 xs:px-20 sm:px-30 lg:px-20 1xl:px-30">
            <div className="text-second xs:text-18 md:text-22">Users referred</div>
            <div className="text-lightwhite font-InterMedium xs:text-18 md:text-22">
              {userCount}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-15">
        <div className="text-second xs:text-18 md:text-22">Claim history</div>
        <div className="grow pr-10px overflow-auto rounded-2xl border-2 border-[#0D181A80]">
          {claimHistory.length > 0 ? (
            <div className="min-w-500">
              {claimHistory.map((data, index) => (
                <div
                  key={index}
                  className={`flex px-15 py-10 gap-10 ${
                    index % 2 === 1 ? "bg-[#0E1415]" : "bg-charcoalGray"
                  }`}
                >
                  <div className="w-170 grow">
                    {getDateTimeStringForReferrals(new Date(data.timestamp * 1000))}
                  </div>
                  <div className="w-80 grow">${numberWithCommas(data.amount)}</div>
                  <div className="w-90 grow flex gap-5 items-center">
                    <img
                      src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                      alt="usdt"
                      className="w-20 h-20"
                    />
                    {numberWithCommas(data.amount)}
                  </div>
                  <div>
                    <a
                      href={`${EXPLORER_LINKS[currentNetworkChainId]}/tx/${data.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 underline"
                    >
                      View Tx
                      <img
                        src="./assets/icons/outlink-referral.svg"
                        alt="outlink"
                        className=" w-[12px]"
                      />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col min-h-180">
              <div className="w-30 h-30 rounded-full border-2 border-lightblue text-lightblue text-20 flex justify-center items-center font-bold">
                ?
              </div>
              <div className="text-20 mt-20 text-lightblue">No claims history yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralEarnings;
