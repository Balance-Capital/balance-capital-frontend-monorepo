import { Box, Typography, SvgIcon } from "@material-ui/core";
import { memo, useMemo } from "react";
import ReactLoading from "react-loading";

import { formatCurrency } from "./helpers";
import "./swap.scss";

import { expectSwapErrors, formatSwapTime, getSwapPath } from "./helpers/swap";
import { MetaResponse, SwapRequest, SwapResponse } from "rango-sdk-basic";
import { TokenWithAmount } from "./swap";
import { Tooltip } from "@mui/material";
import {
  LocalGasStation,
  Schedule,
  InfoOutlined,
  EastOutlined,
  NavigateNext,
} from "@mui/icons-material";
import { ethers } from "ethers";

export type BestRouteProps = {
  bestRoute: (SwapResponse & { amount: string; request: SwapRequest }) | null;
  routeLoading: boolean;
  metaData: MetaResponse | null;
  fromTokenAmount: number;
  toTokenAmount: number;
  fromToken?: TokenWithAmount;
  toToken?: TokenWithAmount;
  reason?: string;
  acceptSlippage: (slippage: number) => void;
};

function BestRoute(props: BestRouteProps) {
  const swapPath = props?.bestRoute?.route?.path;
  const acceptSlippage = props.acceptSlippage;
  const slippage = props.bestRoute?.request?.slippage || "0";

  return (
    <Box border="2px solid #0D181A" borderRadius="25px">
      {props?.routeLoading ? (
        <div className="flex items-center justify-center h-100">
          <ReactLoading type="spinningBubbles" color="rgb(18,179,168)" />
        </div>
      ) : !props?.bestRoute?.route ? (
        <div className="flex flex-col items-center justify-center h-100">
          <Typography variant="subtitle2" style={{ color: "#5B7481" }}>
            <SvgIcon
              component={InfoOutlined}
              fontSize="inherit"
              sx={{ marginRight: "5px", marginTop: "-3px" }}
            />
            {!props?.fromTokenAmount || Number(props.fromTokenAmount) === 0
              ? "Enter amount to find routes"
              : "No routes found"}
          </Typography>
          <Typography variant="subtitle2" style={{ color: "#5B7481" }}>
            {props?.reason}
          </Typography>
        </div>
      ) : (
        <>
          {props?.bestRoute?.route && (
            <div className="w-full flex justify-between">
              <div
                className="flex items-center"
                style={{
                  padding: "10px",
                  marginTop: "-2px",
                  marginLeft: "-2px",
                  borderColor: "#0D181A",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderTopLeftRadius: "24px",
                  borderTopRightRadius: "0px",
                  borderBottomRightRadius: "24px",
                  borderBottomLeftRadius: "0px",
                  borderTop: "none",
                  borderLeft: "none",
                  color: "gray",
                }}
              >
                <LocalGasStation
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "4px",
                    color: "#5B7481",
                  }}
                />
                <Tooltip
                  componentsProps={{
                    popper: {
                      style: {
                        zIndex: "500",
                      },
                    },
                    arrow: {
                      style: {
                        color: "#11171a",
                      },
                    },
                    transition: {
                      style: {
                        background: "#11171a",
                        borderRadius: "15px",
                      },
                    },
                    tooltip: {
                      sx: {
                        bgcolor: "#11171A",
                        fontFamily: "SpaceGroteskRegular",
                        fontSize: "0.65rem",
                        padding: "0.65rem",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                  title={
                    <div className="p-10">
                      <div className="mb-10">Gas Estimate:</div>
                      {props.bestRoute.route.fee.map((fee, i) => {
                        return (
                          <div
                            className={`pt-10 border-t-2 border-t-[#18272a] ${
                              props?.bestRoute?.route?.fee?.length === i + 1
                                ? ""
                                : "pb-10"
                            }`}
                            key={JSON.stringify(fee)}
                          >
                            <div>
                              {fee.token.blockchain}.{fee.token.symbol}
                            </div>
                            <div>
                              {ethers.utils.formatUnits(fee.amount, fee.token.decimals)} (
                              {fee.name == "Rango Fee"
                                ? "Aggregator Service Fee"
                                : fee.name}
                              )
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  }
                >
                  <div className="text-16 text-[#5B7481] cursor-pointer">
                    {formatCurrency(props?.bestRoute?.route?.feeUsd || 0, 2)}
                  </div>
                </Tooltip>
              </div>
              <div
                className="flex items-center"
                style={{
                  padding: "10px",
                  marginTop: "-2px",
                  marginRight: "-2px",
                  borderColor: "#0D181A",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  borderTopLeftRadius: "0px",
                  borderTopRightRadius: "24px",
                  borderBottomRightRadius: "0px",
                  borderBottomLeftRadius: "24px",
                  borderTop: "none",
                  borderRight: "none",
                  color: "gray",
                }}
              >
                <Schedule
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "4px",
                    color: "#5B7481",
                  }}
                />
                <span className="text-16 text-[#5B7481]">
                  {formatSwapTime(props?.bestRoute?.route?.estimatedTimeInSeconds || 0)}
                </span>
              </div>
            </div>
          )}
          <div className="my-10 flex items-center justify-center">
            {swapPath &&
              getSwapPath(swapPath).map((item, index) => {
                return (
                  <div key={`token_${index}`} className="flex items-end gap-10 min-h-130">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        className="w-20 h-20"
                        src={item?.blockchainImage}
                        alt={item?.symbol}
                      />
                      <Typography className="text-12 text-lightwhite">
                        {item?.symbol?.toUpperCase()}
                      </Typography>
                      <Typography className="text-10 text-[#5B7481]">
                        {item?.blockchain}
                      </Typography>
                    </div>
                    {index < getSwapPath(swapPath).length - 1 && (
                      <div className="flex flex-col items-center justify-center gap-20 pb-15">
                        <Tooltip
                          enterTouchDelay={0}
                          placement="top"
                          componentsProps={{
                            arrow: {
                              style: {
                                color: "#11171a",
                              },
                            },
                            transition: {
                              style: {
                                background: "#11171a",
                                borderRadius: "15px",
                              },
                            },
                            tooltip: {
                              sx: {
                                bgcolor: "#11171A",
                                fontFamily: "SpaceGroteskRegular",
                                fontSize: "0.65rem",
                                padding: "5px",
                                borderRadius: "0.5rem",
                              },
                            },
                          }}
                          title={
                            <div className="flex p-10">
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                              >
                                <img
                                  className="w-25 h-25"
                                  src={swapPath[index].from.blockchainImage}
                                  alt={swapPath[index].from.blockchain}
                                />
                                <Typography
                                  noWrap
                                  align="center"
                                  className="text-10 w-full text-lightwhite"
                                >
                                  {swapPath[index].from.symbol}
                                </Typography>
                                <Typography
                                  noWrap
                                  align="center"
                                  className="w-full text-10 text-[#5B7481]"
                                >
                                  {Number(
                                    ethers.utils.formatUnits(
                                      (swapPath[index] as any).inputAmount,
                                      swapPath[index].from.decimals
                                    )
                                  ).toFixed(4)}
                                </Typography>
                              </Box>
                              <NavigateNext />
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                              >
                                <img
                                  style={{ width: "25px", height: "25px" }}
                                  src={swapPath[index].swapper.logo}
                                  alt={swapPath[index].swapper.id}
                                />
                                <Typography
                                  noWrap
                                  style={{ fontSize: "10px" }}
                                  align="center"
                                  className="w-full"
                                >
                                  {swapPath[index].swapper.id}
                                </Typography>
                              </Box>
                              <NavigateNext />
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                              >
                                <img
                                  style={{ width: "25px", height: "25px" }}
                                  src={swapPath[index].to.blockchainImage}
                                  alt={swapPath[index].to.blockchain}
                                />
                                <Typography
                                  noWrap
                                  style={{ fontSize: "10px" }}
                                  align="center"
                                  className="w-full"
                                >
                                  {swapPath[index].to.symbol}
                                </Typography>
                                <Typography
                                  noWrap
                                  style={{ fontSize: "10px" }}
                                  align="center"
                                  className="w-full"
                                >
                                  {Number(
                                    ethers.utils.formatUnits(
                                      swapPath[index].expectedOutput,
                                      swapPath[index].to.decimals
                                    )
                                  ).toFixed(4)}
                                </Typography>
                              </Box>
                            </div>
                          }
                        >
                          <Box
                            key={`route_${index}`}
                            className="w-80 p-10 bg-[#11171A] cursor-pointer rounded-[0.5rem] relative after:absolute after:-bottom-5 after:w-0
                            after:border-l-8 after:border-b-8 after:border-b-[#11171A] after:border-l-[#11171A] after:rotate-45 after:left-[50%] after:-translate-x-[50%] after:contents-[''] "
                          >
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                            >
                              <img
                                style={{ width: "25px" }}
                                src={swapPath[index].swapper.logo}
                                alt={swapPath[index].swapper.id}
                              />
                              <Typography
                                noWrap
                                style={{ fontSize: "10px" }}
                                align="center"
                                className="w-full"
                              >
                                {swapPath[index].swapper.id}
                              </Typography>
                            </Box>
                            <Box
                              display="flex"
                              flexDirection="column"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Typography
                                noWrap
                                style={{
                                  fontSize: "10px",
                                  color: "gray",
                                  textAlign: "center",
                                }}
                                className="w-full"
                              >
                                Time ≈{" "}
                                {formatSwapTime(swapPath[index].estimatedTimeInSeconds)}
                              </Typography>
                            </Box>
                          </Box>
                        </Tooltip>
                        <img src="./assets/icons/right-arrow.svg" alt="" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          {(props.reason || expectSwapErrors(props?.bestRoute)?.length > 0) && (
            <div className="relative mb-10 pl-10 pr-10 w-full">
              <Box
                className="w-full"
                bgcolor="#0D181a"
                borderRadius="15px"
                px="10px"
                py="10px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                {props.reason === "Try to increase your slippage" ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    key={`error_reason`}
                    alignItems="center"
                  >
                    <Typography variant="subtitle2" className="w-full text-lightwhite">
                      Check your slippage
                    </Typography>
                    <Box className="w-full text-12 text-[#5B7481]">
                      This route is calculated with {slippage}% slippage.{" "}
                      <button
                        className="bg-[#1D1214] text-[#E54F61] rounded-lg p-5 cursor-pointer"
                        onClick={() => {
                          console.log(slippage);
                          acceptSlippage(Number(slippage));
                        }}
                      >
                        Accept price impact
                      </button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    key={`error_reason`}
                    alignItems="center"
                  >
                    <Typography variant="subtitle2" className="w-full text-lightwhite">
                      {props.reason}
                    </Typography>
                  </Box>
                )}
                {expectSwapErrors(props?.bestRoute)?.map((item, index) => {
                  return (
                    <Box
                      display="flex"
                      flexDirection="column"
                      key={`error_${index}`}
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" className="w-full text-lightwhite">
                        {item?.title}
                      </Typography>
                      <Typography className="w-full text-12 text-[#5B7481]">
                        {item?.required}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </div>
          )}
        </>
      )}
    </Box>
  );
}

export default memo(BestRoute);
