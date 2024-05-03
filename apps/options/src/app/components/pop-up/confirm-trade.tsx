import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import SvgIcon from "@mui/material/SvgIcon";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import HighArrowIcon from "@mui/icons-material/CallMade";
import LowArrowIcon from "@mui/icons-material/SouthEast";
import Check from "@mui/icons-material/Check";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";

import { LabelIcon } from "../label-icon/label-icon";
import {
  convertTime,
  getBettingTimeframeWithId,
  getOneMillionForBera,
  getRoundTime,
} from "../../helpers/data-translations";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { toogleConfirmModalShow } from "../../store/reducers/app-slice";
import { Underlying_Token, getDecimal } from "../../core/constants/basic";
import { useNetworkContext } from "../../context/NetworkContext";

export function ConfirmTradePopup(props: {
  timeframeId: number;
  currencyValue: number;
  direction: number;
  open: boolean;
  epoch: number;
  onClose: (isOpen: boolean) => void;
  handleBetting: (direction: number) => void;
}) {
  const { timeframeId, currencyValue, direction, open, epoch, onClose, handleBetting } =
    props;
  const { currentNetworkChainId } = useNetworkContext();
  const confirmModalShow = useSelector((state: RootState) => state.app.confirmModalShow);
  const genesisTime = useSelector((state: RootState) => state.trade.genesisTime);
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    onClose(false);
    handleBetting(direction);
  };

  const handleClose = () => {
    onClose(false);
  };

  const handleChangeCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(toogleConfirmModalShow());
  };

  const getRoundTimeString = (
    _genesisTime: number,
    _epoch: number,
    _timeframeId: number
  ) => {
    const roundTime = getRoundTime(_genesisTime, _epoch, _timeframeId);
    const lockTime = new Date(roundTime.lockTime);
    const endTime = new Date(roundTime.closeTime);
    return `${convertTime(lockTime).time} - ${convertTime(endTime).time}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        "& .MuiDialog-paperScrollPaper": {
          width: "420px",
          borderRadius: "30px",
          margin: "20px",
        },
      }}
      PaperProps={{
        className: "bg-modalBgColor border-2 border-modalStrokeColor",
      }}
    >
      <DialogTitle
        id="alert-dialog-title"
        className="w-full flex justify-between items-center"
      >
        <SvgIcon
          component={ArrowBackIcon}
          className="w-30 h-30 text-grayTxtColor p-5 rounded-full bg-btnBlackStrokeColor"
          onClick={handleClose}
        />
        <p className="text-btnBlackTxtColor">Confirm</p>
        <SvgIcon
          component={CloseIcon}
          className="w-30 h-30 text-grayTxtColor p-5 rounded-full bg-btnBlackStrokeColor"
          onClick={handleClose}
        />
      </DialogTitle>
      <DialogContent className="px-10 sm:px-20">
        <div className="rounded-2xl flex justify-between items-center p-5 bg-btnBlackStrokeColor mt-20 mb-10">
          <p className="text-grayTxtColor pl-10">Timeframe</p>
          <LabelIcon
            label={`${getBettingTimeframeWithId(timeframeId).minute}m`}
            icon={WatchLaterOutlinedIcon}
            reverse
            backgroundColor="transparent"
            labelColor="btnBlackTxtColor"
            iconColor="success"
            className="rounded-2xl py-[7px] px-15"
            labelFontSize={20}
          />
        </div>
        <div className="rounded-2xl flex justify-between items-center p-5 bg-btnBlackStrokeColor mb-10">
          <p className="text-grayTxtColor pl-10">Round</p>
          <LabelIcon
            label={`${getRoundTimeString(genesisTime, epoch, timeframeId)}`}
            icon={WatchLaterOutlinedIcon}
            reverse
            backgroundColor="transparent"
            labelColor="btnBlackTxtColor"
            iconColor="success"
            className="rounded-2xl py-[7px] px-15"
            labelFontSize={20}
          />
        </div>
        <div className="rounded-2xl flex justify-between items-center p-5 bg-btnBlackStrokeColor mb-10">
          <p className="text-grayTxtColor pl-10">Quantity</p>
          <LabelIcon
            label={getDecimal(currencyValue * getOneMillionForBera())}
            icon={() => (
              <img
                src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                alt={`${Underlying_Token[currentNetworkChainId].symbol} logo`}
                width={26}
              />
            )}
            reverse
            backgroundColor="transparent"
            labelColor="btnBlackTxtColor"
            className="rounded-2xl py-[7px] px-15"
            labelFontSize={20}
          />
        </div>
        <div className="rounded-2xl flex justify-between items-center p-5 bg-btnBlackStrokeColor mb-20">
          <p className="text-grayTxtColor pl-10">Type</p>
          <LabelIcon
            label={direction ? "DOWN" : "UP"}
            icon={direction ? LowArrowIcon : HighArrowIcon}
            reverse
            backgroundColor="transparent"
            iconColor={direction ? "danger" : "success"}
            labelColor="btnBlackTxtColor"
            className="rounded-2xl py-[7px] px-15"
            labelFontSize={20}
          />
        </div>
        <div className="border border-btnBlackStrokeColor rounded-xl pb-[8px] sm:pb-15">
          <p
            id="alert-dialog-description"
            className="text-btnBlackTxtColor p-10 sm:p-20 text-center text-14 pb-5 sm:pb-10"
          >
            I understand that binary options trading carries significant risk and I am
            aware that I cannot cancel a trade once it has been placed.
          </p>
          <div className="w-full flex justify-center">
            <FormControlLabel
              label="Don't show this message again"
              control={
                <Checkbox
                  checked={!confirmModalShow}
                  icon={
                    <CheckBoxOutlineBlank className="bg-btnBlackBgColor text-grayTxtColor rounded" />
                  }
                  checkedIcon={
                    <Check className="bg-btnBlackBgColor text-brandColor rounded" />
                  }
                  onChange={handleChangeCheckBox}
                  size="small"
                />
              }
              className="text-btnBlackTxtColor text-14"
              sx={{ ".MuiFormControlLabel-label": { fontSize: "14px" } }}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-20">
        <button
          autoFocus
          className="w-full bg-brandColor text-btnTxtColor text-20 outline-none rounded-xl font-bold py-10"
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmTradePopup;
