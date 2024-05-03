import { OutlinedInput, Fade, FormControl } from "@material-ui/core";
import { Box, Modal } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { SvgIcon } from "@mui/material";
import { useState, memo, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import ReactLoading from "react-loading";

import { TokenWithAmount } from "../swap";
import { formatAmount } from "../helpers/swap";
import "../swap.scss";
import ClipboardButton from "../../../components/clipboard-button/ClipboardButton";
import { formatCurrency, shortenEthereumAddress } from "../helpers";
import { NetworkDetail } from "../data";

export const isBlackListed = (token: TokenWithAmount): boolean => {
  if (
    token.blockchain === "ARBITRUM" &&
    token.address === "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" &&
    token.symbol === "USDC.E"
  ) {
    return true;
  }

  return false;
};

export const customizeToken = (token?: TokenWithAmount): TokenWithAmount | undefined => {
  const customizedToken = JSON.parse(JSON.stringify(token || {}));
  if (
    customizedToken.blockchain === "ARBITRUM" &&
    customizedToken.address === "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" &&
    customizedToken.symbol === "USDC"
  ) {
    customizedToken.symbol = "USDC.e";
  }
  return customizedToken;
};

function TokenModal(props: {
  cur: NetworkDetail | undefined;
  tokenCount: number;
  open: boolean;
  onClose: (type: string, token: TokenWithAmount | null) => void;
  type: string;
  onChange: (name: string, type: string) => void;
  tokenList: TokenWithAmount[];
}) {
  const [tokenName, setTokenName] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [showedIndex, setShowedIndex] = useState(20);

  const fetchMoreData = () => {
    if (showedIndex >= props?.tokenCount) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setShowedIndex(showedIndex + 20);
    }, 1000);
  };

  useEffect(() => {
    setTokenName("");
    props.onChange("", props.type);
  }, [props.cur, props.open, props.type]);

  return (
    <Modal open={props?.open} onClose={() => props?.onClose(props?.type, null)}>
      <Fade in={props?.open}>
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
            <div className="text-24 text-lightwhite font-bold">Select token</div>
            <button
              className="bg-bluishLight hover:bg-bluishLightHover rounded-full bg-[#0a1314]"
              onClick={() => props.onClose(props?.type, null)}
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
          <Box mb="10px">
            <FormControl
              className="line-border w-full text-white"
              variant="standard"
              color="primary"
            >
              <OutlinedInput
                placeholder={`Search in ${props?.tokenCount} token`}
                value={tokenName}
                onChange={(e) => {
                  setTokenName(e.target.value);
                  props?.onChange(e.target.value, props?.type);
                }}
                style={{
                  padding: "15px",
                  fontSize: "18px",
                  color: "white",
                  border: "2px solid #11171a",
                  borderRadius: "20px",
                  fontFamily: "InterMedium",
                }}
                notched={false}
              />
            </FormControl>
          </Box>
          <Box pr="10px" height="400px" overflow="auto">
            {
              <InfiniteScroll
                maxLength={props?.tokenList.length}
                loadMore={fetchMoreData}
                loader={
                  <Box display="flex" justifyContent="center" key={0}>
                    <ReactLoading
                      type="spin"
                      color="white"
                      height={30}
                      width="35px"
                      delay={100}
                    />
                  </Box>
                }
                hasMore={hasMore}
                useWindow={false}
              >
                {props?.tokenList.slice(0, showedIndex).map((token, index) => {
                  if (isBlackListed(token)) {
                    return null;
                  }

                  const customizedToken = customizeToken(token);

                  return (
                    <Box
                      className="cursor-pointer text-white"
                      onClick={() => props?.onClose(props?.type, token)}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb="10px"
                      key={`token_${index}_${token?.symbol}`}
                      p="15px"
                      sx={{
                        border: "2px solid #11171a",
                        borderRadius: "30px",
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <img
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "100%",
                          }}
                          src={token?.image}
                          alt={token?.symbol}
                          onError={(error) => {
                            error.currentTarget.src = "./assets/images/default-token.png";
                          }}
                        />
                        <Box
                          display="flex"
                          flexDirection="column"
                          ml="5px"
                          justifyContent="center"
                        >
                          <div className="text-18 text-white font-bold">
                            {customizedToken?.symbol}
                          </div>
                          <div className="text-10 text-white font-bold">
                            {customizedToken?.name}
                          </div>
                          {token?.address && (
                            <Box
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <ClipboardButton copyText={token?.address}>
                                <div className="text-10 text-white font-bold mr-10">
                                  {shortenEthereumAddress(token?.address)}
                                </div>
                              </ClipboardButton>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" justifyContent="center">
                        <div className="text-18 text-white font-bold">
                          {formatAmount(token.amount, token.decimals, 2, token.symbol)}
                        </div>
                        {token?.amount > 0 && (
                          <div className="text-10 text-white font-bold">
                            {formatCurrency(
                              formatAmount(
                                token.amount,
                                token.decimals,
                                2,
                                token.symbol
                              ) * (token.usdPrice || 0),
                              2
                            )}
                          </div>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </InfiniteScroll>
            }
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export default memo(TokenModal);
