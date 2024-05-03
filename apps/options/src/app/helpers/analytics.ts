import { AnalyticsBrowser } from "@segment/analytics-next";
import { Underlying_Token } from "../core/constants/basic";
import { DebugHelper } from "@fantohm/shared-helpers";
import { currentNetworkChain } from "../context/NetworkContext";
import { chains } from "@fantohm/shared-web3";

const writeKey = "Chn4fE1uY42BWEvtdWgODNF4xn8w4Hgz";

export const analytics = AnalyticsBrowser.load({ writeKey });

export enum EventNames {
  WalletConnected = "Wallet Connected",
  WalletDisconnected = "Wallet Disconnected",
  TokenPairSearch = "Token Pair Searched",
  NotificationClicked = "Notification Clicked",
  DiscordClicked = "Discord Clicked",
  TwitterClicked = "Twitter Clicked",
  FeedbackClicked = "Feedback Clicked",
  ReportBugClicked = "Report Bug Clicked",
  BalanceCapitalCTAClicked = "Balance Capital CTA Clicked",
  UserMenuClicked = "User Menu Clicked",
  HomeMainTeaserBtnClicked = "Home: Main Teaser Btn Clicked",
  HomeTeaserTradeClicked = "Home: Teaser Trade Clicked",
  HomeTrendingPairClicked = "Home: Trending Pair Clicked",
  TradeIntervalClicked = "Trade: Trade Interval Clicked",
  TradeTokenPairSelected = "Trade: Token Pair Selected",
  TradeBettingTypeClicked = "Trade: Betting Type Clicked",
  TradeConfirmed = "Trade: Trade Confirmed",
  TradeFailed = "Trade: Trade Failed",
  TradePositionSet = "Trade: Trade Position Set",
  TradeOpenPosViewed = "Trade: Open Pos Viewed",
  TradeClosePosViewed = "Trade: Close Pos Viewed",
  TradeProfitClaimed = "Trade: Profit Claimed",
  TradeRefundClicked = "Trade: Refund Clicked",
  TradeClaimAllClicked = "Trade: Claim All Clicked",
  MarketsTradePairClicked = "Markets: Trade Pair Clicked",
  LeaderboardExplorerViewed = "Leaderboard: Explorer Viewed",
  EarnVaultViewedOnExplorer = "Earn: Vault Viewed On Explorer",
  EarnNewVaultPostionAdded = "Earn: New Vault Postion Added",
  EarnExistingVaultPositionAdjusted = "Earn: Existing Vault Position Adjusted",
  EarnVaultPostitionListedonOpenSea = "Earn: Vault Postition Listed on OpenSea",
  EarnVaultPositionViewedOnExplorer = "Earn: Vault Position Viewed on Explorer",
  SwapPreSwapClicked = "Swap: Prep Swap Clicked",
  SwapConfirmSwapClicked = "Swap: Confirm Swap Clicked",
  CreditClaimedClicked = "Ryze Credits Claimed",
  CampaignLanding = "Campaign Landing",
  NetworkSelected = "Network Selected",
}

export enum MenuitemClickTitle {
  CopyAddress = "Copy Address",
  ViewExplorer = "View Explorer",
}

export enum PageTitles {
  Homepage = "Homepage",
  Trade = "Trade",
  Markets = "Markets",
  Leaderboard = "Leaderboard",
  Earn = "Earn",
  Swap = "Swap",
}

export const NavPaths: Record<string, PageTitles> = {
  "/": PageTitles.Homepage,
  "/trade": PageTitles.Trade,
  "/markets": PageTitles.Markets,
  "/leaderboard": PageTitles.Leaderboard,
  "/vault": PageTitles.Earn,
  "/swap": PageTitles.Swap,
};

const isSegmentAllowed = () => {
  return (
    process.env.NX_BINARY_ENABLE_SEGMENT === "production" ||
    DebugHelper.isActive("enable-segment")
  );
};

