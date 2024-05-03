import { Box, FormControl, OutlinedInput } from "@material-ui/core";
import { memo } from "react";
import ReactLoading from "react-loading";

import { modalType } from "./data";
import "./swap.scss";
import { ExpandMore } from "@mui/icons-material";
import { customizeToken } from "./modals/TokenModal";
import { convertToLocaleString } from "@fantohm/shared-helpers";

function ToTokenSection(props: any) {
  const toToken = customizeToken(props.toToken);
  return (
    <Box className="flex flex-col w-full">
      <div className="font-InterRegular flex items-center justify-between">
        <div className="text-20 leading-7 text-lightwhite">You receive</div>
        <Box
          className="flex items-center rounded-xl bg-[#12b3a81a] text-[#BDE0EB] px-10 py-5 cursor-pointer"
          onClick={() => props?.opeNetworkModal(modalType.to)}
        >
          {!props?.toNetwork ? (
            <ReactLoading type="spinningBubbles" color="#BDE0EB" width={20} height={20} />
          ) : (
            <div className="flex items-center justify-between">
              {props?.toNetwork?.logo && (
                <div className="[&>svg]:w-20 mr-5 text-18">{props.toNetwork.logo}</div>
              )}
              <div className="text-lightwhite font-bold">{props?.toNetwork?.name}</div>
              <div>
                <ExpandMore className="text-lightwhite" />
              </div>
            </div>
          )}
        </Box>
      </div>
      <div className="flex items-center justify-between mt-10">
        <div className="grow w-0 outline-none">
          <FormControl className="w-full" variant="standard" color="primary">
            <OutlinedInput
              className="flex bg-[#0a1314] rounded-2xl p-10"
              inputProps={{
                className:
                  "w-0 grow font-InterMedium text-20 outline-none bg-transparent",
                style: {
                  paddingTop: "0px",
                  paddingBottom: "0px",
                  color: "#BDE0EB",
                },
                pattern: "'d*'/",
              }}
              id="to-token-amount-input"
              type="string"
              disabled
              placeholder="0.00"
              value={
                convertToLocaleString(
                  Number(props?.toTokenAmount) > 0
                    ? Number(props?.toTokenAmount).toFixed(4)
                    : "0"
                ).strValue
              }
              labelWidth={0}
              style={{ color: "white", outline: "none", border: "none" }}
              endAdornment={
                <Box
                  className="flex items-center justify-center rounded-xl gap-5 bg-[#080d0e] p-10 cursor-pointer"
                  onClick={() => props?.openTokenModal(modalType.to)}
                >
                  {props?.toUpdateTokenLoading ? (
                    <ReactLoading
                      type="spinningBubbles"
                      color="#BDE0EB"
                      width={20}
                      height={20}
                    />
                  ) : props?.toToken ? (
                    <>
                      <img
                        className="w-20 h-20 rounded-full"
                        src={toToken?.image}
                        alt={toToken?.symbol}
                        onError={(error) => {
                          error.currentTarget.src = "./assets/images/default-token.png";
                        }}
                      />
                      <div className="font-InterMedium text-18 text-lightwhite">
                        {toToken?.symbol}
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

export default memo(ToTokenSection);
