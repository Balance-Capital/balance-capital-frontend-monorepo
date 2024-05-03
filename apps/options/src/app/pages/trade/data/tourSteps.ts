import { ShepherdOptionsWithType } from "react-shepherd";

export const steps: ShepherdOptionsWithType[] = [
  {
    id: "connect-wallet",
    title: "Step 1/9",
    text: [
      "Find your wallet information, number of assets and updates with notifications here.",
    ],
    attachTo: { element: "#connect-wallet", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "currency-balance",
    title: "Step 2/9",
    text: [
      "You will need native USDC to trade with. You can learn more about this <a href='https://ryze.fi/docs/how-to-get-native-usdc' target='_blank' rel='noreferrer'>here</a>.",
    ],
    attachTo: { element: "#currency-balance", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "currency-dropdown",
    title: "Step 3/9",
    text: [
      "Choose the pair you want to trade against here. More pairs to be added soon.",
    ],
    attachTo: { element: "#currency-dropdown", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "timeframe-dropdown",
    title: "Step 4/9",
    text: ["Choose the timeframe in which you want to trade the selected asset pair."],
    attachTo: { element: "#timeframe-dropdown", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "tv-chart",
    title: "Step 5/9",
    text: [
      "This is the price chart of the asset pair in the selected timeframe. Here you can use tools and indicators for your own technical analysis.",
    ],
    attachTo: { element: "#tv-chart", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "current-card",
    title: "Step 6/9",
    text: [
      "This is current round in-progress. The Open Price shows the price of the selected asset pair at the start of the respective round.",
    ],
    attachTo: { element: "#current-card", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "start-card",
    title: "Step 7/9",
    text: [
      "This is the next upcoming round. Trades must be placed before the round begins.",
    ],
    attachTo: { element: "#start-card", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "bet-position-buttons",
    title: "Step 8/9",
    text: [
      "Choose either 'Up' or 'Down' on the timeframe of the selected asset pair. You must set your position before the round begins.",
    ],
    attachTo: { element: "#bet-position-buttons", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "open-positions-button",
    title: "Step 9/9",
    text: [
      "Currently open positions can be found here. Previously closed positions can be viewed here.",
    ],
    attachTo: { element: "#open-positions-button", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "End Tutorial",
      },
    ],
  },
];

export const mobileSteps: ShepherdOptionsWithType[] = [
  {
    id: "connect-wallet",
    title: "Step 1/7",
    text: [
      "Find your wallet information, number of assets and updates with notifications here.",
    ],
    attachTo: { element: "#connect-wallet", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "currency-dropdown",
    title: "Step 2/7",
    text: [
      "Choose the pair you want to trade against here. More pairs to be added soon.",
    ],
    attachTo: { element: "#currency-dropdown", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "timeframe-dropdown",
    title: "Step 3/7",
    text: ["Choose the timeframe in which you want to trade the selected asset pair."],
    attachTo: { element: "#timeframe-dropdown", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "current-round-card",
    title: "Step 4/7",
    text: [
      "This is the current round in-progress. The Open Price shows the price of the selected asset pair at the start of the respective round.",
    ],
    attachTo: { element: "#mobile-bet-cards", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "start-round-card",
    title: "Step 5/7",
    text: [
      "This is the next upcoming round. Trades must be placed before the round begins.",
    ],
    attachTo: { element: "#mobile-bet-cards", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "bet-position-buttons",
    title: "Step 6/8",
    text: [
      "Choose either 'Up' or 'Down' on the timeframe of the selected asset pair. You must set your position before the round begins.",
    ],
    attachTo: { element: "#mobile-bet-cards", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "Continue",
      },
    ],
  },
  {
    id: "open-positions-button",
    title: "Step 7/7",
    text: [
      "Currently open positions can be found here. Previously closed positions can be viewed here.",
    ],
    attachTo: { element: "#open-positions-button", on: "top" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "next",
        classes: "shepherd-button-secondary",
        text: "End Tutorial",
      },
    ],
  },
];
