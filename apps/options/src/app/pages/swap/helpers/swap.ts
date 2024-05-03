import { SwapResponse, QuotePath, Token } from "rango-sdk-basic";
import { ethers } from "ethers";
import { NetworkIds } from "@fantohm/shared-web3";
import { NetworkDetail } from "../data";
import { TokenWithAmount } from "../swap";

export const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(null), seconds * 1000));
};

export const sortTokenList = (network: NetworkDetail, tokenList: TokenWithAmount[]) => {
  if (network.chainId === NetworkIds.FantomOpera) {
    const fhmIndex = tokenList.findIndex((token) => token.symbol === "FHM");
    if (fhmIndex >= 0) {
      const temp = tokenList[0];
      tokenList[0] = tokenList[fhmIndex];
      tokenList[fhmIndex] = temp;
    }
    const daiIndex = tokenList.findIndex((token) => token.symbol === "DAI");
    if (daiIndex >= 0) {
      const temp = tokenList[1];
      tokenList[1] = tokenList[daiIndex];
      tokenList[daiIndex] = temp;
    }
    const wFtmIndex = tokenList.findIndex((token) => token.symbol === "WFTM");
    if (wFtmIndex >= 0) {
      const temp = tokenList[2];
      tokenList[2] = tokenList[wFtmIndex];
      tokenList[wFtmIndex] = temp;
    }
    const ftmIndex = tokenList.findIndex((token) => token.symbol === "FTM");
    if (ftmIndex >= 0) {
      const temp = tokenList[3];
      tokenList[3] = tokenList[ftmIndex];
      tokenList[ftmIndex] = temp;
    }
  }
};

export const truncateDecimals = (number: any, digits = 2) => {
  const multiplier = Math.pow(10, digits);
  const adjustedNum = number * multiplier;
  const truncatedNum = Math[adjustedNum < 0 ? "ceil" : "floor"](adjustedNum);
  return truncatedNum / multiplier;
};

export const scientificToDecimal = (num: any) => {
  const sign = Math.sign(num);
  //if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = "0";
    const parts = String(num).toLowerCase().split("e"); //split into coeff and exponent
    const e = parts.pop(); //store the exponential part
    let l = Math.abs(Number(e)); //get the number of zeros
    const direction = Number(e) / l; // use to determine the zeroes on the left or right
    const coeffArray = parts[0].split(".");

    if (direction === -1) {
      coeffArray[0] = String(Math.abs(Number(coeffArray[0])));
      num = zero + "." + new Array(l).join(zero) + coeffArray.join("");
    } else {
      const dec = coeffArray[1];
      if (dec) l = l - dec.length;
      num = coeffArray.join("") + new Array(l + 1).join(zero);
    }
  }

  if (sign < 0) {
    num = -num;
  }

  return num;
};

export const formatAmount = (amount: any, decimals: any, length = 2, symbol = "") => {
  if (!amount || !decimals) {
    return 0;
  }

  // workaround for well known decimals
  if (["BTC", "BCH", "LTC"].indexOf(symbol) >= 0) length = Math.min(decimals, 8);
  else if (["ETH", "BNB", "MATIC", "AVAX", "FTM"].indexOf(symbol) >= 0)
    length = Math.min(decimals, 9);

  const result = ethers.utils.formatUnits(
    scientificToDecimal(amount).toString(),
    decimals
  );
  return truncateDecimals(result, length);
};

export const expectSwapErrors = (bestRoute: SwapResponse) => {
  if (!bestRoute.error) {
    return [];
  }
  return [
    {
      title: "Swap Errors",
      required: bestRoute.error,
    },
  ];
};

export const getSwapPath = (swaps?: QuotePath[] | null) => {
  if (!swaps || !swaps.length) {
    return [];
  }
  const path: Token[] = [];
  swaps.forEach((swap, index: number) => {
    path.push(swap.from);
    if (index == swaps.length - 1) {
      path.push(swap.to);
    }
  });
  return path;
};

export const formatSwapTime = (duration: number) => {
  const hrs = parseInt((duration / 3600).toString(), 10);
  const mins = parseInt(((duration % 3600) / 60).toString(), 10);
  const secs = duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let result = "";
  if (hrs > 0) {
    result += "" + (hrs < 10 ? "0" + hrs : hrs) + ":";
  }
  result += "" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
  return result;
};

export const getDownRate = (
  fromToken?: TokenWithAmount,
  toToken?: TokenWithAmount,
  fromTokenAmount = 0,
  toTokenAmount = 0
) => {
  if (fromTokenAmount == 0 || toTokenAmount == 0 || !fromToken || !toToken) {
    return null;
  }
  const to = toTokenAmount * (toToken.usdPrice || 0);
  const from = fromTokenAmount * (fromToken.usdPrice || 0);
  return (to / from) * 100 - 100;
};

export const isDexPage = () => {
  return window.location.hash.indexOf("dex") >= 0;
};

export const setIsDexLoading = (value: string) => {
  window.localStorage.setItem("is-dex-loading", value);
};

export const isDexLoading = () => {
  return window.localStorage && window.localStorage.getItem("is-dex-loading") === "true";
};

export const sliceList = (data: any[], length: number) => {
  return data.slice(0, length);
};
