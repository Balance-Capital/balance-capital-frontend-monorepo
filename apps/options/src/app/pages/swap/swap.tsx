import { Box } from "@material-ui/core";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Asset,
  EvmTransaction,
  StatusRequest,
  StatusResponse,
  SwapRequest,
  SwapResponse,
  Token,
  TransactionStatus,
} from "rango-sdk-basic";
import { DebugHelper } from "@fantohm/shared-helpers";
import { CircularProgress, SvgIcon } from "@mui/material";
import { Settings, LocalGasStation, Schedule } from "@mui/icons-material";
import queryString from "query-string";

import BestRoute from "./BestRoute";
import FromTokenSection from "./FromTokenSection";
import ToTokenSection from "./ToTokenSection";
import NetworkModal from "./modals/NetworkModal";
import TokenModal from "./modals/TokenModal";
import SlippageModal from "./modals/SlippageModal";
import { swapNetworks, modalType, NetworkDetail } from "./data";
import {
  ESTIMATED_GAS_LIMIT,
  GAS_MULTIPLIER,
  REFERRER_ADDRESS,
  REFERRER_FEE,
  rangoClient,
} from "./rango";
import {
  formatAmount,
  expectSwapErrors,
  setIsDexLoading,
  formatSwapTime,
  sleep,
} from "./helpers/swap";
import useDebounce from "./hooks/Debounce";
import { RootState } from "../../store";
import { enqueueSnackbar } from "notistack";
import { BigNumber, ethers } from "ethers";
import { getExplorerURL, formatCurrency, trim, getProvider } from "./helpers";
import { NotifyType } from "../../core/constants/notification";
import "./swap.scss";
import { useChainId, useSigner } from "wagmi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PageTitles,
  emitSwapConfirmSwapClickedTrack,
  emitSwapPreSwapClickedTrack,
} from "../../helpers/analytics";
import useWeb3CustomModal from "../../hooks/useWeb3CustomModal";
import { useAccount } from "../../hooks/useAccount";
import useSwitchNetwork from "../../hooks/useSwitchNetwork";
import NoUsdcBar from "./NoUsdcBar";
import { formatUtoken } from "../../helpers/data-translations";

export type TokenWithAmount = Token & { amount: number };

