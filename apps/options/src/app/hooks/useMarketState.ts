import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { MarketData_Poll_Interval } from "../core/constants/basic";
import { loadMarketState } from "../store/reducers/market-state-slice";

export const useMarketState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadMarketState());

    const timer = setInterval(() => {
      dispatch(loadMarketState());
    }, MarketData_Poll_Interval);

    return () => clearInterval(timer);
  }, [dispatch]);
};
