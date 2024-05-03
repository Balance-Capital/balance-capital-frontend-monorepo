import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store";
import { enqueueSnackbar } from "notistack";
import { NOTIFY_MSG } from "../../constants/notification";

function ExportModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const param = useSelector((state: RootState) => state.leftnavbar.queryParam);
  return (
    <Modal open={open} aria-labelledby="export-modal" aria-describedby="export-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-52%, -50%)",
          minWidth: 370,
          width: "96%",
          ml: "2%",
          maxWidth: 700,
          bgcolor: "#0D181A",
          border: "2px solid #0D181A",
          borderRadius: "50px",
          p: 3,
        }}
      >
        <section className="relative flex items-center justify-between">
          <h2 className="font-InterMedium xs:text-24 md:text-30 text-greenish-0">
            Export code:
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="bg-darkgreen-4 rounded-full p-3"
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
        <section className="bg-darkgreen-3 overflow-auto h-44 text-sm text-greenish-0 p-2 mt-3 rounded-xl">
          <div className="break-words">
            {`<iframe
          id="ryze-widget"
          title="ryze-widget"
          allow="clipboard-read; clipboard-write"
          src="${
            process.env["NX_TRADE_WIDGET_URL"] + param
          }" width="100%" height="100%"></iframe>`}
          </div>
        </section>
        <button
          onClick={() => {
            enqueueSnackbar(NOTIFY_MSG.COPIED, { variant: "success" });
            navigator.clipboard.writeText(
              `<iframe 
              id="ryze-widget"
              title="ryze-widget"
              allow="clipboard-read; clipboard-write"
              src="${
                process.env["NX_TRADE_WIDGET_URL"] + param
              }" width="100%" height="100%"></iframe>`
            );
          }}
          className="mt-3 font-InterMedium xs:text-24 md:text-30 text-greenish-0 bg-greenish-1 px-5 py-2 rounded-2xl active:bg-greenish-3"
        >
          Copy code
        </button>
      </Box>
    </Modal>
  );
}

export default ExportModal;
