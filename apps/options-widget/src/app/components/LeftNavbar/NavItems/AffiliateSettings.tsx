import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  handleAffiliateAddress,
  handleAffiliateFee,
} from "../../../store/reducers/leftnavbarSlice";

function AffilateSettings() {
  const { fee, address } = useSelector(
    (state: RootState) => state.leftnavbar.affiliateSetting
  );
  const dispatch = useDispatch();

  return (
    <>
      <div className="space-y-3">
        <div>Trading fee</div>
        <div className="bg-darkgreen-0 p-3 rounded-xl flex items-center gap-2">
          <div className="w-[3rem]">{fee}%</div>
          <input
            className="w-full h-1 bg-darkgreen-1 rounded-lg appearance-none cursor-pointer accent-greenish-1"
            type="range"
            step="0.1"
            min="0"
            max="3"
            name="fee-range"
            id="fee-range"
            defaultValue={fee}
            onChange={(e) => {
              dispatch(handleAffiliateFee(+e.target.value));
            }}
          ></input>
        </div>
      </div>
      <div className="space-y-3">
        <div>Fee wallet</div>
        <div className="flex items-center justify-between gap-3">
          <input
            className="w-full bg-darkgreen-0 p-3 rounded-xl focus:outline-none placeholder:text-greenish-0/20"
            type="text"
            name="font-family"
            id="font-family"
            placeholder="Enter address"
            value={address}
            onChange={(e) => dispatch(handleAffiliateAddress(e.target.value))}
          />
          {/* <img src="./assets/svgs/delete.svg" alt="" /> */}
        </div>
      </div>
    </>
  );
}

export default AffilateSettings;
