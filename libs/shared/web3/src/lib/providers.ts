import { NetworkIds } from "./networks";
import { NodeHelper } from "./helpers/node-helper";

interface ChainDetailsOpts {
  networkName: string;
  rpcUrls: string[];
  symbol: string;
  decimals: number;
  blockExplorerUrls: string[];
  wssUrls?: string[];
  multicallAddress?: string;
}

class ChainDetails {
  readonly networkName: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly rpcUrls: string[];
  readonly blockExplorerUrls: string[];
  readonly multicallAddress?: string;
  readonly wssUrls?: string[];

  constructor(chainDetailsOpts: ChainDetailsOpts) {
    this.networkName = chainDetailsOpts.networkName;
    this.rpcUrls = chainDetailsOpts.rpcUrls;
    this.symbol = chainDetailsOpts.symbol;
    this.decimals = chainDetailsOpts.decimals;
    this.blockExplorerUrls = chainDetailsOpts.blockExplorerUrls;
    this.wssUrls = chainDetailsOpts.wssUrls;
    this.multicallAddress = chainDetailsOpts.multicallAddress;
  }

  // Return the fastest rpcUrl available
  private static async getFastestRpcUrl(rpcUrls: string[]): Promise<string> {
    return Promise.any(
      rpcUrls.map(
        (rpcUrl) =>
          new Promise<string>((resolve, reject) => {
            NodeHelper.checkNodeStatus(rpcUrl).then((working) => {
              if (working) {
                resolve(rpcUrl);
              } else {
                reject();
              }
            });
          })
      )
    );
  }
}

interface AllChainDetails {
  [key: number]: ChainDetails | any;
}

