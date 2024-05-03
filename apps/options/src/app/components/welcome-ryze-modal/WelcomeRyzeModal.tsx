import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setCurrentTimeframeId } from "../../store/reducers/trade-slice";
import { RootState } from "../../store";
import { formatUtoken, isActiveForChain } from "../../helpers/data-translations";
import { BigNumber } from "ethers";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";
import { Underlying_Token } from "../../core/constants/basic";

function WelcomeRyzeModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { currentNetworkChainId } = useNetworkContext();
  const dispatch = useDispatch();
  const { address } = useAccount();
  const [deactive, setDeactive] = useState(false);
  const { pathname, search } = useLocation();
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const balance = useSelector((state: RootState) =>
    state.account.uTokenBalance
      ? formatUtoken(BigNumber.from(state.account.uTokenBalance))
      : -1
  );
  const totalCredits = useSelector((state: RootState) =>
    state.ryzecredit.creditToken.totalCredits
      ? +state.ryzecredit.creditToken.totalCredits
      : 0
  );

  useEffect(() => {
    if (localStorage.getItem(`${address}RyzeWelcome`)) {
      setOpen(false);
      setDeactive(true);
    } else {
      setDeactive(false);
      setOpen(true);
      localStorage.setItem(`${address}RyzeWelcome`, "true");
    }
  }, [open]);

  const url = useMemo(() => {
    if (pathname.includes("/trade-widget")) {
      if (search.includes("&underlyingToken=")) {
        const ind = search.indexOf("&underlyingToken=");
        return `/trade-widget${search.slice(0, ind)}&underlyingToken=${
          underlyingToken.symbol
        }`;
      } else {
        if (search.length) {
          if (search.includes("underlyingToken=")) {
            return `/trade-widget?underlyingToken=${underlyingToken.symbol}`;
          } else {
            return `/trade-widget${search}&underlyingToken=${underlyingToken.symbol}`;
          }
        } else {
          return `/trade-widget?underlyingToken=${underlyingToken.symbol}`;
        }
      }
    } else {
      return `/trade?underlyingToken=${underlyingToken.symbol}`;
    }
  }, [pathname, address]);

  return deactive && !isActiveForChain(currentNetworkChainId) ? null : (
    <Modal
      open={open}
      aria-labelledby="choose-theme-modal"
      aria-describedby="choose-theme-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-52%, -50%)",
          minWidth: 370,
          width: "96%",
          ml: "2%",
          maxWidth: 592,
          borderRadius: "25px",
        }}
        className="bg-modalBgColor border-2 border-modalStrokeColor"
      >
        <section className="relative flex items-center justify-center pt-20">
          <h2 className="font-InterMedium xs:text-24 md:text-30 text-btnBlackTxtColor">
            Welcome to Ryze.fi
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="right-15 absolute bg-btnBlackStrokeColor p-15 rounded-full"
          >
            <svg
              className="xs:w-15 md:w-[22px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 22.828 23.828"
            >
              <g
                id="Group_13412"
                data-name="Group 13412"
                transform="translate(1.264 1.765)"
              >
                <line
                  id="Line_184"
                  data-name="Line 184"
                  x1="20"
                  y2="21"
                  transform="translate(0.15 -0.351)"
                  fill="none"
                  stroke="#274246"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <line
                  id="Line_185"
                  data-name="Line 185"
                  x2="20"
                  y2="21"
                  transform="translate(0.15 -0.351)"
                  fill="none"
                  stroke="#274246"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </button>
        </section>
        <section className="p-35 space-y-15">
          <div className="bg-[url('./assets/images/bg-claim-credit-modal.png')] xs:bg-center md:bg-cover border-2 border-btnBlackStrokeColor rounded-2xl p-20">
            <div className="xs:w-3/4 md:w-1/2 space-y-10">
              <h2 className="text-btnBlackTxtColor text-24">
                Unlock your <span className="text-brandColor">free credits</span> today
              </h2>
              <p className="text-grayTxtColor text-16">
                Make your first trade today to claim you free credits. You can learn more{" "}
                <a
                  href="https://ryze.fi/docs/referrals"
                  target="_blank"
                  className="text-brandColor"
                  rel="noreferrer"
                >
                  here.
                </a>
              </p>
            </div>
          </div>
          {balance || totalCredits ? (
            <Link
              to={url}
              onClick={() => {
                setOpen(false);
                dispatch(setCurrentTimeframeId(0));
              }}
              className="inline-block text-center w-full font-InterMedium xs:text-18 md:text-22 py-20 rounded-2xl text-whiteTxtColor bg-brandColor"
            >
              Start trading
            </Link>
          ) : (
            <>
              <div className="bg-btnRedBgColor/10 text-warnTxtColor text-center p-20 rounded-2xl text-18 my-30">
                You need native {Underlying_Token[currentNetworkChainId].symbol} in your
                wallet to trade.
              </div>
              <a
                href={`http://ryze.fi/docs/how-to-get-native-${Underlying_Token[
                  currentNetworkChainId
                ].symbol.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-20 bg-appblue/10 rounded-2xl text-18 text-appblue p-20 relative overflow-hidden"
              >
                <img
                  src="./assets/images/arbitrum-transparent.svg"
                  alt="arbitrum-transparent"
                  className="absolute top-15 left-30"
                />
                <img src="./assets/images/arbitrum.svg" alt="arbitrum" className="w-40" />
                <div className="text-center flex flex-col justify-start items-start text-20">
                  Buy or bridge native {Underlying_Token[currentNetworkChainId].symbol}
                  <span className="text-grayTxtColor text-16">
                    Swap tokens cross-chain instantly
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18.199"
                  height="18.509"
                  viewBox="0 0 18.199 18.509"
                  className="absolute top-15 right-15 [&>g>path]:stroke-[#BDE0EB]"
                >
                  <g
                    id="_9041645_arrow_top_right_icon_1_"
                    data-name="9041645_arrow_top_right_icon (1)"
                    transform="translate(0.75 1.06)"
                  >
                    <path
                      id="Path_3477"
                      data-name="Path 3477"
                      d="M17.888,16.888V.5H1.5"
                      transform="translate(-1.5 -0.5)"
                      fill="none"
                      stroke="#1c7fea"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      fillRule="evenodd"
                    />
                    <path
                      id="Path_3478"
                      data-name="Path 3478"
                      d="M16.313.5.5,16.888"
                      transform="translate(0.076 -0.5)"
                      fill="none"
                      stroke="#1c7fea"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      fillRule="evenodd"
                    />
                  </g>
                </svg>
              </a>
            </>
          )}
        </section>
      </Box>
    </Modal>
  );
}

export default WelcomeRyzeModal;
