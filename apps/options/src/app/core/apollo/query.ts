import { gql } from "@apollo/client";

const BET_HISTORY_FRAGMENT = gql`
  fragment BetHistory on Bet {
    claimed
    timeframeId
    amount
    createdAt
    position
    hash
    isReverted
    creditUsed
    round {
      epoch
      lockPrice
      closePrice
      lockAt: estimatedLockTime
      endAt: estimatedEndTime
    }
  }
`;

export const bettingHistory = (
  address: string,
  pageNo: number,
  pageSize: number,
  timeNow: number,
  pairName: string
) => gql`
  query getBetHistory {
    bets(
      first: ${pageSize},
      skip: ${(pageNo - 1) * pageSize},
      orderBy: round__estimatedEndTime,
      orderDirection: desc,
      where:{
        or: [{
          market_: {
            pairName: "${pairName}"
          }
          user: "${address.toLocaleLowerCase()}"
          round_: {
            estimatedEndTime_lte: ${timeNow}
          }
        }, {
          market_: {
            pairName: "${pairName}"
          }
          user: "${address.toLocaleLowerCase()}"
          isReverted: true
        }]
      }
    ) {
      hash
      claimed
      claimedAmount
      claimedHash
      timeframeId
      amount
      position
      isReverted
      creditUsed
      market {
        id
      }
      round {
        epoch
        bullBets
        lockPrice
        closePrice
        lockAt: estimatedLockTime
        endAt: estimatedEndTime
      }
    }
  }
`;

export const openedBetting = (
  address: string,
  marketAddress: string,
  currentTime: number
) => gql`
  query getOpenedBettings {
    bets(
      orderBy: round__estimatedLockTime
      orderDirection: asc
      where: {
        user: "${address.toLowerCase()}"
        market: "${marketAddress.toLowerCase()}"
        isReverted: false
        round_: {
          estimatedEndTime_gte: ${currentTime}
        }
      }
    ) {
      hash
      claimed
      claimedAmount
      claimedHash
      timeframeId
      amount
      position
      isReverted
      creditUsed
      market {
        id
      }
      round {
        epoch
        bullBets
        lockPrice
        closePrice
        lockAt: estimatedLockTime
        endAt: estimatedEndTime
      }
    }

    latest: bets(
      orderBy: createdAt
      orderDirection: desc
      first: 1
      where: {
        user: "${address.toLowerCase()}"
        market: "${marketAddress.toLowerCase()}"
        isReverted: true
      }
    ) {
      timeframeId
      isReverted
      creditUsed
      createdAt
      round {
        epoch
      }
    }
  }
`;

export const bettingHistoryCount = (
  address: string,
  symbol: string,
  first: number,
  skip: number
) => gql`
  {
    bets(
      first: ${first},
      skip: ${skip},
      orderBy: round__estimatedEndTime,
      orderDirection: desc,
      where: {
        user: "${address.toLowerCase()}",
        market_: {
          pairName: "${symbol}USD"
        }
      }
    ) {
      market {
        id
        pairName
      }
    }
  }
`;

export const leaderboardQuery = (
  skip: number,
  take: number,
  orderBy: string,
  showAll: boolean,
  searchText: string
) => gql`
  {
    users (
      orderBy: ${orderBy},
      orderDirection: desc,
      where: {
        ${!showAll ? "roi_gt: 0," : ""}
        address_string_contains: "${searchText.trim().toLowerCase()}"
      }
      first: ${take}
      skip: ${skip}
    ) {
      address
      wholeBetAmount
      wholePayoutAmount
      invest
      roi
      profit_lose
    }
  }
`;

