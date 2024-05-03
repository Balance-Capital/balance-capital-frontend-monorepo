import Modal from "@material-ui/core/Modal";
import { useAccount } from "../../hooks/useAccount";
import { useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { BigNumber, Signer, ethers } from "ethers";
import { formatUtoken } from "../../helpers/data-translations";
import { useNetworkContext } from "../../context/NetworkContext";
import { Underlying_Token } from "../../core/constants/basic";
import { wethDeposit, wethWithdraw } from "../../contract-methods/erc20";
import { enqueueSnackbar } from "notistack";
import { NotifyMessage, NotifyType } from "../../core/constants/notification";
import { loadAccountBalances } from "../../store/reducers/account-slice";
import { Loader } from "../LoadingBoundary/Loader";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const WrapUnwrapModal = ({ open, setOpen }: Props) => {
  const { address, signer } = useAccount();
  const dispatch = useDispatch();
  const { currentNetworkChainId } = useNetworkContext();
  const { data: nativeBalance } = useBalance({
    address,
    watch: true,
  });
  const balance = useSelector((state: RootState) =>
    state.account.uTokenBalance
      ? formatUtoken(BigNumber.from(state.account.uTokenBalance))
      : -1
  );
  const [loading, setLoading] = useState(false);

  const [getData, setData] = useState({
    from: {
      balance: parseFloat(Number(nativeBalance?.formatted).toFixed(6)) || 0,
      symbol: nativeBalance?.symbol || "",
    },
    to: {
      balance: balance > 0 ? +balance.toFixed(6) : 0.0,
      symbol: Underlying_Token[currentNetworkChainId].symbol,
    },
  });
  const [inputValue, setInputValue] = useState("");

  const handleSwitch = () => {
    setInputValue("");
    setData((prev) => ({
      from: prev.to,
      to: prev.from,
    }));
  };

  const handleWrap = async () => {
    const amount = inputValue ? +inputValue : 0;
    if (inputValue) {
      setInputValue("");
    }
    if (address) {
      if (!isNaN(amount)) {
        try {
          setLoading(true);
          if (signer instanceof Signer) {
            await wethDeposit(
              Underlying_Token[currentNetworkChainId].address,
              ethers.utils.parseEther(amount.toString()).toString(),
              signer
            );
            dispatch(loadAccountBalances(address));
            enqueueSnackbar(NotifyMessage.WrapSuccess, {
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

  const handleUnwrap = async () => {
    const amount = inputValue ? +inputValue : 0;
    if (inputValue) {
      setInputValue("");
    }
    if (address) {
      if (!isNaN(amount)) {
        try {
          setLoading(true);
          if (signer instanceof Signer) {
            await wethWithdraw(
              Underlying_Token[currentNetworkChainId].address,
              ethers.utils.parseEther(amount.toString()).toString(),
              signer
            );
            dispatch(loadAccountBalances(address));
            enqueueSnackbar(NotifyMessage.UnwrapSuccess, {
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

  useEffect(() => {
    setInputValue("");
    if (getData.from.symbol === nativeBalance?.symbol) {
      setData({
        from: {
          balance: parseFloat(Number(nativeBalance?.formatted).toFixed(6)) || 0,
          symbol: nativeBalance?.symbol || "",
        },
        to: {
          balance: balance > 0 ? +balance.toFixed(6) : 0.0,
          symbol: Underlying_Token[currentNetworkChainId].symbol,
        },
      });
    } else {
      setData({
        from: {
          balance: balance > 0 ? +balance.toFixed(6) : 0.0,
          symbol: Underlying_Token[currentNetworkChainId].symbol,
        },
        to: {
          balance: parseFloat(Number(nativeBalance?.formatted).toFixed(6)) || 0,
          symbol: nativeBalance?.symbol || "",
        },
      });
    }
  }, [balance, nativeBalance?.formatted]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="relative w-[90vw] max-w-600 p-15 md:p-40 rounded-3xl border-2 border-modalStrokeColor bg-modalBgColor">
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
            Wrap {nativeBalance?.symbol}
          </div>
          <div className="font-InterRegular bg-btnGreenBgColor/10 text-successTxtColor text-center p-20 rounded-2xl text-14 sm:text-18 my-30">
            Wrap {nativeBalance?.symbol} to be used for placing trades.
          </div>
          <div className="my-30">
            <div className="font-InterRegular bg-tabBgColor p-20 rounded-2xl">
              <div className="flex items-center justify-between gap-15">
                <span className="text-whiteTxtColor text-16 sm:text-20">You send</span>
                <span className="text-grayTxtColor text-14 sm:text-18">
                  Balance: {getData.from.balance} {getData.from.symbol}
                  <button
                    className="text-successTxtColor ml-5"
                    onClick={() => {
                      setInputValue(getData.from.balance.toString());
                    }}
                  >
                    MAX
                  </button>
                </span>
              </div>
              <div className="flex items-center justify-between gap-15 mt-20">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  type="number"
                  className="bg-transparent outline-none text-22 placeholder:text-whiteTxtColor min-w-0 flex-1"
                  placeholder="0.00"
                  max={getData.from.balance}
                  disabled={getData.from.balance <= 0}
                />
                <div className="p-10 rounded-xl bg-btnBlackBgColor flex items-center gap-10">
                  <img
                    src={`../../assets/images/${getData.from.symbol}.png`}
                    alt={`${getData.from.symbol} logo`}
                    className="w-25 h-25"
                  />
                  {getData.from.symbol}
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={handleSwitch}
                className="absolute p-15 sm:p-20 rounded-2xl bg-modalBgColor top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27.635"
                  height="21.745"
                  viewBox="0 0 27.635 21.745"
                  className="h-[17.745px] w-[23.635px] sm:h-[21.745px] sm:w-[27.635px]"
                >
                  <path
                    id="Path_23429"
                    data-name="Path 23429"
                    d="M159.483,23.72l5.623-5.78a1.613,1.613,0,0,0,.458-1.084,1.421,1.421,0,0,0-1.476-1.476,1.375,1.375,0,0,0-1.04.425l-2.269,2.359-.961,1.129.056-2.057V3.955a1.492,1.492,0,1,0-2.985,0V17.236l.056,2.057-.961-1.129L153.715,15.8a1.391,1.391,0,0,0-1.04-.425,1.421,1.421,0,0,0-1.476,1.476,1.613,1.613,0,0,0,.458,1.084l5.623,5.78A1.5,1.5,0,0,0,159.483,23.72ZM144.011,2.949l-5.623,5.768a1.586,1.586,0,0,0-.458,1.073,1.478,1.478,0,0,0,2.515,1.062l2.269-2.37.961-1.118-.056,2.057V22.7a1.492,1.492,0,1,0,2.985,0V9.422l-.056-2.057.961,1.118,2.269,2.37a1.478,1.478,0,0,0,2.515-1.062,1.586,1.586,0,0,0-.458-1.073l-5.623-5.768A1.49,1.49,0,0,0,144.011,2.949Z"
                    transform="translate(-137.93 -2.457)"
                    fill="#5b7481"
                  />
                </svg>
              </button>
            </div>
            <div className="font-InterRegular bg-tabBgColor p-20 rounded-2xl mt-10">
              <div className="flex items-center justify-between gap-15">
                <span className="text-whiteTxtColor text-16 sm:text-20">You recieve</span>
                <span className="text-grayTxtColor text-14 sm:text-18">
                  Balance: {getData.to.balance} {getData.to.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between gap-15 mt-20">
                <input
                  type="number"
                  disabled={true}
                  className="bg-transparent outline-none text-grayTxtColor text-22 placeholder:text-grayTxtColor min-w-0 flex-1"
                  placeholder="0.00"
                  value={+inputValue <= getData.from.balance ? inputValue : ""}
                />
                <div className="p-10 rounded-xl bg-btnBlackBgColor flex items-center gap-10">
                  <img
                    src={`../../assets/images/${getData.to.symbol}.png`}
                    alt={`${getData.to.symbol} logo`}
                    className="w-25 h-25"
                  />
                  {getData.to.symbol}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="font-InterRegular bg-btnRedBgColor/10 text-warnTxtColor text-center p-10 rounded-xl text-14 sm:text-16 my-10">
            Insufficient funds
          </div> */}
          <div className="mt-30 flex gap-10 items-stretch h-80 font-InterMedium text-20 sm:text-24">
            {loading ? (
              <div className="w-full flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <>
                <button
                  onClick={handleWrap}
                  disabled={
                    !(
                      getData.from.balance > 0 &&
                      getData.from.symbol === nativeBalance?.symbol
                    )
                  }
                  className="flex-1 bg-btnGreenBgColor text-btnTxtColor disabled:bg-btnUnselectBgColor disabled:text-btnUnselectTxtColor rounded-2xl"
                >
                  Wrap
                </button>
                <button
                  onClick={handleUnwrap}
                  disabled={
                    !(
                      getData.from.balance > 0 &&
                      getData.from.symbol ===
                        Underlying_Token[currentNetworkChainId].symbol
                    )
                  }
                  className="flex-1 border-2 border-btnGreenBgColor text-successTxtColor disabled:border-2 disabled:border-btnUnselectBgColor disabled:text-btnUnselectTxtColor rounded-2xl"
                >
                  Unwrap
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WrapUnwrapModal;
