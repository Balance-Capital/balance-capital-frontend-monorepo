import io, { Socket } from "socket.io-client";
import { NetworkIds } from "@fantohm/shared-web3";

import { CryptoCurrency, IBettingTimeframe, MarketDetail } from "../types/basic.types";
import { NavItemProp } from "../types/basic.types";
import { getCustomHeaders } from "../../components/tvchart/api/helper";
import { loadEnvVariable } from "./network";
import { currentNetworkChain } from "../../context/NetworkContext";
import { DebugHelper } from "@fantohm/shared-helpers";
// import { activeCompetitionData } from "../../pages/competitions/mock";

export const Backend_API = loadEnvVariable("NX_BINARY_BACKEND_API_URL") as string;
export const SOCKET_URL = loadEnvVariable("NX_BINARY_BACKEND_SOCKET_URL") as string;

export let socket: Socket;
export const GRAPH_URL = () =>
  loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_THEGRAPH_URL`) as string;
export const REFERRAL_THEGRAPH_URL = () =>
  loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_REFERRAL_THEGRAPH_URL`) as string;

export const Carousal_Responsive_Form = {
  superLargeDesktop: {
    breakpoint: { max: 1560, min: 1280 },
    items: 3,
  },
  laptopL: {
    breakpoint: { max: 1280, min: 1024 },
    items: 2,
    paritialVisibilityGutter: 50,
  },
  laptop: {
    breakpoint: { max: 860, min: 768 },
    items: 1,
    paritialVisibilityGutter: 180,
  },
  table: {
    breakpoint: { max: 768, min: 425 },
    items: 1,
    paritialVisibilityGutter: 100,
  },
  mobileL: {
    breakpoint: { max: 425, min: 375 },
    items: 1,
    paritialVisibilityGutter: 30,
  },
  mobileM: {
    breakpoint: { max: 375, min: 320 },
    items: 1,
    paritialVisibilityGutter: 15,
  },
  mobile: {
    breakpoint: { max: 320, min: 0 },
    items: 1,
    paritialVisibilityGutter: 30,
  },
};

export const getSocket = () => {
  if (!socket) {
    const headers = getCustomHeaders();
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      query: headers,
      withCredentials: true,
    });
  }
  return socket;
};

export const NavItems: NavItemProp[] = [
  { title: "Trade", href: "/trade" },
  { title: "Markets", href: "/markets" },
  { title: "Leaderboard", href: "/leaderboard" },
  // { title: "Referrals", href: "/referrals" },
  // { title: "Competitions", href: `/competitions/${activeCompetitionData?.id}` },
  // { title: "Rewards", href: "/rewards" },
  // { title: "Earn", href: "/vault" },
  { title: "Swap", href: "/swap" },
];

export const Betting_CryptoCurrencies: CryptoCurrency[] = [
  { name: "Bitcoin", symbol: "BTC", filterString: "bitcoin btcusd btc/usd" },
  { name: "Ether", symbol: "ETH", filterString: "ethereum ethusd eth/usd" },
  // { name: "Binance Coin", symbol: "BNB", filterString: "binance coin bnbusd bnb/usd" },
  // { name: "Ripple", symbol: "XRP", filterString: "ripple xrpusd xrp/usd" },
  // { name: "Polygon", symbol: "MATIC", filterString: "polygon maticusd matic/usd" },
  // { name: "Dogecoin", symbol: "DOGE", filterString: "dogecoin dogeusd doge/usd" },
  { name: "Solana", symbol: "SOL", filterString: "solana solusd sol/usd" },
  // { name: "Chainlink", symbol: "LINK", filterString: "chainlink linkusd link/usd" },
  // { name: "Solana", symbol: "SOL" },
  // { name: "Shiba", symbol: "SHIB" },
];

export const CommunityTools: NavItemProp[] = [
  { title: "Discord", href: "" },
  { title: "Twitter", href: "" },
  { title: "Report & problem", href: "" },
];