function Swap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { switchNetwork } = useSwitchNetwork();
  const { address, chainId } = useAccount();
  const openConnectModal = useWeb3CustomModal();
  const [val, setVal] = useState(1);
  const { data: signer } = useSigner();
  const [toggle, setToggle] = useState(0);
  const [swapStatus, setSwapStatus] = useState<StatusResponse>();

  const [fromNetworkModalOpen, setFromNetworkModalOpen] = useState(false);
  const [fromTokenModalOpen, setFromTokenModalOpen] = useState(false);
  const [fromNetwork, setFromNetwork] = useState<NetworkDetail>();
  const [fromTokenList, setFromTokenList] = useState<TokenWithAmount[]>([]);
  const [fromSearchTokenList, setFromSearchTokenList] = useState<TokenWithAmount[]>([]);
  const [fromToken, setFromToken] = useState<TokenWithAmount>();
  const [fromTokenAmount, setFromTokenAmount] = useState("");
  const fromTokenAmountDebounce = useDebounce(fromTokenAmount, 1000);

  const [toNetworkModalOpen, setToNetworkModalOpen] = useState(false);
  const [toTokenModalOpen, setToTokenModalOpen] = useState(false);
  const [toNetwork, setToNetwork] = useState<NetworkDetail>();
  const [toTokenList, setToTokenList] = useState<TokenWithAmount[]>([]);
  const [toSearchTokenList, setToSearchTokenList] = useState<TokenWithAmount[]>([]);
  const [toToken, setToToken] = useState<TokenWithAmount>();
  const [toTokenAmount, setToTokenAmount] = useState("");

  const [initialized, setInitialized] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [fromUpdateTokenLoading, setFromUpdateTokenLoading] = useState(false);
  const [toUpdateTokenLoading, setToUpdateTokenLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [bestRoute, setBestRoute] = useState<
    (SwapResponse & { amount: string; request: SwapRequest }) | null
  >(null);
  const lastPromise = useRef<
    Promise<{
      route: SwapResponse & { amount: string; request: SwapRequest };
      reason: string;
    } | null>
  >();

  const [slippage, setSlippage] = useState(1);
  const [showSlippageSetting, setShowSlippageSetting] = useState(false);

  const [swapRequest, setSwapRequest] = useState<StatusRequest | null>(null);
  const [reason, setReason] = useState("");

  const metaData = useSelector((state: RootState) => {
    return state?.swap?.value;
  });
  const balance = useSelector((state: RootState) =>
    state.account.uTokenBalance
      ? formatUtoken(BigNumber.from(state.account.uTokenBalance))
      : -1
  );

  const changeNetworks = async (chainId: number) => {
    if (switchNetwork) {
      try {
        await switchNetwork(chainId);
        enqueueSnackbar("Network Switched", { variant: NotifyType.SUCCESS });
      } catch (e) {
        const message =
          "Unable to switch networks. Please change network using provider.";
        enqueueSnackbar(message, {
          variant: NotifyType.ERROR,
        });
      }
    }
  };

  // useEffect(() => {
  //   if (fromNetwork && chainId !== fromNetwork.chainId) {
  //     changeNetworks(fromNetwork.chainId);
  //   }
  // }, [fromNetwork]);

  const outOfService = (chainName: string) => {
    enqueueSnackbar(`Swap on ${chainName} chain is currently out of service.`, {
      variant: NotifyType.INFO,
    });
  };

  const isSwappable = useCallback(() => {
    return (
      !routeLoading &&
      !reason &&
      Number(
        formatAmount(
          fromToken?.amount,
          fromToken?.decimals,
          fromToken?.decimals,
          fromToken?.symbol
        ) || 0
      ) >= Number(fromTokenAmount || 0) &&
      bestRoute &&
      bestRoute?.route &&
      expectSwapErrors(bestRoute).length === 0
    );
  }, [fromToken, fromTokenAmount, routeLoading, reason, bestRoute]);

  const initialize = async () => {
    if (!metaData) {
      return;
    }
    setInitialLoading(true);

    const fromNetworkSearch = swapNetworks.find(
      (item) => item.blockchain === searchParams.get("fromNetwork")
    );

    let _fromNetwork = swapNetworks.find((item) => item.chainId === chainId);
    if (fromNetworkSearch) {
      _fromNetwork = fromNetworkSearch;
    }

    if (!_fromNetwork) {
      _fromNetwork = swapNetworks[0];
    }

    if (fromNetwork?.chainId != _fromNetwork?.chainId) {
      setFromNetwork(_fromNetwork);
      if (_fromNetwork) {
        await fromNetworkDetails(_fromNetwork);
      } else {
        setFromTokenList([]);
        setFromSearchTokenList([]);
        setFromToken(undefined);
      }
    }

    const toNetworkSearch = swapNetworks.find(
      (item) => item.blockchain === searchParams.get("toNetwork")
    );

    let _toNetwork = swapNetworks.find((item) => item.chainId === 42161);
    if (toNetworkSearch) {
      _toNetwork = toNetworkSearch;
    }
    if (!_toNetwork) {
      _toNetwork = swapNetworks[0];
    }
    if (toNetwork?.chainId != _toNetwork?.chainId) {
      setToNetwork(_toNetwork);
      if (_toNetwork) {
        await toNetworkDetails(_toNetwork);
      } else {
        setToTokenList([]);
        setToSearchTokenList([]);
        setToToken(undefined);
      }
    }

    setInitialLoading(false);
    setInitialized(true);
  };

  const setMaxFromTokenAmount = () => {
    if (fromToken) {
      if (!fromToken.address) {
        const provider = getProvider(Number(fromToken.chainId));
        if (provider) {
          provider.getGasPrice().then((price) => {
            const gas = price.mul(ESTIMATED_GAS_LIMIT).mul(GAS_MULTIPLIER).div(100);

            setFromTokenAmount(
              formatAmount(
                fromToken.amount > Number(gas) ? fromToken.amount - Number(gas) : 0,
                fromToken.decimals,
                fromToken.decimals,
                fromToken.symbol
              ).toString()
            );
          });

          return;
        }
      } else {
        setFromTokenAmount(
          formatAmount(
            fromToken.amount,
            fromToken.decimals,
            fromToken.decimals,
            fromToken.symbol
          ).toString()
        );
      }
    }
  };

  const opeNetworkModal = (type: string) => {
    if (type === modalType.from) {
      setFromNetworkModalOpen(true);
    } else {
      setToNetworkModalOpen(true);
    }
  };

  const closeAllModal = () => {
    setFromNetworkModalOpen(false);
    setToNetworkModalOpen(false);
    setFromTokenModalOpen(false);
    setToTokenModalOpen(false);
  };

  const openTokenModal = (type: string) => {
    if (type === modalType.from) {
      fromTokenList.length > 0 && setFromTokenModalOpen(true);
    } else {
      toTokenList.length > 0 && setToTokenModalOpen(true);
    }
  };

  const closeNetworkModal = async (type: string, network: NetworkDetail | null) => {
    closeAllModal();
    if (!network) {
      return;
    }
    if (type === modalType.from) {
      setFromNetwork(network);
      // if (network && chainId !== network.chainId) {
      //   await changeNetworks(network.chainId);
      // }
    } else {
      setToNetwork(network);
    }
    setBestRoute(null);
  };

  const closeTokenModal = (type: string, token: TokenWithAmount | null) => {
    closeAllModal();
    if (!token) {
      return;
    }
    if (type === modalType.from) {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setToTokenAmount("");
    setBestRoute(null);
  };

  const changeTokenModalList = (name: string, type: string) => {
    if (type === modalType.from) {
      const list = fromTokenList.filter(
        (token) =>
          token.symbol.toLowerCase().indexOf(name.toLowerCase()) >= 0 ||
          token.address?.toLowerCase() === name.toLowerCase()
      );
      setFromSearchTokenList(list);
    } else {
      const list = toTokenList.filter(
        (token) =>
          token.symbol.toLowerCase().indexOf(name.toLowerCase()) >= 0 ||
          token.address?.toLowerCase() === name.toLowerCase()
      );
      setToSearchTokenList(list);
    }
  };

  const switchTokens = () => {
    setFromNetwork(toNetwork);
    setToNetwork(fromNetwork);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromTokenAmount(toTokenAmount);
  };

  const fromNetworkDetails = async (fromNetwork: NetworkDetail) => {
    if (!metaData) {
      return;
    }
    let fromTokenList = metaData.tokens
      .filter((token: Token) => token?.blockchain === fromNetwork?.blockchain)
      .map((token) => {
        return { ...token, amount: 0 };
      });
    if (!address) {
      setFromTokenList(fromTokenList);
      setFromSearchTokenList(fromTokenList);
      setFromToken(fromTokenList[0]);
      return;
    }
    setFromUpdateTokenLoading(true);
    const walletDetails = await rangoClient.balance({
      blockchain: fromNetwork?.blockchain,
      address: address,
    });
    walletDetails.wallets.forEach((wallet) => {
      if (wallet.balances) {
        wallet.balances.forEach((balance) => {
          const index = fromTokenList.findIndex(
            (token) => token.address === balance?.asset?.address
          );
          if (index >= 0) {
            fromTokenList[index].amount = Number(balance?.amount.amount) || 0;
          }
        });
      } else {
        outOfService(wallet.blockChain);
      }
    });
    fromTokenList = fromTokenList.sort((a, b) => {
      const amountA = Number(
        formatAmount(a.amount, a.decimals, a.decimals, a.symbol) * (a.usdPrice || 0)
      );
      const amountB = Number(
        formatAmount(b.amount, b.decimals, b.decimals, b.symbol) * (b.usdPrice || 0)
      );
      if (amountA !== amountB) {
        return amountB - amountA;
      }
      if (!a.address) {
        return -1;
      }
      if (!b.address) {
        return 1;
      }
      if (a.symbol === "USDC") {
        return -1;
      }
      if (b.symbol === "USDC") {
        return 1;
      }
      if (a.isPopular !== b.isPopular) {
        if (a.isPopular) {
          return -1;
        }
        if (b.isPopular) {
          return 1;
        }
      }
      return a.symbol > b.symbol ? 1 : -1;
    });
    setFromTokenList(fromTokenList);
    setFromSearchTokenList(fromTokenList);
    if (fromToken?.blockchain !== fromNetwork.blockchain) {
      const fromTokenSearch = fromTokenList.find(
        (item) =>
          (searchParams.get("fromToken") ==
            "0x0000000000000000000000000000000000000000" &&
            !item.address) ||
          (item.address &&
            item.address?.toLowerCase() == searchParams.get("fromToken")?.toLowerCase())
      );
      if (fromTokenSearch) {
        setFromToken(fromTokenSearch);
      } else {
        setFromToken(
          fromTokenList.find((item) => item.amount > 0 && !item.address) ||
            fromTokenList[0]
        );
      }
    } else {
      setFromToken(
        fromTokenList.find((item) => item.address === fromToken.address) ||
          fromTokenList.find((item) => item.amount > 0 && !item.address) ||
          fromTokenList[0]
      );
    }
    setFromUpdateTokenLoading(false);
  };

  const toNetworkDetails = async (toNetwork: NetworkDetail) => {
    if (!metaData) {
      return;
    }
    let toTokenList = metaData.tokens
      .filter((token) => token.blockchain === toNetwork?.blockchain)
      .map((token) => {
        return { ...token, amount: 0 };
      });
    if (!address) {
      setToTokenList(toTokenList);
      setToSearchTokenList(toTokenList);
      if (fromNetwork && fromNetwork?.blockchain === toNetwork?.blockchain) {
        setToToken(toTokenList[1]);
      } else {
        setToToken(toTokenList[0]);
      }
      return;
    }
    setToUpdateTokenLoading(true);
    const walletDetails = await rangoClient.balance({
      blockchain: toNetwork?.blockchain,
      address: address,
    });
    walletDetails.wallets.forEach((wallet) => {
      if (wallet.balances) {
        wallet.balances.forEach((balance) => {
          const index = toTokenList.findIndex(
            (token) => token.address === balance?.asset?.address
          );
          if (index >= 0) {
            toTokenList[index].amount = Number(balance?.amount.amount) || 0;
          }
        });
      } else {
        outOfService(wallet.blockChain);
      }
    });
    toTokenList = toTokenList.sort((a, b) => {
      const amountA = Number(
        formatAmount(a.amount, a.decimals, a.decimals, a.symbol) * (a.usdPrice || 0)
      );
      const amountB = Number(
        formatAmount(b.amount, b.decimals, b.decimals, b.symbol) * (b.usdPrice || 0)
      );
      if (amountA !== amountB) {
        return amountB - amountA;
      }
      if (!a.address) {
        return -1;
      }
      if (!b.address) {
        return 1;
      }
      if (a.symbol === "USDC") {
        return -1;
      }
      if (b.symbol === "USDC") {
        return 1;
      }
      if (a.isPopular !== b.isPopular) {
        if (a.isPopular) {
          return -1;
        }
        if (b.isPopular) {
          return 1;
        }
      }
      return a.symbol > b.symbol ? 1 : -1;
    });
    setToTokenList(toTokenList);
    setToSearchTokenList(toTokenList);
    if (toToken?.blockchain !== toNetwork.blockchain) {
      const toTokenSearch = toTokenList.find(
        (item) =>
          (searchParams.get("toToken") === "0x0000000000000000000000000000000000000000" &&
            !item.address) ||
          (item.address &&
            item.address?.toLowerCase() == searchParams.get("toToken")?.toLowerCase())
      );
      if (toTokenSearch) {
        setToToken(toTokenSearch);
      } else {
        if (fromNetwork && fromNetwork?.blockchain === toNetwork?.blockchain) {
          setToToken(
            toTokenList.find(
              (item) => item.symbol === "USDC" && item.address != fromToken?.address
            ) || toTokenList.find((item) => item.address != fromToken?.address)
          );
        } else {
          setToToken(
            toTokenList.find(
              (item) => item.symbol === "USDC" && item.address != fromToken?.address
            ) || toTokenList[0]
          );
        }
      }
    } else {
      setToToken(
        toTokenList.find((item) => item.address === toToken.address) ||
          toTokenList.find(
            (item) => item.symbol === "USDC" && item.address != fromToken?.address
          ) ||
          toTokenList.find((item) => item.address != fromToken?.address)
      );
    }
    setToUpdateTokenLoading(false);
  };

  const calculateBestRoute = async (): Promise<{
    route: SwapResponse & { amount: string; request: SwapRequest };
    reason: string;
  } | null> => {
    if (
      !fromNetwork ||
      !toNetwork ||
      !fromToken ||
      !toToken ||
      !fromTokenAmount ||
      !address ||
      fromUpdateTokenLoading ||
      toUpdateTokenLoading
    ) {
      return null;
    }

    const from: Asset = {
      blockchain: fromToken?.blockchain,
      symbol: fromToken?.symbol,
      address: fromToken?.address,
    };
    const to: Asset = {
      blockchain: toToken?.blockchain,
      symbol: toToken?.symbol,
      address:
        toToken?.address == null ? toToken?.address : toToken?.address?.toLowerCase(),
    };

    let swapRequest = {
      from,
      to,
      amount: ethers.utils
        .parseUnits(
          Number(fromTokenAmount).toFixed(fromToken.decimals),
          fromToken.decimals
        )
        .toString(),
      slippage: "10",
      disableEstimate: false,
      fromAddress: address,
      toAddress: address,
    } as SwapRequest;
    if (from.symbol != "USDC" || to.symbol != "USDC") {
      swapRequest = {
        ...swapRequest,
        referrerAddress: REFERRER_ADDRESS,
        referrerFee: REFERRER_FEE,
      };
    }
    if (
      from.address === "0xaf88d065e77c8cc2239327c5edb3a432268e5831" &&
      to.address === "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
    ) {
      swapRequest = {
        ...swapRequest,
        referrerAddress: REFERRER_ADDRESS,
        referrerFee: "1",
      };
    }

    let routes = [];
    try {
      routes = await Promise.all(
        [2, 2.5, 5, 10, 15, 20, 30]
          .filter((item) => item > slippage)
          .map((item) => {
            return rangoClient
              .swap({
                ...swapRequest,
                slippage: item.toString(),
              })
              .then((res) => {
                return {
                  ...res,
                  amount: swapRequest.amount,
                  request: {
                    ...swapRequest,
                    slippage: item.toString(),
                  },
                };
              });
          })
      );
    } catch (e) {
      return null;
    }
    const routeWithHighSlippage = routes.find((item) => !!item.route);

    try {
      swapRequest.slippage = slippage.toString();
      const route = await rangoClient.swap(swapRequest);

      if (
        !route.route &&
        routeWithHighSlippage?.route &&
        routeWithHighSlippage.route?.path?.length
      ) {
        return {
          route: routeWithHighSlippage,
          reason: "Try to increase your slippage",
        };
      }
      let reasonString = "";
      if (route.error === "Your input amount might be too low!") {
        reasonString = route.error;
      }
      if (!fromToken.address) {
        const gasFee = route.route?.fee.find(
          (item) => item.name === "Network Fee" && !item.token.address
        );
        if (gasFee) {
          if (
            (fromToken.amount - Number(gasFee.amount)) /
              Math.pow(10, fromToken.decimals) <
            Number(fromTokenAmount)
          ) {
            reasonString = "You don't have enough to pay network fee";
          }
        }
      }
      if (route.route?.path?.length) {
        route.route.path = route.route.path.map((swap) => {
          return {
            ...swap,
            logo: metaData?.swappers.find((sw) => sw.id === swap.swapper.id)?.logo,
          };
        });
      }
      return {
        route: {
          ...route,
          amount: swapRequest.amount,
          request: swapRequest,
        },
        reason: reasonString,
      };
      // eslint-disable-next-line no-empty
    } catch (e) {}

    return null;
  };

  const getBestRoute = async () => {
    if (
      !fromNetwork ||
      !toNetwork ||
      !fromToken ||
      !toToken ||
      !fromTokenAmount ||
      !address ||
      fromUpdateTokenLoading ||
      toUpdateTokenLoading
    ) {
      return;
    }

    setToTokenAmount("");
    setToTokenAmount("0");
    setBestRoute(null);
    setReason("");

    if (
      fromToken.blockchain === toToken.blockchain &&
      fromToken.address === toToken.address
    ) {
      setReason("Please select another token/network");
      return;
    }

    setRouteLoading(true);

    const currentPromise = calculateBestRoute();

    lastPromise.current = currentPromise;

    currentPromise.then((res) => {
      if (currentPromise === lastPromise.current) {
        setBestRoute(res ? res.route : null);
        if (res && res.route) {
          setToTokenAmount(
            ethers.utils.formatUnits(
              trim(res?.route.route?.outputAmount, 4),
              toToken.decimals
            ) || "0"
          );
        }
        setReason(res ? res.reason : "");
        setRouteLoading(false);
      }
    });
  };

  const swap = async () => {
    if (!bestRoute) {
      return;
    }

    if (!fromToken || !toToken) {
      return;
    }
    setSwapLoading(true);
    setIsDexLoading("true");

    try {
      await executeRoute(bestRoute);
    } catch (e) {
      console.log("error", e);
    } finally {
      setIsDexLoading("false");
    }
  };

  const executeRoute = async (routeResponse: SwapResponse) => {
    if (!routeResponse.route || !signer || !fromNetwork || !toNetwork) {
      return;
    }

    setToggle(1);

    setSwapRequest(null);
    setSwapStatus(undefined);
    try {
      const tx = routeResponse.tx as EvmTransaction;
      if (tx.approveTo && tx.approveData) {
        const transaction = await signer.sendTransaction({
          from: tx.from || "",
          to: tx.approveTo || "",
          data: tx.approveData || "",
          gasLimit: tx.gasLimit || undefined,
          gasPrice: tx.gasPrice ? "0x" + parseInt(tx.gasPrice).toString(16) : undefined,
          maxFeePerGas: tx.maxFeePerGas || undefined,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
        });
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const approvalResponse = await rangoClient.isApproved(
            routeResponse.requestId,
            transaction.hash
          );
          if (approvalResponse.isApproved) {
            break;
          }
          await sleep(3);
        }
      }
    } catch (e) {
      setSwapLoading(false);
      setToggle(3);
      return;
    }

    try {
      const tx = routeResponse.tx as EvmTransaction;
      const transaction = await signer.sendTransaction({
        from: tx.from || "",
        to: tx.txTo || "",
        data: tx.txData || "",
        value: tx.value || undefined,
        gasLimit: tx.gasLimit || undefined,
        gasPrice: tx.gasPrice ? "0x" + parseInt(tx.gasPrice).toString(16) : undefined,
        maxFeePerGas: tx.maxFeePerGas || undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
      });
      const startTime = Math.floor(new Date().getTime() / 1000);
      await transaction.wait();
      const request = {
        requestId: routeResponse.requestId,
        txId: transaction.hash,
      };
      setToggle(2);
      setSwapRequest(request);
      let status;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        status = await rangoClient.status(request);
        if (
          !!status.status &&
          [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(status.status)
        ) {
          break;
        }
        await sleep(3);
      }

      if (address && fromToken && toToken && bestRoute && fromNetwork && toNetwork) {
        emitSwapConfirmSwapClickedTrack(PageTitles.Swap, address, {
          slippage: Number(bestRoute.request.slippage),
          sendingNetwork: fromNetwork.blockchain,
          sendingToken:
            fromToken.symbol + (fromToken.address ? "--" + fromToken.address : ""),
          sendingValue: Number(fromTokenAmount),
          recievingNetwork: toNetwork.blockchain,
          recievingToken:
            toToken.symbol + (toToken.address ? "--" + toToken.address : ""),
          recievingValue: Number(
            status.bridgeData
              ? ethers.utils
                  .formatUnits(
                    status.bridgeData.destTokenAmt ?? "0",
                    status.bridgeData.destTokenDecimals
                  )
                  .toString()
              : ethers.utils
                  .formatUnits(bestRoute.route?.outputAmount ?? "0", toToken.decimals)
                  .toString()
          ),
          estimatedTotalFeeUSD: bestRoute.route?.feeUsd || 0,
          estimatedTOA: startTime + (bestRoute.route?.estimatedTimeInSeconds || 0),
          swapRequestId: request.requestId,
          srcTxId: status.bridgeData?.srcTxHash || "",
          destTxId: status.bridgeData?.destTxHash || "",
          status: TransactionStatus.SUCCESS,
          message: status.error || "",
        });
      }

      setSwapStatus(status);
      if (status.status === TransactionStatus.SUCCESS) {
        setVal(3);
        setSwapLoading(false);
        setToggle(0);
      } else {
        setSwapLoading(false);
        setToggle(3);
      }
    } catch (e) {
      setSwapLoading(false);
      setToggle(3);
      return;
    }
  };

  useEffect(() => {
    DebugHelper.isActive("enable-debug");
    initialize().then();
    setIsDexLoading("false");
  }, [metaData, address, chainId]);

  useEffect(() => {
    if (!fromNetwork || !toNetwork) {
      return;
    }
    fromNetworkDetails(fromNetwork).then();
    toNetworkDetails(toNetwork).then();
  }, [address]);

  useEffect(() => {
    if (!fromNetwork || !initialized) {
      return;
    }
    fromNetworkDetails(fromNetwork).then();
  }, [fromNetwork]);

  useEffect(() => {
    if (!toNetwork || !initialized) {
      return;
    }
    toNetworkDetails(toNetwork).then();
  }, [toNetwork]);

  useEffect(() => {
    if (
      !fromNetwork ||
      !toNetwork ||
      !fromTokenAmount ||
      Number(fromTokenAmount) === 0 ||
      !fromToken ||
      !toToken ||
      !initialized ||
      toUpdateTokenLoading ||
      fromUpdateTokenLoading
    ) {
      setBestRoute(null);
      setToTokenAmount("");
      return;
    }
    getBestRoute();
  }, [
    fromToken,
    toToken,
    fromTokenAmountDebounce,
    fromUpdateTokenLoading,
    toUpdateTokenLoading,
    slippage,
  ]);

  const MINUTE_MS = 5 * 60 * 1000;
  const reload = useCallback(() => {
    if (
      !fromNetwork ||
      !toNetwork ||
      !fromTokenAmount ||
      Number(fromTokenAmount) === 0 ||
      !fromToken ||
      !toToken ||
      !initialized ||
      toUpdateTokenLoading ||
      fromUpdateTokenLoading ||
      routeLoading
    ) {
      return;
    }
    getBestRoute();
  }, [
    fromNetwork,
    toNetwork,
    fromTokenAmount,
    fromToken,
    toToken,
    initialized,
    toUpdateTokenLoading,
    fromUpdateTokenLoading,
    routeLoading,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      reload();
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [
    fromNetwork,
    toNetwork,
    fromTokenAmount,
    fromToken,
    toToken,
    initialized,
    toUpdateTokenLoading,
    fromUpdateTokenLoading,
  ]);

  useEffect(() => {
    if (!fromNetwork || !toNetwork || !fromToken || !toToken) {
      return;
    }
    const params = {
      fromNetwork: searchParams.get("fromNetwork") || undefined,
      toNetwork: searchParams.get("toNetwork") || undefined,
      fromToken: searchParams.get("fromToken") || undefined,
      toToken: searchParams.get("toToken") || undefined,
    };
    if (params.fromNetwork != fromNetwork?.blockchain) {
      params.fromNetwork = fromNetwork?.blockchain;
    }
    if (params.toNetwork != toNetwork?.blockchain) {
      params.toNetwork = toNetwork?.blockchain;
    }
    const fromTokenAddress = fromToken?.address
      ? fromToken.address
      : "0x0000000000000000000000000000000000000000";
    if (params.fromToken != fromTokenAddress) {
      params.fromToken = fromTokenAddress;
    }
    const toTokenAddress = toToken?.address
      ? toToken.address
      : "0x0000000000000000000000000000000000000000";
    if (params.toToken != toTokenAddress) {
      params.toToken = toTokenAddress;
    }
    navigate(
      { pathname: "/swap", search: queryString.stringify(params) },
      {
        replace: true,
      }
    );
  }, [fromNetwork, toNetwork, fromToken, toToken]);

  return (
    <>
      <NetworkModal
        cur={fromNetwork}
        type={modalType.from}
        open={fromNetworkModalOpen}
        onClose={closeNetworkModal}
      />
      <NetworkModal
        cur={toNetwork}
        type={modalType.to}
        open={toNetworkModalOpen}
        onClose={closeNetworkModal}
      />
      <TokenModal
        cur={fromNetwork}
        type={modalType.from}
        open={fromTokenModalOpen}
        tokenCount={fromSearchTokenList.length}
        tokenList={fromSearchTokenList}
        onChange={changeTokenModalList}
        onClose={closeTokenModal}
      />
      <TokenModal
        cur={toNetwork}
        type={modalType.to}
        open={toTokenModalOpen}
        tokenCount={toSearchTokenList.length}
        tokenList={toSearchTokenList}
        onChange={changeTokenModalList}
        onClose={closeTokenModal}
      />
      <SlippageModal
        open={showSlippageSetting}
        onClose={() => setShowSlippageSetting(false)}
        setSlippage={setSlippage}
        slippage={slippage}
      />
      <div
        id="swap-view"
        className="px-20 md:px-30 lg:px-40 
        xl:px-60"
      >
        <div className="xs:p-[0.8rem_0.8rem] sm:p-[1rem_2rem] xl:p-[1.5rem_2rem] 2xl:p-[2rem_4rem]">
          <div>
            {val === 1 && (
              <div className="xs:w-[24rem] sm:w-[30rem] mx-auto border-2 rounded-[2.5rem] text-white p-20 border-[#0D181A] bg-[#080d0e] space-y-10">
                <div className="relative flex items-center">
                  <div className="w-full font-InterMedium text-center tracking-[0.2rem] leading-9 text-24 text-lightwhite">
                    Swap
                  </div>
                  <div className="absolute right-0 bg-[#0a1314] rounded-full p-[7px_9px]">
                    <Settings
                      className="w-20 h-20 mt-[-1px] text-[#274246] cursor-pointer"
                      onClick={() => setShowSlippageSetting(true)}
                    />
                  </div>
                  <img
                    onClick={() => {
                      navigate(-1);
                    }}
                    className="absolute left-0 bg-[#0a1314] rounded-full p-[7px_9px] w-35 h-35 cursor-pointer"
                    src="./assets/icons/left-arrow.svg"
                    alt="left-arrow.svg"
                  />
                </div>
                <FromTokenSection
                  fromToken={fromToken}
                  fromTokenAmount={fromTokenAmount}
                  fromNetwork={fromNetwork}
                  setFromTokenAmount={setFromTokenAmount}
                  setMaxFromTokenAmount={setMaxFromTokenAmount}
                  fromUpdateTokenLoading={fromUpdateTokenLoading}
                  openTokenModal={openTokenModal}
                  opeNetworkModal={opeNetworkModal}
                />
                <div className="flex items-center justify-between">
                  <div>
                    {Number(fromTokenAmount) > 0 && (
                      <div className="flex items-center justify-between font-SpaceGroteskLight text-14 text-[#5B7481] ml-2">
                        ≈
                        {formatCurrency(
                          (fromToken?.usdPrice || 0) * Number(fromTokenAmount),
                          2
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-16">
                    <span className="text-[#5B7481]">Balance: </span>
                    <span className="text-lightwhite">
                      {fromUpdateTokenLoading
                        ? "--"
                        : formatAmount(
                            fromToken?.amount,
                            fromToken?.decimals,
                            fromToken?.decimals,
                            fromToken?.symbol
                          )}{" "}
                    </span>
                    {!fromUpdateTokenLoading && (
                      <span
                        className="font-InterMedium text-success cursor-pointer"
                        onClick={() => setMaxFromTokenAmount()}
                      >
                        (MAX)
                      </span>
                    )}
                  </div>
                </div>
                <img
                  onClick={() => switchTokens()}
                  className="block mx-auto p-5 rounded-full bg-deepSea w-50 h-50 cursor-pointer border-2 border-[#0D181A]"
                  src="./assets/icons/up-down-arrow.svg"
                  alt="up-down-arrow.svg"
                />
                <ToTokenSection
                  fromToken={fromToken}
                  fromTokenAmount={fromTokenAmount}
                  toToken={toToken}
                  toTokenAmount={toTokenAmount}
                  toNetwork={toNetwork}
                  openTokenModal={openTokenModal}
                  opeNetworkModal={opeNetworkModal}
                  toUpdateTokenLoading={toUpdateTokenLoading}
                />
                {Number(toTokenAmount) > 0 && (
                  <div className="font-SpaceGroteskLight text-14 text-[#5B7481] ml-2">
                    ≈{formatCurrency((toToken?.usdPrice || 0) * Number(toTokenAmount), 2)}
                  </div>
                )}
                {balance > 0 ? (
                  <BestRoute
                    bestRoute={bestRoute}
                    routeLoading={routeLoading}
                    metaData={metaData}
                    fromTokenAmount={Number(fromTokenAmount)}
                    toTokenAmount={Number(toTokenAmount)}
                    fromToken={fromToken}
                    toToken={toToken}
                    reason={reason}
                    acceptSlippage={setSlippage}
                  />
                ) : (
                  <NoUsdcBar />
                )}
                <Box display="flex" justifyContent="center">
                  {!address && (
                    <button
                      onClick={() => openConnectModal()}
                      className="w-full py-20 rounded-2xl text-lightwhite bg-[#12b3a8]"
                    >
                      Connect Wallet
                    </button>
                  )}
                  {address && fromNetwork && fromNetwork.chainId !== chainId && (
                    <button
                      onClick={() => changeNetworks(fromNetwork.chainId)}
                      className="w-full py-20 rounded-2xl text-lightwhite bg-[#12b3a8]"
                    >
                      Switch Network
                    </button>
                  )}
                  {address &&
                    fromToken &&
                    toToken &&
                    bestRoute &&
                    fromNetwork &&
                    fromNetwork.chainId === chainId &&
                    toNetwork && (
                      <button
                        disabled={!isSwappable() || swapLoading}
                        onClick={() => {
                          emitSwapPreSwapClickedTrack(PageTitles.Swap, address, {
                            slippage: Number(bestRoute.request.slippage),
                            sendingNetwork: fromNetwork.blockchain,
                            sendingToken:
                              fromToken.symbol +
                              (fromToken.address ? "--" + fromToken.address : ""),
                            sendingValue: Number(fromTokenAmount),
                            recievingNetwork: toNetwork.blockchain,
                            recievingToken:
                              toToken.symbol +
                              (toToken.address ? "--" + toToken.address : ""),
                            recievingValue: Number(
                              ethers.utils
                                .formatUnits(
                                  bestRoute.route?.outputAmount ?? "0",
                                  toToken.decimals
                                )
                                .toString()
                            ),
                            estimatedTotalFeeUSD: bestRoute.route?.feeUsd || 0,
                            estimatedDuration:
                              bestRoute.route?.estimatedTimeInSeconds || 0,
                          });
                          setVal(2);
                        }}
                        className={`font-InterMedium text-24 w-full py-20 rounded-2xl ${
                          !isSwappable() || swapLoading
                            ? "text-[#4B616C] bg-[#202a2f]"
                            : "text-lightwhite bg-[#12b3a8]"
                        }`}
                      >
                        Preview Swap
                      </button>
                    )}
                </Box>
              </div>
            )}
            {val === 2 && (
              <div className="xs:w-[24rem] sm:w-[30rem] mx-auto border-2 rounded-[2rem] p-20 border-[#0D181A] text-white bg-[#080d0e] space-y-30">
                <div className="relative flex items-center">
                  <div className="w-full text-center leading-9 text-24 font-InterMedium">
                    Swap
                  </div>
                  <img
                    onClick={() => {
                      setToggle(0);
                      setVal(1);
                    }}
                    className="absolute left-0 bg-[#0a1314] rounded-full p-10 w-40 h-40 cursor-pointer"
                    src="./assets/icons/left-arrow.svg"
                    alt="left-arrow.svg"
                  />
                </div>
                {(toggle === 0 || toggle === 1) && (
                  <>
                    <div className="flex flex-col gap-10 rounded-2xl p-15 border-2 border-[#0d181a]">
                      <div className="text-16 text-second flex items-center justify-between">
                        <span>From</span>
                        <span>Amount</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-10">
                          <img
                            className="w-30 h-30"
                            src={fromToken?.blockchainImage}
                            alt={fromToken?.blockchain}
                          />
                          {fromToken?.blockchain}
                        </span>
                        <span className="text-sm">
                          – {Number(fromTokenAmount).toFixed(4)} {fromToken?.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-10 rounded-2xl p-15 border-2 border-[#0d181a]">
                      <div className="text-16 text-second flex items-center justify-between">
                        <span>To</span>
                        <span>Amount</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-10">
                          <img
                            className="w-30 h-30"
                            src={toToken?.blockchainImage}
                            alt={toToken?.blockchain}
                          />
                          {toToken?.blockchain}
                        </span>
                        <span className="text-sm">
                          + {Number(toTokenAmount).toFixed(4)} {toToken?.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-10">
                      <div className="flex items-center justify-between font-SpaceGroteskLight text-xs text-second">
                        <span className="flex items-center gap-10">
                          <SvgIcon component={LocalGasStation} fontSize="inherit" />
                          Estimated total fee:
                        </span>
                        <span className="flex items-center gap-10 text-lightwhite">
                          {formatCurrency(bestRoute?.route?.feeUsd || 0, 2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-SpaceGroteskLight text-xs text-second">
                        <span className="flex items-center gap-10">
                          <SvgIcon component={Schedule} fontSize="inherit" />
                          Estimated TOA:
                        </span>
                        <span className="flex items-center gap-10 text-lightwhite">
                          {formatSwapTime(bestRoute?.route?.estimatedTimeInSeconds || 0)}
                        </span>
                      </div>
                    </div>
                    {toggle === 0 && (
                      <button
                        onClick={() => {
                          swap();
                        }}
                        className="mt-10 w-full py-20 rounded-2xl text-lightwhite bg-[#12b3a8]"
                      >
                        Swap
                      </button>
                    )}
                    {toggle === 1 && (
                      <button className="mt-10 flex items-center justify-center gap-10 w-full py-20 rounded-2xl text-[#4b616c] bg-[#202a2f] disabled">
                        <CircularProgress className="text-success" size="1rem" /> Swap
                      </button>
                    )}
                  </>
                )}
                {toggle === 2 && (
                  <>
                    <div className="flex flex-col items-center gap-30">
                      <img
                        src={`./assets/icons/transaction-submit.svg`}
                        alt="transaction-submit"
                      />
                      <div className="text-center">
                        <h2 className="text-20 text-lightwhite">Transaction Submitted</h2>
                        <div className="text-[#5b7481] text-16">
                          You can find the transaction{" "}
                          <a
                            className="text-secondary underline"
                            href={`${getExplorerURL(chainId || 1)}tx/${
                              swapRequest?.txId
                            }`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            here
                          </a>
                        </div>
                      </div>
                      <div className="text-center w-full text-[#5b7481] text-16 border-2 border-[#0D181A] rounded-2xl p-15">
                        Your swap request ID is{" "}
                        <div className="text-lightwhite font-InterMedium">
                          {swapRequest?.requestId}
                        </div>
                      </div>
                    </div>
                    <button
                      disabled
                      className="mt-10 flex items-center justify-center gap-10 w-full py-20 rounded-2xl text-second bg-[#202A2F]"
                    >
                      <CircularProgress className="text-success" size="1rem" /> Swap
                      in-progress
                    </button>
                  </>
                )}
                {toggle === 3 && (
                  <>
                    <div className="flex flex-col items-center gap-30">
                      <img
                        className="bg-[#ff586c]/50 p-15 rounded-full w-115 h-115"
                        src={`./assets/icons/transaction-fail.svg`}
                        alt="transaction-submit"
                      />
                      <div className="text-center">
                        <h2 className="text-20 font-InterMedium text-lightwhite">
                          Transaction Failed
                        </h2>
                        {swapRequest && (
                          <div className="text-[#5b7481] text-16">
                            You can find the transaction{" "}
                            <a
                              className="text-secondary underline"
                              href={`${getExplorerURL(chainId || 1)}tx/${
                                swapRequest?.txId
                              }`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              here
                            </a>
                          </div>
                        )}
                      </div>
                      {swapRequest && (
                        <div className="text-center w-full text-[#5b7481] text-16 border-2 border-[#0D181A] rounded-2xl p-15">
                          Your swap request ID is{" "}
                          <div className="text-lightwhite font-InterMedium">
                            {swapRequest?.requestId || "124123123-123123"}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setToggle(0);
                        setVal(1);
                      }}
                      className="mt-10 w-full py-20 rounded-2xl text-lightwhite bg-[#12b3a8]"
                    >
                      Go back
                    </button>
                  </>
                )}
              </div>
            )}

            {val === 3 && (
              <div className="xs:w-[24rem] sm:w-[30rem] mx-auto border-2 rounded-[2rem] border-[#0D181A] text-white bg-[#080d0e] p-[20px_15px] space-y-30">
                <div className="relative flex items-center">
                  <div className="w-full text-center leading-9 text-24 font-InterMedium">
                    Swap
                  </div>
                  <img
                    onClick={() => {
                      setToggle(0);
                      setVal(1);
                    }}
                    className="absolute left-0 bg-[#0a1314] rounded-full p-10 w-40 h-40 cursor-pointer"
                    src="./assets/icons/left-arrow.svg"
                    alt="left-arrow.svg"
                  />
                </div>
                <div className="flex flex-col items-center gap-25">
                  <img src={`./assets/icons/swap-confirm.svg`} alt="transaction-submit" />
                  <div className="text-center space-y-5">
                    <h2 className="font-InterMedium text-20">Swap confirmed</h2>
                    <div className="text-[#5b7481] text-16">
                      Swap has successfully confirmed
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setVal(1);
                    setToggle(0);
                    setBestRoute(null);
                    setFromTokenAmount("");
                    setToTokenAmount("");
                    if (fromNetwork) {
                      fromNetworkDetails(fromNetwork);
                    }
                    if (toNetwork) {
                      toNetworkDetails(toNetwork);
                    }
                  }}
                  className="w-full py-20 rounded-2xl text-lightwhite bg-[#12b3a8]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(Swap);
