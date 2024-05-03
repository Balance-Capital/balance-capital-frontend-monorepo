import Modal from "@material-ui/core/Modal";
import React, { useMemo } from "react";
import { EXPLORER_LINKS } from "../../core/constants/network";
import { Underlying_Token } from "../../core/constants/basic";
import { useNetworkContext } from "../../context/NetworkContext";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const BuyUSDCModal = ({ open, setOpen }: Props) => {
  const { currentNetworkChainId } = useNetworkContext();

  const URL = useMemo(() => {
    return `${EXPLORER_LINKS[currentNetworkChainId]}/token/${Underlying_Token[currentNetworkChainId].address}`;
  }, [currentNetworkChainId]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="relative w-[90vw] max-w-500 p-15 md:p-40 rounded-3xl border-2 border-modalStrokeColor bg-modalBgColor">
          <div
            className="absolute bg-btnBlackStrokeColor rounded-full p-5 md:p-10 top-15 right-15 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <img
              src="./assets/icons/close-icon.svg"
              alt="close"
              className="w-15 h-15 md:w-20 md:h-20"
            />
          </div>
          <div className="text-btnBlackTxtColor text-24 md:text-30 text-center">
            Buy Native {Underlying_Token[currentNetworkChainId].symbol}
          </div>
          <div className="bg-brandColor/10 text-brandColor text-center p-20 rounded-2xl text-18 my-30">
            You need{" "}
            <a href={URL} target="_blank" rel="noopener noreferrer" className="underline">
              native {Underlying_Token[currentNetworkChainId].symbol}
            </a>{" "}
            to begin trading.
          </div>
          <a
            href={`http://ryze.fi/docs/how-to-get-native-${Underlying_Token[
              currentNetworkChainId
            ].symbol.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-appblue/10 rounded-2xl text-18 text-appblue gap-10 p-20 relative overflow-hidden"
          >
            <img
              src="./assets/images/arbitrum-transparent.svg"
              alt="arbitrum-transparent"
              className="absolute top-15 left-30"
            />
            <img src="./assets/images/arbitrum.svg" alt="arbitrum" className="w-40" />
            <div className="text-center text-btnBlackTxtColor">
              Buy or bridge native {Underlying_Token[currentNetworkChainId].symbol}
            </div>
            <img src="./assets/images/up-right-icon.svg" alt="up right" />
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default BuyUSDCModal;
