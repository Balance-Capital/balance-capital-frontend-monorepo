import Modal from "@material-ui/core/Modal";
import { useNetworkContext } from "../../context/NetworkContext";
import { Underlying_Token } from "../../core/constants/basic";
import { useRef, useState } from "react";
import { erc20Mint } from "../../contract-methods/erc20";
import { useAccount } from "../../hooks/useAccount";
import { BigNumber, Signer } from "ethers";
import { enqueueSnackbar } from "notistack";
import { NotifyMessage, NotifyType } from "../../core/constants/notification";
import { Loader } from "../LoadingBoundary/Loader";
import { useDispatch, useSelector } from "react-redux";
import { loadAccountBalances } from "../../store/reducers/account-slice";
import { RootState } from "../../store";
import {
  convertNumbertoShortenForm,
  formatUtoken,
  getOneMillionForBera,
} from "../../helpers/data-translations";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const MintTokenModal = ({ open, setOpen }: Props) => {
  const { address, signer } = useAccount();
  const dispatch = useDispatch();
  const { currentNetworkChainId } = useNetworkContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const balance = useSelector((state: RootState) =>
    state.account.uTokenBalance
      ? formatUtoken(BigNumber.from(state.account.uTokenBalance))
      : -1
  );
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    const amount = inputRef.current?.value ? +inputRef.current?.value : 0;
    if (inputRef.current?.value) {
      inputRef.current.value = "";
    }
    if (address) {
      if (!isNaN(amount)) {
        try {
          setLoading(true);
          if (signer instanceof Signer) {
            const d = BigNumber.from(10).pow(
              Underlying_Token[currentNetworkChainId].decimals
            );
            const amt = BigNumber.from(amount).mul(d);
            await erc20Mint(
              Underlying_Token[currentNetworkChainId].address,
              amt.toString(),
              signer
            );
            dispatch(loadAccountBalances(address));
            enqueueSnackbar(NotifyMessage.MintSuccess, {
              variant: NotifyType.SUCCESS,
            });
          }
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      }
    }
  };

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
            Insufficient funds
          </div>
          <div className="font-InterRegular bg-btnGreenBgColor/10 text-successTxtColor text-center p-20 rounded-2xl text-18 my-30">
            Mint {Underlying_Token[currentNetworkChainId].symbol} to be used for placing
            trades.
          </div>
          <div className="text-btnBlackTxtColor mb-10 flex items-center justify-between">
            <div>Amount to mint</div>
            <div>
              Balance: {convertNumbertoShortenForm(balance * getOneMillionForBera())}
            </div>
          </div>
          <div className="flex items-center justify-between bg-tabBgColor p-15 rounded-2xl gap-15">
            <input
              ref={inputRef}
              type="number"
              className="bg-transparent outline-none text-22 placeholder:text-grayTxtColor min-w-0 flex-1"
              placeholder="0"
            />
            <div className="p-10 rounded-xl bg-btnBlackBgColor flex items-center gap-5">
              <img
                src={`../../assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
                alt={`${Underlying_Token[currentNetworkChainId].symbol} logo`}
                className="w-25 h-25"
              />
              {Underlying_Token[currentNetworkChainId].symbol}
            </div>
          </div>
          {loading ? (
            <div className="mt-30 text-center">
              <Loader />
            </div>
          ) : (
            <button
              onClick={handleMint}
              className="mt-30 bg-btnGreenBgColor text-whiteTxtColor text-18 text-center w-full p-20 rounded-2xl"
            >
              Mint
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MintTokenModal;
