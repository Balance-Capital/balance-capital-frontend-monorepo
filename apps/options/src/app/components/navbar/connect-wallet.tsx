import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LaunchIcon from "@mui/icons-material/Launch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { addressEllipsis } from "@fantohm/shared-helpers";
import { networks } from "@fantohm/shared-web3";
import { useCallback, useEffect, useState } from "react";
import AvatarPlaceholder from "../../../assets/images/temp-avatar.png";
import AvatarAccount from "../../../assets/images/avatar-account.png";
import {
  NotifyMessage,
  NotifyType,
  Notify_Duration,
} from "../../core/constants/notification";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Skeleton from "../skeleton/skeleton";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { NetworkStatus } from "../../core/types/basic.types";
import { useBalance, useSwitchNetwork } from "wagmi";
import WalletBalance from "./wallet-balance";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  EventNames,
  MenuitemClickTitle,
  emitNormalTrack,
  emitUserMenuClickTrack,
  emitWalletConnectedTrack,
  identify,
} from "../../helpers/analytics";
import usePageTitle from "../../hooks/usePageTitle";
import { erc20BalanceOf } from "../../contract-methods/erc20";
import { Underlying_Token } from "../../core/constants/basic";
import { formatUtoken } from "../../helpers/data-translations";
import { useLocation } from "react-router-dom";
import NetworkModal from "../../pages/swap/modals/NetworkModal";
import { modalType, swapNetworks } from "../../pages/swap/data";
import { ExpandMore } from "@mui/icons-material";
import { useAccount } from "../../hooks/useAccount";
// import Switch from "react-switch";
import useLocalstorage from "../../hooks/useLocalstorage";
import SelectWeb3ModePopup from "../pop-up/select-web3-mode";
import { useNetworkContext } from "../../context/NetworkContext";
import SwitchNetwork from "./SwitchNetwork";

import useMediaQuery from "@mui/material/useMediaQuery";
import SemetrixPixelTracking from "../semetrix-pixel-tracking/semetrix-pixel-tracking";

const CopiedNotiTime = 3000;

