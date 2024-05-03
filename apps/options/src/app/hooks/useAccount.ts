import {
  useAccount as useAccountDefault,
  useChainId,
  useDisconnect,
  useSigner,
} from "wagmi";
import { useAAContext } from "../context/AAContext";
import useWeb3CustomModal from "./useWeb3CustomModal";
import useLocalstorage from "./useLocalstorage";
import { SUPPORTED_CHAINS, defaultChainId } from "../core/constants/network";
import { useEffect, useState } from "react";
import { useNetworkContext } from "../context/NetworkContext";

export function useAccount() {
  const openConnectModal = useWeb3CustomModal();
  const { address, isConnected } = useAccountDefault();
  const {
    isLoggedIn,
    login: connect,
    logout,
    scaAddress,
    provider,
    chainId: chainIdSCA,
  } = useAAContext();
  const { data: signer } = useSigner();
  const { disconnect } = useDisconnect();
  const { web3Mode } = useLocalstorage();
  const chainIdEOA = useChainId();
  const { setNetworkId, currentNetworkChainId } = useNetworkContext();
  const [lastChainId, setLastChainId] = useState(defaultChainId);

  useEffect(() => {
    if (address) {
      const chainId =
        web3Mode === "EOA"
          ? SUPPORTED_CHAINS[chainIdEOA] || defaultChainId
          : SUPPORTED_CHAINS[chainIdSCA] || defaultChainId;
      setLastChainId(currentNetworkChainId);
      setNetworkId(chainId);
    } else {
      setNetworkId(defaultChainId);
    }
  }, [chainIdEOA, chainIdSCA]);

  return {
    address: web3Mode === "SCA" ? scaAddress : address,
    isConnected: web3Mode === "SCA" ? isLoggedIn : isConnected,
    connect: web3Mode === "SCA" ? connect : openConnectModal,
    disconnect: web3Mode === "SCA" ? logout : disconnect,
    signer: web3Mode === "SCA" ? provider : signer,
    isEOA: web3Mode === "SCA",
    connect_sca: connect,
    connect_eoa: openConnectModal,
    chainId: web3Mode === "EOA" ? chainIdEOA : chainIdSCA,
    lastChainId: lastChainId,
  };
}
