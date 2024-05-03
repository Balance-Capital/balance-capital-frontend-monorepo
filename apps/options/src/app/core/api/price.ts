import axios from "axios";
import { Backend_API } from "../constants/basic";
import { getCustomHeaders } from "../../components/tvchart/api/helper";

export const getCurrentPrice = async (time: number, symbol = "ETHUSD") => {
  try {
    const headers = getCustomHeaders();
    const { data } = await axios.get(`${Backend_API}/price`, {
      headers: headers,
      withCredentials: true,
      params: {
        symbol,
        time: time * 1000, //second to millisecond
      },
    });
    if (!data.price) return "0";
    if (data.price === "NaN") return "0";
    return data.price + "";
  } catch (error) {
    console.log("getCurrentPrice: failed");
    return "0";
  }
};
