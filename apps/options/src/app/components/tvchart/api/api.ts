import { makeApiRequest } from "./helper";
import { setBasePrices, subscribeOnStream, unsubscribeFromStream } from "./stream";
import { BarData, ConfigurationData, SymbolInfo } from "./types";
import store from "../../../store";
import { setUnderlyingToken } from "../../../store/reducers/trade-slice";
import { Backend_API } from "../../../core/constants/basic";
import { getUnixTimestampInSeconds } from "../../../helpers/axios";

const lastBarsCache = new Map();
export let currentResolution: string;

const supported_resolutions = [
  {
    label: "1",
    value: 1,
    apiValue: "1m",
  },
  {
    label: "3",
    value: 3,
    apiValue: "3m",
  },
  {
    label: "5",
    value: 5,
    apiValue: "5m",
  },
  {
    label: "15",
    value: 15,
    apiValue: "15m",
  },
  {
    label: "30",
    value: 30,
    apiValue: "30m",
  },
  {
    label: "1h",
    value: 60,
    apiValue: "1h",
  },
  // {
  //   label: "2h",
  //   value: 120,
  //   apiValue: "2h",
  // },
  // {
  //   label: "4h",
  //   value: 240,
  //   apiValue: "4h",
  // },
  // {
  //   label: "1d",
  //   value: 1440,
  //   apiValue: "1d",
  // },
  // {
  //   label: "1w",
  //   value: 10080,
  //   apiValue: "1w",
  // },
  // {
  //   label: "1M",
  //   value: 43200,
  //   apiValue: "1M",
  // },
  // {
  //   label: "1y",
  //   value: 525600,
  //   apiValue: "1y",
  // },
];

export const getResolutionLabel = (resolution: number) => {
  return supported_resolutions.find((r) => r.value === resolution)?.apiValue || "1m";
};

const configurationData: ConfigurationData = {
  supported_resolutions: supported_resolutions.map((r) => r.label),
  exchanges: [
    {
      value: "Binary",
      name: "Binary",
      desc: "Binary",
    },
  ],
  symbols_types: [
    {
      name: "ALL",
      value: "ALL",
    },
    {
      name: "BTC/USD",
      value: "BTC/USD",
    },
    {
      name: "ETH/USD",
      value: "ETH/USD",
    },
    // {
    //   name: "BNB/USD",
    //   value: "BNB/USD",
    // },
    // {
    //   name: "XRP/USD",
    //   value: "XRP/USD",
    // },
    // {
    //   name: "MATIC/USD",
    //   value: "MATIC/USD",
    // },
    // {
    //   name: "DOGE/USD",
    //   value: "DOGE/USD",
    // },
    {
      name: "SOL/USD",
      value: "SOL/USD",
    },
    // {
    //   name: "LINK/USD",
    //   value: "LINK/USD",
    // },
  ],
};

export function getAllSymbols() {
  const bettingCryptoCurrencies = store.getState().trade.bettingCryptoCurrencies;
  const _temp = [
    {
      description: "BTC/USD",
      symbol: "BTC/USD",
      full_name: "BTC/USD",
      exchange: "",
      type: "BTC/USD",
      filterString: "btc/usdbtcusdbitcoin",
      decimals: 2,
    },
    {
      description: "ETH/USD",
      symbol: "ETH/USD",
      full_name: "ETH/USD",
      exchange: "",
      type: "ETH/USD",
      filterString: "eth/usdethusdethereum",
      decimals: 2,
    },
    // {
    //   description: "BNB/USD",
    //   symbol: "BNB/USD",
    //   full_name: "BNB/USD",
    //   exchange: "",
    //   type: "BNB/USD",
    //   filterString: "bnb/usdethusdbinancecoin",
    //   decimals: 2,
    // },
    // {
    //   description: "XRP/USD",
    //   symbol: "XRP/USD",
    //   full_name: "XRP/USD",
    //   exchange: "",
    //   type: "XRP/USD",
    //   filterString: "xrp/usdethusdripple",
    //   decimals: 5,
    // },
    // {
    //   description: "MATIC/USD",
    //   symbol: "MATIC/USD",
    //   full_name: "MATIC/USD",
    //   exchange: "",
    //   type: "MATIC/USD",
    //   filterString: "matic/usdethusdpolygon",
    //   decimals: 5,
    // },
    // {
    //   description: "DOGE/USD",
    //   symbol: "DOGE/USD",
    //   full_name: "DOGE/USD",
    //   exchange: "",
    //   type: "DOGE/USD",
    //   filterString: "doge/usdethusddogecoin",
    //   decimals: 6,
    // },
    {
      description: "SOL/USD",
      symbol: "SOL/USD",
      full_name: "SOL/USD",
      exchange: "",
      type: "SOL/USD",
      filterString: "sol/usdethusdsolana",
      decimals: 2,
    },
    // {
    //   description: "LINK/USD",
    //   symbol: "LINK/USD",
    //   full_name: "LINK/USD",
    //   exchange: "",
    //   type: "LINK/USD",
    //   filterString: "link/usdethusdchainlink",
    //   decimals: 3,
    // },
  ];
  return _temp.filter((obj) =>
    bettingCryptoCurrencies.some((obj1) => obj.symbol.includes(obj1.symbol))
  );
}

