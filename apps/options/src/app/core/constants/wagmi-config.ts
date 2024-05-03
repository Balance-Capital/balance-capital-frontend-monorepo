import { configureChains, createClient, mainnet } from "wagmi";
import { arbitrum, arbitrumGoerli, bsc, avalanche, optimism, fantom } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { EthereumClient, w3mConnectors } from "@web3modal/ethereum";
import { berachain, blast, blastMainnet, inevm, inevmMainnet } from "./custom-chains";

export const projectId = "ca143dd21c648bb6f8fe27807a4b7755";

export const { chains, provider, webSocketProvider } = configureChains(
  [
    arbitrumGoerli,
    arbitrum,
    mainnet,
    bsc,
    avalanche,
    optimism,
    fantom,
    berachain,
    blast,
    blastMainnet,
    inevm,
    inevmMainnet,
  ],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  provider,
  webSocketProvider,
  storage: undefined,
});

export const ethereumClient = new EthereumClient(wagmiClient, chains);
