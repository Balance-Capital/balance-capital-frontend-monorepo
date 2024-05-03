import SvgIcon from "@mui/material/SvgIcon";
import SearchIcon from "@mui/icons-material/Search";
import styled from "@mui/system/styled";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";

import { CryptoCurrency } from "../../core/types/basic.types";
import usePageTitle from "../../hooks/usePageTitle";
import { emitTokenPairSearchTrack } from "../../helpers/analytics";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useAccount } from "../../hooks/useAccount";

const Input = styled("input")(({ theme }) => ({
  width: 130,
  backgroundColor: theme.palette.mode === "light" ? "#fff" : "#000",
  color: theme.palette.mode === "light" ? "#000" : "#fff",
}));

const Listbox = styled("ul")(({ theme }) => ({
  margin: 0,
  padding: 0,
  zIndex: 20,
  position: "absolute",
  top: 48,
  listStyle: "none",
  overflow: "auto",
  maxHeight: 500,
  "& li.Mui-focused": {
    backgroundColor: "#0D1112",
    color: "white",
    cursor: "pointer",
  },
  "& li:active": {
    backgroundColor: "#0D1112",
    color: "white",
  },
}));

type Props = {
  setNavbarOpen?: (open: boolean) => void;
};

const Search = ({ setNavbarOpen }: Props) => {
  const navigate = useNavigate();
  const bettingCryptoCurrencies = useSelector(
    (state: RootState) => state.trade.bettingCryptoCurrencies
  );
  const { address } = useAccount();
  const pageTitle = usePageTitle();
  const [listCurrencies, setListCurrencies] = useState(bettingCryptoCurrencies);

  const [isOpenList, setIsOpenList] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setListCurrencies(
      bettingCryptoCurrencies.filter((currency) =>
        currency.filterString.includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleClickCurrency = (currency: CryptoCurrency) => {
    if (setNavbarOpen) {
      setNavbarOpen(false);
    }
    navigate(`/trade?underlyingToken=${currency.symbol.toLowerCase()}`);
    setSearchValue("");
    setIsOpenList(false);

    if (address) {
      emitTokenPairSearchTrack(pageTitle, address, `${currency.symbol}/USD`);
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-full h-[50px] px-5 flex items-center rounded-3xl text-primary border-obsidianBlack backdrop-blur-[30px] z-20
          ${
            isOpenList
              ? "rounded-b-none border-2 bg-deepSea"
              : "rounded-b-3xl bg-transparent border-2"
          }`}
      >
        <SvgIcon className="m-5 text-second" component={SearchIcon} />
        <Input
          placeholder="Search for a token"
          className="w-full outline-none border-0 bg-transparent text-second text-16 placeholder:text-second"
          value={searchValue}
          onFocus={() => setIsOpenList(true)}
          onBlur={() => !isOpenList && setIsOpenList(false)}
          onChange={handleSearchInputChange}
        />
      </div>
      {isOpenList ? (
        <Listbox
          className="w-full bg-deepSea rounded-b-3xl shadow-3xl z-20"
          sx={{ "& li.Mui-focused": { backgroundColor: "#0A1314" } }}
        >
          {listCurrencies.map((currency, index) => (
            <li
              className="hover:bg-obsidianBlack h-[70px] flex items-center cursor-pointer"
              key={index}
            >
              <div
                className="flex px-[29px] py-5"
                onClick={() => handleClickCurrency(currency)}
              >
                <div className="token-logo flex justify-center items-center w-40">
                  <img
                    src={`./assets/images/${currency.symbol}.png`}
                    alt={`${currency.symbol} logo`}
                  />
                </div>
                <div className="pl-[17px]">
                  <p className="betting-token text-15 text-primary">{currency.name}</p>
                  <p className="token-pair text-14 text-lightgray">
                    {currency.symbol}/{"USD"}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {listCurrencies.length === 0 && (
            <li className="py-10 text-second text-center">No Result</li>
          )}
        </Listbox>
      ) : null}
      {isOpenList && (
        <div
          className="fixed w-screen h-screen bg-black opacity-0 top-0 left-0 z-10"
          onClick={() => setIsOpenList(false)}
        ></div>
      )}
    </div>
  );
};

export default Search;
