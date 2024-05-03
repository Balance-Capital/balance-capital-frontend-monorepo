import { useMemo } from "react";

import {
  getUnderlyingTokenContract,
  getMarketManagerContract,
  getVaultManagerContract,
} from "../helpers/contractHelpers";
import { loadEnvVariable } from "../core/constants/network";
import { Underlying_Token } from "../core/constants/basic";
import { useSigner } from "wagmi";
import { useAccount } from "./useAccount";
import { useNetworkContext } from "../context/NetworkContext";

export const useUnderlyingTokenContract = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const { currentNetworkChainId } = useNetworkContext();
  return useMemo(
    () =>
      getUnderlyingTokenContract(
        Underlying_Token[currentNetworkChainId].address,
        signer ? signer : undefined
      ),
    [signer, address, currentNetworkChainId]
  );
};

export const useMarketManagerContract = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();
  return useMemo(
    () =>
      getMarketManagerContract(
        loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_MANAGER_ADDRESS`),
        signer ? signer : undefined
      ),
    [signer, address, currentNetworkChainId]
  );
};

export const useVaultManagerContract = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();
  return useMemo(
    () =>
      getVaultManagerContract(
        loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_MANAGER_ADDRESS`),
        signer ? signer : undefined
      ),
    [signer, address, currentNetworkChainId]
  );
};
