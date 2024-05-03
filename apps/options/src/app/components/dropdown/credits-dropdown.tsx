import SvgIcon from "@mui/material/SvgIcon";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState, MouseEvent, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setSelected } from "../../store/reducers/credit-slice";

export default function CreditsDropDown() {
  const dispatch = useDispatch();
  const { selected, creditArr } = useSelector(
    (state: RootState) => state.ryzecredit.creditDropdown
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);

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
    setOpen((prev) => !prev);
  };
  const handleDropDownClose = () => {
    setOpen((prev) => !prev);
  };

  const handleMenuItemClick = (obj: { img: string; name: string }) => {
    dispatch(setSelected(obj));
    setOpen((prev) => !prev);
  };

  return (
    <div id="credits-dropdown">
      <Button
        id="creditsDropdownBtn"
        aria-controls={open ? "dropdownMenuCredits" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => {
          if (creditArr.length > 1) handleDropDownOpen(e);
        }}
        className={`${
          open ? "rounded-b-none" : "rounded-b-[20px]"
        } rounded-[20px] bg-btnBlackStrokeColor p-0`}
      >
        <div className="bg-btnBlackBgColor rounded-[20px] px-[11px] py-[9px] flex items-center gap-15 border-2 border-solid border-btnBlackStrokeColor">
          <div className="flex items-center gap-[7px]">
            <img
              src={selected.img}
              alt={`${selected.name} logo`}
              className="w-[24px] h-auto"
            />
            <span className="font-InterMedium text-18 text-btnBlackTxtColor w-[fit-content]">
              {selected.name}
            </span>
          </div>
          {creditArr.length > 1 ? (
            <SvgIcon
              component={!open ? KeyboardArrowDownOutlined : KeyboardArrowUpOutlined}
              className="text-whiteIconColor"
            />
          ) : null}
        </div>
      </Button>
      <Menu
        id="dropdownMenuCredits"
        anchorEl={anchorEl}
        open={open}
        onClose={handleDropDownClose}
        MenuListProps={{
          "aria-labelledby": "creditsDropdownBtn",
          sx: { width: anchorEl && anchorEl.offsetWidth },
        }}
        sx={{
          "& .MuiPaper-elevation": {
            borderRadius: "0px 0px 20px 20px",
          },
        }}
        className="[&>.MuiPaper-elevation]:bg-btnBlackStrokeColor [&>.MuiPaper-elevation]:shadow-none"
      >
        {creditArr.map((obj, index) => (
          <MenuItem
            onClick={() => handleMenuItemClick(obj)}
            className="hover:bg-btnBlackBgColor rounded-[20px] space-x-10"
            key={obj.name}
          >
            <img src={obj.img} alt={`${obj.name} logo`} className="w-[24px] h-auto" />
            <p className="text-btnBlackTxtColor font-InterMedium text-18">{obj.name}</p>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
