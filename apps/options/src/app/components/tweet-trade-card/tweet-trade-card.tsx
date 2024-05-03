import Modal from "@material-ui/core/Modal";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { getBettingTimeframeWithId } from "../../helpers/data-translations";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  roundId: number;
};

const TweetTradeCardModal = ({ open, setOpen, roundId }: Props) => {
  const underlyingToken = useSelector(
    (state: RootState) => state.trade.underlyingToken.symbol
  );
  const timeframeId = useSelector((state: RootState) => state.trade.currentTimeframeId);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="relative w-[90vw] max-w-600 p-15 md:p-30 rounded-3xl border-2 border-modalStrokeColor bg-modalBgColor">
          <div className="cursor-pointer pb-10">
            <span onClick={() => setOpen(false)}>
              <ClearRoundedIcon className="text-18 text-grayTxtColor" />
            </span>
          </div>
          <div className="flex gap-15">
            <div>
              <img
                src="./assets/images/avatar-account.png"
                alt="account"
                className="w-35 h-35"
              />
            </div>
            <div className="w-0 grow">
              <div className="flex">
                <div className="px-10 text-12 flex items-center border-[1px] border-grayTxtColor rounded-2xl text-appblue font-bold">
                  Everyone <ExpandMoreRoundedIcon className="text-14" />
                </div>
              </div>
              <div className="text-btnBlackTxtColor text-18 font-bold pt-15">
                Trade <span className="text-appblue">${underlyingToken}</span>/USD long or
                short. Starting in {getBettingTimeframeWithId(timeframeId).minute}{" "}
                minutes:
              </div>
              <a
                href={`https://app.ryze.fi/trade?underlyingToken=${underlyingToken.toLowerCase()}`}
                className="text-16 font-bold text-appblue block mt-15"
                target="_blank"
              >{`https://app.ryze.fi/trade?underlyingToken=${underlyingToken.toLowerCase()}`}</a>
              <div className="w-full rounded-2xl border-[1px] border-grayTxtColor mt-10 overflow-hidden">
                <img
                  src={`./assets/images/trade card-${underlyingToken}.png`}
                  alt="trade card"
                  className="border-b-[1px] border-grayTxtColor block"
                />
                <div className="p-10">
                  <div className="text-btnBlackTxtColor text-14">rize.fi</div>
                  <div className="text-btnBlackTxtColor font-bold">
                    Trade {underlyingToken}/USD-Ryze.fi
                  </div>
                  <div className="text-btnBlackTxtColor text-14">
                    Trade The Volatility of {underlyingToken}/USD
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-14 font-bold text-appblue flex items-center gap-[7px] mt-10">
            <PublicOutlinedIcon className="text-16" /> Everyone can reply
          </div>
          <div className="h-[1px] bg-grayTxtColor/50 w-full my-10"></div>
          <div className="flex gap-10 px-10 pt-10 items-center justify-between">
            <div className="flex gap-10 text-appblue text-14">
              <ImageOutlinedIcon className="text-18" />
              <ListOutlinedIcon className="text-18 opacity-70" />
              <SentimentSatisfiedAltOutlinedIcon className="text-18" />
              <PendingActionsOutlinedIcon className="text-18" />
              <LocationOnOutlinedIcon className="text-18" />
            </div>
            <button
              className="bg-appblue rounded-3xl text-btnTxtColor px-15 py-[2px] text-16"
              onClick={() => {
                setOpen(false);
                window.open(
                  `https://twitter.com/intent/tweet?text=Trade%20the%20volatility%20of%20%24BTC%20on%20%40RyzeFi%20📈%2C%20the%20binary%20options%20DEX%20on%20Arbitrum.&url=https%3A%2F%2Fapp.ryze.fi%2Ftrade%3FunderlyingToken%3D${underlyingToken.toLowerCase()}`,
                  "_blank"
                );
              }}
            >
              Tweet
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TweetTradeCardModal;
