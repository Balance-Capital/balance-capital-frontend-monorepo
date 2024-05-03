import { ILeaderboardData } from "../../core/types/basic.types";
import { getLeaderboardDataInPeriod } from "../../helpers/graphqlHelpers";

export interface ICompetiton {
  id: number;
  active: boolean;
  startTimestamp: number;
  endTimestamp: number;
  winners: {
    first: { price: number; symbol: string };
    second: { price: number; symbol: string };
    third: { price: number; symbol: string };
  };
  competitionTermLimit: number;
  totalWinningPrice: () => number;
  getData: (address: any) => Promise<{
    list: ILeaderboardData[];
    yourPosition: ILeaderboardData | undefined;
  }>;
  termAndCondition: string;
}

const genesisTime = 1689974100;
const thirtyDaysInSec = 60 * 60 * 24 * 30;
const MAIN = Object.freeze<ICompetiton[]>([
  {
    id: 1,
    active: false,
    startTimestamp: genesisTime + thirtyDaysInSec,
    endTimestamp: genesisTime + thirtyDaysInSec * 2,
    winners: {
      first: {
        price: 3000,
        symbol: "$",
      },
      second: {
        price: 1500,
        symbol: "$",
      },
      third: {
        price: 500,
        symbol: "$",
      },
    },
    totalWinningPrice: function () {
      return (
        this.winners.first.price + this.winners.second.price + this.winners.third.price
      );
    },
    competitionTermLimit: 5,
    getData: async function (address: any) {
      const ld = await getLeaderboardDataInPeriod(
        this.startTimestamp,
        this.endTimestamp,
        [] // [] means all timeframes
      );
      const yourPosition = ld.find(
        (d) => d.user.toLowerCase() === address?.toLowerCase()
      );
      const list = ld
        .filter((d) => d.totalBet >= this.competitionTermLimit)
        .sort((a, b) => {
          if (a.roi === b.roi) {
            return b.pNl - a.pNl;
          }
          return b.roi - a.roi;
        });

      return { list, yourPosition };
    },
    termAndCondition: `
      Prizes:<br>
      1st place: Win up to $3,000<br>
      2nd place: Win up to $1,500<br>
      3rd place: Win $500<br>
      <br>
      Duration: The competition runs until the main launch of the Ryze platform.<br>
      <br>
      Eligibility: Exclusive to users on the Ryze waiting list.<br>
      <br>
      Maximize your return on investment (ROI) using your favorite trading strategies. Remember, you can win big with as little as $1, as the competition is based on ROI!<br>
      <br>
      Resources:<br><br>
      How to place a trade:<br>
      <a
        href="https://ryze.fi/docs/how-to-place-a-trade"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://ryze.fi/docs/how-to-place-a-trade
      </a><br><br>
      How to bridge to Arbitrum:<br>
      <a
        href="https://ryze.fi/docs/how-to-bridge-eth-to-arbitrum"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://ryze.fi/docs/how-to-bridge-eth-to-arbitrum
      </a><br><br>
      How to get USDC:<br>
      <a
        href="https://ryze.fi/docs/how-to-get-native-usdc"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://ryze.fi/docs/how-to-get-native-usdc
      </a><br><br>
      How to place multiple trades:<br>
      <a
        href="https://ryze.fi/docs/how-to-place-a-future-trade"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://ryze.fi/docs/how-to-place-a-future-trade
      </a><br>
      <br>
      1. Users must trade on Ryze.fi<br>
      <br>
      2. Users need to have a trading volume of ≥ 5 USDC.<br>
      <br>
      (Note: Trading volume is calculated every hour)<br>
      <br>
      3. The effective trading volume counts both buys and sells, excluding any wash trades;<br>
      <br>
      4. Ryze.fi reserves the right to disqualify trades that are deemed to be wash trades, illegal bulk account registrations, self-dealing, or display signs of market manipulation, etc.;<br>
      <br>
      5. Ryze.fi reserves the right at any time in its sole and absolute discretion to determine and/or amend or vary these terms and conditions without prior notice, and all Participants shall be bound by these amendments;
    `,
  },
  {
    id: 2,
    active: true,
    startTimestamp: 1698184800,
    endTimestamp: 1700863200,
    winners: {
      first: {
        price: 1500,
        symbol: "Credits",
      },
      second: {
        price: 750,
        symbol: "Credits",
      },
      third: {
        price: 250,
        symbol: "Credits",
      },
    },
    totalWinningPrice: function () {
      return (
        this.winners.first.price + this.winners.second.price + this.winners.third.price
      );
    },
    competitionTermLimit: 5,
    getData: async function (address: any) {
      const ld = await getLeaderboardDataInPeriod(
        this.startTimestamp,
        this.endTimestamp,
        [0, 3] // 0 mean 1min and 3 mean 3min
      );
      const yourPosition = ld.find(
        (d) => d.user.toLowerCase() === address?.toLowerCase()
      );
      const list = ld
        .filter((d) => d.totalBet >= this.competitionTermLimit)
        .sort((a, b) => {
          if (a.roi === b.roi) {
            return b.pNl - a.pNl;
          }
          return b.roi - a.roi;
        });

      return { list, yourPosition };
    },
    termAndCondition: `
    Prizes:<br>
    1st place: Win up to 1,500 Credits <br>
    2nd place: Win up to 750 Credits <br>
    3rd place: Win 250 Credits <br>
    <br>
    Duration: Oct 24th - Nov 24th 2023 <br>
    <br>
    Eligibility: Any traders on the platform between Oct 24th and Nov 24th that meet minimum volume requirements, trading on 1 minute and 3 minute timeframes.<br>
    <br>
    Maximise your return on investment (ROI) using your favourite trading strategies. Remember, you can win big with as little as $1, as the competition is based on ROI! <br>
    <br>
    Resources:<br><br>
    How to place a trade:<br>
    <a
      href="https://ryze.fi/docs/how-to-place-a-trade"
      target="_blank"
      rel="noopener noreferrer"
    >
      https://ryze.fi/docs/how-to-place-a-trade
    </a><br><br>
    How to bridge to Arbitrum:<br>
    <a
      href="https://ryze.fi/docs/how-to-bridge-eth-to-arbitrum"
      target="_blank"
      rel="noopener noreferrer"
    >
      https://ryze.fi/docs/how-to-bridge-eth-to-arbitrum
    </a><br><br>
    How to get USDC:<br>
    <a
      href="https://ryze.fi/docs/how-to-get-native-usdc"
      target="_blank"
      rel="noopener noreferrer"
    >
      https://ryze.fi/docs/how-to-get-native-usdc
    </a><br><br>
    How to place multiple trades:<br>
    <a
      href="https://ryze.fi/docs/how-to-place-a-future-trade"
      target="_blank"
      rel="noopener noreferrer"
    >
      https://ryze.fi/docs/how-to-place-a-future-trade
    </a><br>
    <br>
    1. Users must trade on Ryze.fi<br>
    <br>
    2. Users need to have a trading volume of ≥ 50 USDC.<br>
    <br>
    (Note: Trading volume is calculated every hour)<br>
    <br>
    3. The effective trading volume counts both buys and sells, excluding any wash trades;<br>
    <br>
    4. Ryze.fi reserves the right to disqualify trades that are deemed to be wash trades, illegal bulk account registrations, self-dealing, or display signs of market manipulation, etc.;<br>
    <br>
    5. In order for the full prize pool to be paid out, a total of $30000 in volume must be achieved from all participants. Anything under that, the prize pool will be adjusted accordingly.<br>
    <br>
    6. Ryze.fi reserves the right at any time in its sole and absolute discretion to determine and/or amend or vary these terms and conditions without prior notice, and all Participants shall be bound by these amendments;`,
  },
]);

export const getCompetitionById = (id: number) => {
  return MAIN.find((item) => item.id === id);
};

const Singleton = (() => {
  let activeCompetition: ICompetiton | undefined;

  function init() {
    return MAIN.find((item) => item.active);
  }

  return {
    getInstance() {
      if (!activeCompetition) {
        activeCompetition = init();
      }
      return activeCompetition;
    },
  };
})();

export const activeCompetitionData = Singleton.getInstance();
