import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useDispatch } from "react-redux";
import { handleTypoFontFamilyChange } from "../../../store/reducers/leftnavbarSlice";

const menuListStyle = {
  fontSize: "1.125rem",
  color: "#BDE0EB",
  ":hover": {
    color: "#13C9BD",
  },
};

export default function FontFamilyDropDown({
  fontFamilys,
}: {
  fontFamilys: Array<{
    name: string;
    isSelected: boolean;
  }>;
}) {
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="font-family-button"
        aria-controls={open ? "font-family-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          p: "0.75rem",
          borderRadius: "0.75rem",
          bgcolor: "#173033",
          color: "#BDE0EB",
          maxWidth: "100%",
          minWidth: "100%",
          fontFamily: "InterMedium",
          fontSize: "1.125rem",
          textTransform: "initial",
        }}
      >
        <div className="w-full flex items-center justify-between">
          {fontFamilys.find((item) => item.isSelected === true)?.name}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15.869"
            height="8.719"
            viewBox="0 0 15.869 8.719"
          >
            <path
              id="_7059899_chevron_up_icon"
              data-name="7059899_chevron_up_icon"
              d="M24.984,13a1.153,1.153,0,0,0-.8.319l-6,5.767-6-5.766a1.166,1.166,0,0,0-1.6,0,1.061,1.061,0,0,0,0,1.541l6.8,6.539a1.167,1.167,0,0,0,1.6,0l6.8-6.539a1.059,1.059,0,0,0,.247-1.189A1.135,1.135,0,0,0,24.984,13Z"
              transform="translate(-10.251 -12.999)"
              fill="#bde0eb"
            />
          </svg>
        </div>
      </Button>
      <Menu
        id="font-family-menu"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "font-family-button",
          sx: { width: anchorEl && anchorEl.offsetWidth },
        }}
        sx={{
          "& .MuiPaper-elevation": {
            backgroundColor: "#0F1617",
            borderRadius: 4,
            mt: 1,
            maxWidth: "100%",
            fontFamily: "InterMedium",
          },
        }}
      >
        {fontFamilys.map((item, index) => (
          <MenuItem
            key={index}
            sx={menuListStyle}
            onClick={() => {
              handleClose();
              dispatch(handleTypoFontFamilyChange(item.name));
            }}
          >
            {item.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
