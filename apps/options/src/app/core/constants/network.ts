import { DebugHelper } from "libs/shared/web3/src/lib/helpers/debug-helper";
import { INetworks, NetworkIds, chains } from "@fantohm/shared-web3";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import { currentNetworkChain } from "../../context/NetworkContext";

export const loadEnvVariable = (
  name: string,
  useDefaultValue = false,
  defaultValue = ""
) => {
  if (!process.env[name] && !useDefaultValue) {
    console.error(`Environment variable for ${name} is not set!`);
  }
  return process.env[name] || defaultValue;
};

export const ChainMode = loadEnvVariable("NX_BINARY_CHAIN_MODE") as string;

type NumberObject = { [key: number]: number };
export const SUPPORTED_CHAINS = ((): NumberObject => {
  const supportedChains = loadEnvVariable(`NX_SUPPORTED_CHAINS`) || "[]";
  try {
    const supportedChainsParsed = JSON.parse(supportedChains);
    if (Array.isArray(supportedChainsParsed)) {
      return supportedChainsParsed.reduce((obj: NumberObject, element: number) => {
        obj[element] = element;
        return obj;
      }, {});
    } else {
      console.error("The parsed value is not an array.");
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  return {};
})();

export const defaultChainId =
  ChainMode === "testnet" ? NetworkIds.GoerliArbitrum : NetworkIds.Arbitrum;

export const chain = ChainMode === "testnet" ? arbitrumGoerli : arbitrum;

export const MULTICALL2_ADDRESS = () => {
  return chains[currentNetworkChain.id].multicallAddress;
};

// export const BINARY_ADDRESSES = {
//   MARKET_ADDRESS: {
//     BTC: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_MARKET_GOERLI_ARB_BTC_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_MARKET_ARB_BTC_ADDRESS"] as string,
//     },
//     ETH: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_MARKET_GOERLI_ARB_ETH_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_MARKET_ARB_ETH_ADDRESS"] as string,
//     },
//     // BNB: process.env["NX_BINARY_MARKET_BNB_ADDRESS"] as string,
//     // XRP: process.env["NX_BINARY_MARKET_XRP_ADDRESS"] as string,
//     // MATIC: process.env["NX_BINARY_MARKET_MATIC_ADDRESS"] as string,
//     // DOGE: process.env["NX_BINARY_MARKET_MATIC_ADDRESS"] as string,
//     SOL: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_MARKET_GOERLI_ARB_SOL_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_MARKET_ARB_SOL_ADDRESS"] as string,
//     },
//     // LINK: process.env["NX_BINARY_MARKET_MATIC_ADDRESS"] as string,
//   } as { [key: string]: { [key: number]: string } },
//   MARKET_MANAGER_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_MARKET_MANAGER_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_MARKET_MANAGER_ADDRESS"] as string,
//   } as { [key: number]: string },
//   VAULT_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_VAULT_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_VAULT_ADDRESS"] as string,
//   } as { [key: number]: string },
//   VAULT_MANAGER_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_VAULT_MANAGER_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_VAULT_MANAGER_ADDRESS"] as string,
//   } as { [key: number]: string },
//   OPERATOR_WALLETS: {
//     BTC: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_GOERLI_ARB_OPERATOR_BTC_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_OPERATOR_BTC_ADDRESS"] as string,
//     },
//     ETH: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_GOERLI_ARB_OPERATOR_ETH_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_OPERATOR_ETH_ADDRESS"] as string,
//     },
//     // BNB: process.env["NX_BINARY_OPERATOR_BNB_ADDRESS"] as string,
//     // XRP: process.env["NX_BINARY_OPERATOR_XRP_ADDRESS"] as string,
//     // MATIC: process.env["NX_BINARY_OPERATOR_MATIC_ADDRESS"] as string,
//     // DOGE: process.env["NX_BINARY_OPERATOR_MATIC_ADDRESS"] as string,
//     SOL: {
//       [NetworkIds.GoerliArbitrum]: process.env[
//         "NX_BINARY_GOERLI_ARB_OPERATOR_SOL_ADDRESS"
//       ] as string,
//       [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_OPERATOR_SOL_ADDRESS"] as string,
//     },
//     // LINK: process.env["NX_BINARY_OPERATOR_MATIC_ADDRESS"] as string,
//   } as { [key: string]: { [key: number]: string } },
//   CONFIG_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_CONFIG_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_CONFIG_ADDRESS"] as string,
//   } as { [key: number]: string },
//   REFERRAL_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_DISTRIBUTOR_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_DISTRIBUTOR_ADDRESS"] as string,
//   } as { [key: number]: string },
//   CREDIT_TOKEN_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_CREDIT_TOKEN_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env["NX_BINARY_ARB_CREDIT_TOKEN_ADDRESS"] as string,
//   } as { [key: number]: string },
//   CREDIT_TOKEN_MINTER_ADDRESS: {
//     [NetworkIds.GoerliArbitrum]: process.env[
//       "NX_BINARY_GOERLI_ARB_CREDIT_TOKEN_MINTER_ADDRESS"
//     ] as string,
//     [NetworkIds.Arbitrum]: process.env[
//       "NX_BINARY_ARB_CREDIT_TOKEN_MINTER_ADDRESS"
//     ] as string,
//   } as { [key: number]: string },
// };

export const EXPLORER_LINKS = {
  [NetworkIds.GoerliArbitrum as number]: "https://testnet.arbiscan.io",
  [NetworkIds.Arbitrum as number]: "https://arbiscan.io",
  [NetworkIds.Berachain as number]: "https://artio.beratrail.io",
  [NetworkIds.Blast as number]: "https://testnet.blastscan.io",
  [NetworkIds.BlastMainnet as number]: "https://blastscan.io",
  [NetworkIds.Inevm as number]: "https://inevm-testnet.explorer.caldera.xyz",
  [NetworkIds.InevmMainnet as number]: "https://explorer.inevm.com",
};

export const OPENSEA_LINKS = {
  [NetworkIds.GoerliArbitrum as number]:
    "https://testnets.opensea.io/assets/arbitrum-goerli",
  [NetworkIds.Arbitrum as number]: "https://opensea.io/assets/arbitrum",
  [NetworkIds.Berachain as number]: "https://artio.beratrail.io",
  [NetworkIds.Blast as number]: "https://testnet.blastscan.io",
  [NetworkIds.BlastMainnet as number]: "https://blastscan.io",
  [NetworkIds.Inevm as number]: "https://inevm-testnet.explorer.caldera.xyz",
  [NetworkIds.InevmMainnet as number]: "https://explorer.inevm.com",
};
