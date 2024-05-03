import SvgIcon from "@mui/material/SvgIcon";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import Search from "@mui/icons-material/Search";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState, MouseEvent, ChangeEvent, useEffect } from "react";

import { TokenPair } from "../token-pair/token-pair";
import { CryptoCurrency } from "../../core/types/basic.types";
import { useSelector } from "react-redux";

import { RootState } from "../../store";
import { emitTradeTokenPairClickTrack } from "../../helpers/analytics";
import usePageTitle from "../../hooks/usePageTitle";
import { getBettingTimeframeWithId } from "../../helpers/data-translations";
import { useAccount } from "../../hooks/useAccount";

interface CurrencyDropDownProps {
  bettingCurrencies: CryptoCurrency[];
}

export const BettingCurrencyDropdown = (props: CurrencyDropDownProps) => {
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );
  const { address } = useAccount();
  const pageTitle = usePageTitle();

  const { bettingCurrencies } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [showCurrencies, setShowCurrencies] = useState(bettingCurrencies);

  useEffect(() => {
    const func = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", func);

    return () => {
      window.removeEventListener("scroll", func);
    };
  }, []);

  const handleDropDownOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
    setShowCurrencies(bettingCurrencies);
  };
  const handleDropDownClose = () => {
    setOpen(!open);
  };

  const handleMenuItemClick = (currency: CryptoCurrency) => {
    setOpen(!open);

    if (address) {
      const timeframe = getBettingTimeframeWithId(currentTimeframeId).minute;
      emitTradeTokenPairClickTrack(
        pageTitle,
        address,
        `${currency.symbol}/USD`,
        `${timeframe}m`
      );
    }
  };

  const onSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const filterValue = event.target.value.toLowerCase();
    setShowCurrencies(
      bettingCurrencies.filter((currency) => currency.filterString.includes(filterValue))
    );
  };

  return (
    <div id="currency-dropdown">
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => {
          if (showCurrencies.length > 1) handleDropDownOpen(e);
        }}
        className="bg-btnBlackBgColor border-2 border-solid border-btnBlackStrokeColor xs:rounded-[20px] md:rounded-[24px] xs:py-[10px] md:py-[15px] xs:px-[12px] md:px-[20px] flex items-center xs:gap-[15px] md:gap-[17px]"
      >
        <div className="flex items-center xs:gap-[6px] md:gap-[11px]">
          <img
            src={`./assets/images/${underlyingToken.symbol}.png`}
            alt={`${underlyingToken.symbol} logo`}
            className="xs:w-[24px] md:w-[30px] 2xl:w-[34px]"
          />
          <span className="text-btnBlackTxtColor font-InterMedium xs:text-18 2xl:text-[20px]">
            {underlyingToken.symbol}/USD
          </span>
        </div>
        {showCurrencies.length > 1 ? (
          <SvgIcon
            component={!open ? KeyboardArrowDownOutlined : KeyboardArrowUpOutlined}
            className="text-whiteIconColor xs:text-20 md:text-26 2xl:text-30"
          />
        ) : null}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleDropDownClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
          sx: { width: anchorEl && anchorEl.offsetWidth + 20 },
        }}
        sx={{
          "& .MuiPaper-elevation": {
            borderRadius: "35px",
            marginTop: "7px",
          },
        }}
        className="[&>.MuiPaper-elevation]:bg-btnBlackStrokeColor [&>.MuiPaper-elevation]:shadow-none"
      >
        <div className="px-[18px] flex items-center xs:gap-10 md:gap-15 py-15">
          <SvgIcon className="text-25 text-grayTxtColor" component={Search} />
          <input
            type="text"
            className="xs:text-12 md:text-16 w-full outline-none bg-transparent text-grayTxtColor placeholder:text-grayTxtColor"
            placeholder="Search for a token"
            onChange={onSearchInputChange}
          />
        </div>
        {Object.values(showCurrencies).map((currency: CryptoCurrency, index) => (
          <div onClick={() => handleMenuItemClick(currency)} key={index}>
            <div className="px-[18px]">
              <TokenPair underlyingToken={currency} basicToken="USD" key={index} />
            </div>
          </div>
        ))}
        {showCurrencies.length === 0 && (
          <div className="flex justify-center text-grayTxtColor py-10">No Result</div>
        )}
      </Menu>
    </div>
  );
};
