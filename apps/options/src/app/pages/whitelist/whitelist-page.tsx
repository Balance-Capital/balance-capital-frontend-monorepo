import React, { useEffect } from "react";
import { AccountWhitelistStatus } from "../../core/types/basic.types";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useDisconnect } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { addAppLaunchedAddress } from "../../store/reducers/app-slice";
import { DiscordURL, ReportURL, TwitterURL } from "../../core/constants/social_url";

import Discord from "../../../assets/icons/discord.svg";
import Report from "@mui/icons-material/Report";
import Twitter from "@mui/icons-material/Twitter";
import SvgIcon from "@mui/material/SvgIcon";
import { EventNames, PageTitles, emitNormalTrack } from "../../helpers/analytics";
import useWeb3CustomModal from "../../hooks/useWeb3CustomModal";
import { useAccount } from "../../hooks/useAccount";

type Props = {
  status: AccountWhitelistStatus;
  appLaunched: boolean;
  setAppLaunched: (appLaunched: boolean) => void;
};

const WhitelistPage = ({ status, appLaunched, setAppLaunched }: Props) => {
  const openConnectModal = useWeb3CustomModal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const dispatch = useDispatch();

  const appLaunchedAddresses = useSelector(
    (state: RootState) => state.app.appLaunchedAddresses
  );

  useEffect(() => {
    if (
      address &&
      isConnected &&
      status === AccountWhitelistStatus.Whitelisted &&
      appLaunchedAddresses.includes(address.toLowerCase())
    ) {
      setAppLaunched(true);
    } else {
      setAppLaunched(false);
    }
  }, [status]);

  const handleLaunchApp = () => {
    setAppLaunched(true);
    if (address) {
      dispatch(addAppLaunchedAddress(address.toLocaleLowerCase()));
    }
  };

  const emitTrack = (event: EventNames) => {
    if (address) {
      emitNormalTrack(PageTitles.Homepage, address, event);
    }
  };

  useEffect(() => {
    console.log(address, isConnected ? "Connected" : "Not connected");
  }, [address, isConnected]);

  return (
    <>
      {(!appLaunched || status === AccountWhitelistStatus.Disconnected) && (
        <div className="mx-auto relative w-9/10 max-w-800 py-100">
          <div className="relative rounded-[30px] border-[#0F1617] border-2 bg-woodsmoke overflow-hidden">
            <div className="p-40 bg-[url('./assets/images/bg-whitelist.png')] rounded-[30px] bg-center bg-cover border-2 border-[#0F1617] w-[calc(100%+4px)] translate-x-[-2px] translate-y-[-2px]">
              <div className="text-30 font-medium text-textWhite text-center sm:text-left">
                Ryze.fi Beta Launch Access
              </div>
              <div className="text-second text-center sm:text-left">
                Check your address is eligible for access
              </div>
            </div>
            <div className="h-auto p-15 pt-25 sm:p-0 sm:h-300 flex items-center justify-center">
              {status === AccountWhitelistStatus.Disconnected && (
                <Button
                  className="bg-success text-buttontext rounded-2xl py-15 px-50 text-20 normal-case xs:w-full sm:w-auto"
                  onClick={() => openConnectModal()}
                >
                  Connect wallet
                </Button>
              )}
              {status === AccountWhitelistStatus.Whitelisted && (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="bg-success/10 text-success-hover xs:px-15 xs:py-15 sm:py-25 w-full sm:w-10/12 mx-auto mb-15 sm:my-40 text-center xs:rounded-xl sm:rounded-2xl">
                    This address is eligible for access
                  </div>
                  <Button
                    className="bg-success text-buttontext rounded-2xl py-15 px-50 text-20 normal-case mx-auto block xs:w-full sm:w-auto"
                    onClick={handleLaunchApp}
                  >
                    Launch app
                  </Button>
                </div>
              )}
              {status === AccountWhitelistStatus.NotWhitelisted && (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="bg-danger/10 text-danger-hover px-15 py-15 sm:py-25 sm:w-10/12 mx-auto mb-15 sm:my-40 text-center rounded-xl sm:rounded-2xl">
                    This address is not eligible. If you believe this is a mistake{" "}
                    <a
                      href="https://ryze.fi"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      get in touch here
                    </a>
                    .
                  </div>
                  <Button
                    className="border-success border-2 border-solid text-buttontext rounded-2xl py-15 px-50 text-20 normal-case mx-auto block xs:w-full sm:w-auto"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-20 mt-20">
            <a
              href={DiscordURL}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-[#0F1617] rounded-full w-50 h-50 flex justify-center items-center bg-woodsmoke"
              onClick={() => emitTrack(EventNames.DiscordClicked)}
            >
              <img src={Discord} alt="discord" width={30} />
            </a>
            <a
              href={TwitterURL}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-[#0F1617] rounded-full w-50 h-50 flex justify-center items-center bg-woodsmoke"
              onClick={() => emitTrack(EventNames.TwitterClicked)}
            >
              <SvgIcon
                component={Twitter}
                sx={{ width: "30px", height: "30px", color: "#5B7481" }}
              />
            </a>
            <a
              href={ReportURL}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-[#0F1617] rounded-xl h-50 px-10 flex justify-center items-center bg-woodsmoke text-[#5B7481] ml-auto"
              onClick={() => emitTrack(EventNames.ReportBugClicked)}
            >
              <SvgIcon
                component={Report}
                sx={{ width: "30px", height: "30px", color: "#5B7481" }}
              />
              Report a problem
            </a>
          </div>
        </div>
      )}
      {status === AccountWhitelistStatus.Checking && (
        <div className="w-screen h-screen z-[100000] fixed left-0 top-0 bg-disable/10 flex justify-center items-center backdrop-blur-sm">
          <div className="border-2 border-disable/50 bg-woodsmoke flex flex-col items-center justify-center gap-10 w-350 h-300 rounded-3xl">
            <CircularProgress sx={{ color: "#12b3a8", marginBottom: "20px" }} size={70} />
            <div className="text-textWhite text-18">Checking eligibility</div>
            <div className="text-second">Please wait</div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhitelistPage;
