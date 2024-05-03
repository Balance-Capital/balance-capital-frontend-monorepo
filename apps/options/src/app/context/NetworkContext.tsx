import React, { createContext, useContext, ReactNode } from "react";
import { NetworkIds } from "@fantohm/shared-web3";

export const currentNetworkChain = {
  id:
    process.env["NX_BINARY_CHAIN_MODE"] === "testnet"
      ? NetworkIds.GoerliArbitrum
      : NetworkIds.Arbitrum,
};

interface NetworkContextType {
  currentNetworkChainId: number;
  setNetworkId: (id: number) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentNetworkChainId, setCurrentNetworkChainId] = React.useState<number>(
    process.env["NX_BINARY_CHAIN_MODE"] === "testnet"
      ? NetworkIds.GoerliArbitrum
      : NetworkIds.Arbitrum
  );

  const setNetworkId = (id: number) => {
    currentNetworkChain.id = id;
    setCurrentNetworkChainId(id);
  };

  const contextValue: NetworkContextType = {
    currentNetworkChainId,
    setNetworkId,
  };

  return (
    <NetworkContext.Provider value={contextValue}>{children}</NetworkContext.Provider>
  );
};

export const useNetworkContext = (): NetworkContextType => {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetworkContext must be used within a NetworkContextProvider");
  }

  return context;
};