export const identify = (wallet: string, page: PageTitles) => {
  if (isSegmentAllowed())
    try {
      analytics.identify(wallet, {
        page,
      });
    } catch (error) {
      console.error("identify", error);
    }
};

export const getCampId = (): string => {
  try {
    const campData = JSON.parse(localStorage.getItem("UTM_CAMPAIGN") || "[]");
    if (Date.now() > campData.expireAt) {
      return "";
    }

    return campData.campIds.join(",");
  } catch {
    return "";
  }
};

export const saveNewCampaign = (newCampId: string) => {
  let res = [];
  try {
    const campData = JSON.parse(localStorage.getItem("UTM_CAMPAIGN") || "[]");
    if (Date.now() < campData.expireAt) {
      res = campData.campIds;
    }

    if (res.includes(newCampId)) {
      return;
    }
    // eslint-disable-next-line no-empty
  } catch {}

  res.push(newCampId);
  localStorage.setItem(
    "UTM_CAMPAIGN",
    JSON.stringify({
      campIds: res,
      expireAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    })
  );
};

export const emitNormalTrack = (page: PageTitles, wallet: string, event: EventNames) => {
  if (isSegmentAllowed())
    try {
      analytics.track(event, {
        walletId: wallet,
        page,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitNormalTrack", error);
    }
};

export const emitWalletConnectedTrack = (
  page: PageTitles,
  wallet: string,
  walletSize: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.WalletConnected, {
        walletId: wallet,
        page,
        walletSize,
        baseToken: Underlying_Token[currentNetworkChain.id].symbol,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitWalletConnectedTrack", error);
    }
};

export const emitTokenPairSearchTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TokenPairSearch, {
        walletId: wallet,
        page,
        tokenPair,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTokenPairSearchTrack", error);
    }
};

export const emitUserMenuClickTrack = (
  page: PageTitles,
  wallet: string,
  menuItemClicked: MenuitemClickTitle
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.UserMenuClicked, {
        walletId: wallet,
        page,
        menuItemClicked,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitUserMenuClickTrack", error);
    }
};

export const emitHomeMainTeaserButtonClickTrack = (
  page: PageTitles,
  wallet: string,
  teaserBtn: "Trade" | "Demo"
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.HomeMainTeaserBtnClicked, {
        walletId: wallet,
        page,
        teaserBtn,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitHomeMainTeaserButtonClickTrack", error);
    }
};

export const emitHomeTeaserTradeClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.HomeTeaserTradeClicked, {
        walletId: wallet,
        page,
        tokenPair,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitHomeTeaserTradeClickTrack", error);
    }
};

export const emitHomeTrendingPairClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.HomeTrendingPairClicked, {
        walletId: wallet,
        page,
        tokenPair,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitHomeTrendingPairClickTrack", error);
    }
};

export const emitTradeIntervalClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeIntervalClicked, {
        walletId: wallet,
        page,
        tokenPair,
        tradeInterval,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeIntervalClickTrack", error);
    }
};

export const emitTradeTokenPairClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeTokenPairSelected, {
        walletId: wallet,
        page,
        tokenPair,
        tradeInterval,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeTokenPairClickTrack", error);
    }
};

export const emitTradeBettingTypeClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string,
  bettingType: "Up" | "Down"
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeBettingTypeClicked, {
        walletId: wallet,
        page,
        tokenPair,
        tradeInterval,
        bettingType,
        leverage: "2x",
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeBettingTypeClickTrack", error);
    }
};

export const emitTradeConfirmedTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string,
  bettingType: "Up" | "Down",
  bettingSize: number,
  systemMaxBet: number,
  roundId: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeConfirmed, {
        walletId: wallet,
        page,
        tokenPair,
        tradeInterval,
        bettingType,
        leverage: "2x",
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        bettingSize: bettingSize + "",
        systemMaxBet,
        roundId: "#" + roundId,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeConfirmedTrack", error);
    }
};

