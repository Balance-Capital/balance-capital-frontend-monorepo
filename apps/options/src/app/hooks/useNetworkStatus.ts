import { useEffect, useState } from "react";
import { NetworkStatus } from "../core/types/basic.types";
import { useAccount } from "./useAccount";
import { useNetworkContext } from "../context/NetworkContext";
import { NetworkIds } from "@fantohm/shared-web3";
import { isActiveForChain } from "../helpers/data-translations";

export const useNetworkStatus = () => {
  const { isConnected, address, chainId } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();
  const [networkStatus, setNetworkStatus] = useState(
    !address || !chainId || !isConnected
      ? NetworkStatus.NotConnected
      : chainId !== NetworkIds.GoerliArbitrum &&
        chainId !== NetworkIds.Arbitrum &&
        isActiveForChain(chainId)
      ? NetworkStatus.WrongNetwork
      : NetworkStatus.Success
  ); // 0: not connected, 1: wrong network, 2: success

  useEffect(() => {
    const TimeLimit = 1000;

    const TimerId = setTimeout(() => {
      if (!address || !chainId || !isConnected) {
        setNetworkStatus(NetworkStatus.NotConnected);
      } else if (chainId !== currentNetworkChainId) {
        setNetworkStatus(NetworkStatus.WrongNetwork);
      } else {
        setNetworkStatus(NetworkStatus.Success);
      }
    }, TimeLimit);

    return () => clearTimeout(TimerId);
  }, [address, currentNetworkChainId, chainId]);

  return networkStatus;
};
