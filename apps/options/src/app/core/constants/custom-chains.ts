import { Chain } from "wagmi";

export const berachain = {
  id: 80085,
  name: "Berachain Artio",
  network: "Berachain Artio",
  nativeCurrency: {
    decimals: 18,
    name: "BERA",
    symbol: "BERA",
  },
  rpcUrls: {
    public: { http: ["https://rpc.ankr.com/berachain_testnet"] },
    default: { http: ["https://rpc.ankr.com/berachain_testnet"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://artio.beratrail.io" },
  },
  contracts: {
    multicall3: {
      address: "0x9d1dB8253105b007DDDE65Ce262f701814B91125",
    },
  },
} as const satisfies Chain;

export const blast = {
  id: 168587773,
  name: "Blast Sepolia",
  network: "Blast Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://rpc.ankr.com/blast_testnet_sepolia"] },
    default: { http: ["https://rpc.ankr.com/blast_testnet_sepolia"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://testnet.blastscan.io" },
  },
  contracts: {
    multicall3: {
      address: "0x022560cfCB4AA213829451aCcA374Bc01f5078E9",
    },
  },
} as const satisfies Chain;

export const blastMainnet = {
  id: 81457,
  name: "Blast",
  network: "Blast",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://rpc.ankr.com/blast"] },
    default: { http: ["https://rpc.ankr.com/blast"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://blastscan.io" },
  },
  contracts: {
    multicall3: {
      address: "0xAA7290d31736E7cA54d54ee1d273E84D60a89475",
    },
  },
} as const satisfies Chain;

export const inevm = {
  id: 2424,
  name: "inEVM testnet",
  network: "inEVM testnet",
  nativeCurrency: {
    decimals: 18,
    name: "INJ",
    symbol: "INJ",
  },
  rpcUrls: {
    public: { http: ["https://inevm-testnet.rpc.caldera.xyz/http"] },
    default: { http: ["https://inevm-testnet.rpc.caldera.xyz/http"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://inevm-testnet.explorer.caldera.xyz" },
  },
  contracts: {
    multicall3: {
      address: "0xB203Cc80ff89d0D436923F884944b75C9c8bBdB5",
    },
  },
} as const satisfies Chain;

export const inevmMainnet = {
  id: 2525,
  name: "inEVM",
  network: "inEVM",
  nativeCurrency: {
    decimals: 18,
    name: "INJ",
    symbol: "INJ",
  },
  rpcUrls: {
    public: { http: ["https://mainnet.rpc.inevm.com/http"] },
    default: { http: ["https://mainnet.rpc.inevm.com/http"] },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://explorer.inevm.com" },
  },
  contracts: {
    multicall3: {
      address: "0x4E28CEC8Ed3e02933d0EaCeBd0B3E0F102672521",
    },
  },
} as const satisfies Chain;
