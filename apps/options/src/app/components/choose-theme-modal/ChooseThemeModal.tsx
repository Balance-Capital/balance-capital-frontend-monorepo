import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { Dispatch, SetStateAction } from "react";

function ChooseThemeModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
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
          transform: "translate(-50%, -50%)",
          minWidth: 370,
          width: "100%",
          maxWidth: 592,
          border: "2px solid #0D181A",
          borderRadius: "25px",
        }}
        className="bg-charcoalGray"
      >
        <section className="relative flex items-center justify-center pt-20">
          <h2 className="font-InterMedium xs:text-24 md:text-30 text-lightwhite">
            Theme
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="right-15 absolute bg-deepSea p-10 rounded-full"
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
          <h2 className="font-InterMedium xs:text-20 md:text-24 text-lightwhite">
            Choose theme
          </h2>
          <button className="w-full p-15 rounded-[35px] bg-charcoalGray flex items-center border-2 border-success">
            <span className="flex-1 xs:h-full sm:h-145 bg-obsidianBlack p-15 rounded-3xl flex items-center justify-center">
              <img src="./assets/images/bars-btn.png" alt="" />
            </span>
            <span className="flex-1 text-center font-InterMedium xs:text-20 md:text-24 text-lightwhite">
              Advanced
            </span>
          </button>
          <button className="w-full p-15 rounded-[35px] bg-charcoalGray flex items-center border-2 border-obsidianBlack">
            <span className="flex-1 xs:h-full sm:h-145 bg-obsidianBlack p-15 rounded-3xl flex items-center justify-center">
              <img src="./assets/images/up-down-btn.png" alt="" />
            </span>
            <span className="flex-1 text-center font-InterMedium xs:text-20 md:text-24 text-lightwhite">
              Basic
            </span>
          </button>
          <button className="w-full rounded-3xl text-center font-InterMedium xs:text-20 md:text-24 bg-success py-25 text-lightwhite">
            Save settings
          </button>
        </section>
      </Box>
    </Modal>
  );
}

export default ChooseThemeModal;
