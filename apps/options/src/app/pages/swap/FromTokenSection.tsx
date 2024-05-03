import { Box, FormControl, OutlinedInput } from "@material-ui/core";
import { memo } from "react";
import ReactLoading from "react-loading";

import { modalType } from "./data";
import "./swap.scss";
import { ExpandMore } from "@mui/icons-material";
import { customizeToken } from "./modals/TokenModal";
import { Underlying_Token } from "../../core/constants/basic";
import { currentNetworkChain } from "../../context/NetworkContext";

function FromTokenSection(props: any) {
  const fromToken = customizeToken(props.fromToken);
  return (
    <Box className="flex flex-col w-full">
      <div className="font-InterRegular flex items-center justify-between">
        <div className="text-20 leading-7 text-lightwhite">You send</div>
        <Box
          className="flex items-center rounded-xl bg-[#12b3a81a] text-[#BDE0EB] px-10 py-5 cursor-pointer"
          onClick={() => props?.opeNetworkModal(modalType.from)}
        >
          {!props?.fromNetwork ? (
            <ReactLoading type="spinningBubbles" color="#BDE0EB" width={20} height={20} />
          ) : (
            <div className="flex items-center justify-between">
              {props?.fromNetwork?.logo && (
                <div className="[&>svg]:w-20 mr-5 text-18">{props.fromNetwork.logo}</div>
              )}
              <div className="text-lightwhite font-bold">
                {props?.fromNetwork?.name || "Unsupported"}
              </div>
              <ExpandMore className="text-lightwhite" />
            </div>
          )}
        </Box>
      </div>
      <div className="flex items-center justify-between mt-10">
        <div className="grow w-0 outline-none">
          <FormControl className="w-full" variant="standard">
            <OutlinedInput
              className="flex bg-[#0a1314] rounded-2xl p-10"
              inputProps={{
                className:
                  "w-0 grow font-InterMedium text-20 text-[#BDE0EB] outline-none bg-transparent",
                style: {
                  paddingTop: "0px",
                  paddingBottom: "0px",
                },
                pattern: "'d*'/",
              }}
              id="from-token-amount-input"
              type="number"
              placeholder="0.00"
              notched={false}
              value={props?.fromTokenAmount}
              onChange={(e) => props?.setFromTokenAmount(e.target.value)}
              style={{ color: "white", outline: "none", border: "none" }}
              onKeyDown={(e) => {
                if (e.keyCode === 69) {
                  e.preventDefault();
                }
              }}
              endAdornment={
                <Box
                  className="flex items-center justify-center rounded-xl gap-5 bg-[#080d0e] p-10 cursor-pointer"
                  onClick={() => props?.openTokenModal(modalType.from)}
                >
                  {props?.fromUpdateTokenLoading ? (
                    <ReactLoading
                      type="spinningBubbles"
                      color="#BDE0EB"
                      width={20}
                      height={20}
                    />
                  ) : props.fromToken ? (
                    <>
                      <img
                        className="w-20 h-20 rounded-full"
                        src={fromToken?.image}
                        alt={fromToken?.symbol}
                        onError={(error) => {
                          error.currentTarget.src = "./assets/images/default-token.png";
                        }}
                      />
                      <div className="font-InterMedium text-18 text-lightwhite">
                        {fromToken?.symbol ||
                          Underlying_Token[currentNetworkChain.id].symbol}
                      </div>
                      <ExpandMore sx={{ color: "#5b7481" }} />
                    </>
                  ) : (
                    <>-</>
                  )}
                </Box>
              }
            />
          </FormControl>
        </div>
      </div>
    </Box>
  );
}

export default memo(FromTokenSection);
