/* eslint-disable jsx-a11y/iframe-has-title */
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ModalSizeRatio = 1.778;

const DemoModal = ({ open, onClose }: Props) => {
  const [modalW, setModalW] = useState(0);
  const [modalH, setModalH] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const maxWidth = Math.min(1200, screenW - 24);
      const maxHeight = screenH - 24;

      const tmpH = Math.floor(maxWidth / ModalSizeRatio);
      const tmpW = Math.floor(maxHeight * ModalSizeRatio);

      const width = Math.min(tmpW, maxWidth);
      const height = Math.min(tmpH, maxHeight);

      setModalW(width);
      setModalH(height);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: modalW,
          height: modalH,
        }}
        className="rounded-xl bg-woodsmoke overflow-hidden relative"
      >
        <IconButton
          onClick={onClose}
          className="absolute z-10 top-10 right-10 md:top-20 md:right-20 text-textWhite bg-gray-500/10 hover:bg-gray-500/20"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className="h-full w-full">
          <video
            controls
            width={"100%"}
            height={"100%"}
            className="w-full h-full"
            autoPlay
          >
            <source
              src="https://drive.google.com/uc?id=1dvBi_vCSUJHoX_ebOUzwefMjF1zkFzOP"
              type="video/mp4"
            />
          </video>
        </div>
      </Box>
    </Modal>
  );
};

export default DemoModal;