export const loadBetHistoryforNotificationQuery = (
  address: string,
  from: number,
  to: number
) => gql`
  ${BET_HISTORY_FRAGMENT}
  query BetHistory {
    ethMarketHistory: bets(
      first: 10
      orderBy: round__estimatedEndTime
      orderDirection: desc
      where: {
        or: [
          {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "ETHUSD"
            }
            round_: {
              lockPrice_not: null,
              closePrice_not: null,
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
          }, {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "ETHUSD"
            }
            round_: {
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
            isReverted: true
          }
        ]
      }
    ) {
      ...BetHistory
    }

    btcMarketHistory: bets(
      first: 10
      orderBy: round__estimatedEndTime
      orderDirection: desc
      where: {
        or: [
          {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "BTCUSD"
            }
            round_: {
              lockPrice_not: null,
              closePrice_not: null,
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
          }, {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "BTCUSD"
            }
            round_: {
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
            isReverted: true
          }
        ]
      }
    ) {
      ...BetHistory
    }

    solMarketHistory: bets(
      first: 10
      orderBy: round__estimatedEndTime
      orderDirection: desc
      where: {
        or: [
          {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "SOLUSD"
            }
            round_: {
              lockPrice_not: null,
              closePrice_not: null,
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
          }, {
            user: "${address.toLowerCase()}"
            market_: {
              pairName: "SOLUSD"
            }
            round_: {
              estimatedEndTime_gte: ${from},
              estimatedEndTime_lte: ${to}
            }
            isReverted: true
          }
        ]
      }
    ) {
      ...BetHistory
    }
  }
`;
// bnbMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "BNBUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "BNBUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

// xrpMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "XRPUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "XRPUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

// maticMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "MATICUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "MATICUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

// dogeMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "DOGEUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "DOGEUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

// solMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "SOLUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "SOLUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

// linkMarketHistory: bets(
//   first: 10
//   orderBy: round__estimatedEndTime
//   orderDirection: desc
//   where: {
//     or: [
//       {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "LINKUSD"
//         }
//         round_: {
//           lockPrice_not: null,
//           closePrice_not: null,
//           estimatedEndTime_gte: ${from},
//           estimatedEndTime_lte: ${to}
//         }
//       }, {
//         user: "${address.toLowerCase()}"
//         market_: {
//           pairName: "LINKUSD"
//         }
//         isReverted: true
//       }
//     ]
//   }
// ) {
//   ...BetHistory
// }

export const getAllUnclaimedBets = (
  userAddress: string,
  skip: number,
  pairName: string
) => gql`query BetHistory {
  bets (
    orderBy: round__estimatedEndTime,
    orderDirection: desc,
    skip: ${skip},
    first: 100,
    where: {
      user: "${userAddress.toLowerCase()}",
      claimed: false,
      market_: {
        pairName: "${pairName}"
      }
    }
  ) {
    timeframeId
    position
    amount
    isReverted
    market {
      id
    }
    round {
      epoch
      lockPrice
      closePrice
      estimatedEndTime
    }
  }
}`;

export const getVaultData = (vaultAddress: string, timestamp: number) => {
  const seconds7D = 60 * 60 * 24 * 7;
  const time7dAgo = timestamp - seconds7D;
  return gql`
    query Vault {
      vault(id: "${vaultAddress.toLowerCase()}") {
        address
        totalShares
        totalStakedAmount
        totalInvestedAmount
        snapshots(
          first: 1,
          orderBy: timestamp,
          orderDirection: asc,
          where: {
            timestamp_gte: ${time7dAgo}
          }
        ) {
          timestamp
          totalStakedAmount
          totalShares
        }
      }
    }
  `;
};

export const getVaultUserPositions = (vaultAddress: string, userAddress: string) => gql`
  query VaultPositions {
    vaultPositions(where: {
      vault: "${vaultAddress.toLowerCase()}",
      owner: "${userAddress.toLowerCase()}"
    }) {
      id
      tokenId
      investAmount
      shareAmount
      withdrawal {
        startTime
        shareAmount
        tokenId
      }
      timestamp
      owner
    }
  }
`;

export const getVaultTotalInvestedAmount = (vaultAddress: string) => {
  return gql`
    query Vault {
      vault(id: "${vaultAddress.toLowerCase()}") {
        totalInvestedAmount
      }
    }
  `;
};

export const getEarningClaimsHistoryQuery = (address: string) => {
  return gql`
    query Claims {
      claims (where: {
        user: "${address.toLowerCase()}"
      }) {
        amount
        timestamp
        id
      }
    }
  `;
};

export const getBetsInPeriodQuery = (
  startTime: number,
  endTime: number,
  skip: number,
  first: number
) => gql`
  query Bets {
    bets(
      where: { round_: { estimatedEndTime_gte: ${startTime}, estimatedEndTime_lte: ${endTime} } },
      skip: ${skip},
      first: ${first},
      orderBy: round__estimatedEndTime,
    ) {
      id
      user {
        id
      }
      timeframeId
      amount
      position
      claimed
      isReverted
      creditUsed
      round {
        id
        lockPrice
        closePrice
        position
      }
    }
  }
`;
