import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockIcon from "@mui/icons-material/Lock";
import ErrorIcon from "@mui/icons-material/Error";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentTimeFrame,
  recordSuccessBetting,
  setIsBetting,
} from "../../../../store/reducers/trade-slice";
import ConfirmTradePopup from "../../../../components/pop-up/confirm-trade";
import {
  NotifyMessage,
  NotifyType,
  Notify_Duration,
} from "../../../../core/constants/notification";
import { loadEnvVariable } from "../../../../core/constants/network";
import { BigNumber, Signer, ethers } from "ethers";
import {
  useGetCurrentBettableAmount,
  useMinBetAmount,
} from "../../../../hooks/useMarketContract";
import {
  OperatorWalletDisableBalance,
  Underlying_Token,
  ValidNumberInputKeyCodes,
  getDecimal,
} from "../../../../core/constants/basic";
import { RootState } from "../../../../store";
import {
  formatUtoken,
  getBettingTimeframeWithId,
  getOneMillionForBera,
  isEpoch,
  minuteTimer,
  numberWithCommas,
  parseUtoken,
} from "../../../../helpers/data-translations";
import BorderLinearProgress from "./border-linear-progress";
import {
  betToRound,
  getEthBalance,
  getVaultContract,
} from "../../../../helpers/contractHelpers";
import { insertOpenPosition } from "../../../../store/reducers/openedRounds-slice";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import LoadingSkeleton from "./loading-skeleton";
import PriceWidget from "./price-widget";
import IconButton from "@mui/material/IconButton";
import {
  PageTitles,
  emitTradeBettingTypeClickTrack,
  emitTradeConfirmedTrack,
  emitTradeFailedTrack,
  emitTradePositionSet,
} from "../../../../helpers/analytics";
import SocialMenu from "../../../../components/social-menu/SocialMenu";
import { NetworkIds, chains } from "@fantohm/shared-web3";
import BuyEthModal from "../../../../components/buy-eth-modal/buy-eth-modal";
import BuyUSDCModal from "../../../../components/buy-usdc-modal/buy-usdc-modal";
import HowToBet from "../../../../components/how-to-bet/how-to-bet";
import TweetTradeCardModal from "../../../../components/tweet-trade-card/tweet-trade-card";
import CreditsDropDown from "../../../..//components/dropdown/credits-dropdown";
import { setCreditArrAndSelected } from "../../../../../app/store/reducers/credit-slice";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";
import { useAccount } from "../../../../../app/hooks/useAccount";
import { useNetworkStatus } from "../../../../../app/hooks/useNetworkStatus";
import { injectSemetrixPixelImg } from "../../../../../app/components/semetrix-pixel-tracking/semetrix-pixel-tracking";

interface Props {
  cardId?: number;
  onGoBack?: () => void;
  setSwiperEnabled?: (enabled: boolean) => void;
}

