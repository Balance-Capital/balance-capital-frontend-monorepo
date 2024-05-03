import { NetworkId, networks } from "../networks";
export { loadState, saveState } from "./localstorage";

export function roundToNearestHour(seconds: number) {
  return seconds - (seconds % 3600);
}

export function shorten(str: string) {
  if (str.length < 10) return str;
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function trim(number = 0, precision = 0) {
  if (!number) {
    return "0";
  }
  const multiPrecision = Math.pow(10, precision);
  number = Math.floor(number * multiPrecision) / multiPrecision;
  // why would number ever be undefined??? what are we trimming?
  const array = Number(number).toFixed(precision).toString().split(".");
  if (array.length === 1) return number.toString();
  if (precision === 0) return array[0].toString();

  const poppedNumber = array.pop() || "0";
  let belowPrecision = poppedNumber.substring(0, precision);

  const lastZeros = belowPrecision.match(/[0]+$/);
  if (lastZeros) {
    const { index } = lastZeros!;
    if (index === 0) return array[0];
    belowPrecision = belowPrecision.substring(0, index);
  }
  array.push(belowPrecision);
  const trimmedNumber = array.join(".");
  return trimmedNumber;
}

export function getRebaseBlock(networkId: NetworkId, currentBlock: number) {
  return (
    currentBlock +
    networks[networkId].epochInterval -
    ((currentBlock - networks[networkId].epochBlock) % networks[networkId].epochInterval)
  );
}

export function secondsUntilBlock(
  networkId: NetworkId,
  startBlock: number,
  endBlock: number
) {
  const blocksAway = endBlock - startBlock;
  const secondsAway = blocksAway * networks[networkId].blocktime;

  return secondsAway;
}

export function prettyVestingPeriod(
  networkId: NetworkId,
  currentBlock: number,
  vestingBlock: number
) {
  if (vestingBlock === 0) {
    return "";
  }

  const seconds = secondsUntilBlock(networkId, currentBlock, vestingBlock);
  if (seconds < 0) {
    return "Fully Vested";
  }
  return prettifySeconds(seconds);
}

export function prettifySeconds(seconds: number, resolution?: string) {
  if (seconds !== 0 && !seconds) {
    return "";
  }

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (resolution === "day") {
    return d + (d == 1 ? " day" : " days");
  }

  const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " min" : " mins") : "";

  let result = dDisplay + hDisplay + mDisplay;
  if (mDisplay === "") {
    result = result.slice(0, result.length - 2);
  }

  if (d > 0) {
    result = dDisplay.slice(0, dDisplay.length - 2);
  }

  if (seconds <= 0) result = "Instant";

  if (result === "") result = `${Math.floor(seconds)} sec`;

  return result;
}

export function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getSohmTokenImage() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return;
}

export function getOhmTokenImage(w?: number, h?: number) {
  const height = h == null ? "32px" : `${h}px`;
  const width = w == null ? "32px" : `${w}px`;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return;
}

export function getTokenImage(name: string) {
  if (name === "fhm") return getOhmTokenImage();
  if (name === "sfhm") return getSohmTokenImage();
  return getOhmTokenImage();
}

// TS-REFACTOR-NOTE - Used for:
// account-slice.ts, app-slice.ts, lusd-slice.ts
export function setAll(state: any, properties: any) {
  const props = Object.keys(properties);
  props.forEach((key) => {
    state[key] = properties[key];
  });
}

/**
 * returns false if SafetyCheck has fired in this Session. True otherwise
 * @returns boolean
 */
export const shouldTriggerSafetyCheck = () => {
  const _storage = window.sessionStorage;
  const _safetyCheckKey = "-oly-safety";
  // check if sessionStorage item exists for SafetyCheck
  if (!_storage.getItem(_safetyCheckKey)) {
    _storage.setItem(_safetyCheckKey, "true");
    return true;
  }
  return false;
};

/**
 * returns unix timestamp for x minutes ago
 * @param x minutes as a number
 */
export const minutesAgo = (x: number) => {
  const now = new Date().getTime();
  return new Date(now - x * 60000).getTime();
};

/**
 * subtracts two dates for use in 33-together timer
 * param (Date) dateA is the ending date object
 * param (Date) dateB is the current date object
 * returns days, hours, minutes, seconds
 * NOTE: this func previously used parseInt() to convert to whole numbers, however, typescript doesn't like
 * ... using parseInt on number params. It only allows parseInt on string params. So we converted usage to
 * ... Math.trunc which accomplishes the same result as parseInt.
 */
export const subtractDates = (dateA: Date, dateB: Date) => {
  const msA: number = dateA.getTime();
  const msB: number = dateB.getTime();

  let diff: number = msA - msB;

  let days = 0;
  if (diff >= 86400000) {
    days = Math.trunc(diff / 86400000);
    diff -= days * 86400000;
  }

  let hours = 0;
  if (days || diff >= 3600000) {
    hours = Math.trunc(diff / 3600000);
    diff -= hours * 3600000;
  }

  let minutes = 0;
  if (hours || diff >= 60000) {
    minutes = Math.trunc(diff / 60000);
    diff -= minutes * 60000;
  }

  let seconds = 0;
  if (minutes || diff >= 1000) {
    seconds = Math.trunc(diff / 1000);
  }
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export function getQueryParams(search: string): { [key: string]: boolean } {
  const param = new URLSearchParams(search.toString()?.replace("/", ""));
  const custom: { [key: string]: boolean } = {};
  param.forEach(function (value, key) {
    custom[key] = value === "true" ? true : false;
  });
  return custom;
}

export const isDev: boolean =
  !process.env["NODE_ENV"] || process.env["NODE_ENV"] === "development";
