import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  handleAffiliateAddress,
  setReferralCode,
} from "../../../store/reducers/leftnavbarSlice";

function ReferralCode() {
  const referralCode = useSelector((state: RootState) => state.leftnavbar.referralCode);
  const dispatch = useDispatch();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          className="w-full bg-darkgreen-0 p-3 rounded-xl focus:outline-none placeholder:text-greenish-0/20"
          type="text"
          name="referral-code"
          id="referral-code"
          placeholder="Paste url"
          value={referralCode}
          onChange={(e) => {
            if (
              e.target.value.includes("https://") ||
              e.target.value.includes("http://")
            ) {
              // for ref-
              const regex = /ref-(.*)/;
              const match = e.target.value.match(regex);
              // for ?ref= or &ref=
              const url = new URL(e.target.value);
              const params = new URLSearchParams(url.search);
              const extractedCode = params.get("ref");
              if (match) {
                dispatch(setReferralCode(match[1]));
              } else if (extractedCode) {
                dispatch(setReferralCode(extractedCode));
              }
              return;
            }
            dispatch(setReferralCode(""));
          }}
        />
      </div>
    </div>
  );
}

export default ReferralCode;
