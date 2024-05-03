export enum BetPosition {
  UP = "Up",
  DOWN = "Down",
  HOUSE = "House",
}

export enum BetPair {
  BTCUSD = "BTC/USD",
  ETHUSD = "ETH/USD",
  // BNBUSD = "BNB/USD",
  // XRPUSD = "XRP/USD",
  // MATICUSD = "MATIC/USD",
  // DOGEUSD = "DOGE/USD",
  SOLUSD = "SOL/USD",
  // LINKUSD = "LINK/USD",
}

export enum PredictionStatus {
  INITIAL = "initial",
  LIVE = "live",
  PAUSED = "paused",
  ERROR = "error",
}

export interface Bet {
  id?: string;
  hash?: string;
  epoch: number;
  amount: number;
  position: BetPosition;
  pair: BetPair;
  timeframe: number;
  openPrice: number;
  closePrice: number;
  claimed: boolean;
  claimedAt: number;
  claimedBlock: number;
  claimedHash: string;
  claimedAmount: number;
  createdAt: number;
  updatedAt: number;
  startRoundAt: number;
  closeRoundAt: number;
  userAddress?: string;
  roundId?: string;
}

export interface Round {
  id: string;
  epoch: number;
  position: BetPosition;
  failed: boolean;
  startAt: number;
  startBlock: number;
  startHash: string;
  lockAt: number;
  lockBlock: number;
  lockHash: string;
  lockPrice: number;
  lockRoundId: string;
  closeAt: number;
  closeBlock: number;
  closeHash: string;
  closePrice: number;
  closeRoundId: string;
  totalBets: number;
  totalAmount: number;
  bullBets: number;
  bullAmount: number;
  bearBets: number;
  bearAmount: number;
  bets?: Bet[];
}
