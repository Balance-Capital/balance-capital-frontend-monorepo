import { BigNumber } from "ethers";
import {
  BettingTimeframes,
  METAMASK_ERRORS,
  Underlying_Token,
} from "../core/constants/basic";
import { Betting_CryptoCurrencies } from "../core/constants/basic";
import { NotifyMessage } from "../core/constants/notification";
import { CryptoCurrency, PositionData } from "../core/types/basic.types";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { currentNetworkChain } from "../context/NetworkContext";
import { NetworkIds } from "@fantohm/shared-web3";

export const convertNumbertoDouble = (n: number): string => {
  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};

export const formatTimeInUnits = (counter: number) => {
  const days = Math.floor(counter / (1000 * 60 * 60 * 24));
  const hours = Math.floor((counter % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((counter % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((counter % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, counter };
};

export const getCurrencyDetail = (underlyingCurrency: string): CryptoCurrency => {
  const underlyingToken = Betting_CryptoCurrencies.filter((item) => {
    return item.symbol === underlyingCurrency?.toUpperCase();
  });
  return underlyingToken[0];
};

export const convertTime = (
  props: Date,
  isFullYear = false
): { time: string; date: string } => {
  const time = `${convertNumbertoDouble(props.getHours())}:${convertNumbertoDouble(
    props.getMinutes()
  )}:${convertNumbertoDouble(props.getSeconds())}`;
  const date = `${convertNumbertoDouble(props.getMonth() + 1)}/${convertNumbertoDouble(
    props.getDate()
  )}/${props.getFullYear() - (isFullYear ? 0 : 2000)}`;
  return { time, date };
};

export const getDateTimeStringForReferrals = (date: Date) => {
  const time = `${convertNumbertoDouble(date.getHours())}:${convertNumbertoDouble(
    date.getMinutes()
  )}:${convertNumbertoDouble(date.getSeconds())}`;

  const day = `${convertNumbertoDouble(date.getDate())}/${convertNumbertoDouble(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;

  return `${day} - ${time}`;
};

export const fixedFloatString = (x: string | number): string => {
  if (typeof x === "string") return Number.parseFloat(x).toFixed(2);
  else return x.toFixed(2);
};

export const financialFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const numberWithCommas = (value: number, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
};

export const convertTimeString = (e: number) => {
  let timeType: any;
  if (e < 10) timeType = "00:0" + e.toString() + ":00";
  else timeType = "00:" + e.toString() + ":00";
  return timeType;
};

// export const getTimeFrameIdToMin = (timeframeId: number) => {
//   switch (timeframeId) {
//     case 0:
//       return 1;
//     case 1:
//       return 5;
//     default:
//       return 15;
//   }
// };

// export const getTimeFrameMinToId = (timeframeDropDownValue: number) => {
//   switch (timeframeDropDownValue) {
//     case 1:
//       return 0;
//     case 5:
//       return 1;
//     default:
//       return 2;
//   }
// };

export const getBettingTimeframeWithId = (timeframeId: number) => {
  const bettingTimeframe = BettingTimeframes.find((t) => t.id === timeframeId);
  if (bettingTimeframe) {
    return bettingTimeframe;
  }
  return BettingTimeframes[0];
};

export const getBettingTimeframeWithMinutes = (minutes: number) => {
  const bettingTimeframe = BettingTimeframes.find((t) => t.minute === minutes);
  if (bettingTimeframe) {
    return bettingTimeframe;
  }
  return BettingTimeframes[0];
};

export const convertNumbertoShortenForm = (
  num: string | number,
  isStatic?: boolean
): string => {
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  if (num < 10000 && !isStatic) {
    return `${numberWithCommas(num)}`;
  }
  const symbols = ["", "K", "M", "B", "T"];
  let i = 0;
  while (Math.abs(num) >= 1000 && i < 4) {
    i++;
    num /= 1000;
  }
  return `${parseFloat(num.toFixed(2))}${symbols[i]}`;
};

export const getTimezoneDisplayName = (date: Date): string => {
  const localtimestring = date.toLocaleDateString(undefined, { timeZoneName: "short" });
  return localtimestring.split(", ")[1];
};

export const getRoundTime = (
  genesisStartTime: number,
  epoch: number,
  timeframeId: number
) => {
  genesisStartTime *= 1000;

  const roundTime = getBettingTimeframeWithId(timeframeId).minute * 60000;
  const startTime = genesisStartTime + epoch * roundTime;
  const lockTime = genesisStartTime + (epoch + 1) * roundTime;
  const closeTime = genesisStartTime + (epoch + 2) * roundTime;
  return {
    startTime,
    lockTime,
    closeTime,
  };
};

export const calcEpoch = (startTime: number, currenTime: number, timeframeId: number) => {
  const epoch = Math.floor(
    (currenTime - startTime) / (getBettingTimeframeWithId(timeframeId).minute * 60)
  );
  return epoch;
};

export const minuteTimer = (time: number) => {
  let result = "";
  const second: number = Math.floor(time % 60) || 0;
  const minute: number = Math.floor(time / 60) || 0;
  result += minute < 10 ? `0${minute}` : minute;
  result += ":";
  result += second < 10 ? `0${second}` : second;
  return result;
};

export const calcBettingReward = (
  isCredit: boolean,
  amount: number,
  bettingFee: number
) => {
  return isCredit
    ? (amount * (100 - bettingFee)) / 100
    : (amount * 2 * (100 - bettingFee)) / 100;
};

export const calcVaultPositionBalance = (position: PositionData, netValue?: string) => {
  if (!netValue) {
    netValue = position.netValue;
  }
  return (formatUtoken(netValue) / position.investAmount) * 100;
};

export const convertBase64ToJSON = (base64: string) => {
  if (base64.startsWith("data:application/json;base64,")) {
    base64 = base64.split(",")[1];
  }
  return JSON.parse(atob(base64));
};

export const convertSecondsToString = (seconds: number) => {
  const second = seconds % 60;
  seconds = Math.floor(seconds / 60);
  const minute = seconds % 60;
  seconds = Math.floor(seconds / 60);
  const hours = seconds % 24;
  return `${convertNumbertoDouble(hours)}:${convertNumbertoDouble(
    minute
  )}:${convertNumbertoDouble(second)}`;
};

export const getMetamaskErrorMessage = (error: any) => {
  const errorCode = error.code + "";
  if (errorCode === "-32603" && error?.data?.message) {
    return error.data.message as string;
  }
  if (METAMASK_ERRORS[errorCode]) {
    return METAMASK_ERRORS[errorCode];
  }
  return NotifyMessage.DefaultError;
};

export const formatUtoken = (amount: BigNumber | string) => {
  if (typeof amount === "string") {
    amount = BigNumber.from(amount);
  }
  return parseFloat(
    formatUnits(amount, Underlying_Token[currentNetworkChain.id].decimals)
  );
};

export const parseUtoken = (amount: number | string) => {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }
  // amount = Math.floor(
  //   amount * Math.pow(10, Underlying_Token[currentNetworkChain.id].decimals)
  // );
  const decimals: number = Underlying_Token[currentNetworkChain.id].decimals;

  return parseUnits(amount + "", decimals);
};

export const withdrawLocktimeToString = (time: number) => {
  if (time === -1) return "1";
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (time / day > 1) {
    return `${time / day} Days`;
  }

  if (time / hour > 1) {
    return `${time / hour} Hours`;
  }

  if (time / hour === 1) {
    return "1 Hour";
  }
  return `${time / minute} Minutes`;
};

export const roundTimeToString = (seconds: number) => {
  const hr = 60;

  const min = seconds / 60;

  if (min > hr && min % hr === 0) {
    return `${min / hr}h`;
  }

  if (min > hr && min % hr) {
    return `${Math.floor(min / hr)}h ${min % hr}m`;
  }
  return `${min}m`;
};

export const calcAPY = (
  sharePrice: number,
  sharePrice7DAgo: number,
  totalStackedAmount: number,
  totalInvestedAmount: number
) => {
  if (sharePrice7DAgo === 0) {
    return { value: 0, isAPY: false };
  }
  const weeksInYear = 52;
  const apyBreakpoint = 5;
  const apy = Math.pow(sharePrice / sharePrice7DAgo, weeksInYear) * 100 - 100;
  if (apy > apyBreakpoint) {
    return { value: apy, isAPY: true };
  }

  const roi = (totalStackedAmount / totalInvestedAmount) * 100 - 100;

  return { value: roi, isAPY: false };
};

export const isEpoch = (epoch: any) => {
  return !epoch || (epoch && epoch > 28000000);
};

export const getOneMillionForBera = () => {
  return currentNetworkChain.id === NetworkIds.Berachain ? 1000000 : 1;
};

export const isActiveForChain = (currentChainId: number) => {
  return (
    currentChainId !== NetworkIds.Berachain &&
    currentChainId !== NetworkIds.Blast &&
    currentChainId !== NetworkIds.BlastMainnet &&
    currentChainId !== NetworkIds.Inevm &&
    currentChainId !== NetworkIds.InevmMainnet
  );
};
