"use client";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, createWalletClient, custom } from "viem";
import { useZeroDevWeb3auth } from "../hooks/useZerodevWeb3auth";
import { ECDSAProvider } from "@zerodev/sdk";
import { defaultChainId } from "../core/constants/network";

type AAContextProps = {
  // Functions
  login: () => Promise<void>;
  logout: () => Promise<void>;

  // Properties
  provider: ECDSAProvider | undefined;
  ownerAddress?: Address;
  scaAddress?: Address;
  username?: string;
  isLoggedIn: boolean;
  chainId: number;
};

const defaultUnset: any = null;
const AAContext = createContext<AAContextProps>({
  // Default Values
  provider: defaultUnset,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoggedIn: defaultUnset,
  chainId: defaultChainId,
});

export const useAAContext = () => useContext(AAContext);

export const AAContextProvider = ({ children }: { children: ReactNode }) => {
  // const { web3auth, login, logout, ownerAddress, scaAddress, username, isLoggedIn, provider } = useWeb3Auth();
  const { web3auth, login, logout, scaAddress, username, isLoggedIn, provider, chainId } =
    useZeroDevWeb3auth();

  return (
    <AAContext.Provider
      value={{
        login,
        logout,
        isLoggedIn,
        provider,
        scaAddress,
        username,
        chainId,
      }}
    >
      {children}
    </AAContext.Provider>
  );
};
