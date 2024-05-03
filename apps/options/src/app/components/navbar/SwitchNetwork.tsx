import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Popover from "@mui/material/Popover";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useEffect } from "react";
import { useSwitchNetwork, useChainId } from "wagmi";
import { enqueueSnackbar } from "notistack";
import { NotifyType } from "../../core/constants/notification";
import useMediaQuery from "@mui/material/useMediaQuery";
import ClearIcon from "@mui/icons-material/Clear";
import { NetworkIds, networks } from "@fantohm/shared-web3";
import { SUPPORTED_CHAINS } from "../../core/constants/network";
import {
  isBerachainInParam,
  isBlastInParam,
  isBlastMainnetInParam,
  isInevmInParam,
  isInevmMainnetInParam,
} from "../../core/constants/basic";
import { isActiveForChain } from "../../helpers/data-translations";

const SwitchNetwork = ({
  flagNetworkDropDown,
  setFlagNetworkDropDown,
}: {
  flagNetworkDropDown: HTMLButtonElement | null;
  setFlagNetworkDropDown: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { switchNetworkAsync } = useSwitchNetwork();
  const networkDrop = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFlagNetworkDropDown(event.currentTarget);
  };
  const chainId = useChainId();

  const handleSwitchNetwork = async (chainId: number) => {
    setFlagNetworkDropDown(null);
    if (switchNetworkAsync) {
      await switchNetworkAsync(chainId);
      enqueueSnackbar("Network Switched", { variant: NotifyType.SUCCESS });
    }
  };

  useEffect(() => {
    setFlagNetworkDropDown(flagNetworkDropDown);
  }, [flagNetworkDropDown]);

  return (
    <>
      <Button
        id="network-drop-button"
        aria-controls={flagNetworkDropDown ? "network-drop" : undefined}
        aria-haspopup="true"
        aria-expanded={flagNetworkDropDown ? "true" : undefined}
        aria-describedby={flagNetworkDropDown ? "network-drop" : undefined}
        className="hidden sm:flex sm:items-center sm:gap-[8px]"
        disableRipple={true}
        onClick={networkDrop}
      >
        <Box className="bg-pageBgColor w-[24px] h-[24px] md:w-[32px] md:h-[32px] rounded-full flex items-center justify-center">
          <img src={networks[chainId]?.logo} alt="profile pic2" />
        </Box>
        <div className="w-[16px] h-[9px] flex items-center justify-center">
          <Icon
            component={KeyboardArrowDownIcon}
            className="text-whiteIconColor block w-fit"
          ></Icon>
        </div>
      </Button>
      <Popover
        id="network-drop"
        open={Boolean(flagNetworkDropDown)}
        anchorEl={flagNetworkDropDown}
        onClose={() => setFlagNetworkDropDown(null)}
        anchorReference={isMobile ? "anchorPosition" : "anchorEl"}
        anchorPosition={
          isMobile ? { top: window.innerHeight, left: 0 } : { top: NaN, left: NaN }
        }
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        disableScrollLock={true}
        sx={
          !isMobile
            ? {
                "& .MuiPopover-paper": {
                  borderRadius: "35px",
                  marginLeft: "5px",
                },
              }
            : {
                "& .MuiPopover-paper": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopLeftRadius: "35px",
                  borderTopRightRadius: "35px",
                  left: "0px !important",
                  maxWidth: "none !important",
                },
              }
        }
        className="[&>.MuiPopover-paper]:w-full [&>.MuiPopover-paper]:lg:w-[522px] [&>.MuiPopover-paper]:lg:mt-[19px] [&>.MuiPopover-paper]:xs:mt-[10px]"
      >
        <div className="text-btnBlackTxtColor flex flex-col bg-[#0A1314] p-[32px] pb-[100px] md:p-[32px]">
          <div className="flex justify-between items-center text-16 lg:text-19 text-btnBlackTxtColor pb-20">
            <h3>Network</h3>
            {isMobile && (
              <div onClick={() => setFlagNetworkDropDown(null)}>
                <ClearIcon />
              </div>
            )}
          </div>

          {Object.entries(networks)
            .reverse()
            .map(
              ([id, chain]) =>
                SUPPORTED_CHAINS[id as any] && (
                  <div
                    className={`flex items-center gap-[15px] font-InterMedium text-17 lg:text-20 pb-20 px-15 lg:px-25
                    ${
                      (isBerachainInParam() && id === NetworkIds.Berachain.toString()) ||
                      (isBlastInParam() && id === NetworkIds.Blast.toString()) ||
                      (isBlastMainnetInParam() &&
                        id === NetworkIds.BlastMainnet.toString()) ||
                      (isInevmInParam() && id === NetworkIds.Inevm.toString()) ||
                      (isInevmMainnetInParam() &&
                        id === NetworkIds.InevmMainnet.toString()) ||
                      isActiveForChain(+id)
                        ? "flex"
                        : "hidden"
                    }
                    `}
                    key={id}
                  >
                    <Avatar
                      sx={{
                        width: "38px",
                        height: "38px",
                      }}
                      className="rounded-full"
                      src={chain.logo}
                    />
                    <p className="mr-auto text-btnBlackTxtColor">
                      {chain.name}
                      {""}
                    </p>
                    <div className="relative">
                      <div
                        className="flex bg-btnBlackStrokeColor text-btnBlackTxtColor px-15 py-10 rounded-lg cursor-pointer items-center"
                        onClick={() => handleSwitchNetwork(Number(id))}
                      >
                        {chainId === Number(id) ? (
                          <span className="text-success-hover">Connected</span>
                        ) : (
                          <span>Connect</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </Popover>
    </>
  );
};

export default SwitchNetwork;
