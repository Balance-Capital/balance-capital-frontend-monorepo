import Modal from "@material-ui/core/Modal";
import React, { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "@mui/material/Button";
import { useDispatch } from "react-redux";
import { setShowPlatformNotice } from "../../store/reducers/app-slice";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useNetworkContext } from "../../context/NetworkContext";
import { Underlying_Token } from "../../core/constants/basic";

type Props = {
  page?: number;
  open: boolean;
};

const PlatformNoticeModal = ({ page, open }: Props) => {
  const dispatch = useDispatch();
  const { currentNetworkChainId } = useNetworkContext();

  const [pageStep, setPageStep] = useState<number>(page ? page : 1);
  const [isOpen, setIsOpen] = useState(open);
  const [checked, setChecked] = useState(false);

  return (
    <Modal
      open={isOpen}
      onClose={(e, reason) => {
        if (reason && reason === "backdropClick") return;
        setIsOpen(false);
      }}
    >
      <div className="w-[90vw] max-w-500 p-15 md:p-40 rounded-3xl border-2 border-[#0D181A] bg-charcoalGray absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="w-50 h-50 md:w-60 md:h-60 bg-success/10 text-success rounded-full mx-auto my-20 flex justify-center items-center">
          <InfoOutlinedIcon className="text-30 md:text-36" />
        </div>
        {pageStep === 1 ? (
          <div>
            <div className="text-lightwhite text-24 md:text-34 text-center">
              Platform Notice
            </div>
            <div className="text-lightwhite text-16 md:text-20 text-center m-20">
              Due to the platform being in beta mode, there is a chance that there may not
              be sufficient liquidity to place trades. If they don’t get placed, you will
              be able to claim them in closed positions.
            </div>
            <Button
              className="bg-success rounded-2xl text-[#EFF7FF] text-20 md:text-24 w-full py-10 md:py-15 mt-30 normal-case"
              onClick={() => setPageStep(2)}
            >
              Next
            </Button>
          </div>
        ) : (
          <div>
            <div className="text-lightwhite text-24 md:text-34 text-center">
              Native {Underlying_Token[currentNetworkChainId].symbol}
            </div>
            <div className="text-lightwhite text-16 md:text-20 text-center m-20">
              You will need native {Underlying_Token[currentNetworkChainId].symbol} in
              your wallet to begin trading. You can learn more about this{" "}
              <a
                href={`http://ryze.fi/docs/how-to-get-native-${Underlying_Token[
                  currentNetworkChainId
                ].symbol.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success underline"
              >
                here
              </a>
              .
            </div>
            <div className="text-lightwhite flex items-center justify-center gap-15 mt-60 mb-10">
              <div
                className={`w-20 h-20 flex justify-center items-center rounded-md cursor-pointer transition-all ${
                  checked ? "bg-success" : "bg-disable hover:bg-second"
                }`}
                onClick={() => setChecked((prev) => !prev)}
              >
                {checked && <CheckRoundedIcon className="text-textWhite text-20" />}
              </div>
              Don’t show this message again
            </div>
            <Button
              className="bg-success rounded-2xl text-[#EFF7FF] text-20 md:text-24 w-full py-10 md:py-15 mt-30 normal-case"
              onClick={() => {
                setIsOpen(false);
                dispatch(setShowPlatformNotice(!checked));
              }}
            >
              I understand
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlatformNoticeModal;
