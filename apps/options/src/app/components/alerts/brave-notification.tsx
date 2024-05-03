import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import useDetectBrave from "../../hooks/useDetectBrave";
import useDetectAdBlocker from "../../hooks/useDetectAdBlocker";
import useInternetStatus from "../../hooks/useInternetStatus";

export default function BraveNotification() {
  const { isOnline } = useInternetStatus();
  const isBrave = useDetectBrave();
  const isAdblocker = useDetectAdBlocker();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOnline) {
      if (isBrave) {
        setOpen(isBrave);
      }
      if (isAdblocker) {
        setOpen(true);
      }
    }
  }, [isBrave, isAdblocker]);

  return (
    <Modal open={open} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 540,
          bgcolor: "#0f1617",
          border: "1px solid #12B3A8",
          borderRadius: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          p: 4,
        }}
      >
        {isBrave ? (
          <>
            <h2
              className="font-InterRegular text-textWhite xs:text-14 sm:text-18 text-center"
              id="modal-modal-title"
            >
              We see you are using brave browser with brave shield on. Probably a good
              idea on most sites. Don't worry we won't be showing you hot singles in your
              area. Just to let you know we are using some frontend tracking in order for
              us to optimise UX. If you want to contribute feel free to turn brave shield
              off. If not, all good happy trading.
            </h2>
            <img src="./assets/images/brave-noti.png" alt="" className="" />
          </>
        ) : null}
        {!isBrave && isAdblocker ? (
          <h2
            className="font-InterRegular text-textWhite xs:text-14 sm:text-18 text-center"
            id="modal-modal-title"
          >
            We see you are using an ad blocker. Probably a good idea on most sites. Don't
            worry we won't be showing you hot singles in your area. Just to let you know
            we are using some fronted tracking in order for us to optimise UX. If you want
            to contribute feel free to turn your ad blocker off. If not, all good happy
            trading.
          </h2>
        ) : null}
        <button
          onClick={() => setOpen(false)}
          className="bg-success w-1/2 mx-auto py-[8px] rounded-[10px] font-InterRegular text-textWhite xs:text-14 sm:text-18"
        >
          OK, got it!
        </button>
      </Box>
    </Modal>
  );
}
