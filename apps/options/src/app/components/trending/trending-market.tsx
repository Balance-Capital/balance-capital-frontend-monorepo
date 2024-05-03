import SvgIcon from "@mui/material/SvgIcon";
import HighArrowIcon from "@mui/icons-material/CallMade";
import { useNavigate } from "react-router-dom";

import { TokenPair } from "../token-pair/token-pair";
import { TrendingPadProps } from "./trending-pad";
import { CryptoCurrency } from "../../core/types/basic.types";
import { useSelector } from "react-redux";
import { getMarketState, MarketData } from "../../store/reducers/market-state-slice";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import {
  convertNumbertoShortenForm,
  numberWithCommas,
} from "../../helpers/data-translations";
import usePageTitle from "../../hooks/usePageTitle";
import { emitHomeTrendingPairClickTrack } from "../../helpers/analytics";
import { useAccount } from "../../hooks/useAccount";

const TrendingMarket = (props: TrendingPadProps) => {
  const navigate = useNavigate();
  const marketData = useSelector(getMarketState);
  const { address } = useAccount();
  const pageTitle = usePageTitle();

  const market = marketData?.marketsData?.find(
    (item: MarketData) => item.symbol.indexOf(props.underlyingToken.symbol) != -1
  );
  const svg = new Blob([market?.trendLineSvg || "<svg></svg>"], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(svg);

  const handleTradeClick = (underlyingToken: CryptoCurrency) => {
    navigate(`/trade?underlyingToken=${underlyingToken.symbol.toLowerCase()}`);
    window.scrollTo(0, 0);

    if (address) {
      emitHomeTrendingPairClickTrack(pageTitle, address, `${underlyingToken.symbol}/USD`);
    }
  };
  return (
    <tr className="font-InterRegular xs:text-17 lg:text-20 [&>td]:bg-woodsmoke xs:[&>td]:py-15 lg:[&>td]:py-20">
      <td className="text-primary rounded-l-[30px] pl-30">
        <TokenPair
          underlyingToken={props.underlyingToken}
          basicToken={props.sourceToken}
          onClick={() => {
            handleTradeClick(props.underlyingToken);
          }}
        />
      </td>
      <td className="text-primary">
        ${numberWithCommas(parseFloat(market?.price.toString() || "0"))}
      </td>
      <td className="text-success">
        <div className="flex items-center">
          {market?.oneDayChangeRate && market?.oneDayChangeRate >= 0 ? (
            <>
              <SvgIcon className="text-18 mr-5 text-success" component={HighArrowIcon} />
              <p className="text-success">{market?.oneDayChangeRate?.toFixed(2)}%</p>
            </>
          ) : (
            <>
              <SvgIcon className="text-18 mr-5 text-danger" component={ArrowDownward} />
              <p className="text-danger">{market?.oneDayChangeRate?.toFixed(2)}%</p>
            </>
          )}
        </div>
      </td>
      <td className="text-primary text-right">
        ${convertNumbertoShortenForm(market?.oneDayVolume || 0)}
      </td>
      <td>
        <img className="text-danger float-right" src={url} alt="ETH logo" />
      </td>
      <td className="rounded-r-[30px] pr-30 text-center">
        <button
          className="w-[155px] h-[50px] xs:text-16 lg:text-18 bg-success hover:bg-success-hover rounded-xl text-buttontext float-right text-nope transition-all font-semibold"
          onClick={() => handleTradeClick(props.underlyingToken)}
        >
          Trade
        </button>
      </td>
    </tr>
  );
};

export default TrendingMarket;
