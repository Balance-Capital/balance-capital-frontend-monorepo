import { useCallback, useEffect, useState } from "react";

import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { CLIENT_ID, WEB3AUTH_NETWORK, ALCHEMY_RPC_URL } from "../core/constants/aa";
import { OpenloginAdapter, OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
import { createWalletClient, custom } from "viem";

// Adapters
import {
  WalletConnectV2Adapter,
  getWalletConnectV2Settings,
} from "@web3auth/wallet-connect-v2-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { Address } from "viem";
import { SmartAccountSigner, WalletClientSigner } from "@alchemy/aa-core";
import { useAlchemyProvider } from "./useAlchemyProvider";
import { EXPLORER_LINKS } from "../core/constants/network";
import { networks } from "@fantohm/shared-web3";
import { useNetworkContext } from "../context/NetworkContext";

// a viem wallet client that wraps web3auth for utility methods
// NOTE: this isn't necessary since you can just use the `web3auth.rpcProvider`
// directly, but this makes things much easier

// a smart account signer you can use as an owner on ISmartContractAccount

export const useWeb3Auth = () => {
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>();
  const [ownerAddress, setOwnerAddress] = useState<Address>();
  const [scaAddress, setScaAddress] = useState<Address>();
  const [username, setUsername] = useState<string>();

  const { currentNetworkChainId } = useNetworkContext();

  // see https://web3auth.io/docs/quick-start for more info
  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: CLIENT_ID,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: `0x${currentNetworkChainId.toString(16)}`,
            rpcTarget: ALCHEMY_RPC_URL,
            displayName: networks[currentNetworkChainId].name,
            blockExplorer: EXPLORER_LINKS[currentNetworkChainId],
            ticker: "ETH",
            tickerName: networks[currentNetworkChainId].name,
          },
          // uiConfig refers to the whitelabeling options, which is available only on Growth Plan and above
          // Please remove this parameter if you're on the Base Plan
          // uiConfig: {
          //   appName: "Ryze AA Test",
          //   // appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
          //   theme: {
          //     primary: "red",
          //   },
          //   mode: "dark",
          //   logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
          //   logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
          //   defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
          //   loginGridCol: 3,
          //   primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
          // },
          authMode: "DAPP",
          uiConfig: {},
          // @ts-ignore
          web3AuthNetwork: WEB3AUTH_NETWORK,
        });

        await registerAdapters(web3auth);

        setWeb3Auth(web3auth);

        await web3auth.initModal();

        if (web3auth.connected && web3auth.provider) {
          setIsLoggedIn(true);
          setupSigner(web3auth, web3auth.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  async function registerAdapters(web3auth: Web3Auth) {
    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: "optional",
      },
      adapterSettings: {
        uxMode: "popup", // "redirect" | "popup"
        whiteLabel: {
          logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
          logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
          defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
          mode: "dark", // whether to enable dark, light or auto mode. defaultValue: auto [ system theme]
        },
        mfaSettings: {
          deviceShareFactor: {
            enable: true,
            priority: 1,
            mandatory: true,
          },
          backUpShareFactor: {
            enable: true,
            priority: 2,
            mandatory: false,
          },
          socialBackupFactor: {
            enable: true,
            priority: 3,
            mandatory: false,
          },
          passwordFactor: {
            enable: true,
            priority: 4,
            mandatory: false,
          },
        },
      },
    });
    web3auth.configureAdapter(openloginAdapter);

    // plugins and adapters are optional and can be added as per your requirement
    // read more about plugins here: https://web3auth.io/docs/sdk/web/plugins/

    // read more about adapters here: https://web3auth.io/docs/sdk/pnp/web/adapters/

    // adding wallet connect v2 adapter
    const defaultWcSettings = await getWalletConnectV2Settings(
      "eip155",
      [1],
      "04309ed1007e77d1f119b85205bb779d"
    );
    const walletConnectV2Adapter = new WalletConnectV2Adapter({
      adapterSettings: { ...defaultWcSettings.adapterSettings },
      loginSettings: { ...defaultWcSettings.loginSettings },
    });

    web3auth.configureAdapter(walletConnectV2Adapter);

    // adding metamask adapter
    const metamaskAdapter = new MetamaskAdapter({
      clientId: CLIENT_ID,
      sessionTime: 3600, // 1 hour in seconds
      // @ts-ignore
      web3AuthNetwork: WEB3AUTH_NETWORK,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: `0x${currentNetworkChainId.toString(16)}`,
        rpcTarget: ALCHEMY_RPC_URL, // This is the public RPC we have added, please pass on your own endpoint while creating an app
        blockExplorer: EXPLORER_LINKS[currentNetworkChainId],
      },
    });

    // it will add/update  the metamask adapter in to web3auth class
    web3auth.configureAdapter(metamaskAdapter);
  }

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [web3AuthSigner, setWeb3AuthSigner] = useState<SmartAccountSigner>();
  const { provider, connectProviderToAccount, disconnectProviderFromAccount } =
    useAlchemyProvider();

  const login = useCallback(async () => {
    if (!web3auth) {
      console.log("Web3auth not initialized");
      return;
    }

    const web3AuthProvider = await web3auth.connect();

    if (web3AuthProvider) {
      setupSigner(web3auth, web3AuthProvider);
      setIsLoggedIn(true);
    }
  }, [web3auth, connectProviderToAccount, provider]);

  const setupSigner = async (web3auth: Web3Auth, provider: IProvider) => {
    const web3authClient = createWalletClient({
      transport: custom(provider),
    });

    const web3authSigner: SmartAccountSigner = new WalletClientSigner(
      web3authClient,
      "web3auth" // signerType
    );

    setWeb3AuthSigner(web3authSigner);

    const alchemyProvider = connectProviderToAccount(web3authSigner);
    const user = await web3auth.getUserInfo();
    setUsername(user.name || user.email);
    setScaAddress(await alchemyProvider.getAddress());
  };

  const logout = useCallback(async () => {
    if (!web3auth) {
      throw new Error("Web3auth not initialized");
    }

    try {
      console.log("logout start");
      await web3auth.logout();
      disconnectProviderFromAccount();
      console.log("logout end");
    } finally {
      setIsLoggedIn(false);
      setUsername(undefined);
      setOwnerAddress(undefined);
      setScaAddress(undefined);
    }
  }, [web3auth, disconnectProviderFromAccount]);

  return {
    web3auth,
    login,
    logout,
    username,
    ownerAddress,
    scaAddress,
    isLoggedIn,
    provider,
  };
};