export const Underlying_Token = {
  [NetworkIds.GoerliArbitrum as number]: {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x1017E3FFAA464558C00E89f5DB56F44382928027",
    decimals: 6,
    initializingTime: 5,
    finalizingTime: 3,
  },
  [NetworkIds.Arbitrum as number]: {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    initializingTime: 5,
    finalizingTime: 3,
  },
  [NetworkIds.Berachain as number]: {
    name: "μHONEY",
    symbol: "μHONEY",
    address: "0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B",
    decimals: 18,
    initializingTime: 8,
    finalizingTime: 5,
  },
  [NetworkIds.Blast as number]: {
    name: "WETH",
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000023",
    decimals: 18,
    initializingTime: 6,
    finalizingTime: 4,
  },
  [NetworkIds.BlastMainnet as number]: {
    name: "WETH",
    symbol: "WETH",
    address: "0x4300000000000000000000000000000000000004",
    decimals: 18,
    initializingTime: 6,
    finalizingTime: 4,
  },
  [NetworkIds.Inevm as number]: {
    name: "WINJ",
    symbol: "WINJ",
    address: "0xbB0b37cDd55f2fd572141a82F3648C1f716F6527",
    decimals: 18,
    initializingTime: 6,
    finalizingTime: 4,
  },
  [NetworkIds.InevmMainnet as number]: {
    name: "WINJ",
    symbol: "WINJ",
    address: "0x986fF689befdC31A41682A602946040F0771B0eB",
    decimals: 18,
    initializingTime: 6,
    finalizingTime: 4,
  },
};

export const Betting_History_Tabs = ["Open Positions", "Closed Positions"];

export const Poll_Interval = 10000;

export const Account_Balance_Interval = 60 * 1000; // 1m

export const MarketData_Poll_Interval = 20 * 1000; // 20s

export const BETTING_AMOUNT = {
  MIN: 0.1,
  MAX: 1000,
};

// export const BETTING_ROUND_IN_MINUTE = [1, 5, 15];

export const BettingTimeframes: Array<IBettingTimeframe> = [
  {
    id: 0,
    minute: 1,
    disabled: false,
  },
  {
    id: 3,
    minute: 3,
    disabled: false,
  },
  {
    id: 1,
    minute: 5,
    disabled: false,
  },
  {
    id: 2,
    minute: 15,
    disabled: true,
  },
];

export const RefreshTimeLimit = 15 * 60 * 1000;

export const OperatorWalletMinBalance = 0.02;
export const OperatorWalletDisableBalance = 0.001;

export const MaxBettableFutureTime = 6 * 60; // 6h = 360 min

export const METAMASK_ERRORS: Record<string, string> = {
  "-32700":
    "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.",
  "-32600": "The JSON sent is not a valid Request object.",
  "-32601": "The method does not exist / is not available.",
  "-32602": "Invalid method parameter(s).",
  "-32603": "Internal JSON-RPC error.",
  "-32000": "Invalid input.",
  "-32001": "Resource not found.",
  "-32002": "Resource unavailable.",
  "-32003": "Transaction rejected.",
  "-32004": "Method not supported.",
  "-32005": "Request limit exceeded.",
  "4001": "User rejected the request.",
  "4100": "The requested account and/or method has not been authorized by the user.",
  "4200": "The requested method is not supported by this Ethereum provider.",
  "4900": "The provider is disconnected from all chains.",
  "4901": "The provider is disconnected from the specified chain.",
};

export const marketCurrencies: MarketDetail[] = [
  {
    marketCapId: 1027,
    price: 0,
    priceChange: 0,
    symbol: "ETH",
  },
  {
    marketCapId: 52,
    price: 0,
    priceChange: 0,
    symbol: "XRP",
  },
  {
    marketCapId: 1839,
    price: 0,
    priceChange: 0,
    symbol: "BNB",
  },
  {
    marketCapId: 5426,
    price: 0,
    priceChange: 0,
    symbol: "SOL",
  },
];

export const BlockedCountries = [
  {
    countryName: "United States",
    countryCode: "US",
  },
];

export const ValidNumberInputKeyCodes = [
  96, 97, 98, 99, 100, 101, 102, 103, 105, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 110,
  190, 8, 18, 46, 37, 38, 39, 40,
];

export const UserRegisterSignMessage = "Welcome to Ryze!";

export const CompetitionRoundTime = 30 * 24 * 60 * 60; //1 month

export const CompetitionTermsLimit = 5;

export const TradingFee = 5;

export const LoadVaultBalanceInterval = 60000;

export const isBerachainInParam = () => DebugHelper.isActive("enable-berachain");
export const isBlastInParam = () => DebugHelper.isActive("enable-blast");
export const isBlastMainnetInParam = () => DebugHelper.isActive("enable-blast-mainnet");
export const isInevmInParam = () => DebugHelper.isActive("enable-inevm");
export const isInevmMainnetInParam = () => DebugHelper.isActive("enable-inevm-mainnet");

export const getDecimal = (value: number): string => {
  return +value < 0.1 ? (+value.toFixed(6)).toString() : (+value.toFixed(2)).toString();
};
