import { DebugHelper } from "./helpers/debug-helper";

export type NetworkId = number;

export enum NetworkIds {
  Ethereum = 1,
  Rinkeby = 4,
  Goerli = 5,
  GoerliArbitrum = 421613,
  Arbitrum = 42161,
  Bsc = 56,
  FantomOpera = 250,
  FantomTestnet = 4002,
  Moonriver = 1285,
  MoonbaseAlpha = 1287,
  Boba = 288,
  Avalanche = 43114,
  Optimism = 10,
  Berachain = 80085,
  Blast = 168587773,
  BlastMainnet = 81457,
  Inevm = 2424,
  InevmMainnet = 2525,
}

export const defaultNetworkId = NetworkIds.FantomOpera;

// TODO once for a while update block times, use yesterday's value as today is not complete day
// https://ftmscan.com/chart/blocktime
// https://moonscan.io/chart/blocktime

interface INetwork {
  name: string;
  logo?: any;
  isEnabled: boolean;
  isTestNet: boolean;
  blocktime: number; // NOTE could get this from an outside source since it changes slightly over time
  epochBlock: number;
  epochInterval: number;
  blockCountdownUrl: (block: number) => string;
  getEtherscanUrl: (txnHash: string) => string;
  getPoolTogetherUrls: (contractAddress: string) => string[];
  getEtherscanAddress: (contractAddress: string) => string;
  poolGraphUrl: string;
  liquidityPoolReserveDecimals?: {
    token0Decimals: number;
    token1Decimals: number;
  };
  addresses?: { [key: string]: string };
  USDB_LENDING_ADDRESSES?: string[];
}

export interface INetworks {
  [key: string]: INetwork;
}

export const networks: INetworks = {
  [NetworkIds.GoerliArbitrum]: {
    name: "Goerli Arbitrum Testnet",
    logo: "../../assets/images/arbitrum.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: true,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://goerli.arbiscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://goerli.arbiscan.io/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://goerli.arbiscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Berachain]: {
    name: "Berachain Artio",
    logo: "../../assets/images/berachain.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: true,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://artio.beratrail.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => `https://artio.beratrail.io/tx/` + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://artio.beratrail.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Blast]: {
    name: "Blast Sepolia",
    logo: "../../assets/images/BLAST.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: true,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://testnet.blastscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => `https://testnet.blastscan.io/tx/` + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://testnet.blastscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.BlastMainnet]: {
    name: "Blast",
    logo: "../../assets/images/BLAST.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: false,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://blastscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => `https://blastscan.io/tx/` + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://blastscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Inevm]: {
    name: "inEVM testnet",
    logo: "../../assets/images/INJ.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: true,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) =>
      `https://inevm-testnet.explorer.caldera.xyz/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) =>
      `https://inevm-testnet.explorer.caldera.xyz/tx/` + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://inevm-testnet.explorer.caldera.xyz/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.InevmMainnet]: {
    name: "inEVM",
    logo: "../../assets/images/INJ.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: false,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://explorer.inevm.com/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => `https://explorer.inevm.com/tx/` + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://explorer.inevm.com/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Arbitrum]: {
    name: "Arbitrum One Mainnet",
    logo: "../../assets/images/arbitrum.png",
    isEnabled: DebugHelper.isActive("enable-testnet"),
    isTestNet: false,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://arbiscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://arbiscan.io/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://arbiscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Bsc]: {
    name: "BNB Chain",
    isEnabled: false,
    isTestNet: false,
    blocktime: 3,
    epochBlock: 10112184,
    epochInterval: 687,
    blockCountdownUrl: (block) => `https://bscscan.com/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://bscscan.com/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://bscscan.com/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3",
  },
  [NetworkIds.Ethereum]: {
    name: "Ethereum",
    isEnabled: false,
    isTestNet: false,
    blocktime: 14,
    epochBlock: 10112184,
    epochInterval: 687,
    blockCountdownUrl: (block) => `https://etherscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://etherscan.io/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://etherscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/ethereum-v3_4_3",
  },
  [NetworkIds.Avalanche]: {
    name: "Avalanche",
    isEnabled: false,
    isTestNet: false,
    blocktime: 402,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://snowtrace.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://snowtrace.io/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://snowtrace.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
  [NetworkIds.Optimism]: {
    name: "Optimism",
    isEnabled: false,
    isTestNet: false,
    blocktime: 402,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) =>
      `https://optimistic.etherscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://optimistic.etherscan.io/tx/" + txnHash,
    getEtherscanAddress: (contractAddress) =>
      "https://optimistic.etherscan.io/address/" + contractAddress,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
  },
};

export const enabledNetworkIds: NetworkId[] = Object.keys(networks)
  .map((networkID) => parseInt(networkID))
  .filter((networkID) => networks[networkID].isEnabled);
export const enabledNetworkIdsExceptBscAndEth: NetworkId[] = Object.keys(networks)
  .map((networkID) => parseInt(networkID))
  .filter(
    (networkID) =>
      networks[networkID].isEnabled &&
      networkID !== NetworkIds.Bsc &&
      networkID !== NetworkIds.Ethereum
  );
export const enabledMainNetworkIds: NetworkId[] = enabledNetworkIds.filter(
  (networkID) => !networks[networkID].isTestNet
);
