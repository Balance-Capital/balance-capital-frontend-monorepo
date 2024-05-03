export type NavItemProp = {
  title: string;
  href: string;
};

export type CryptoCurrency = {
  name: string;
  symbol: string;
  filterString: string;
};

export interface TokenPair {
  name: string;
  icon: string;
}
export interface TransactionProps {
  tx: string;
  from: string;
  to: string;
  timestamp: string;
  tokenPair: TokenPair;
  data: any;
}
export interface HistoryProps {
  type: "Up" | "Down";
  asset: string;
  quantity: number;
  payout: number | undefined;
  status: boolean;
  open: number;
  close: number | undefined;
  time: Date;
  expiration: Date;
  timer: number | undefined;
}
export interface HistoryData {
  amount: number;
  hash: string;
  claimed: boolean;
  claimedAmount: number | null;
  claimedHash: string | null;
  timeframeId: number;
  position: string;
  market: string;
  isReverted: boolean;
  creditUsed: boolean;
  round: {
    epoch: number;
    bullBets: number;
    lockPrice: number;
    closePrice: number;
    lockAt: number;
    endAt: number;
  };
}

export enum NetworkStatus {
  NotConnected = 0,
  WrongNetwork = 1,
  Success = 2,
}

export interface PositionData {
  tokenId: number;
  investAmount: number;
  withdrawal: {
    startTime: number;
    shareAmount: number;
  } | null;
  timestamp: number;
  owner: string;
  shares: string;
  tokenValue: string;
  netValue: string;
  fee: string;
}

export enum AccountWhitelistStatus {
  Disconnected = 0,
  Checking = 1,
  Whitelisted = 2,
  NotWhitelisted = 3,
}

export interface MarketDetail {
  symbol: string;
  marketCapId: number;
  price: number;
  priceChange: number;
}

export type Erc20CurrencyAddress = {
  [networkId: number]: string;
};

export type CurrencyDetails = {
  symbol: string;
  name: string;
  icon?: string; //svg
  addresses: Erc20CurrencyAddress;
  coingeckoStub: string;
  decimals?: number;
};

export type CurrencyInfo = {
  [constantName: string]: CurrencyDetails;
};

export interface ILeaderboardData {
  user: string;
  totalBet: number;
  totalInvestment: number;
  pNl: number;
  roi: number;
}

export interface IBettingTimeframe {
  id: number;
  minute: number;
  disabled: boolean;
}
