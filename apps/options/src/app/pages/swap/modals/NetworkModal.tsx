import { memo, useState } from "react";
import { Fade, FormControl, OutlinedInput, SvgIcon } from "@material-ui/core";
import { Box, Modal } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

import { NetworkDetail, swapNetworks } from "../data";
import "../swap.scss";
import { Check } from "@mui/icons-material";

function NetworkModal(props: {
  title?: string;
  cur: NetworkDetail | undefined;
  open: boolean;
  onClose: (arg0: string, arg1: NetworkDetail | null) => void;
  type: string;
}) {
  const [networkName, setNetworkName] = useState("");
  return (
    <Modal open={props.open} onClose={() => props.onClose(props.type, null)}>
      <Fade in={props.open}>
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
          className="network-modal xs:w-[24rem] sm:w-[32rem] mx-auto border-2 border-modalStrokeColor rounded-[2rem] bg-modalBgColor"
        >
          <Box>
            <Box className="flex justify-between items-center">
              <div className="text-24 text-btnBlackTxtColor font-bold">
                {props.title || "Select Network"}
              </div>
              <button
                className="bg-bluishLight hover:bg-bluishLightHover rounded-full bg-btnBlackStrokeColor"
                onClick={() => props.onClose(props.type, null)}
              >
                <SvgIcon
                  component={ClearIcon}
                  className="text-grayTxtColor"
                  sx={{
                    fontSize: "1.2rem",
                    m: "0.4rem",
                  }}
                />
              </button>
            </Box>
          </Box>
          <Box>
            <FormControl
              className="line-border w-full"
              variant="standard"
              color="primary"
            >
              <OutlinedInput
                placeholder={`Search for a network`}
                value={networkName}
                onChange={(e) => {
                  setNetworkName(e.target.value);
                }}
                style={{
                  padding: "15px",
                  fontSize: "18px",
                  color: "white",
                  borderRadius: "20px",
                  fontFamily: "InterMedium",
                }}
                className="border-2 border-btnBlackStrokeColor text-btnBlackTxtColor placeholder:text-btnBlackTxtColor"
                notched={false}
              />
            </FormControl>
          </Box>
          <Box pr="10px" height="400px" overflow="auto">
            {swapNetworks
              .filter(
                (network) =>
                  network.blockchain.toLowerCase().includes(networkName.toLowerCase()) ||
                  network.name.toLowerCase().includes(networkName.toLowerCase())
              )
              .map((network, index) => {
                return (
                  <Box
                    display="flex"
                    className="cursor-pointer border-2 border-btnBlackStrokeColor text-btnBlackTxtColor"
                    width="100%"
                    alignItems="center"
                    mb="10px"
                    key={network.blockchain}
                    onClick={() => props.onClose(props.type, network)}
                    p="15px"
                    sx={{
                      borderRadius: "30px",
                    }}
                  >
                    <Box width={40} mr="20px">
                      {network.logo}
                    </Box>
                    <div className="font-InterMedium text-20 text-btnBlackTxtColor font-bold">
                      {network.name}
                    </div>
                    {network.chainId === props.cur?.chainId ? (
                      <div className="flex items-center justify-center rounded-full w-30 h-30 ml-auto border-2 border-btnBlackStrokeColor bg-brandColor">
                        <Check className="text-14 font-bold" />
                      </div>
                    ) : (
                      <div className="rounded-full w-30 h-30 ml-auto border-2 border-btnBlackStrokeColor"></div>
                    )}
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export default memo(NetworkModal);