const ConnectWallet = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const location = useLocation();
  const { address, isConnected, connect, disconnect, chainId } = useAccount();
  const networkStatus = useNetworkStatus();
  // const { web3Mode, updateWeb3Mode } = useLocalstorage();

  const { data: nativeBalance } = useBalance({
    address,
    watch: true,
  });
  const { switchNetworkAsync } = useSwitchNetwork();
  const pageTitle = usePageTitle();

  const [flagAccountDropDown, setFlagAccountDropDown] =
    useState<HTMLButtonElement | null>(null);

  const [addressCopied, setAddressCopied] = useState(false);
  const [fromNetworkModalOpen, setFromNetworkModalOpen] = useState(false);
  const [beforeAddress, setBeforeAddress] = useState<string>();
  const [flagNetworkDropDown, setFlagNetworkDropDown] =
    useState<HTMLButtonElement | null>(null);

  const ethBalance = useSelector((state: RootState) => state.account.ethBalance);

  const isSwapPage = location.pathname === "/swap";
  const currentNetwork = swapNetworks.find((item) => item.chainId === chainId);
  const [connectModalOpened, setConnectModalOpened] = useState<boolean>(false);
  const { isWalletModeSetted } = useLocalstorage();
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      const func = async () => {
        if (address) {
          const tokenBalanceInWei = await erc20BalanceOf(
            Underlying_Token[currentNetworkChainId].address,
            address
          );
          emitWalletConnectedTrack(pageTitle, address, formatUtoken(tokenBalanceInWei));
        }
      };
      if (beforeAddress) {
        emitNormalTrack(pageTitle, beforeAddress, EventNames.WalletDisconnected);
      }
      if (address) {
        setBeforeAddress(address);
        identify(address, pageTitle);
        func();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [address, currentNetworkChainId]);

  useEffect(() => {
    const listener = () => {
      setFlagAccountDropDown(null);
    };
    window.addEventListener("scroll", listener);

    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, []);

  useEffect(() => {
    if (!isSwapPage && networkStatus === NetworkStatus.WrongNetwork) {
      closeSnackbar();
      enqueueSnackbar(NotifyMessage.WrongNetwork, {
        variant: NotifyType.WARN,
        autoHideDuration: Notify_Duration,
        preventDuplicate: true,
      });
    }
    if (networkStatus !== NetworkStatus.Success) {
      setFlagAccountDropDown(null);
    }
  }, [networkStatus]);

  const onClickDisconnect = () => {
    disconnect();
  };

  const accountDrop = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFlagAccountDropDown(event.currentTarget);
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address).then(
        function () {
          setAddressCopied(true);
          setTimeout(() => setAddressCopied(false), CopiedNotiTime);
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
      emitUserMenuClickTrack(pageTitle, address, MenuitemClickTitle.CopyAddress);
    }
  };

  const handleExplorer = () => {
    if (!address) return;
    else window.open(networks[chainId].getEtherscanAddress(address), "_blank");
    emitUserMenuClickTrack(pageTitle, address, MenuitemClickTitle.ViewExplorer);
  };

  const handleSwitchNetwork = async (chainId: number) => {
    setFlagNetworkDropDown(null);
    if (switchNetworkAsync) {
      await switchNetworkAsync(chainId);
      enqueueSnackbar("Network Switched", { variant: NotifyType.SUCCESS });
    }
  };

  const handleConnect = useCallback(() => {
    if (isWalletModeSetted) {
      connect();
    } else {
      setConnectModalOpened(true);
    }
  }, [connect]);

  const networkDrop = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFlagNetworkDropDown(event.currentTarget);
  };

  return (
    <>
      <SemetrixPixelTracking />
      {networkStatus === NetworkStatus.Success || (isSwapPage && isConnected) ? (
        <div className="rounded-2xl" id="connect-wallet">
          <NetworkModal
            title="Switch Network"
            cur={currentNetwork}
            type={modalType.from}
            open={fromNetworkModalOpen}
            onClose={(_, network) => {
              if (network && network.chainId !== chainId) {
                handleSwitchNetwork(network.chainId);
              }
              setFromNetworkModalOpen(false);
            }}
          />
          <Box className="h-[36px] md:h-[50px] flex items-center xs:gap-[3px] md:gap-[6px] xs:py-10 xs:px-[5px] sm:px-[14px] sm:py-[12px] bg-btnBlackBgColor text-[14px] rounded-[12px] md:rounded-[18px] border-2 border-btnBlackStrokeColor">
            {networkStatus === NetworkStatus.Success && <WalletBalance />}
            <SwitchNetwork
              flagNetworkDropDown={flagNetworkDropDown}
              setFlagNetworkDropDown={setFlagNetworkDropDown}
            />
            <Button
              id="account-drop-button"
              aria-controls={flagAccountDropDown ? "account-drop" : undefined}
              aria-haspopup="true"
              aria-expanded={flagAccountDropDown ? "true" : undefined}
              aria-describedby={flagAccountDropDown ? "account-drop" : undefined}
              className="sm:flex sm:items-center sm:gap-[8px]"
              disableRipple={true}
              onClick={accountDrop}
            >
              <Box className="bg-pageBgColor w-[24px] h-[24px] md:w-[32px] md:h-[32px] rounded-full flex items-center justify-center">
                <img src={AvatarPlaceholder} alt="profile pic" />
              </Box>
              <div className="w-[16px] h-[9px] flex items-center justify-center">
                <Icon
                  component={KeyboardArrowDownIcon}
                  className="text-whiteIconColor block w-fit"
                ></Icon>
              </div>
            </Button>
            <Popover
              id="account-drop"
              open={Boolean(flagAccountDropDown)}
              anchorEl={flagAccountDropDown}
              onClose={() => setFlagAccountDropDown(null)}
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
                        borderRadius: "35px",
                        marginLeft: "5px",
                        maxWidth: "none !important",
                        left: "0px !important",
                        width: "100% !important",
                      },
                    }
              }
              className="[&>.MuiPopover-paper]:lg:w-[522px] [&>.MuiPopover-paper]:lg:mt-[19px] [&>.MuiPopover-paper]:xs:mt-[10px]"
            >
              <div className="bg-pageBgColor text-btnBlackTxtColor flex flex-col">
                <div className="flex justify-between items-center text-16 lg:text-19 text-btnBlackTxtColor py-20 px-15 lg:px-25">
                  <h3>Account</h3>
                  <button
                    className="bg-btnBlackStrokeColor px-[13px] py-[8px] rounded-[10px]"
                    onClick={onClickDisconnect}
                  >
                    Disconnect
                  </button>
                </div>
                <div className="flex items-center gap-[15px] font-InterMedium text-17 lg:text-20 pb-20 px-15 lg:px-25">
                  <Avatar
                    sx={{
                      width: "38px",
                      height: "38px",
                    }}
                    className="rounded-full"
                    src={AvatarAccount}
                  />
                  <p className="mr-auto text-btnBlackTxtColor">
                    <span>{address && addressEllipsis(address)}</span>
                    <IconButton
                      size="small"
                      aria-label="copy address"
                      sx={{
                        width: 20,
                        height: 20,
                      }}
                      className="invisible md:visible text-btnBlackTxtColor"
                      onClick={copyToClipboard}
                    >
                      {addressCopied ? (
                        <CheckBoxIcon fontSize="small" />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                  </p>
                  <div className="relative">
                    {ethBalance < 0 && (
                      <div className="w-full min-w-100 h-full absolute right-0 top-0">
                        <Skeleton />
                      </div>
                    )}
                    <div
                      className="flex items-center bg-btnBlackStrokeColor text-btnBlackTxtColor px-15 py-10 rounded-lg cursor-pointer"
                      onClick={() => isSwapPage && setFromNetworkModalOpen(true)}
                    >
                      {nativeBalance
                        ? parseFloat(Number(nativeBalance?.formatted).toFixed(3))
                        : "--"}{" "}
                      {nativeBalance?.symbol}
                      {/* <div className="w-30 ml-10">{currentNetwork?.logo}</div> */}
                      {isSwapPage && (
                        <div>
                          <ExpandMore />
                        </div>
                      )}
                      <Button
                        id="network-drop-button"
                        aria-controls={flagNetworkDropDown ? "network-drop" : undefined}
                        aria-haspopup="true"
                        aria-expanded={flagNetworkDropDown ? "true" : undefined}
                        aria-describedby={
                          flagNetworkDropDown ? "network-drop" : undefined
                        }
                        className="flex md:hidden md:items-center md:gap-[8px] sm:px-15 py-10 rounded-lg bg-btnBlackStrokeColor pr-0"
                        disableRipple={true}
                        onClick={networkDrop}
                      >
                        <Box className="bg-pageBgColor w-[24px] h-[24px] md:w-[32px] md:h-[32px] rounded-full flex items-center justify-center">
                          <img src={networks[chainId]?.logo} alt="profile pic2" />
                        </Box>
                        <div className="w-[16px] h-[9px] flex items-center justify-center">
                          <Icon
                            component={KeyboardArrowDownIcon}
                            sx={{ width: "fit-content" }}
                            className="text-whiteIconColor"
                          ></Icon>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="bg-btnBlackStrokeColor flex justify-between items-center py-20 px-15 lg:px-25">
                  <div
                    className="flex items-center gap-10 text-14 lg:text-18 text-btnBlackTxtColor cursor-pointer"
                    onClick={() => {
                      handleExplorer();
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label="copy address"
                      sx={{
                        width: 20,
                        height: 20,
                      }}
                      className="text-btnBlackTxtColor"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                    <h3>View Explorer</h3>
                  </div>
                  {/* <div className="">
                    <div className="flex items-center">
                      <h3>Gasless Trading</h3>
                      <Switch
                        checked={web3Mode === "SCA"}
                        onChange={() =>
                          updateWeb3Mode(web3Mode === "EOA" ? "SCA" : "EOA")
                        }
                        onColor="#12b2a7"
                        onHandleColor="#12b2a7"
                        handleDiameter={24}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={16}
                        width={40}
                        className="react-switch"
                      />
                    </div>
                  </div> */}
                </div>
              </div>
            </Popover>
          </Box>
        </div>
      ) : !isSwapPage && networkStatus === NetworkStatus.WrongNetwork ? (
        <button
          onClick={() => {
            handleSwitchNetwork(currentNetworkChainId);
          }}
          className="h-[40px] md:h-[60px] px-30 bg-orange-500 rounded-xl md:rounded-2xl text-14px md:text-18 text-whiteTxtColor"
        >
          Switch Network
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="h-[40px] md:h-[60px] px-30 bg-brandColor rounded-xl md:rounded-2xl text-14px md:text-18 text-btnTxtColor"
        >
          Connect
        </button>
      )}
      <SelectWeb3ModePopup open={connectModalOpened} onClose={setConnectModalOpened} />
    </>
  );
};

export default ConnectWallet;
