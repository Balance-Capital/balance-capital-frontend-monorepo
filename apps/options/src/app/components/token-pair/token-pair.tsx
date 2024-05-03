import { useLocation, useNavigate } from "react-router-dom";
import { CryptoCurrency } from "../../core/types/basic.types";

export const TokenPair = (tokenPair: {
  underlyingToken: CryptoCurrency;
  basicToken: string;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const handleClick = (underlyingToken: string) => {
    if (pathname.includes("/trade-widget")) {
      if (search.includes("&underlyingToken=")) {
        const ind = search.indexOf("&underlyingToken=");
        navigate(
          `/trade-widget${search.slice(0, ind)}&underlyingToken=${underlyingToken}`
        );
      } else {
        if (search.length) {
          if (search.includes("underlyingToken=")) {
            navigate(`/trade-widget?underlyingToken=${underlyingToken}`);
          } else {
            navigate(`/trade-widget${search}&underlyingToken=${underlyingToken}`);
          }
        } else {
          navigate(`/trade-widget?underlyingToken=${underlyingToken}`);
        }
      }
    } else {
      navigate(`/trade?underlyingToken=${underlyingToken}`);
    }
  };

  return (
    <div
      className="flex gap-5 py-5 w-full cursor-pointer"
      onClick={() => handleClick(tokenPair.underlyingToken.symbol.toLowerCase())}
    >
      <div className="token-logo flex justify-center items-center xs:w-[47px] sm:w-40">
        <img
          width={40}
          height={40}
          src={`./assets/images/${tokenPair.underlyingToken.symbol}.png`}
          alt={`${tokenPair.underlyingToken.symbol} logo`}
        />
      </div>
      <div className="px-10">
        <p className="betting-token xs:text-15 sm:text-18 text-btnBlackTxtColor">
          {tokenPair.underlyingToken.name}
        </p>
        <p className="token-pair xs:text-15 sm:text-16 text-grayTxtColor">
          {tokenPair.underlyingToken.symbol}/{tokenPair.basicToken}
        </p>
      </div>
    </div>
  );
};