export const emitTradeFailedTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string,
  bettingType: string,
  systemMaxBet: number,
  bettingSize: number,
  roundId: number,
  message: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeFailed, {
        walletId: wallet,
        page,
        tokenPair,
        tradeInterval,
        bettingType,
        leverage: "2x",
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        bettingSize: bettingSize + "",
        systemMaxBet,
        roundId: "#" + roundId,
        message,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeConfirmedTrack", error);
    }
};

export const emitTradePositionSet = (
  page: PageTitles,
  wallet: string,
  tokenPair: string,
  tradeInterval: string,
  bettingType: "Up" | "Down",
  bettingSizePercentage: string,
  bettingSize: number,
  systemMaxBet: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradePositionSet, {
        walletId: wallet,
        tradeInterval,
        tokenPair,
        page,
        bettingType,
        leverage: "2x",
        bettingSizePercentage,
        bettingSize,
        systemMaxBet,
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradePositionSet", error);
    }
};

export const emitProfitClaimedTrack = (
  page: PageTitles,
  wallet: string,
  bettingType: "Up" | "Down",
  bettingSize: number,
  roundId: number,
  openPrice: number,
  closePrice: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.TradeProfitClaimed, {
        walletId: wallet,
        page,
        bettingType,
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        bettingSize: bettingSize + "",
        roundId: "#" + roundId,
        status: "ABCXYZ",
        openPrice: "$" + openPrice,
        closePrice: "$" + closePrice,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitProfitClaimedTrack", error);
    }
};

