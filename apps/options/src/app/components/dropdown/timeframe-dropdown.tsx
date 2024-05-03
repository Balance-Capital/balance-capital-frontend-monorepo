import SvgIcon from "@mui/material/SvgIcon";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState, MouseEvent, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setCurrentTimeframeId } from "../../store/reducers/trade-slice";
import { RootState } from "../../store";
import { PageTitles, emitTradeIntervalClickTrack } from "../../helpers/analytics";
import { getBettingTimeframeWithId } from "../../helpers/data-translations";
import { useAccount } from "../../hooks/useAccount";

export const TimeframeDropdown = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { address } = useAccount();
  const underlytingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const bettingTimeframes = useSelector(
    (state: RootState) => state.trade.bettingTimeframes
  );

  const currentTimeframeId = useSelector(
    (state: RootState) => state.trade.currentTimeframeId
  );

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
  };
  const handleDropDownClose = () => {
    // setAnchorEl(null);
    setOpen(!open);
  };

  const handleMenuItemClick = (timeframe: number, index: number) => {
    // setAnchorEl(null);
    setOpen(!open);
    dispatch(setCurrentTimeframeId(index));

    if (address) {
      emitTradeIntervalClickTrack(
        PageTitles.Trade,
        address,
        `${underlytingToken.symbol}/USD`,
        `${timeframe}m`
      );
    }
  };

  return (
    <div id="timeframe-dropdown">
      <Button
        id="timeframeBtn"
        aria-controls={open ? "dropdownMenuTimeframe" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => {
          if (bettingTimeframes.length > 1) handleDropDownOpen(e);
        }}
        className={`xs:rounded-t-[16px] 2xl:rounded-t-[20px] bg-btnBlackStrokeColor p-0 ${
          open ? "rounded-b-none" : "xs:rounded-b-[16px] 2xl:rounded-b-[20px]"
        }`}
      >
        <div className="bg-btnBlackBgColor xs:rounded-[16px] 2xl:rounded-[20px] px-[11px] xs:py-[7px] 2xl:py-[9px] flex items-center gap-15 border-2 border-solid border-btnBlackStrokeColor">
          <div className="flex items-center gap-[7px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 34 34"
              className="xs:w-[28px] xs:h-[28px] 2xl:w-[34px] 2xl:h-[34px]"
            >
              <g
                id="_9041676_clock_icon"
                data-name="9041676_clock_icon"
                transform="translate(27 27) rotate(180)"
              >
                <circle
                  id="Ellipse_1019"
                  data-name="Ellipse 1019"
                  cx="10"
                  cy="10"
                  r="10"
                  transform="translate(0)"
                  fill="none"
                  stroke="#12b3a8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  id="Path_3689"
                  data-name="Path 3689"
                  d="M4.386,5.013V0H0"
                  transform="translate(5.481 8.756)"
                  fill="none"
                  stroke="#12b3a8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  fillRule="evenodd"
                />
                <circle
                  id="Ellipse_1022"
                  data-name="Ellipse 1022"
                  cx="17"
                  cy="17"
                  r="17"
                  transform="translate(27 27) rotate(-180)"
                  fill="rgba(18,179,168,0.1)"
                />
              </g>
            </svg>
            <span className="lowercase font-InterMedium text-18 text-btnBlackTxtColor xs:w-35 2xl:w-40 text-right">
              {getBettingTimeframeWithId(currentTimeframeId).minute + "m"}
            </span>
          </div>
          {bettingTimeframes.length > 1 ? (
            <SvgIcon
              component={!open ? KeyboardArrowDownOutlined : KeyboardArrowUpOutlined}
              className="text-whiteIconColor"
            />
          ) : null}
        </div>
      </Button>
      <Menu
        id="dropdownMenuTimeframe"
        anchorEl={anchorEl}
        open={open}
        onClose={handleDropDownClose}
        MenuListProps={{
          "aria-labelledby": "timeframeBtn",
          sx: { width: anchorEl && anchorEl.offsetWidth },
        }}
        sx={{
          "& .MuiPaper-elevation": {
            borderRadius: "0px 0px 20px 20px",
          },
        }}
        className="[&>.MuiPaper-elevation]:bg-btnBlackStrokeColor [&>.MuiPaper-elevation]:shadow-none"
      >
        {bettingTimeframes
          .filter((bt) => !bt.disabled)
          .map((timeframe, index) => (
            <MenuItem
              className="hover:bg-btnBlackBgColor xs:rounded-[16px] 2xl:rounded-[20px]"
              onClick={() => handleMenuItemClick(timeframe.minute, timeframe.id)}
              key={timeframe.id}
            >
              <p className="text-btnBlackTxtColor font-InterMedium text-18">
                {timeframe.minute}m
              </p>
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
};
