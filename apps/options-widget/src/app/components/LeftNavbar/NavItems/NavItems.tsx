import { useState } from "react";
import UnderLyingTokens from "./UnderlyingTokens";
import TimeFrames from "./Timeframes";
import BackgroundItems from "./BackgroundItems";
import Typography from "./typography";
import AffilateSettings from "./AffiliateSettings";
import ReferralCode from "./ReferralCode";

function NavItems() {
  const [list, setList] = useState([
    { name: "Underlying tokens", isActive: false, child: <UnderLyingTokens /> },
    { name: "Timeframes", isActive: false, child: <TimeFrames /> },
    { name: "Color", isActive: false, child: <BackgroundItems /> },
    { name: "Typography", isActive: false, child: <Typography /> },
    { name: "Affilate settings", isActive: false, child: <AffilateSettings /> },
    { name: "Referral link", isActive: false, child: <ReferralCode /> },
  ]);

  const handleOnClick = (item: any) => {
    const mapped = list.map((data) => {
      if (data.name === item.name) {
        return {
          ...item,
          isActive: !item.isActive,
        };
      } else {
        if (!item.isActive) {
          return {
            ...data,
            isActive: false,
          };
        } else {
          return data;
        }
      }
    });
    setList(mapped);
  };
  return (
    <div className="py-6 space-y-6 text-lg text-greenish-0">
      {list.map((item, i) => (
        <div className="space-y-4" key={i}>
          <div
            onClick={() => handleOnClick(item)}
            className="px-6 flex items-center justify-between cursor-pointer"
          >
            {item.name}
            <svg
              className={`${
                item.isActive ? "rotate-180" : "rotate-0"
              } transition duration-200`}
              xmlns="http://www.w3.org/2000/svg"
              width="15.869"
              height="8.719"
              viewBox="0 0 15.869 8.719"
            >
              <path
                id="_7059899_chevron_up_icon"
                data-name="7059899_chevron_up_icon"
                d="M24.984,13a1.153,1.153,0,0,0-.8.319l-6,5.767-6-5.766a1.166,1.166,0,0,0-1.6,0,1.061,1.061,0,0,0,0,1.541l6.8,6.539a1.167,1.167,0,0,0,1.6,0l6.8-6.539a1.059,1.059,0,0,0,.247-1.189A1.135,1.135,0,0,0,24.984,13Z"
                transform="translate(-10.251 -12.999)"
                fill="#bde0eb"
              />
            </svg>
          </div>
          {item.isActive ? (
            <div className="bg-darkgreen-3 rounded-3xl p-6 space-y-4">{item.child}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default NavItems;
