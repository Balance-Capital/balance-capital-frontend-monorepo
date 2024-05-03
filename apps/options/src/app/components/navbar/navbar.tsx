import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { RefObject, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Logo from "../logo/logo";
import SearchBar from "./search";
import { NavItems } from "../../core/constants/basic";
import UserMenu from "./user-menu";
import { useDispatch, useSelector } from "react-redux";
import SvgIcon from "@mui/material/SvgIcon";
import { DiscordURL, ReportURL, TwitterURL } from "../../core/constants/social_url";
import Report from "@mui/icons-material/Report";
import Twitter from "@mui/icons-material/Twitter";
import { ReactComponent as Discord } from "../../../assets/icons/discord.svg";
import MaintenanceMode from "../../pages/trade/components/maintenance-mode";
import { getAppMode } from "../../store/reducers/app-slice";
// import BannerPriceBar from "./banner-price-bar";
import { setUserwallet } from "../../store/reducers/trade-slice";
import { Button } from "@mui/material";
import {
  clearUserProfile,
  loadUserProfileThunk,
  setReferralCode,
} from "../../store/reducers/referrals-slice";
import { RootState } from "../../store";
import useHideCompsForRoutes from "../../hooks/useHideCompsForRoutes";
import CompetitionBar from "../competition-bar/CompetitionBar";
import { decryptToString, encryptToString } from "../../helpers/encrypt-decrypt";
import WelcomeRyzeModal from "../welcome-ryze-modal/WelcomeRyzeModal";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { NetworkStatus } from "../../core/types/basic.types";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";
import { NetworkIds } from "@fantohm/shared-web3";
import { emitNetworkSelected } from "../../helpers/analytics";

interface IProps {
  forwardRef: RefObject<HTMLDivElement>;
  forwardRefHeight: number;
}

function Navbar({ forwardRef, forwardRefHeight }: IProps) {
  const { pathname, search } = useLocation();
  const [isToggle, setIsToggle] = useState(false);

  const mode = useSelector(getAppMode);
  const { address, chainId, lastChainId } = useAccount();
  const dispatch = useDispatch();
  const isNavActive = useHideCompsForRoutes();
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  const referralCode = useSelector((state: RootState) => state.referrals.referralCode);
  const refCode = useSelector((state: RootState) => state.referrals.refCode);
  const networkStatus = useNetworkStatus();
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(clearUserProfile());
      if (address) {
        dispatch(loadUserProfileThunk({ address, referralCode }));
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [address, referralCode, currentNetworkChainId]);

  useEffect(() => {
    if (address) {
      const page = pathname.split("/")[1];
      emitNetworkSelected(address, lastChainId, chainId, page);
    }
  }, [chainId, lastChainId]);

  useEffect(() => {
    if (address) {
      const params = new URLSearchParams(search);
      let referralCode = localStorage.getItem("beneficial-code");
      if (referralCode) {
        setShowWelcome(true);
        referralCode = decryptToString(referralCode);
        dispatch(setReferralCode(referralCode));
      } else {
        const refQueryParam = params.get("ref") || "";
        if (refCode?.includes("ref-") || refQueryParam) {
          referralCode = refCode ? refCode.replace(/^ref-/, "") : refQueryParam;
          if (referralCode) {
            setShowWelcome(true);
            localStorage.setItem("beneficial-code", encryptToString(referralCode));
            dispatch(setReferralCode(referralCode));
          }
        }
      }
    }
  }, [refCode, address, search, currentNetworkChainId]);

  useEffect(() => {
    if (address) {
      dispatch(setUserwallet(address));
    } else {
      dispatch(setUserwallet(""));
    }
  }, [address, currentNetworkChainId]);

  useEffect(() => {
    try {
      if (isToggle) {
        document.getElementsByTagName("body")[0].style.overflowY = "hidden";
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      } else {
        document.getElementsByTagName("body")[0].style.overflowY = "auto";
        document.getElementsByTagName("html")[0].style.overflowY = "auto";
      }
    } catch (error) {
      console.error("toggle", error);
    }
  }, [isToggle]);

  return isNavActive ? (
    <>
      <div className="fixed z-50 w-full" ref={forwardRef}>
        <MaintenanceMode />
        {networkStatus === NetworkStatus.Success ? (
          <WelcomeRyzeModal open={showWelcome} setOpen={setShowWelcome} />
        ) : null}
        <div
          className={`transition-all ${
            isToggle
              ? "bg-btnBlackBgColor backdrop-blur-0"
              : "bg-pageBgColor md:bg-transparent backdrop-blur-[30px]"
          } border-b-2 border-btnBlackStrokeColor`}
        >
          {/* <BannerPriceBar /> */}
          <CompetitionBar />
          <div className="flex items-center justify-between xs:pl-[12px] xl:px-[90px]">
            <div className="shrink-0 h-70 lg:h-90 flex items-center justify-center">
              <Logo className="h-[20px] md:h-[36px]" />
            </div>
            <div className="hidden 2xl:block w-[250px] 2xl:w-[305px]">
              <SearchBar />
            </div>
            <div className="hidden xl:flex gap-50">
              {NavItems.map((item, index) => {
                return (currentNetworkChainId === NetworkIds.Berachain ||
                  currentNetworkChainId === NetworkIds.Blast ||
                  currentNetworkChainId === NetworkIds.BlastMainnet ||
                  currentNetworkChainId === NetworkIds.Inevm ||
                  currentNetworkChainId === NetworkIds.InevmMainnet) &&
                  item.title === "Swap" ? null : (
                  <Link
                    to={item.href}
                    key={index}
                    className={`${
                      pathname === item.href && "border-b-2 border-b-brandColor"
                    } h-90 flex items-center text-18 text-btnBlackTxtColor cursor-pointer hover:border-b-2 hover:border-b-brandColor`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-[6px] md:gap-[14px]">
              <UserMenu />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToggle((prev) => !prev);
                }}
                disableRipple={true}
                className="!border-2 !border-bunker !border-solid xs:!block xl:!hidden !min-h-[36px] !min-w-[36px] md:!min-h-[50px] md:!min-w-[50px] !rounded-[12px] md:!rounded-[18px] !bg-btnBlackBgColor !p-0 !m-0"
              >
                {isToggle ? (
                  <CloseIcon className="w-fit text-btnBlackTxtColor" />
                ) : (
                  <MenuIcon className="w-fit text-btnBlackTxtColor" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isToggle && (
        <div
          style={{
            height: window.innerHeight - forwardRefHeight,
          }}
          className="fixed bottom-0 w-full z-10 bg-charcoalGray overflow-auto"
        >
          <div className="flex flex-col gap-25 pt-15 font-InterRegular text-25 text-primary h-full">
            <div className="w-full px-[12px] md:px-[90px] py-[12px]">
              <SearchBar setNavbarOpen={setIsToggle} />
            </div>
            {NavItems.map((item, index) =>
              currentNetworkChainId === NetworkIds.Berachain &&
              item.title === "Swap" ? null : (
                <Link
                  to={item.href}
                  key={index}
                  onClick={() => setIsToggle(false)}
                  className="w-full px-[12px] md:px-[90px] cursor-pointer flex items-center justify-between"
                >
                  {item.title}
                  <KeyboardArrowRight className="w-fit text-primary" />
                </Link>
              )
            )}
            <div className="flex mt-auto items-center justify-center gap-30">
              <a
                href={DiscordURL}
                target="_blank"
                className="flex items-center"
                rel="noreferrer"
              >
                <Discord width={35} height={35} />
              </a>
              <a
                href={TwitterURL}
                target="_blank"
                className="flex items-center"
                rel="noreferrer"
              >
                <SvgIcon component={Twitter} className="text-second text-35" />
              </a>
              <a
                href={ReportURL}
                target="_blank"
                className="flex items-center"
                rel="noreferrer"
              >
                <SvgIcon component={Report} className="text-second text-35" />
              </a>
            </div>
            {
              <div
                className="flex items-center justify-center mb-55"
                dangerouslySetInnerHTML={{
                  __html: `<ethermail-subscribe theme="dark" input="both"/>`,
                }}
              ></div>
            }
            <div className="py-20 flex bg-deepSea">
              <a
                href="https://ryze.fi/legal#terms"
                target="_blank"
                rel="noreferrer"
                className="w-0 grow text-16 text-center"
              >
                Terms
              </a>
              <a
                href="https://ryze.fi/legal#privacy"
                target="_blank"
                rel="noreferrer"
                className="w-0 grow text-16 text-center"
              >
                Privacy
              </a>
              <a
                href="https://ryze.fi/legal#misc"
                target="_blank"
                rel="noreferrer"
                className="w-0 grow text-16 text-center"
              >
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    // eslint-disable-next-line
    <></>
  );
}

export default Navbar;
