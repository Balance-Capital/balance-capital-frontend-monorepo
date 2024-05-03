import {
  EthereumIcon,
  BscIcon,
  ArbitrumIcon,
  AvalancheIcon,
  OptimismIcon,
  FantomIcon,
} from "./network-icons";

export const modalType = {
  from: "from",
  to: "to",
};

export const bondActionType = {
  deposit: "deposit",
  approve: "approve",
};

export type NetworkDetail = {
  blockchain: string;
  name: string;
  chainId: number;
  id: string;
  logo: JSX.Element;
};

export const swapNetworks = [
  {
    blockchain: "ETH",
    name: "Ethereum",
    chainId: 1,
    id: "ethereum",
    logo: <EthereumIcon />,
  },
  {
    blockchain: "BSC",
    name: "BNB Smart Chain",
    chainId: 56,
    id: "binance-smart-chain",
    logo: <BscIcon />,
  },
  {
    blockchain: "ARBITRUM",
    name: "Arbitrum",
    chainId: 42161,
    id: "arbitrum",
    logo: <ArbitrumIcon />,
  },
  {
    blockchain: "OPTIMISM",
    name: "Optimism",
    chainId: 10,
    id: "optimism",
    logo: <OptimismIcon />,
  },
  // {
  //   blockchain: "FANTOM",
  //   name: "Fantom",
  //   chainId: 250,
  //   id: "fantom",
  //   logo: <FantomIcon />,
  // },
  {
    blockchain: "AVAX_CCHAIN",
    name: "Avalanche",
    chainId: 43114,
    id: "avax_cchain",
    logo: <AvalancheIcon />,
  },
  // {
  //   blockchain: "HARMONY",
  //   name: "Harmony",
  //   chainId: 1666600000,
  //   id: "harmony",
  //   logo: <HarmonyIcon />,
  // },
  // {
  //   blockchain: "POLYGON",
  //   name: "Polygon",
  //   chainId: 137,
  //   id: "polygon",
  //   logo: <PolygonIcon />,
  // },
];

export const slippageList = [0.5, 1, 3, 5, 8, 13, 20];
