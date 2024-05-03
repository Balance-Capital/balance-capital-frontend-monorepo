import Modal from "@material-ui/core/Modal";
import { useNetworkContext } from "../../context/NetworkContext";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const BuyEthModal = ({ open, setOpen }: Props) => {
  const { currentNetworkChainId } = useNetworkContext();
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="relative w-[90vw] max-w-500 p-15 md:p-40 rounded-3xl border-2 border-modalStrokeColor bg-modalBgColor">
          <div
            className="absolute bg-btnBlackStrokeColor rounded-full p-5 md:p-10 top-15 right-10 sm:right-15 cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <img
              src="./assets/icons/close-icon.svg"
              alt="close"
              className="w-15 h-15 md:w-20 md:h-20"
            />
          </div>
          <div className="text-btnBlackTxtColor text-22 md:text-26 text-center">
            Insufficient funds for gas
          </div>
          <div className="bg-btnRedBgColor/10 text-warnTxtColor text-center p-20 rounded-2xl text-18 my-30">
            You do not have enough ETH for transaction fees.
          </div>
          <div className="text-btnBlackTxtColor mb-10">Wallet balance:</div>
          <div className="py-15 px-30 border-2 border-btnRedStrokeColor rounded-3xl flex justify-between items-center mb-25 bg-btnBlackBgColor">
            <div className="text-grayTxtColor text-26 font-bold">0.00</div>
            <div className="text-btnBlackTxtColor text-22 px-20 py-5 flex gap-10 items-center bg-btnBlackBgColor rounded-2xl">
              <img src="./assets/images/ETH.png" alt="ETH" className="w-30 h-30" />
              ETH
            </div>
          </div>
          <a
            href={`https://bridge.arbitrum.io/?l2ChainId=${currentNetworkChainId}`}
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
            <div className="text-center text-btnBlackTxtColor">Buy or bridge ETH</div>
            <img src="./assets/images/up-right-icon.svg" alt="up right" />
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default BuyEthModal;