const allChains: AllChainDetails = {
  [NetworkIds.GoerliArbitrum]: new ChainDetails({
    networkName: "Arbitrum Goerli Testnet",
    rpcUrls: [
      "https://arbitrum-goerli.publicnode.com/",
      "https://arb-goerli.g.alchemy.com/v2/b03hTU7YZUxs8kJkhb8IWYmEr-wELvk3",
      "https://arb-goerli.g.alchemy.com/v2/nrfGPivuE26jzBT2ry0mBKsdTQInr-xr",
    ],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://goerli.arbiscan.io/"],
    wssUrls: [
      "wss://arb-goerli.g.alchemy.com/v2/b03hTU7YZUxs8kJkhb8IWYmEr-wELvk3",
      "wss://arb-goerli.g.alchemy.com/v2/nrfGPivuE26jzBT2ry0mBKsdTQInr-xr",
      "wss://goerli-rollup.arbitrum.io/rpc",
    ],
    multicallAddress: "0x0b883cdd725f8cd89816e38371de138a57b3e6fc",
  }),
  [NetworkIds.Goerli]: new ChainDetails({
    networkName: "Goerli Testnet",
    rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://goerli.io/"],
    wssUrls: [
      "wss://arb-goerli.g.alchemy.com/v2/b03hTU7YZUxs8kJkhb8IWYmEr-wELvk3",
      "wss://arb-goerli.g.alchemy.com/v2/nrfGPivuE26jzBT2ry0mBKsdTQInr-xr",
      "wss://goerli-rollup.arbitrum.io/rpc",
    ],
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
  }),
  [NetworkIds.Arbitrum]: new ChainDetails({
    networkName: "Arbitrum One",
    rpcUrls: [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-one.public.blastapi.io",
      "https://arb-mainnet.g.alchemy.com/v2/hJyQTYCZaLoWLSP_AtcY148cd85AbOQW",
    ],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://arbiscan.io/"],
    wssUrls: [
      "wss://arb-mainnet.g.alchemy.com/v2/hJyQTYCZaLoWLSP_AtcY148cd85AbOQW",
      "wss://arb1.arbitrum.io/rpc",
    ],
    multicallAddress: "0x842eC2c7D803033Edf55E478F461FC547Bc54EB2",
  }),
  [NetworkIds.Berachain]: new ChainDetails({
    networkName: "Berachain Artio",
    rpcUrls: ["https://rpc.ankr.com/berachain_testnet"],
    symbol: "BERA",
    decimals: 18,
    blockExplorerUrls: ["https://artio.beratrail.io"],
    wssUrls: ["wss://artio.rpc.berachain.com"],
    multicallAddress: "0x9d1dB8253105b007DDDE65Ce262f701814B91125",
  }),
  [NetworkIds.Blast]: new ChainDetails({
    networkName: "Blast Sepolia",
    rpcUrls: ["https://rpc.ankr.com/blast_testnet_sepolia"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://testnet.blastscan.io"],
    wssUrls: ["wss://rpc.ankr.com/blast_testnet_sepolia"],
    multicallAddress: "0x022560cfCB4AA213829451aCcA374Bc01f5078E9",
  }),
  [NetworkIds.BlastMainnet]: new ChainDetails({
    networkName: "Blast",
    rpcUrls: ["https://rpc.ankr.com/blast"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://blastscan.io"],
    wssUrls: ["wss://rpc.blast.io"],
    multicallAddress: "0xAA7290d31736E7cA54d54ee1d273E84D60a89475",
  }),
  [NetworkIds.Inevm]: new ChainDetails({
    networkName: "inEVM testnet",
    rpcUrls: ["https://inevm-testnet.rpc.caldera.xyz/http"],
    symbol: "INJ",
    decimals: 18,
    blockExplorerUrls: ["https://inevm-testnet.explorer.caldera.xyz"],
    wssUrls: ["wss://inevm-testnet.rpc.caldera.xyz/ws"],
    multicallAddress: "0xB203Cc80ff89d0D436923F884944b75C9c8bBdB5",
  }),
  [NetworkIds.InevmMainnet]: new ChainDetails({
    networkName: "inEVM",
    rpcUrls: ["https://mainnet.rpc.inevm.com/http"],
    symbol: "INJ",
    decimals: 18,
    blockExplorerUrls: ["https://explorer.inevm.com"],
    wssUrls: ["wss://mainnet.rpc.inevm.com/ws"],
    multicallAddress: "0x4E28CEC8Ed3e02933d0EaCeBd0B3E0F102672521",
  }),
  [NetworkIds.Avalanche]: new ChainDetails({
    networkName: "Avalanche Network",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    symbol: "AVAX",
    decimals: 18,
    blockExplorerUrls: ["https://snowtrace.io/"],
  }),
  [NetworkIds.Bsc]: new ChainDetails({
    networkName: "Smart Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    symbol: "BNB",
    decimals: 18,
    blockExplorerUrls: ["https://bscscan.com/"],
  }),
  [NetworkIds.Boba]: new ChainDetails({
    networkName: "BOBA L2",
    rpcUrls: ["https://mainnet.boba.network/"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://blockexplorer.boba.network/"],
  }),
  [NetworkIds.Ethereum]: new ChainDetails({
    networkName: "Ethereum",
    rpcUrls: ["https://mainnet.infura.io/v3/84842078b09946638c03157f83405213"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://etherscan.io/"],
    multicallAddress: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
  }),
  [NetworkIds.FantomOpera]: new ChainDetails({
    networkName: "Fantom Opera",
    rpcUrls: [
      // this is just a test, have our node and one other
      // 'https://summer-frosty-cherry.fantom.quiknode.pro/40823c8d106b70145e5cb78de1751d9ecadc5f1d/',
      "https://rpc.ankr.com/fantom",
      "https://rpc.ftm.tools",
      "https://rpc3.fantom.network",
      "https://rpc.fantom.network",
      "https://rpcapi.fantom.network",
      "https://rpc2.fantom.network",
      // 'https://rpc.neist.io',
    ],
    symbol: "FTM",
    decimals: 18,
    blockExplorerUrls: ["https://ftmscan.com/"],
    multicallAddress: "0xe4CC2532B2b1EC585310682af3656b2E4B6fab58",
  }),
  [NetworkIds.Optimism]: new ChainDetails({
    networkName: "Optimism Network",
    rpcUrls: ["https://mainnet.optimism.io"],
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrls: ["https://optimistic.etherscan.io/"],
  }),
};

export const chains = allChains;
