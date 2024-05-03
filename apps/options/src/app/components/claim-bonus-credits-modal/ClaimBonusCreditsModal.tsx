import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";

function ClaimBonusCreditModal({
  open,
  tokenId,
  setOpen,
  claimBtn,
}: {
  open: boolean;
  tokenId: number;
  setOpen: Dispatch<SetStateAction<boolean>>;
  claimBtn: () => void;
}) {
  const { address } = useAccount();
  const [deactive, setDeactive] = useState(false);
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    if (address && currentNetworkChainId) {
      if (localStorage.getItem(`${address}${currentNetworkChainId}TokenId${tokenId}`)) {
        setDeactive(true);
      } else {
        setDeactive(false);
        if (
          tokenId > 1 &&
          localStorage.getItem(`${address}${currentNetworkChainId}TokenId${tokenId - 1}`)
        ) {
          localStorage.removeItem(
            `${address}${currentNetworkChainId}TokenId${tokenId - 1}`
          );
        }
        localStorage.setItem(
          `${address}${currentNetworkChainId}TokenId${tokenId}`,
          "true"
        );
      }
    }
  }, [address, currentNetworkChainId]);

  return deactive ? null : (
    <Modal
      open={open}
      aria-labelledby="choose-theme-modal"
      aria-describedby="choose-theme-modal"
    >
      <Box
        sx={{
          position: "absolute",
          bottom: "2%",
          left: "2%",
          width: "calc(96%)",
          maxWidth: 700,
          borderRadius: "25px",
          overflow: "hidden",
        }}
        className="bg-modalBgColor border-2 border-modalStrokeColor"
      >
        <div className="bg-[url('./assets/images/bg-claim-credit-modal.png')] bg-no-repeat bg-center bg-cover p-20 space-y-20">
          <div className=" space-y-10">
            <h2 className="font-InterMedium xs:text-24 md:text-30 text-btnBlackTxtColor">
              Claim your <span className="text-brandColor">bonus credits</span>
            </h2>
            <p className="text-grayTxtColor text-16 w-1/2">
              Your next trade is on us. Learn more{" "}
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
          <div>
            <button
              onClick={() => {
                claimBtn();
                setOpen(false);
              }}
              className="border-2 border-brandColor px-30 py-10 font-InterMedium text-successTxtColor xs:text-18 md:text-22 rounded-2xl"
            >
              Claim
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-30 py-10 font-InterMedium text-grayTxtColor xs:text-18 md:text-22"
            >
              Close
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default ClaimBonusCreditModal;
