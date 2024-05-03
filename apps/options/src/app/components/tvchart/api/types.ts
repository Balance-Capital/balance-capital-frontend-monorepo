export type SymbolInfo = {
  description: string;
  symbol: string;
  full_name: string;
  exchange: string;
  type: string;
  filterString?: string;
};

export type ConfigurationData = {
  supported_resolutions: string[];
  exchanges: {
    value: string;
    name: string;
    desc: string;
  }[];
  symbols_types: {
    name: string;
    value: string;
  }[];
};

export type BarData = {
  time: number;
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
};

export enum AppMode {
  MaintenanceMode = 0,
  OfflineMode = 1,
  Success = 2,
}
