import Modal from "@material-ui/core/Modal";
import React from "react";

type Props = {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
};

const LocationBlockModal = ({ open, setOpen }: Props) => {
  return (
    <Modal open={open}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline-none">
        <div className="relative w-[90vw] max-w-600 p-15 md:p-40 rounded-3xl border-2 border-[#0D181A] bg-charcoalGray">
          <div className="w-80 h-80 md:w-100 md:h-100 flex justify-center items-center rounded-full bg-warning/10 mx-auto my-25 md:my-40">
            <img
              src="./assets/icons/warning.svg"
              alt="warning"
              className="w-45 md:w-55"
            />
          </div>
          <div className="text-primary text-24 sm:text-30 text-center px-20 sm:px-30">
            Sorry,{" "}
            <a href="https://ryze.fi" className="text-success">
              Ryze.fi
            </a>{" "}
            is unavailable in your location
          </div>
          <div className="text-[#80A2B4] text-18 text-center px-10 sm:px-15 my-15">
            Because you appear to be in a jurisdiction that prohibits the trading of
            binary options, you are prohibited from using this platform.
          </div>
          <div className="flex justify-center">
            <a
              className="border-2 border-success rounded-lg text-primary px-25 py-15 mt-20 transition-all hover:bg-success"
              href="https://ryze.fi/docs"
            >
              Visit help center
            </a>
            <span
              className="border-2 border-success rounded-lg text-primary ml-20 px-25 py-15 mt-20 transition-all hover:bg-success cursor-pointer"
              onClick={() => {
                setOpen(false);
              }}
            >
              Confirm
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LocationBlockModal;
