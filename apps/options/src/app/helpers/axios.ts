import axios from "axios";
import { Backend_API, marketCurrencies } from "../core/constants/basic";
import { MarketDetail } from "../core/types/basic.types";
import { getCustomHeaders } from "../components/tvchart/api/helper";

export const backendInstance = axios.create({
  baseURL: Backend_API,
  headers: getCustomHeaders(),
  withCredentials: true,
});

const time_promsie1 = async () => {
  try {
    const res = await axios.get("https://worldtimeapi.org/api/timezone/GMT");
    return res.data.unixtime as number;
  } catch (error) {
    throw new Error("error");
  }
};

const time_promsie2 = async () => {
  try {
    const headers = getCustomHeaders();
    const res = await backendInstance.get("/current-time", {
      headers: headers,
    });
    return Math.floor(res.data / 1000);
  } catch (error) {
    throw new Error("error");
  }
};

export const getUnixTimestampInSeconds = async () => {
  try {
    const timestamp = await Promise.any([time_promsie1(), time_promsie2()]);
    return timestamp;
  } catch (err) {
    return Math.floor(new Date().getTime() / 1000);
  }
};

export const getTokenPrice = async (symbol: string, time: number) => {
  try {
    const headers = getCustomHeaders();
    const res = await backendInstance.get("/price", {
      headers: headers,
      params: { symbol: `${symbol}USD`, time },
    });
    return res.data.price;
  } catch (error) {
    console.error("[getTokenPrice]: ", error);
    throw error;
  }
};

export const getIsWhitelisted = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get("/whitelist", {
    headers: headers,
    params: { address },
  });
  return res.data.isWhitelisted as boolean;
};

export const getBackendhealth = async () => {
  try {
    const headers = getCustomHeaders();
    await backendInstance.get("/status", { headers: headers });
    return true;
  } catch (error) {
    console.error("[Backend HealthCheck]: ", error);
    return false;
  }
};

export const networkHealthCheck = async () => {
  try {
    await axios.get("https://rest.ensembl.org/info/ping");
    return true;
  } catch (error) {
    console.error("[network Health Check]: ", error);
    return false;
  }
};

export const getCoinsPriceHistory = async () => {
  const key = "ae423e61-7625-490b-990e-400cfcd47868";
  let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=";
  url += marketCurrencies.map((c) => c.marketCapId).join(",");
  const res = await axios.get(url, {
    headers: { "X-CMC_PRO_API_KEY": key },
  });
  const currencies: MarketDetail[] = marketCurrencies.map((c) => ({
    ...c,
    price: res.data.data[c.marketCapId + ""].quote.USD.price,
    priceChange: res.data.data[c.marketCapId + ""].quote.USD.percent_change_24h,
  }));
  return currencies;
};

export const getCurrentCountry = async () => {
  const url = "https://api.country.is";
  const res = await axios.get(url);
  return res.data.country as string;
};

export const getUserProfile = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/user/${address.toLowerCase()}`, {
    headers: headers,
  });
  return res.data;
};

export const registerUserProfile = async (address: string, referralCode: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.post(
    "/user/register",
    {
      headers: headers,
      withCredentials: true,
      address: address.toLowerCase(),
      referralCode,
    }
    // {
    //   headers: {
    //     authorization: `Bearer ${signature}`,
    //   },
    // }
  );
  return res.data;
};

export const generateReferralCodeAPI = async (signature: string) => {
  const headers = getCustomHeaders();
  console.log(signature);
  await backendInstance.post(
    "/user/generate-referral",
    {},
    {
      headers: {
        authorization: `Bearer ${signature}`,
        Cookie: document.cookie,
        ...headers,
      },
      withCredentials: true,
    }
  );
};

export const getInvitedUserCountAPI = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/affiliate/${address.toLowerCase()}`, {
    headers: headers,
  });
  return res.data.length as number;
};

export const getClaimableFeeAPI = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(
    `/affiliate/fee/${address.toLowerCase()}?needSignature=false`,
    { headers: headers }
  );
  const fee = res.data.fee ? parseFloat(res.data.fee.fee + "") : 0;
  const signature: string = res.data.signature;
  return { fee, signature };
};

export const getCreditInfo = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(
    `/ryze-credits/signature?address=${address.toLowerCase()}`,
    { headers: headers }
  );
  return res.data;
};

export const getTasks = async () => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/point/tasks`, { headers: headers });
  return res.data;
};

export const getTaskProgress = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/point/task-progresses/${address}`, {
    headers: headers,
  });
  return res.data;
};

export const getTaskTiers = async () => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/point/task-tiers`, {
    headers: headers,
  });
  return res.data;
};

export const getCurrentSeason = async () => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/point/current-season`, {
    headers: headers,
  });
  return res.data;
};

export const getUserPoint = async (address: string) => {
  const headers = getCustomHeaders();
  const res = await backendInstance.get(`/point/user-point/${address}`, {
    headers: headers,
  });
  return res.data;
};

export const getRewardLeaderboard = async (skip = 0, take = 10, address?: string) => {
  const headers = getCustomHeaders();
  let str = `?skip=${skip}&take=${take}`;
  if (address) {
    str += `&address=${address}`;
  }
  const res = await backendInstance.get(`/point/leaderboard${str}`, {
    headers: headers,
  });
  return res.data;
};
