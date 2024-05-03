import { Box, Modal } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import useInternetStatus from "../../hooks/useInternetStatus";
import { getCustomHeaders } from "../tvchart/api/helper";

export default function UpdateBar() {
  const { isOnline } = useInternetStatus();
  const hash = useRef(null);
  const [open, setOpen] = useState(false);

  const fetchHash = async () => {
    const headers = getCustomHeaders();
    const response = await axios("/hash.json", {
      headers: headers,
      withCredentials: true,
    });
    hash.current = response?.data?.hash;
    console.log(`call hash.json and pick ${response.data?.hash}`);
  };

  const callHash = async () => {
    if (isOnline) {
      try {
        const headers = getCustomHeaders();
        const response = await axios(`/hash.${hash.current}.json`, {
          headers: headers,
          withCredentials: true,
        });
        if (!response.data?.hash) {
          console.log(
            `Called successfully but hash.${hash.current}.json not available open modal to reload`
          );
          setOpen(true);
        } else {
          console.log(`hash.${hash.current}.json still available`);
        }
      } catch (err) {
        setOpen(true);
        console.log(
          `Error: hash.${hash.current}.json not available open modal to reoload`,
          err
        );
      }
    } else {
      console.log("callHash function will not run status offline");
    }
  };

  useEffect(() => {
    let interval = {} as NodeJS.Timeout;
    if (isOnline) {
      fetchHash();
      interval = setInterval(() => {
        callHash();
      }, 60000);
    } else {
      console.log("Interval will not run status offline");
    }
    return () => {
      clearInterval(interval);
      console.log(`clear interval last hash ${hash.current}`);
    };
  }, [isOnline]);

  return (
    <Modal open={open} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 370,
          bgcolor: "#0f1617",
          border: "1px solid #12B3A8",
          borderRadius: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          p: 4,
        }}
      >
        <h2
          className="font-InterRegular text-textWhite xs:text-18 sm:text-24 text-center"
          id="modal-modal-title"
        >
          Hey! You still there?
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="bg-success w-1/2 mx-auto py-[8px] rounded-[10px] font-InterRegular text-textWhite xs:text-14 sm:text-20"
        >
          Refresh
        </button>
      </Box>
    </Modal>
  );
}
