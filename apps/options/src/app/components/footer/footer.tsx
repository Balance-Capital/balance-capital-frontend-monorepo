// import SvgIcon from "@mui/material/SvgIcon";
// import Report from "@mui/icons-material/Report";
// import Twitter from "@mui/icons-material/Twitter";
import { Link } from "react-router-dom";

import Logo from "../logo/logo";
// import Discord from "../../../assets/icons/discord.svg";
import { NavItemProp } from "../../core/types/basic.types";
import { NavItems } from "../../core/constants/basic";
import {
  DiscordURL,
  FeedbackURL,
  ReportURL,
  TwitterURL,
} from "../../core/constants/social_url";
import usePageTitle from "../../hooks/usePageTitle";
import { EventNames, emitNormalTrack } from "../../helpers/analytics";
import useHideCompsForRoutes from "../../hooks/useHideCompsForRoutes";
import { useAccount } from "../../hooks/useAccount";
import EthermailScript from "../ethermail-script/ethermail-script";

const Footer = () => {
  const pageTitle = usePageTitle();
  const { address } = useAccount();
  const isNavActive = useHideCompsForRoutes();

  const emitTrack = (event: EventNames) => {
    if (address) {
      emitNormalTrack(pageTitle, address, event);
    }
  };

  return isNavActive ? (
    <div>
      <div
        className={`flex flex-col justify-center items-center py-60 text-darkBlue text-16`}
      >
        <p className="text-darkBlue">
          Ryze.fi is a{" "}
          <a
            href="http://balance.capital"
            target={"_blank"}
            rel="noreferrer"
            className="underline"
            onClick={() => emitTrack(EventNames.BalanceCapitalCTAClicked)}
          >
            balance.capital
          </a>{" "}
          product.
        </p>
        <p className="text-center px-15 text-darkBlue">
          *Trading binary options carries substantial financial and other risks. Ryze does
          not provide financial advice. <br />
          Please adhere to your locals laws and regulations when using Ryze.
        </p>
      </div>

      <footer className="bg-charcoalGray xs:h-60 md:h-90 flex justify-between items-center md:px-40 lg:px-60 text-darkBlue text-18 md:mt-0 cursor-default">
        <div className="xs:hidden lg:flex menu md:w-1/3 justify-between items-center text-darkBlue">
          {NavItems.map((item: NavItemProp) => {
            return (
              <Link key={item.title} to={item.href}>
                {item.title}
              </Link>
            );
          })}
        </div>
        <div className="h-full flex justify-center items-center xs:w-full lg:w-1/3">
          <Logo dark={true} />
        </div>
        <div className="xs:hidden lg:flex community-tool lg:w-1/3 justify-around items-center text-darkBlue">
          <a
            href={DiscordURL}
            target="_blank"
            className="flex items-center"
            rel="noreferrer"
            onClick={() => emitTrack(EventNames.DiscordClicked)}
          >
            {/* <SvgIcon
              component={() => (
                <img src={Discord} width={25} alt="Discord logo" className="mr-10" />
              )}
            /> */}
            Discord
          </a>
          <a
            href={TwitterURL}
            target="_blank"
            className="flex items-center"
            rel="noreferrer"
            onClick={() => emitTrack(EventNames.TwitterClicked)}
          >
            {/* <SvgIcon component={Twitter} sx={{ width: "30px", marginRight: "5px" }} /> */}
            Twitter
          </a>
          <a
            href={FeedbackURL}
            target="_blank"
            className="flex items-center"
            rel="noreferrer"
            onClick={() => emitTrack(EventNames.FeedbackClicked)}
          >
            Feedback
          </a>
          <a
            href={ReportURL}
            target="_blank"
            className="flex items-center"
            rel="noreferrer"
            onClick={() => emitTrack(EventNames.ReportBugClicked)}
          >
            {/* <SvgIcon component={Report} sx={{ width: "30px", marginRight: "5px" }} /> */}
            Report
          </a>
          {
            <div
              className="flex items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: `<ethermail-subscribe theme="dark" input="both"/>`,
              }}
            ></div>
          }
        </div>
      </footer>
      <EthermailScript />
    </div>
  ) : (
    // eslint-disable-next-line
    <></>
  );
};

export default Footer;
