import { Box, Modal } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { SvgIcon } from "@mui/material";
import { memo, useEffect, useState } from "react";

import "../swap.scss";

function SlippageModal(props: {
  open: boolean;
  slippage: number;
  setSlippage: (newSlippage: number) => void;
  onClose: () => void;
}) {
  const [slippage, setSlippage] = useState(props.slippage.toString());

  useEffect(() => {
    setSlippage(props.slippage.toString());
  }, [props.slippage]);

  const slippageItem = (value: number) => {
    return (
      <Box
        key={value}
        className="flex cursor-pointer justify-center mr-10 mb-10 text-white"
        style={{
          border: "2px solid #0d181a",
          borderRadius: "30px",
          padding: "10px",
          width: "20%",
          minWidth: "100px",
          height: "48px",
          fontSize: "16px",
          background: props.slippage === value ? "#12b3a8" : "#0a1314",
        }}
        onClick={() => {
          setSlippage(value.toString());
          props.setSlippage(value);
        }}
      >
        {value} %
      </Box>
    );
  };
  const settings = [0.1, 0.5, 1];
  return (
    <Modal open={props.open} onClose={() => props.onClose()}>
      <Box
        padding="40px"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 370,
          border: "1px solid #0d181a",
          borderRadius: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          p: 4,
        }}
        className="network-modal xs:w-[24rem] sm:w-[32rem] mx-auto border-2 border-blackLightTwo rounded-[2rem] bg-charcoalGray"
      >
        <Box className="flex justify-between items-center" mb="20px">
          <div className="text-24 text-lightwhite font-bold">Swap Settings</div>
          <button
            className="bg-bluishLight hover:bg-bluishLightHover rounded-full bg-[#0a1314]"
            onClick={() => props.onClose()}
          >
            <SvgIcon
              component={ClearIcon}
              sx={{
                color: "#274246",
                fontSize: "1.2rem",
                m: "0.4rem",
              }}
            />
          </button>
        </Box>

        <Box className="flex justify-between items-center mb-4">
          <div className="text-18 text-lightwhite font-bold">Slippage</div>
        </Box>

        <Box className="grid xs:grid-cols-3 sm:grid-cols-4" sx={{ fontSize: "16px" }}>
          <div
            className="mr-10 mb-10"
            style={{
              width: "100px",
              minWidth: "100px",
              position: "relative",
            }}
          >
            <input
              value={slippage}
              type="number"
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E" || e.key === "-") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const str = e.target.value;
                let value = Number(str);
                if (value < 0) {
                  value = 0;
                }
                if (value > 100) {
                  value = 100;
                }
                setSlippage(str);
                props.setSlippage(value);
              }}
              className="w-full flex cursor-pointer justify-center text-center text-white"
              style={{
                background: "transparent",
                border: !settings.includes(props.slippage)
                  ? "2px solid #13c9bd"
                  : "2px solid #0d181a",
                borderRadius: "30px",
                padding: "4px",
                height: "48px",
                fontSize: "16px",
                outline: "none",
                paddingLeft: "10px",
                paddingRight: "30px",
              }}
              onFocus={() => {
                props.setSlippage(Number(slippage));
              }}
            />
            <div
              className="text-white"
              style={{
                position: "absolute",
                right: "15px",
                top: "12px",
              }}
            >
              %
            </div>
          </div>
          {settings.map((item) => {
            return slippageItem(item);
          })}
        </Box>
      </Box>
    </Modal>
  );
}

export default memo(SlippageModal);
