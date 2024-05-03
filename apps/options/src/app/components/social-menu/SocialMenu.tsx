import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from "@mui/icons-material/Telegram";
import LinkIcon from "@mui/icons-material/Link";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const menuListStyle = {
  fontSize: 20,
  ":hover": {
    color: "#13C9BD",
  },
  display: "flex",
  gap: 1,
};

type Props = {
  onClickTweet: (open: boolean) => void;
};

export default function SocialMenu({ onClickTweet }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = React.useState<boolean>(false);

  const underlyingToken = useSelector(
    (state: RootState) => state.trade.underlyingToken.symbol
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    const func = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", func);

    return () => {
      window.removeEventListener("scroll", func);
    };
  }, []);

  return (
    <div>
      <Button
        id="social-button"
        aria-controls={open ? "social-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          borderRadius: 38,
          border: 2,
          maxWidth: 38,
          minWidth: 38,
          height: 38,
        }}
        className={`${
          !open ? "bg-pageBgColor" : "bg-btnBlackStrokeColor"
        } border-btnBlackStrokeColor hover:bg-btnBlackStrokeColor`}
      >
        <MoreHorizIcon className="text-grayTxtColor" />
      </Button>
      <Menu
        id="social-menu"
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
          "aria-labelledby": "social-button",
        }}
        sx={{
          "& .MuiPaper-elevation": {
            backgroundColor: "#0F1617",
            borderRadius: 4,
            mt: 1,
          },
        }}
        className="[&>.MuiPaper-elevation]:bg-btnBlackStrokeColor [&>.MuiPaper-elevation]:shadow-none"
      >
        <MenuItem
          sx={menuListStyle}
          className="text-btnBlackTxtColor hover:text-brandColor"
          onClick={() => {
            handleClose();
            onClickTweet(true);
          }}
        >
          <TwitterIcon />
          Tweet
        </MenuItem>
        <MenuItem
          sx={menuListStyle}
          className="text-btnBlackTxtColor hover:text-brandColor"
          onClick={() => {
            handleClose();
            window.open(
              `https://t.me/share/url?url=https%3A%2F%2Fapp.ryze.fi%2Ftrade%2F%3FunderlyingToken%3D${underlyingToken.toLowerCase()}`,
              "_blank"
            );
          }}
        >
          <TelegramIcon />
          Telegram
        </MenuItem>
        <MenuItem
          sx={menuListStyle}
          className="text-btnBlackTxtColor hover:text-brandColor"
          onClick={() => {
            handleClose();
            navigator.clipboard.writeText(
              `https://app.ryze.fi/trade/?underlyingToken=${underlyingToken.toLowerCase()}`
            );
          }}
        >
          <LinkIcon />
          Copy Link
        </MenuItem>
      </Menu>
    </div>
  );
}