export const emitTradeRefundClicked = (
  page: PageTitles,
  wallet: string,
  bettingType: "Up" | "Down",
  tradeInterval: number,
  tokenPair: string,
  refundSize: number,
  roundId: number
) => {
  if (isSegmentAllowed()) {
    try {
      analytics.track(EventNames.TradeRefundClicked, {
        walletId: wallet,
        page,
        tradeInterval: `${tradeInterval}m`,
        tokenPair,
        bettingType,
        leverage: "2x",
        refundSize,
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        roundId: `#${roundId}`,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeRefundedTrack", error);
    }
  }
};

export const emitTradeClaimAllClickedTrack = (
  wallet: string,
  page: PageTitles,
  tokenPair: string,
  claimedSize: number
) => {
  if (isSegmentAllowed()) {
    try {
      analytics.track(EventNames.TradeClaimAllClicked, {
        walletId: wallet,
        page,
        tokenPair,
        leverage: "2x",
        claimedSize,
        bettingToken: Underlying_Token[currentNetworkChain.id].symbol,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitTradeRefundedTrack", error);
    }
  }
};

export const emitMarketTradePairClickTrack = (
  page: PageTitles,
  wallet: string,
  tokenPair: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.MarketsTradePairClicked, {
        walletId: wallet,
        page,
        tokenPair,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitMarketTradePairClickTrack", error);
    }
};

export const emitLeaderboardExplorerViewedTrack = (
  page: PageTitles,
  wallet: string,
  rank: number,
  user: string,
  pnl: number,
  roi: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.LeaderboardExplorerViewed, {
        walletId: wallet,
        page,
        rank,
        user,
        pnl: "$" + pnl,
        roi: roi + "%",
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitLeaderboardExplorerViewedTrack", error);
    }
};

export const emitEarnVaultViewedOnExplorerTrack = (
  page: PageTitles,
  wallet: string,
  totalValueLocked: string,
  vaultPoolApr: number,
  vaultLockDuration: string
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.EarnVaultViewedOnExplorer, {
        walletId: wallet,
        page,
        totalValueLocked,
        vaultToken: Underlying_Token[currentNetworkChain.id].symbol,
        vaultPoolApr: vaultPoolApr + "%",
        vaultLockDuration,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitEarnVaultViewedOnExplorerTrack", error);
    }
};

export const emitEarnNewVaultPositionAddedTrack = (
  page: PageTitles,
  wallet: string,
  positionSize: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.EarnNewVaultPostionAdded, {
        walletId: wallet,
        page,
        positionSize,
        positionToken: Underlying_Token[currentNetworkChain.id].symbol,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitEarnNewVaultPositionAddedTrack", error);
    }
};

export const emitEarnExistingVaultPositionAdjustedTrack = (
  page: PageTitles,
  wallet: string,
  positionSize: number,
  action: "Withdraw" | "Deposit"
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.EarnExistingVaultPositionAdjusted, {
        walletId: wallet,
        page,
        positionSize,
        positionToken: Underlying_Token[currentNetworkChain.id].symbol,
        action,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitEarnExistingVaultPositionAdjustedTrack", error);
    }
};

export const emitEarnVaultPostitionListedOnOpenSeaTrack = (
  page: PageTitles,
  wallet: string,
  positionValue: number,
  positionDeposit: number,
  tokenId: number,
  vaultShare: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.EarnExistingVaultPositionAdjusted, {
        walletId: wallet,
        page,
        positionValue,
        positionDeposit,
        vaultShare: vaultShare + "%",
        positionToken: Underlying_Token[currentNetworkChain.id].symbol,
        tokenId,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitEarnVaultPostitionListedOnOpenSeaTrack", error);
    }
};

export const emitEarnVaultPositionViewedOnExplorerTrack = (
  page: PageTitles,
  wallet: string,
  tokenId: number
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.EarnVaultPositionViewedOnExplorer, {
        walletId: wallet,
        page,
        tokenId,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitEarnVaultPositionViewedOnExplorerTrack", error);
    }
};

export const emitSwapPreSwapClickedTrack = (
  page: PageTitles,
  wallet: string,
  data: {
    slippage: number;
    sendingNetwork: string;
    sendingToken: string;
    sendingValue: number;
    recievingNetwork: string;
    recievingToken: string;
    recievingValue: number;
    estimatedTotalFeeUSD: number;
    estimatedDuration: number; // in seconds
  }
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.SwapPreSwapClicked, {
        walletId: wallet,
        page,
        ...data,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitSwapPreSwapClickedTrack", error);
    }
};

export const emitSwapConfirmSwapClickedTrack = (
  page: PageTitles,
  wallet: string,
  data: {
    slippage: number;
    sendingNetwork: string;
    sendingToken: string;
    sendingValue: number;
    recievingNetwork: string;
    recievingToken: string;
    recievingValue: number;
    estimatedTotalFeeUSD: number;
    estimatedTOA: number; // timestamp
    swapRequestId: string;
    srcTxId: string;
    destTxId: string;
    status: string; // e.g., pass, failed
    message: string; // e.g., transaction failed, not enough gas
  }
) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.SwapConfirmSwapClicked, {
        walletId: wallet,
        page,
        ...data,
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitSwapConfirmSwapClickedTrack", error);
    }
};

export const emitRyzeCreditClaimed = (walletId: string, creditAmount: number) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.CreditClaimedClicked, {
        walletId,
        creditAmount,
        campId: getCampId(),
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitRyzeCreditClaimed", error);
    }
};

export const emitCampaignLanding = (walletId: string, campId: string, page: string) => {
  if (isSegmentAllowed())
    try {
      analytics.track(EventNames.CampaignLanding, {
        walletId,
        campId,
        page,
        chain: chains[currentNetworkChain.id].networkName,
      });
    } catch (error) {
      console.error("emitCampaignLanding", error);
    }
};

export const emitNetworkSelected = (
  walletId: string,
  fromChainId: number,
  toChainId: number,
  page: string
) => {
  if (isSegmentAllowed())
    try {
      if (fromChainId !== toChainId) {
        analytics.track(EventNames.NetworkSelected, {
          walletId,
          campId: getCampId(),
          fromChain: chains[fromChainId].networkName,
          toChain: chains[toChainId].networkName,
          page,
        });
      }
    } catch (error) {
      console.error("emitNetworkSelected", error);
    }
};
