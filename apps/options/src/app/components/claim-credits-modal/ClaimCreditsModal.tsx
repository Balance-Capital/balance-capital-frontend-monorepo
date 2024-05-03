import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { emitRyzeCreditClaimed } from "../../helpers/analytics";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

function ClaimCreditsModal({
  amount,
  open,
  address,
  setOpen,
  claimBtn,
}: {
  amount: number;
  open: boolean;
  address: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  claimBtn: () => void;
}) {
  const { pathname, search } = useLocation();
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);

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
  }, []);

  return (
    <Modal
      open={open}
      aria-labelledby="claim-credit-modal"
      aria-describedby="claim-credit-modal"
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
            Claim credits
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
                You’ve got a bonus{" "}
                <span className="text-brandColor">{amount} Ryze Credits</span> available
              </h2>
              <p className="text-grayTxtColor text-16">
                Trade on 1 minute or 3 minute rounds on any pair to use these credits. You
                can learn more{" "}
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
          <Link
            to={url}
            onClick={() => {
              emitRyzeCreditClaimed(address, amount);
              claimBtn();
              setOpen(false);
            }}
            className="inline-block text-center w-full font-InterMedium xs:text-18 md:text-22 py-20 rounded-2xl text-lightwhite bg-success"
          >
            Claim
          </Link>
        </section>
      </Box>
    </Modal>
  );
}

export default ClaimCreditsModal;
