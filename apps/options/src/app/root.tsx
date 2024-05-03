import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import store from "./store";
import { ApolloProvider } from "@apollo/client";
import { clientInstance } from "./core/apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { LoadingProvider } from "./components/LoadingBoundary/LoadingBoundary";
import { SnackbarProvider } from "notistack";
import {
  Notify_Duration,
  StyledMaterialDesignContent,
} from "./core/constants/notification";
import BetResultAlert from "./components/alerts/bet-result-alert";
import AlertIcon from "./components/alerts/alert-icon";
import { ethereumClient, projectId, wagmiClient } from "./core/constants/wagmi-config";
import { WagmiConfig } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import { AAContextProvider } from "./context/AAContext";
import { ThemeProvider, useTheme } from "./context/ThemeProvider";
import { NetworkContextProvider } from "./context/NetworkContext";

const walletIds = {
  metamask: "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
  coinbase: "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",
  unstoppableDomains: "8308656f4548bb81b3508afe355cfbb7f0cb6253d1cc7f998080601f838ecee3",
};

const WagmiRoot = (): JSX.Element => {
  const { isDarkMode } = useTheme();
  return (
    <WagmiConfig client={wagmiClient}>
      <LoadingProvider>
        <SnackbarProvider
          autoHideDuration={Notify_Duration}
          Components={{
            success: StyledMaterialDesignContent,
            error: StyledMaterialDesignContent,
            warning: StyledMaterialDesignContent,
            info: StyledMaterialDesignContent,
            betResult: BetResultAlert,
          }}
          iconVariant={{
            error: <AlertIcon variant="error" />,
            success: <AlertIcon variant="success" />,
            info: <AlertIcon variant="info" />,
            warning: <AlertIcon variant="warning" />,
          }}
        >
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </SnackbarProvider>
      </LoadingProvider>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode={isDarkMode ? "dark" : "light"}
        explorerRecommendedWalletIds={[
          walletIds.metamask,
          walletIds.coinbase,
          walletIds.unstoppableDomains,
        ]}
        themeVariables={{
          "--w3m-background-color": "#12B3A8",
          "--w3m-accent-color": "#12B3A8",
        }}
      />
    </WagmiConfig>
  );
};

const Root = (): JSX.Element => {
  return (
    <ThemeProvider>
      <NetworkContextProvider>
        <Provider store={store}>
          <ApolloProvider client={clientInstance()}>
            <AAContextProvider>
              <WagmiRoot />
            </AAContextProvider>
          </ApolloProvider>
        </Provider>
      </NetworkContextProvider>
    </ThemeProvider>
  );
};

export default Root;
