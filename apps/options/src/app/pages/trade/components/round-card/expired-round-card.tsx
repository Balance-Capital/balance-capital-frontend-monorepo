import Button from "@mui/material/Button";
import { numberWithCommas } from "@fantohm/shared-web3";
import { useSelector } from "react-redux";
import { useClaim } from "../../../../hooks/useMarketContract";
import { useEffect, useState } from "react";
import { RootState } from "../../../../store";
import { getLedger, getRound } from "../../../../helpers/contractHelpers";
import { loadEnvVariable } from "../../../../core/constants/network";
import {
  calcBettingReward,
  getOneMillionForBera,
} from "../../../../helpers/data-translations";
import PriceWidget from "./price-widget";
import { Underlying_Token, getDecimal } from "../../../../core/constants/basic";
import { useAccount } from "../../../../../app/hooks/useAccount";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";

enum ClaimStatus {
  PENDING = 1,
  LOST = 2,
  WIN = 3,
  CLAIMED = 4,
}

const ExpiredRoundCard = () => {
  const tradingFee = useSelector((state: RootState) => state.binaryConfig.tradingFee);

  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const expiredRound = useSelector((state: RootState) => state.trade.timeframe.rounds[0]);

  const { address } = useAccount();

  const [claimStatus, setClaimStatus] = useState(ClaimStatus.PENDING);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isReverted, setIsReverted] = useState(false);
  const { currentNetworkChainId } = useNetworkContext();

  const { claim } = useClaim();

  const getClaimable = async (
    timeframeId: number,
    epoch: number,
    underlyingToken: string,
    position: number,
    address: string
  ) => {
    const marketAddress = loadEnvVariable(
      `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken}_ADDRESS`
    );

    const ledger = await getLedger(address, marketAddress, timeframeId, epoch);
    setIsReverted(ledger.isReverted);
    if (ledger.isReverted) {
      if (ledger.claimed) {
        setClaimStatus(ClaimStatus.CLAIMED);
        setLoadingComplete(true);
      } else {
        setClaimStatus(ClaimStatus.WIN);
      }
      return;
    }

    const round = await getRound(marketAddress, timeframeId, epoch);
    if (!round.lockPrice || !round.closePrice) {
      setClaimStatus(ClaimStatus.PENDING);
    } else {
      // const result = await getSingleClaimable(timeframeId, epoch);
      let result = false;
      if (position === 1 && round.closePrice < round.lockPrice) {
        result = true;
      }
      if (position === 0 && round.closePrice > round.lockPrice) {
        result = true;
      }
      if (ledger.claimed) {
        setClaimStatus(ClaimStatus.CLAIMED);
        setLoadingComplete(true);
        return;
      }
      setClaimStatus(result ? ClaimStatus.WIN : ClaimStatus.LOST);
      setLoadingComplete(true);
    }
  };
  useEffect(() => {
    let intervalId: any;
    if (!loadingComplete && expiredRound.amount) {
      getClaimable(
        currentTimeframeId,
        expiredRound.epoch,
        underlyingToken.symbol,
        expiredRound.position,
        address || ""
      );
      intervalId = setInterval(() => {
        getClaimable(
          currentTimeframeId,
          expiredRound.epoch,
          underlyingToken.symbol,
          expiredRound.position,
          address || ""
        );
      }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    currentTimeframeId,
    expiredRound.epoch,
    underlyingToken,
    loadingComplete,
    address,
    currentNetworkChainId,
  ]);

  useEffect(() => {
    setLoadingComplete(false);
  }, [
    currentTimeframeId,
    expiredRound.epoch,
    underlyingToken,
    address,
    currentNetworkChainId,
  ]);

  return (
    <div className="w-full max-w-450 xl:w-450 h-full sm:h-[fit-content] bg-btnBlackBgColor rounded-3xl xs:p-15 xl:p-20 2xl:p-25 flex flex-col xs:gap-15 2xl:gap-20 border-2 border-btnBlackStrokeColor">
      <div className="w-full card-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <span className="inline-flex w-10 h-10 rounded-full opacity-75 bg-redIconColor" />
            <p className="ml-20 xs:text-20 2xl:text-22 text-btnBlackTxtColor">
              Completed round
            </p>
          </div>
          <p className="xs:text-20 xl:text-18 2xl:text-22 text-grayTxtColor">
            #{numberWithCommas(expiredRound.epoch)}
          </p>
        </div>
      </div>
      <PriceWidget
        priceTitle1="Opened"
        priceTitle2="Closed"
        openPrice={expiredRound.lockPrice}
        closePrice={expiredRound.closePrice}
        size="lg"
      />
      <div className="bg-pageBgColor border-btnBlackStrokeColor border-2 p-20 rounded-3xl hidden md:flex justify-between items-center">
        <div>
          <p className="xs:text-15 xl:text-16 text-grayTxtColor">Type</p>
          {expiredRound.amount ? (
            <p
              className={`xs:text-22 2xl:text-24 font-semibold ${
                expiredRound.position ? "text-warnTxtColor" : "text-successTxtColor"
              }`}
            >
              {expiredRound.position ? "Down" : "Up"}
            </p>
          ) : (
            <p className="xs:text-22 2xl:text-24 text-btnBlackTxtColor font-semibold">
              -
            </p>
          )}
        </div>
        <div className="min-w-120">
          <p className="xs:text-15 2xl:text-16 text-grayTxtColor">Position</p>
          {expiredRound.amount ? (
            <p className="transition-all xs:text-22 2xl:text-24 text-btnBlackTxtColor font-semibold">
              {getDecimal(expiredRound.amount * getOneMillionForBera())}
              {` ${Underlying_Token[currentNetworkChainId].symbol}`}
            </p>
          ) : (
            <p className="xs:text-22 2xl:text-24 text-btnBlackTxtColor font-semibold">
              -
            </p>
          )}
        </div>
      </div>
      <div className="bg-pageBgColor border-btnBlackStrokeColor border-2 p-20 rounded-3xl flex justify-between items-center">
        <div>
          {expiredRound.amount ? (
            <p
              className={`xs:text-22 2xl:text-24 font-semibold ${
                isReverted
                  ? "text-whiteTxtColor"
                  : claimStatus === ClaimStatus.WIN || claimStatus === ClaimStatus.CLAIMED
                  ? "text-successTxtColor"
                  : claimStatus === ClaimStatus.LOST
                  ? "text-warnTxtColor"
                  : "text-btnBlackTxtColor"
              }`}
            >
              {isReverted
                ? "Reverted"
                : claimStatus === ClaimStatus.WIN || claimStatus === ClaimStatus.CLAIMED
                ? "Win"
                : claimStatus === ClaimStatus.PENDING
                ? "Pending"
                : "Loss"}
            </p>
          ) : (
            <p className="xs:text-22 2xl:text-24 text-btnBlackTxtColor font-semibold">
              -
            </p>
          )}
        </div>
        <div>
          {expiredRound.amount > 0 && claimStatus !== ClaimStatus.PENDING && (
            <p
              className={`text-20 rounded-lg px-15 py-[3px] font-semibold ${
                isReverted
                  ? "bg-whiteTxtColor/10 text-whiteTxtColor"
                  : claimStatus === ClaimStatus.WIN
                  ? "bg-btnBlackStrokeColor text-successTxtColor"
                  : claimStatus === ClaimStatus.LOST
                  ? "bg-btnBlackStrokeColor text-warnTxtColor"
                  : "text-btnBlackTxtColor"
              }`}
            >
              {isReverted
                ? expiredRound.amount * getOneMillionForBera() < 0.1
                  ? expiredRound.amount.toFixed(6)
                  : parseFloat((expiredRound.amount * getOneMillionForBera()).toFixed(2))
                : claimStatus === ClaimStatus.WIN || claimStatus === ClaimStatus.CLAIMED
                ? expiredRound.amount * getOneMillionForBera() < 0.1
                  ? calcBettingReward(false, expiredRound.amount, tradingFee).toFixed(6)
                  : parseFloat(
                      calcBettingReward(
                        false,
                        expiredRound.amount * getOneMillionForBera(),
                        tradingFee
                      ).toFixed(2)
                    )
                : claimStatus === ClaimStatus.LOST
                ? expiredRound.amount * getOneMillionForBera() < 0.1
                  ? expiredRound.amount.toFixed(6)
                  : parseFloat((expiredRound.amount * getOneMillionForBera()).toFixed(2))
                : "-"}{" "}
              {Underlying_Token[currentNetworkChainId].symbol}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="contained"
        disabled={
          expiredRound.amount &&
          (claimStatus === ClaimStatus.WIN ||
            (isReverted && claimStatus !== ClaimStatus.CLAIMED))
            ? false
            : true
        }
        onClick={async () => {
          await claim(
            loadEnvVariable(
              `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
            ),
            currentTimeframeId,
            expiredRound.epoch
          );
          getClaimable(
            currentTimeframeId,
            expiredRound.epoch,
            underlyingToken.symbol,
            expiredRound.position,
            address || ""
          );
        }}
        className={`w-full xs:h-[60px] 2xl:h-[70px] rounded-2xl text-center normal-case flex bg-brandColor text-btnTxtColor disabled:bg-btnUnselectBgColor disabled:text-btnUnselectTxtColor xs:text-22 2xl:text-24 font-bold leading-tight `}
      >
        {claimStatus === ClaimStatus.CLAIMED ? "Claimed" : "Claim"}
      </Button>
    </div>
  );
};

export default ExpiredRoundCard;
