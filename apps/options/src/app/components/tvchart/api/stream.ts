import { parseFullSymbol } from "./helper";
import { currentResolution } from "./api";
import { BarData } from "./types";

const channelToSubscription = new Map();

let baseVolume = 0;
let baseLow = 0;
let baseHigh = 0;

export const setBasePrices = (v: number, l: number, h: number) => {
  baseVolume = v;
  baseLow = l;
  baseHigh = h;
};

export const updateCandle = async (
  fromSymbol: string,
  toSymbol: string,
  data: {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
    volume: number;
  }
) => {
  const channelString = `0~${fromSymbol}~${toSymbol}`;
  const subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem === undefined) {
    return;
  }

  baseVolume += data.volume;
  baseLow = baseLow ? Math.min(baseLow, data.low) : data.low;
  baseHigh = Math.max(baseHigh, data.high);

  // console.log("candle-price: ", data);

  const roundMilliSec = parseInt(currentResolution) * 60 * 1000;

  if ((data.time + 60 * 1000) % roundMilliSec === 0) {
    const newCandleStartTime =
      Math.floor((data.time + 60 * 1000) / roundMilliSec) * roundMilliSec;
    // Update current candle
    const bar = {
      ...subscriptionItem.lastDailyBar,
      close: data.close,
      high: baseHigh,
      low: baseLow,
      volume: baseVolume,
    };
    subscriptionItem.handlers.forEach((handler: any) => handler.callback(bar));

    // console.log("latest-candle", bar);

    baseHigh = baseLow = baseVolume = 0;

    // Create new candle
    const newBar = {
      open: data.close,
      high: data.close,
      low: data.close,
      close: data.close,
      volume: 0,
      time: newCandleStartTime,
    };

    subscriptionItem.lastDailyBar = newBar;
    subscriptionItem.handlers.forEach((handler: any) => handler.callback(newBar));
  }
};

export const updateTradingView = async (
  fromSymbol: string,
  toSymbol: string,
  data: { price: number; volume: number; timestamp: number }
) => {
  const { price, volume, timestamp } = data;

  const tradePrice = price;
  const tradeTime = timestamp;
  const channelString = `0~${fromSymbol}~${toSymbol}`;
  const subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem === undefined) {
    return;
  }
  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextCandleTime(
    currentResolution,
    lastDailyBar.time,
    timestamp
  );

  // console.log("latest-price: ", data);
  // console.log("Received - local time: ", Date.now());

  if (tradeTime < nextDailyBarTime) {
    const bar: BarData = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar?.high, tradePrice),
      low: lastDailyBar?.low > 0 ? Math.min(lastDailyBar?.low, tradePrice) : tradePrice,
      close: tradePrice,
      volume: volume + baseVolume,
    };

    subscriptionItem.lastDailyBar = bar;

    // send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler: any) => handler.callback(bar));
  }
};

function getNextCandleTime(
  resolution: string,
  currentCandleTime: number,
  timestamp: number
) {
  let nextCandleMinute = currentCandleTime + parseInt(resolution) * 60 * 1000;
  const delta = timestamp - nextCandleMinute;
  if (delta > 0) {
    nextCandleMinute += delta - (delta % (parseInt(resolution) * 60000));
  }
  return nextCandleMinute;
}

export function subscribeOnStream(
  symbolInfo: any,
  resolution: any,
  onRealtimeCallback: () => void,
  subscriberUID: any,
  onResetCacheNeededCallback: () => void,
  lastDailyBar: any
) {
  const parsedSymbol: any = parseFullSymbol(symbolInfo.full_name);
  const channelString = `0~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem) {
    // already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastDailyBar,
    handlers: [handler],
  };
  channelToSubscription.set(channelString, subscriptionItem);
  // socket.emit('SubAdd', { subs: [channelString] });
}

export function unsubscribeFromStream(subscriberUID: any) {
  // find a subscription with id === subscriberUID
  for (const channelString of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(channelString);
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler: any) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      // remove from handlers
      subscriptionItem.handlers.splice(handlerIndex, 1);

      if (subscriptionItem.handlers.length === 0) {
        // unsubscribe from the channel, if it was the last handler
        // console.log(
        //   "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
        //   channelString
        // );
        // socket.emit('SubRemove', { subs: [channelString] });
        channelToSubscription.delete(channelString);
        break;
      }
    }
  }
}
