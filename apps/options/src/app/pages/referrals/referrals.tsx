import React, { useState } from "react";
import ReferralCode from "./tabs/referral-code";
import ReferralEarnings from "./tabs/referral-earnings";

const Referrals = () => {
  const [tabId, setTabId] = useState(0);

  return (
    <div className="xs:py-0 lg:py-50 text-lightwhite px-20 md:px-30 lg:px-50 xl:px-80">
      <div className="xs:flex lg:hidden">
        {["Referral", `Earnings`].map((text, ind) => (
          <button
            className={`w-0 grow py-20 border-b-2 text-18 sm:text-20 ${
              ind === tabId
                ? "border-b-success text-textWhite"
                : "border-b-second text-second"
            }`}
            onClick={() => setTabId(ind)}
            key={text}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 md:gap-50 lg:gap-30 xl:gap-50">
        {[<ReferralCode />, <ReferralEarnings />].map((tab, index) => (
          <div
            className={`lg:bg-charcoalGray lg:border-2 lg:border-obsidianBlack lg:rounded-[35px] xs:px-0 xs:py-20 lg:p-30 xl:p-40 2xl:p-50 lg:h-full ${
              index === tabId ? "block" : "hidden lg:block"
            }`}
            key={index}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Referrals;