export default {
  onReady: (callback: (data: ConfigurationData) => void) => {
    callback(configurationData);
  },
  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: (data: any) => void, // TODO: data type
    onResolveErrorCallback: (error: string) => void,
    extension: any // TODO: Data type
  ) => {
    const underlyingToken = store.getState().trade.underlyingToken;
    const bettingCryptoCurrencies = store.getState().trade.bettingCryptoCurrencies;
    const strSymbol = symbolName.replaceAll("/USD", "");
    if (underlyingToken.symbol !== strSymbol) {
      const indexOfCrypto = bettingCryptoCurrencies.findIndex(
        (v) => v.symbol === strSymbol
      );
      if (indexOfCrypto !== -1) {
        store.dispatch(setUnderlyingToken(bettingCryptoCurrencies[indexOfCrypto]));
      } else {
        return;
      }
    }
    const symbols = getAllSymbols();
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
    if (!symbolItem) {
      onResolveErrorCallback("cannot resolve symbol");
      return;
    }
    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: "24x7",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: Math.pow(10, symbolItem.decimals),
      has_intraday: true,
      has_no_volume: false, // enable volume data
      has_weekly_and_monthly: true,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: "streaming",
    };

    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: any,
    onHistoryCallback: (data: any[], option: { noData: boolean }) => void,
    onErrorCallback: (error: any) => void
  ) => {
    const { from, to, firstDataRequest } = periodParams;
    let stFrom = parseInt(from);
    let stTo = parseInt(to);
    const roundSec = parseInt(resolution) * 60;
    stFrom = roundSec * Math.floor(stFrom / roundSec);
    stTo = roundSec * Math.ceil(stTo / roundSec);

    const symbol =
      symbolInfo.full_name.split("/")[0] + symbolInfo.full_name.split("/")[1].slice(0, 3);

    try {
      const data = await makeApiRequest(
        `${Backend_API}/ohlc?symbol=${symbol}&resolution=${getResolutionLabel(
          parseInt(resolution)
        )}&from=${stFrom * 1000}&to=${stTo * 1000}`
      );
      if ((data.Response && data.Response === "Error") || data.o.length <= 1) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], { noData: true });
        return;
      }
      const { o, h, l, c, v, t } = data;
      // Check if prev min's candle exists
      const utcTime = await getUnixTimestampInSeconds();
      const prevCandleTime =
        Math.floor(utcTime / (parseInt(resolution) * 60)) *
        (parseInt(resolution) * 60) *
        1000;
      if (!t.find((time: number) => prevCandleTime === time)) {
        // Not exists
        const _closePrice = c[c.length - 1];
        t.push(prevCandleTime);
        o.push(_closePrice);
        h.push(_closePrice);
        l.push(_closePrice);
        c.push(_closePrice);
        v.push(_closePrice);
      }
      const bars: BarData[] = [];
      for (let i = 0; i < o.length; i++) {
        if (t[i] < from * 1000 || t[i] > (to + 120) * 1000) {
          continue;
        }
        if (
          t[i] === null ||
          l[i] === null ||
          h[i] === null ||
          o[i] === null ||
          c[i] === null ||
          v[i] === null
        )
          continue;

        bars.push({
          time: data.t[i],
          low: data.l[i] > 0 ? data.l[i] : data.o[i],
          high: data.h[i] > 0 ? data.h[i] : data.o[i],
          open: data.o[i],
          close: data.c[i] > 0 ? data.c[i] : data.o[i],
          volume: data.v[i],
        });
      }
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, bars[bars.length - 1]);
        const lastbar = bars[bars.length - 1];
        if (lastbar.time === prevCandleTime) {
          setBasePrices(lastbar.volume, lastbar.low, lastbar.high);
        }
      }
      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      onErrorCallback(error);
    }
  },

  searchSymbols: async (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (result: SymbolInfo[]) => void
  ) => {
    if (symbolType !== "") {
      const symbols = getAllSymbols() as SymbolInfo[];
      const filteredSymbols = symbols.filter((symbol) =>
        symbol.filterString?.includes(userInput.toLowerCase())
      );
      onResultReadyCallback(filteredSymbols);
    }
  },

  subscribeBars: (
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtimeCallback: () => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => {
    currentResolution = resolution;
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name)
    );
  },

  unsubscribeBars: (subscriberUID: string) => {
    unsubscribeFromStream(subscriberUID);
  },
};
