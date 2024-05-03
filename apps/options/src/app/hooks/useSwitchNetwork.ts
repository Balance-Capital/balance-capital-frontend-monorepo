import { useCallback } from "react";
import useLocalstorage from "./useLocalstorage";
import { useSwitchNetwork as useEOASwitchNetwork } from "wagmi";
import { useZeroDevWeb3auth } from "./useZerodevWeb3auth";
export default function useSwitchNetwork() {
    const { web3Mode } = useLocalstorage();
    const { switchNetworkAsync } = useEOASwitchNetwork();
    const { switchNetwork: switchSCANetwork } = useZeroDevWeb3auth();

    const switchNetwork = useCallback(async (chainId: number) => {
        if (web3Mode === 'EOA') {
            if (switchNetworkAsync) {
                await switchNetworkAsync(chainId);
            }
        } else {
            await switchSCANetwork(chainId);
        }
    }, [web3Mode, switchNetworkAsync]);

    return { switchNetwork };
}