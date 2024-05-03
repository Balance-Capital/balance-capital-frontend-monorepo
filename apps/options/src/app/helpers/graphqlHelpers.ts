import {
  ApolloClient,
  ApolloQueryResult,
  DocumentNode,
  InMemoryCache,
} from "@apollo/client";
import { GRAPH_URL, TradingFee } from "../core/constants/basic";
import { getBetsInPeriodQuery } from "../core/apollo/query";
import { ILeaderboardData } from "../core/types/basic.types";
import { calcBettingReward } from "./data-translations";

export const apolloClient = () =>
  new ApolloClient({
    uri: GRAPH_URL(),
    cache: new InMemoryCache(),
  });

export const runQuery = async (query: DocumentNode) => {
  try {
    return await apolloClient().query({ query });
  } catch (error) {
    console.error("runQuery: ", error);
    throw error;
  }
};

export const getLeaderboardDataFromBets = (bets: any[]): ILeaderboardData => {
  let totalInvestment = 0;
  let balance = 0;
  let totalBet = 0;
  const user: string = bets.length > 0 ? bets[0].user.id : "";

  for (let i = 0; i < bets.length; i++) {
    const closePrice = parseFloat(bets[i].round.closePrice + "");
    const lockPrice = parseFloat(bets[i].round.lockPrice + "");
    const amount = parseFloat(bets[i].amount + "");

    totalBet += amount;

    const newInvest = amount - balance;
    if (newInvest > 0) {
      totalInvestment += newInvest;
      balance += newInvest;
    }

    balance -= amount;

    if (bets[i].isReverted || closePrice * lockPrice === 0) {
      balance += amount;
    }

    if (
      (closePrice < lockPrice && bets[i].position === "Bear") ||
      (closePrice > lockPrice && bets[i].position === "Bull")
    ) {
      balance += calcBettingReward(bets[i].creditUsed, amount, TradingFee);
    }
  }

  return {
    user,
    totalBet,
    totalInvestment,
    pNl: balance - totalInvestment,
    roi: (balance - totalInvestment) / totalInvestment,
  };
};

export const getLeaderboardDataInPeriod = async (
  startTime: number,
  endTime: number,
  timeframeIds: Array<number>
) => {
  const takeLimit = 500;
  let bets: any[] = [];
  let res: ApolloQueryResult<any>;
  do {
    const query = getBetsInPeriodQuery(startTime, endTime, bets.length, takeLimit);

    res = await runQuery(query);
    bets = bets.concat(res.data.bets);
  } while (res.data.bets.length === takeLimit);

  const leaderboardData: Array<ILeaderboardData> = [];
  while (bets.length > 0) {
    const user = bets[0].user.id;
    let tmp = [];
    if (timeframeIds.length) {
      tmp = bets.filter(
        (bet: any) =>
          bet.user.id === user &&
          bet.round.closePrice &&
          bet.round.lockPrice &&
          ((bet.round.lockPrice < bet.round.closePrice &&
            bet.round.position === "Bull") ||
            (bet.round.lockPrice > bet.round.closePrice &&
              bet.round.position === "Bear")) &&
          !bet.isReverted &&
          timeframeIds.some((val) => bet.timeframeId === val)
      );
    } else {
      tmp = bets.filter(
        (bet: any) =>
          bet.user.id === user &&
          bet.round.closePrice &&
          bet.round.lockPrice &&
          ((bet.round.lockPrice < bet.round.closePrice &&
            bet.round.position === "Bull") ||
            (bet.round.lockPrice > bet.round.closePrice &&
              bet.round.position === "Bear")) &&
          !bet.isReverted
      );
    }
    bets = bets.filter((bet: any) => bet.user.id !== user);
    if (tmp.length) leaderboardData.push(getLeaderboardDataFromBets(tmp));
  }
  return leaderboardData;
};
