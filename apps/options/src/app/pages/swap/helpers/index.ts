import { chains } from "@fantohm/shared-web3";
import { ethers } from "ethers";

export function formatCurrency(c: number, precision = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(c);
}

export function trim(number = "0", precision = 0) {
  // why would number ever be undefined??? what are we trimming?
  const array = number.toString().split(".");
  if (array.length === 1) return number.toString();
  if (precision === 0) return array[0].toString();

  const poppedNumber = array.pop() || "0";
  array.push(poppedNumber.substring(0, precision));
  const trimmedNumber = array.join(".");
  return trimmedNumber;
}

export const getExplorerURL = (chainId: number) => {
  return chains[chainId]?.blockExplorerUrls ? chains[chainId]?.blockExplorerUrls[0] : "";
};

export const getProvider = (chainId: number) => {
  return chains[chainId]?.rpcUrls
    ? new ethers.providers.JsonRpcProvider(chains[chainId]?.rpcUrls[0])
    : "";
};

export const shortenEthereumAddress = (
  address: string,
  size: "sm" | "md" | "lg" | "xl" = "md"
) => {
  const totalLength = address.length;
  let shortenLength = 3;
  switch (size) {
    case "md":
      shortenLength = 5;
      break;
    case "lg":
      shortenLength = 7;
      break;
    case "xl":
      shortenLength = 9;
      break;
    default:
      break;
  }

  return `${address.slice(0, shortenLength + 2)}...${address.slice(
    totalLength - shortenLength,
    totalLength
  )}`;
};
