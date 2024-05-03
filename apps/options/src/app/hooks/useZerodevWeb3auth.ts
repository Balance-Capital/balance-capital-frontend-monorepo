import { useState, useMemo, useEffect, useCallback } from "react";
import { ECDSAProvider } from "@zerodev/sdk";
import { getRPCProviderOwner } from "@zerodev/sdk";
import { Address } from "viem";
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  WalletConnectV2Adapter,
  getWalletConnectV2Settings,
} from "@web3auth/wallet-connect-v2-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { EXPLORER_LINKS } from "../core/constants/network";
import {
  ALCHEMY_RPC_URL,
  CLIENT_ID,
  WEB3AUTH_NETWORK,
  WEB3AUTH_SETTINGS,
  ZERODEV_PROJECT_ID,
} from "../core/constants/aa";
import { chains, networks } from "@fantohm/shared-web3";
import { Web3Auth } from "@web3auth/modal";
import { useNetworkContext } from "../context/NetworkContext";

export function useZeroDevWeb3auth() {
  const [ownerAddress, setOwnerAddress] = useState<Address>();
  const [scaAddress, setScaAddress] = useState<Address>();
  const [username, setUsername] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ECDSAProvider>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>();
  const { currentNetworkChainId } = useNetworkContext();
  const [currentChainId, setCurrentChainId] = useState<number>(currentNetworkChainId);

  const setWallet = async (provider: any, chainId: number) => {
    const ecdsaProvider = await ECDSAProvider.init({
      projectId: WEB3AUTH_SETTINGS[chainId].ZERODEV_PROJECT_ID,
      owner: await getRPCProviderOwner(provider),
      opts: {
        paymasterConfig: {
          policy: "TOKEN_PAYMASTER",
          gasToken: "TEST_ERC20",
        },
      },
    });
    console.log(ecdsaProvider.rpcClient.chain);
    setScaAddress(await ecdsaProvider.getAddress());
    setProvider(ecdsaProvider);
  };

  const switchNetwork = async (chainId: number) => {
    await logout();
    init(chainId);

    await login(chainId);
  };

  const init = async (chainId: number) => {
    try {
      const web3auth = new Web3Auth({
        clientId: WEB3AUTH_SETTINGS[chainId]?.WEB3AUTH_CLIENT_ID,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: `0x${chainId.toString(16)}`,
          rpcTarget: chains[chainId].rpcUrls?.[0],
          displayName: chains[chainId]?.networkName,
          blockExplorer: chains[chainId]?.[0],
          ticker: chains[chainId]?.symbol,
          tickerName: chains[chainId]?.symbol,
        },
        uiConfig: {
          appName: "Ryze",
          appUrl: "https://ryze.fi",
          mode: "dark",
          logoDark: "android-icon-36x36.png",
          theme: {
            primary: "#12b3a8",
          },
        },
        authMode: "DAPP",
        // @ts-ignore
        web3AuthNetwork: WEB3AUTH_NETWORK,
      });

      setWeb3Auth(web3auth);
      await registerAdapters(web3auth);

      await web3auth.initModal({
        modalConfig: {
          [WALLET_ADAPTERS.OPENLOGIN]: {
            label: "openlogin",
            loginMethods: {
              facebook: {
                name: "facebook",
                showOnModal: false,
              },
              weibo: {
                name: "weibo",
                showOnModal: false,
              },
              wechat: {
                name: "wechat",
                showOnModal: false,
              },
            },
          },
          [WALLET_ADAPTERS.TORUS_EVM]: {
            label: "torus_evm",
            loginMethods: {
              torus_evm: {
                name: "torus_evm",
                showOnModal: false,
              },
            },
          },
        },
      });

      if (web3auth.connected && web3auth.provider) {
        setIsLoggedIn(true);
        setWallet(web3auth.provider, chainId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init(currentNetworkChainId);
  }, []);

  async function registerAdapters(web3auth: Web3Auth) {
    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: "optional",
      },
      adapterSettings: {
        uxMode: "popup", // "redirect" | "popup"
        whiteLabel: {
          appName: "Ryze.fi",
          appUrl: "https://ryze.fi",
          logoLight: "android-icon-36x36.png",
          logoDark: "android-icon-36x36.png",
          defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
          mode: "dark", // whether to enable dark, light or auto mode. defaultValue: auto [ system theme]
        },
      },
    });
    web3auth.configureAdapter(openloginAdapter);
  }

  const logout = useCallback(async () => {
    if (!web3auth || !provider) {
      console.log("logout: Web3auth not initialized");
      return;
    }

    await web3auth.logout();
    provider.disconnect();
    setScaAddress(undefined);
    setIsLoggedIn(false);
  }, [web3auth, provider]);

  const login = useCallback(
    async (chainId: number = currentNetworkChainId) => {
      if (!web3auth) {
        console.log("login: Web3auth not initialized");
        return;
      }
      setLoading(true);
      web3auth
        .connect()
        .then((provider) => {
          setWallet(provider, chainId);
          setLoading(false);
          setIsLoggedIn(true);
          setCurrentChainId(chainId);
        })
        .catch(console.log)
        .finally(() => {
          setLoading(false);
        });
    },
    [web3auth]
  );

  return {
    web3auth,
    login,
    logout,
    username,
    scaAddress,
    isLoggedIn,
    provider,
    switchNetwork,
    chainId: currentChainId,
  };
}
