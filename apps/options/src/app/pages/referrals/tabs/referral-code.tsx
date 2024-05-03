import React, { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { ChainMode } from "../../../core/constants/network";
import { useSigner } from "wagmi";
import { generateReferralCodeAPI } from "../../../helpers/axios";
import { UserRegisterSignMessage } from "../../../core/constants/basic";
import { loadUserProfileThunk } from "../../../store/reducers/referrals-slice";
import { useAccount } from "../../../hooks/useAccount";

const ReferralCode = () => {
  const { userProfile, referralCode } = useSelector(
    (state: RootState) => state.referrals
  );
  const [copied, setCopied] = useState(false);
  const { address, signer } = useAccount();
  const dispatch = useDispatch();

  const handleCopyReferralUrl = () => {
    navigator.clipboard.writeText(
      `https://${ChainMode === "mainnet" ? "app" : "test"}.ryze.fi/ref-${
        userProfile.referralId
      }`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async () => {
    if (!address || !signer) return;
    try {
      const signature = await signer.signMessage(UserRegisterSignMessage);
      await generateReferralCodeAPI(signature);
      // dispatch(setUserProfile(res));
      dispatch(loadUserProfileThunk({ address, referralCode }));
    } catch (error) {
      console.error("handleRegister", error);
    }
  };

  return (
    <div className="flex flex-col gap-35">
      <div className="space-y-15">
        <div className="text-24 md:text-28 font-InterMedium text-lightwhite">
          Referral
        </div>
        <div className="font-InterRegular xs:text-14 md:text-18 text-second">
          Share a portion of the protocol’s 5% trading fee through the referral program.
          <br />
          For more information, please read the{" "}
          <a
            href="https://ryze.fi/docs/referrals"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            referral program details
          </a>
          .
        </div>
      </div>
      {userProfile.referralId === "" && (
        <div className="bg-success/10 xs:text-14 md:text-18 text-success p-20 rounded-2xl text-center">
          <InfoOutlinedIcon className="xs:text-14 md:text-18 translate-y-[-1px]" /> Looks
          like you don't have a referral code. Create one now to start earning.
        </div>
      )}
      <div className="space-y-15">
        <div className="text-second xs:text-18 md:text-22">Generate referral code</div>
        <div className="xs:bg-transparent sm:bg-bunker sm:rounded-2xl xs:p-0 sm:p-10 flex sm:items-center flex-col sm:flex-row gap-20">
          <div className="bg-bunker block lg:w-0 grow text-lightwhite text-18 font-InterMedium rounded-xl overflow-hidden whitespace-nowrap text-ellipsis py-15 px-20">
            {!userProfile.referralId || userProfile.referralId === ""
              ? "Generate your unique code"
              : `
            ${ChainMode === "mainnet" ? "app" : "test"}.ryze.fi/ref-${
                  userProfile.referralId
                }`}
          </div>
          <button
            className="bg-success hover:bg-success-hover text-lightwhite rounded-xl xs:text-18 md:text-22 font-InterMedium py-15 px-35 flex items-center gap-5 justify-center"
            onClick={() => {
              if (!userProfile.referralId || userProfile.referralId === "") {
                handleGenerateCode();
              } else {
                handleCopyReferralUrl();
              }
            }}
          >
            {userProfile.referralId && userProfile.referralId !== "" && (
              <img src="./assets/icons/copy-icon.svg" alt="copy" className="w-20" />
            )}
            {!userProfile.referralId || userProfile.referralId === ""
              ? "Generate"
              : copied
              ? "Copied"
              : "Copy"}
          </button>
        </div>
      </div>
      {userProfile.referralId && userProfile.referralId !== "" && (
        <div className="space-y-15">
          <div className="text-second xs:text-18 md:text-22">Share on socials</div>
          <div className="flex gap-20">
            <a
              href={`https://twitter.com/intent/tweet?text=Trade%20the%20volatility%20of%20%24BTC%20and%20%24ETH%20on%20%40RyzeFi%20with%20up%20to%202x%20leverage%20%F0%9F%93%88.%20Use%20my%20link%20for%20a%20discount%20on%20fees%3A&url=https%3A%2F%2Fapp.ryze.fi%2F%23%2Ftrade%2F%3Fref%3D${userProfile.referralId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-60 h-60 flex justify-center items-center rounded-full bg-bunker"
            >
              <img
                src="./assets/icons/twitter-referrals.svg"
                alt="twitter"
                className="h-25"
              />
            </a>
            <a
              href={`https://t.me/share/url?url=https%3A%2F%2Fapp.ryze.fi%2F%23%2Ftrade%2F%3Fref%3D${userProfile.referralId}%20&text=Trade%20the%20volatility%20of%20%24BTC%20and%20%24ETH%20on%20%40RyzeFi%20with%20up%20to%202x%20leverage%20%F0%9F%93%88%20%20Use%20my%20link%20for%20a%20discount%20on%20fees%3A`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-60 h-60 flex justify-center items-center rounded-full bg-bunker"
            >
              <img
                src="./assets/icons/telegram-referrals.svg"
                alt="telegram"
                className="h-25"
              />
            </a>
            {/* <a
              href="http://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-60 h-60 flex justify-center items-center rounded-full bg-bunker"
            >
              <img
                src="./assets/icons/facebook-referrals.svg"
                alt="facebook"
                className="h-25"
              />
            </a> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCode;
