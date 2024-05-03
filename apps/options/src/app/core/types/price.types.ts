export type PairLatestPrice = {
  price: number;
  timestamp?: number;
  volume?: number;
  symbol?: string;
};

export type DataProviderLatestPrice = {
  [key: string]: PairLatestPrice;
};

export type CurrentLatestPrice = {
  price: number;
};