const StartRoundCard = ({ cardId, onGoBack, setSwiperEnabled }: Props) => {
  const { address, connect, signer } = useAccount();
  const networkStatus = useNetworkStatus();

  const minBetAmount = useMinBetAmount();

  const getCurrentBettableAmount = useGetCurrentBettableAmount();

  const [bullPosition, setBullPosition] = useState(0);
  const positionRef = useRef(bullPosition);
  positionRef.current = bullPosition;

  const [progressVal, setProgressVal] = useState(0);
  const [timerValue, setTimerValue] = useState("");
  const [percent, setPercent] = useState<number | string | Array<number | string>>();
  const [isOpen, setOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(BigNumber.from(0));
  const [placedStatus, setPlacedStatus] = useState({ amount: 0, position: 0 });
  const [currentBettableAmount, setCurrentBettableAmount] = useState([
    BigNumber.from(0),
    BigNumber.from(0),
  ]);
  const [pageStep, setPageStep] = useState(0);
  const [usdcModalOpen, setUsdcModalOpen] = useState(false);
  const [ethModalOpen, setEthModalOpen] = useState(false);
  const [tweetModalOpen, setTweetModalOpen] = useState(false);

  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const confirmModalShow = useSelector((state: RootState) => state.app.confirmModalShow);
  const genesisTime = useSelector((state: RootState) => state.trade.genesisTime);

  const operatorWalletBalance = useSelector(
    (state: RootState) => state.trade.operatorWalletBalance[underlyingToken.symbol]
  );

  const isInitializing = useSelector((state: RootState) => state.trade.isInitializing);
  const backendHealth = useSelector((state: RootState) => state.app.backendHealth);
  const openedRounds = useSelector((state: RootState) => state.openRounds.rounds);
  const currentTimeFrame = useSelector(getCurrentTimeFrame);
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const startingRound = useSelector(
    (state: RootState) => state.trade.timeframe.rounds[2]
  );
  const { uTokenBalance, ethBalance } = useSelector((state: RootState) => state.account);
  const totalCredits = useSelector((state: RootState) =>
    state.ryzecredit.creditToken.totalCredits
      ? state.ryzecredit.creditToken.totalCredits
      : "0"
  );
  const currentPrice = useSelector(
    (state: RootState) =>
      state.app.latestPrice[underlyingToken.symbol.toUpperCase()]?.price || 0
  );
  const creditSelected = useSelector(
    (state: RootState) => state.ryzecredit.creditDropdown.selected
  );
  const creditArr = useSelector(
    (state: RootState) => state.ryzecredit.creditDropdown.creditArr
  );

  const { currentNetworkChainId } = useNetworkContext();

  const affiliateSettings = useSelector((state: RootState) => state.widget.affiliateData);

  const mainBalance = creditSelected.name === "CREDITS" ? totalCredits : uTokenBalance;

  const tokenAmountRef = useRef<BigNumber>();
  tokenAmountRef.current = tokenAmount;

  const tokenAmountInputRef = useRef<HTMLInputElement>(null);

  const utokenBalanceRef = useRef<string | undefined>();
  utokenBalanceRef.current = mainBalance;

  const currentEpochRef = useRef<number>(0);
  const timeframeIdRef = useRef<number>(0);

  useEffect(() => {
    dispatch(
      setCreditArrAndSelected({
        balance: uTokenBalance ? +uTokenBalance : 0,
        totalCredits: +totalCredits,
        currentTimeframeId,
      })
    );
  }, [uTokenBalance, totalCredits, currentTimeframeId]);

  useEffect(() => {
    const epoch = cardId ? cardId : startingRound.epoch;
    setTokenAmount(BigNumber.from("0"));
    loadCurrentBettableAmount(currentTimeframeId, epoch);
  }, [mainBalance]);

  useEffect(() => {
    currentEpochRef.current = cardId ? cardId : startingRound.epoch;
  }, [startingRound.epoch, cardId]);

  useEffect(() => {
    timeframeIdRef.current = currentTimeframeId;
  }, [currentTimeframeId]);

  useEffect(() => {
    if (!currentTimeFrame.isBetting) {
      setPlacedStatus({ amount: 0, position: 0 });
      const epoch = cardId || startingRound.epoch;
      const round = openedRounds.find(
        (r) => r.timeframeId === currentTimeframeId && epoch === r.round.epoch
      );
      if (round) {
        setPlacedStatus({
          amount: round.amount,
          position: round.position === "Bear" ? 1 : 0,
        });
      }
    }
  }, [
    cardId,
    currentTimeframeId,
    startingRound.epoch,
    currentTimeFrame.isBetting,
    underlyingToken,
    openedRounds,
  ]);

  useEffect(() => {
    const epoch = cardId ? cardId : startingRound.epoch;
    loadCurrentBettableAmount(currentTimeframeId, epoch);
    setPageStep(0);
  }, [cardId, underlyingToken, startingRound.epoch]);

  useEffect(() => {
    if (!cardId || cardId === startingRound.epoch) {
      setTimeout(() => {
        const epoch = cardId ? cardId : startingRound.epoch;
        loadCurrentBettableAmount(currentTimeframeId, epoch);
      }, Underlying_Token[currentNetworkChainId].initializingTime * 1000);
    }
  }, [startingRound.epoch, currentNetworkChainId, cardId]);

  useEffect(() => {
    if (placedStatus.amount) {
      setPercent(
        (placedStatus.amount / formatUtoken(currentBettableAmount[positionRef.current])) *
          100
      );
    }
  }, [cardId, startingRound.epoch, placedStatus, currentBettableAmount]);

  const dispatch = useDispatch();

  useEffect(() => {
    const roundTime = getBettingTimeframeWithId(currentTimeframeId).minute * 60;
    const remainingTime = currentTimeFrame.remainingTime;

    const tTime =
      getBettingTimeframeWithId(currentTimeframeId).minute *
      60 *
      (1 + (cardId ? cardId - startingRound.epoch : 0));

    setProgressVal(((tTime - (roundTime - remainingTime)) / tTime) * 100);
    setTimerValue(() => {
      if (cardId)
        return minuteTimer(remainingTime + (cardId - startingRound.epoch) * roundTime);
      return minuteTimer(remainingTime);
    });
  }, [currentTimeFrame.remainingTime, cardId]);

  useEffect(() => {
    if (tokenAmount.gt(currentBettableAmount[bullPosition])) {
      setTokenAmount(currentBettableAmount[bullPosition]);

      if (tokenAmountInputRef.current) {
        tokenAmountInputRef.current.value = getDecimal(
          formatUtoken(
            currentBettableAmount[bullPosition].mul(
              BigNumber.from(getOneMillionForBera())
            )
          )
        );
      }
      setPercent(100);
    } else {
      setPercent(
        (formatUtoken(tokenAmount) / formatUtoken(currentBettableAmount[bullPosition])) *
          100
      );
    }
  }, [bullPosition, cardId]);

  useEffect(() => {
    const epoch = cardId ? cardId : startingRound.epoch;
    const func = () => loadCurrentBettableAmount(currentTimeframeId, epoch);
    let wssProvider;
    if (
      currentNetworkChainId === NetworkIds.Berachain ||
      currentNetworkChainId === NetworkIds.Blast ||
      currentNetworkChainId === NetworkIds.BlastMainnet
    ) {
      wssProvider = new ethers.providers.JsonRpcProvider(
        chains[currentNetworkChainId].rpcUrls[0]
      );
    } else {
      wssProvider = new ethers.providers.WebSocketProvider(
        chains[currentNetworkChainId].wssUrls[0]
      );
    }

    const vaultContract = getVaultContract(wssProvider);

    vaultContract.on("LiquidityAdded", func);

    vaultContract.on("LiquidityRemoved", func);

    return () => {
      vaultContract.removeListener("LiquidityAdded", func);
      vaultContract.removeListener("LiquidityRemoved", func);
    };
  }, [currentTimeframeId, cardId, currentNetworkChainId]);

  const loadCurrentBettableAmount = async (timeframeId: number, epoch: number) => {
    try {
      const amt = await getCurrentBettableAmount(timeframeId, epoch);

      if (timeframeId !== timeframeIdRef.current || epoch !== currentEpochRef.current) {
        return;
      }

      if (utokenBalanceRef.current) {
        const balance = BigNumber.from(utokenBalanceRef.current);
        if (amt[0].gt(balance)) {
          amt[0] = balance;
        }
        if (amt[1].gt(balance)) {
          amt[1] = balance;
        }
      }

      const tokenAmount = tokenAmountRef.current;

      if (tokenAmount) {
        if (tokenAmount.gt(amt[positionRef.current])) {
          setTokenAmount(amt[positionRef.current]);

          if (tokenAmountInputRef.current) {
            tokenAmountInputRef.current.value = getDecimal(
              formatUtoken(
                amt[positionRef.current].mul(BigNumber.from(getOneMillionForBera()))
              )
            );
          }

          setPercent(100);
        } else {
          setPercent(
            (formatUtoken(tokenAmount) / formatUtoken(amt[positionRef.current])) * 100
          );
        }
      }
      setCurrentBettableAmount(amt);
    } catch (error) {
      console.error("[start-round-card]: [currentBettableAmount]", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSliderChange = (event: any) => {
    if (placedStatus.amount) return;
    if (setSwiperEnabled) {
      setSwiperEnabled(false);
    }
    if (event) {
      const amount = currentBettableAmount[bullPosition]
        .mul(BigNumber.from(event.target.value))
        .div(BigNumber.from(100));
      setTokenAmount(amount);

      if (tokenAmountInputRef.current) {
        tokenAmountInputRef.current.value = getDecimal(
          formatUtoken(amount.mul(BigNumber.from(getOneMillionForBera())))
        );
      }

      setPercent(event.target.value);
    }
  };

  const handleMarkClick = (mark: number) => {
    if (placedStatus.amount) return;
    const amount = currentBettableAmount[bullPosition]
      .mul(BigNumber.from(mark))
      .div(BigNumber.from(100));
    setTokenAmount(amount);

    if (tokenAmountInputRef.current) {
      tokenAmountInputRef.current.value = getDecimal(
        formatUtoken(amount.mul(BigNumber.from(getOneMillionForBera())))
      );
    }

    if (address) {
      emitTradePositionSet(
        PageTitles.Trade,
        address,
        underlyingToken.symbol + "/USD",
        getBettingTimeframeWithId(currentTimeframeId).minute + "m",
        bullPosition ? "Down" : "Up",
        mark === 100 ? "Max" : `${mark}%`,
        formatUtoken(amount),
        formatUtoken(currentBettableAmount[bullPosition])
      );
    }

    setPercent(mark);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (placedStatus.amount) return;
    if (event.target.value === "") {
      setTokenAmount(BigNumber.from("0"));
      setPercent(0);
      return;
    }

    let amount: BigNumber = BigNumber.from("0");

    if (
      parseUtoken(parseFloat(event.target.value)).gte(currentBettableAmount[bullPosition])
    ) {
      amount = currentBettableAmount[bullPosition];
      setTokenAmount(amount);

      if (tokenAmountInputRef.current) {
        tokenAmountInputRef.current.value = getDecimal(
          formatUtoken(amount.mul(BigNumber.from(getOneMillionForBera())))
        );
      }

      if (
        tokenAmountInputRef.current &&
        amount.toString() !== tokenAmountInputRef.current.value
      ) {
        tokenAmountInputRef.current.value = getDecimal(
          formatUtoken(amount.mul(BigNumber.from(getOneMillionForBera())))
        );
      }
    } else {
      amount = parseUtoken(parseFloat(event.target.value));
      setTokenAmount(parseUtoken(event.target.value));
    }
    setPercent(
      event.target.value === ""
        ? ""
        : (Number(event.target.value) /
            formatUtoken(currentBettableAmount[bullPosition])) *
            100
    );
  };

  const handleBetting = async (direction: number) => {
    if (!address || !signer) return;
    dispatch(setIsBetting(true));

    const ethBalance = await getEthBalance(address);

    if (ethBalance === 0 && signer instanceof Signer) {
      enqueueSnackbar(NotifyMessage.InsufficientETHBalance, {
        variant: NotifyType.ERROR,
      });
    } else if (formatUtoken(tokenAmount) < minBetAmount) {
      enqueueSnackbar(`${NotifyMessage.AmountInsufficient} ${minBetAmount}`, {
        variant: NotifyType.ERROR,
      });
    } else if (signer && address) {
      dispatch(setIsBetting(true));

      const roundId = cardId ? cardId : startingRound.epoch;
      const betAmount = tokenAmount;
      const userAddress = address + "";
      const betResult = await betToRound(
        address,
        loadEnvVariable(
          `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
        ),
        currentTimeframeId,
        cardId ? cardId : startingRound.epoch,
        tokenAmount,
        direction,
        creditSelected,
        signer,
        affiliateSettings?.address,
        affiliateFee
      );

      console.log("betResult: ", betResult);

      if (betResult.severity === NotifyType.DEFAULT) {
        setTokenAmount(BigNumber.from("0"));
        setPercent(0);
        emitTradeConfirmedTrack(
          PageTitles.Trade,
          address,
          `${underlyingToken.symbol}/USD`,
          `${getBettingTimeframeWithId(currentTimeframeId).minute}m`,
          direction ? "Down" : "Up",
          formatUtoken(betAmount),
          formatUtoken(currentBettableAmount[bullPosition]),
          roundId
        );

        dispatch(
          recordSuccessBetting({
            epoch: roundId,
            betAmount: formatUtoken(betAmount),
            maxAmntLimit: formatUtoken(currentBettableAmount[bullPosition]),
            position: direction,
            userAddress,
          })
        );

        dispatch(
          insertOpenPosition({
            address: userAddress,
            amount: formatUtoken(betAmount),
            epoch: roundId,
            hash: betResult.data,
            position: direction,
            timeframeId: currentTimeframeId,
            genesisTime,
            symbol: underlyingToken.symbol,
            creditUsed: creditSelected.name === "CREDITS",
          })
        );

        injectSemetrixPixelImg(address);

        if (onGoBack) {
          onGoBack();
        }
        const id = enqueueSnackbar(betResult.message, { variant: betResult.severity });
        setTimeout(() => {
          closeSnackbar(id);
        }, Notify_Duration);
      } else {
        const message =
          cardId === undefined && roundId !== currentEpochRef.current
            ? NotifyMessage.NotBettable
            : betResult.message;
        emitTradeFailedTrack(
          PageTitles.Trade,
          address,
          `${underlyingToken.symbol}/USD`,
          `${getBettingTimeframeWithId(currentTimeframeId).minute}m`,
          direction ? "Down" : "Up",
          formatUtoken(betAmount),
          formatUtoken(currentBettableAmount[bullPosition]),
          roundId,
          message
        );
        enqueueSnackbar(message, { variant: betResult.severity });
      }
    }
    dispatch(setIsBetting(false));
  };

  const onClickConnect = () => {
    try {
      connect();
    } catch (e: unknown) {
      console.warn(e);
    }
  };

  const checkMinAmountValidation = (): boolean => {
    if (formatUtoken(tokenAmount) < minBetAmount) {
      enqueueSnackbar(`${NotifyMessage.AmountInsufficient} ${minBetAmount}`, {
        variant: NotifyType.ERROR,
      });
      return false;
    }
    return true;
  };

  const onBetButtonClick = () => {
    console.log(confirmModalShow);
    if (checkMinAmountValidation()) {
      if (confirmModalShow) {
        setOpen(true);
      } else {
        handleBetting(bullPosition);
      }
    }
  };

  const affiliateFee = useMemo(() => {
    if (
      affiliateSettings.fee &&
      +affiliateSettings.fee >= 0 &&
      +affiliateSettings.fee <= 3
    ) {
      return +affiliateSettings?.fee * 100;
    }
    return 0;
  }, [affiliateSettings.fee]);

  return (
    <>
      <div
        className="start-round-card w-full bg-btnBlackBgColor rounded-3xl xs:p-15 xl:p-20 2xl:p-25 flex flex-col justify-between xs:gap-15 2xl:gap-20 border-2 border-btnBlackStrokeColor relative overflow-hidden h-full sm:h-auto max-w-450"
        id="start-round-card"
      >
        {currentTimeFrame.isBetting && (
          <div className="start-round-card w-full h-full bg-btnBlackBgColor rounded-3xl flex items-center justify-center absolute top-0 right-0 z-20">
            <div className="flex flex-col items-center gap-10">
              <CircularProgress sx={{ color: "#00B6A9" }} />
              <span className="text-grayTxtColor">Waiting for confirmation...</span>
            </div>
          </div>
        )}
        {!cardId &&
          (getBettingTimeframeWithId(currentTimeframeId).minute * 60 -
            Underlying_Token[currentNetworkChainId].initializingTime <
            currentTimeFrame.remainingTime ||
            currentTimeFrame.remainingTime <
              Underlying_Token[currentNetworkChainId].finalizingTime) && (
            <div className="absolute w-full h-[calc(100%-50px)] xl:h-[calc(100%-60px)] flex flex-col justify-center items-center gap-10 z-40 bg-btnBlackBgColor left-0 top-50 xl:top-60">
              <CircularProgress className="text-greenIconColor" />
              <span className="text-grayTxtColor text-16">
                {currentTimeFrame.remainingTime <
                Underlying_Token[currentNetworkChainId].finalizingTime
                  ? "Finalizing..."
                  : "Initializing..."}
              </span>
            </div>
          )}
        <div className="w-full card-title">
          {pageStep === 0 || Boolean(placedStatus.amount) ? (
            <div className="flex items-center justify-between h-30 xl:h-35">
              <div className="flex items-center justify-start">
                {onGoBack ? (
                  <IconButton
                    size="small"
                    onClick={onGoBack}
                    className="bg-pageBgColor border-2 border-btnBlackStrokeColor"
                  >
                    <ArrowBackRoundedIcon className="text-grayTxtColor" />
                  </IconButton>
                ) : (
                  <ArrowForwardRoundedIcon className="text-grayTxtColor" />
                )}
                <div className="ml-10 xs:text-20 2xl:text-22 flex gap-10">
                  <div className="text-btnBlackTxtColor">Start in</div>
                  <div className="relative text-btnBlackTxtColor">
                    {isInitializing && (
                      <LoadingSkeleton className="absolute rounded-md min-w-65 w-full overflow-hidden h-full z-30 left-0 top-0 bg-btnBlackBgColor" />
                    )}
                    {timerValue}
                  </div>
                </div>
              </div>
              <div className="relative">
                {(isInitializing || isEpoch(startingRound?.epoch)) && (
                  <LoadingSkeleton className="absolute rounded-md w-80 min-w-full overflow-hidden h-full z-30 right-0 top-0 bg-btnBlackBgColor" />
                )}
                <div className="flex items-center gap-10">
                  <p className="xs:text-20 xl:text-18 2xl:text-22 text-grayTxtColor">
                    #{cardId || numberWithCommas(startingRound.epoch).split(".")[0]}
                  </p>
                  <SocialMenu onClickTweet={setTweetModalOpen} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between h-30 2xl:h-35">
              <div className="flex items-center justify-start">
                <IconButton
                  size="small"
                  onClick={() => setPageStep(0)}
                  className="bg-pageBgColor border-2 border-btnBlackStrokeColor"
                >
                  <ArrowBackRoundedIcon className="text-grayTxtColor" />
                </IconButton>
                <div className="ml-10 flex gap-10">
                  <div className="xs:text-20 xl:text-18 2xl:text-22 text-btnBlackTxtColor">
                    Set position
                  </div>
                </div>
              </div>
              <div
                className={`text-18 text-whiteTxtColor px-15 py-[3px] rounded-md font-bold ${
                  bullPosition ? "bg-btnRedBgColor" : "bg-btnGreenBgColor"
                }`}
              >
                {bullPosition ? "Down - 2X" : "Up - 2X"}
              </div>
            </div>
          )}
          <BorderLinearProgress
            variant="determinate"
            value={progressVal}
            className="mt-10 xl:mt-20 !bg-btnUnselectBgColor [&>.MuiLinearProgress-barColorPrimary]:!bg-brandColor"
          />
        </div>
        <div className={pageStep === 1 ? "hidden xl:block" : ""}>
          <PriceWidget
            priceTitle1="Open price"
            priceTitle2="Current price"
            closePrice={currentPrice}
            size="lg"
          />
        </div>
        {(Boolean(pageStep) || Boolean(placedStatus.amount)) && (
          <>
            <div className="w-full bg-pageBgColor border-btnBlackStrokeColor border-2 p-15 rounded-3xl flex flex-row items-center">
              <div className="betting-amount w-0 grow">
                {placedStatus.amount > 0 ? (
                  <input
                    type="text"
                    value={getDecimal(placedStatus.amount)}
                    disabled={true}
                    className="w-full text-whiteTxtColor disabled:text-grayTxtColor text-24 xl:text-22 2xl:text-26 grow outline-none bg-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    defaultValue={getDecimal(
                      formatUtoken(
                        tokenAmount.mul(BigNumber.from(getOneMillionForBera()))
                      )
                    )}
                    onChange={handleInputChange}
                    disabled={!address}
                    className="w-full text-btnBlackTxtColor disabled:text-grayTxtColor text-24 xl:text-22 2xl:text-26 grow outline-none bg-transparent"
                    ref={tokenAmountInputRef}
                    onKeyDown={(e) => {
                      if (!ValidNumberInputKeyCodes.includes(e.keyCode)) {
                        e.preventDefault();
                      }
                      if (
                        (e.keyCode === 190 || e.keyCode === 110) &&
                        tokenAmountInputRef.current?.value.includes(".")
                      ) {
                        e.preventDefault();
                      }
                      if (e.keyCode === 69 || e.keyCode === 188) e.preventDefault();
                    }}
                  />
                )}
              </div>
              <CreditsDropDown />
            </div>
            <div className="amount-slider grow">
              <Slider
                value={typeof percent === "number" ? percent : 0}
                aria-label="percent"
                onChange={(e) => handleSliderChange(e)}
                onChangeCommitted={() => {
                  if (setSwiperEnabled) {
                    setSwiperEnabled(true);
                  }
                }}
                valueLabelDisplay="off"
                disabled={!address}
                className={`${
                  placedStatus.amount ? "!text-unselectTxtColor" : "!text-brandColor"
                }`}
              />
              <div className="grid grid-cols-5 gap-10 cursor-default">
                {[10, 20, 50, 75, 100].map((percentage) => (
                  <button
                    className={`${
                      !placedStatus.amount && percentage === percent
                        ? "bg-brandColor text-btnTxtColor"
                        : "bg-btnBlackBgColor border-btnBlackStrokeColor border-2 text-btnBlackTxtColor"
                    } rounded-3xl py-5 normal-case xs:text-14 2xl:text-16 text-center disabled:bg-btnUnselectBgColor transition-all`}
                    disabled={!address}
                    onClick={() => handleMarkClick(percentage)}
                    key={percentage}
                  >
                    {percentage < 100 ? `${percentage}%` : "Max"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {!address ? (
          <div>
            <button
              onClick={onClickConnect}
              className="w-full xs:py-[16px] 2xl:py-20 rounded-2xl text-btnTxtColor bg-brandColor"
            >
              <span className="mx-10 leading-tight xs:text-20 2xl:text-24">Connect</span>
            </button>
          </div>
        ) : placedStatus.amount ? (
          <Button
            disabled
            variant="contained"
            className="flex w-full h-60 2xl:h-[70px] text-center normal-case bg-btnUnselectBgColor rounded-2xl text-unselectTxtColor py-15"
          >
            <LockIcon className="mr-10 xs:text-28 2xl:text-32" />
            <span className="leading-tight xs:text-22 2xl:text-24 font-bold">
              {placedStatus.position ? "Down - " : "Up - "}
              {`${+getDecimal(placedStatus.amount)} ${
                Underlying_Token[currentNetworkChainId].symbol
              }`}
            </span>
          </Button>
        ) : pageStep === 0 ? (
          <div id="bet-position-buttons" className="h-130 2xl:h-150">
            <div className="flex justify-between flex-col gap-10 betting">
              {["Up", "Down"].map((pos, ind) => (
                <Button
                  key={ind}
                  variant="contained"
                  onClick={() => {
                    if (ethBalance === 0 && signer instanceof Signer) {
                      setEthModalOpen(true);
                      return;
                    }
                    if (
                      !uTokenBalance ||
                      (formatUtoken(uTokenBalance) === 0 &&
                        formatUtoken(totalCredits) === 0)
                    ) {
                      setUsdcModalOpen(true);
                      return;
                    }
                    setBullPosition(ind);
                    // onBetButtonClick(ind);
                    setPageStep(1);
                    if (address) {
                      emitTradeBettingTypeClickTrack(
                        PageTitles.Trade,
                        address,
                        `${underlyingToken.symbol}/USD`,
                        `${getBettingTimeframeWithId(currentTimeframeId).minute}m`,
                        ind ? "Down" : "Up"
                      );
                    }
                  }}
                  className={`${
                    ind ? "bg-btnRedBgColor" : "bg-btnGreenBgColor"
                  } text-whiteTxtColor w-full rounded-2xl text-center h-60 2xl:h-[70px] normal-case flex flex-col disabled:bg-btnUnselectBgColor disabled:text-btnUnselectTxtColor shadow-none`}
                  disabled={
                    operatorWalletBalance < OperatorWalletDisableBalance ||
                    !backendHealth ||
                    creditArr.length === 0
                  }
                >
                  <p className="leading-tight xs:text-22 2xl:text-24 font-bold">
                    {pos} - 2x
                  </p>
                  {/* <p className="leading-tight text-14">2x</p> */}
                </Button>
              ))}
            </div>
          </div>
        ) : formatUtoken(tokenAmount) >
          (mainBalance ? formatUtoken(BigNumber.from(mainBalance)) : -1) ? (
          <Button
            disabled
            variant="contained"
            className="flex w-full h-60 2xl:h-[70px] text-center normal-case bg-btnUnselectBgColor rounded-2xl text-btnUnselectTxtColor py-15"
          >
            <ErrorIcon className="mr-10 xs:text-28 2xl:text-32" />
            <span className="leading-tight xs:text-22 2xl:text-24 font-bold">
              Insufficient {Underlying_Token[currentNetworkChainId].symbol} balance
            </span>
          </Button>
        ) : (
          <Button
            className="bg-brandColor text-whiteTxtColor w-full rounded-2xl text-center h-60 2xl:h-[70px] normal-case flex flex-col disabled:bg-btnUnselectBgColor disabled:text-btnUnselectTxtColor xs:text-20 2xl:text-22 font-bold"
            onClick={onBetButtonClick}
            disabled={currentBettableAmount[bullPosition].isZero()}
          >
            Confirm
          </Button>
        )}
      </div>
      {pageStep === 0 && (
        <div className="pt-30 hidden md:flex mx-auto justify-center">
          <HowToBet />
        </div>
      )}
      <ConfirmTradePopup
        timeframeId={currentTimeframeId}
        currencyValue={formatUtoken(tokenAmount)}
        direction={bullPosition}
        handleBetting={(direction: number) => handleBetting(direction)}
        open={isOpen}
        onClose={(value: boolean) => setOpen(value)}
        epoch={cardId ? cardId : startingRound.epoch}
      />
      <BuyUSDCModal open={usdcModalOpen} setOpen={setUsdcModalOpen} />
      <BuyEthModal open={ethModalOpen} setOpen={setEthModalOpen} />
      <TweetTradeCardModal
        open={tweetModalOpen}
        setOpen={setTweetModalOpen}
        roundId={cardId ? cardId : startingRound.epoch}
      />
    </>
  );
};

export default StartRoundCard;
