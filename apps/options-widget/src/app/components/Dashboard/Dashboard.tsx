import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAffiliateSetting,
  getBackgroundItemsWithoutNameProp,
  getTimeFrames,
  getTypographyWithoutNamePropFromColor,
  getUnderlyingTokensWithoutImgProp,
} from "../../store/selectors/leftnavbarSelector";
import { firstStringifyThenEncodedURI } from "../../helpers/generic";
import { setQueryParam } from "../../store/reducers/leftnavbarSlice";
import { RootState } from "../../store";
import { CircularProgress } from "@mui/material";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const underlyingTokens = useSelector(getUnderlyingTokensWithoutImgProp);
  const timeFrames = useSelector(getTimeFrames);
  const backgroundItems = useSelector(getBackgroundItemsWithoutNameProp);
  const typoGraphy = useSelector(getTypographyWithoutNamePropFromColor);
  const affiliateSetting = useSelector(getAffiliateSetting);
  const referralCode = useSelector((state: RootState) => state.leftnavbar.referralCode);
  const isDarkMode = useSelector((state: RootState) => state.leftnavbar.isDarkMode);

  const encodedUnderlyingTokens = useMemo(() => {
    return firstStringifyThenEncodedURI(underlyingTokens);
  }, [underlyingTokens]);

  const encodedTimeFramesTokens = useMemo(() => {
    return firstStringifyThenEncodedURI(timeFrames);
  }, [timeFrames]);

  const encodedBackgroundItems = useMemo(() => {
    return firstStringifyThenEncodedURI(backgroundItems);
  }, [backgroundItems]);

  const encodedTypoGraphy = useMemo(() => {
    return firstStringifyThenEncodedURI(typoGraphy);
  }, [typoGraphy]);

  const encodedAffiliateSetting = useMemo(() => {
    return firstStringifyThenEncodedURI(affiliateSetting);
  }, [affiliateSetting]);

  const queryParams = useMemo(() => {
    setLoading(true);
    const param = `?underlyingTokens=${encodedUnderlyingTokens}&timeFrames=${encodedTimeFramesTokens}&backgroundItems=${encodedBackgroundItems}&typoGraphy=${encodedTypoGraphy}&affiliateSetting=${encodedAffiliateSetting}${
      referralCode ? `&ref=${referralCode}` : ""
    }&isDarkMode=${isDarkMode}`;
    dispatch(setQueryParam(param));
    return param;
  }, [
    encodedAffiliateSetting,
    encodedBackgroundItems,
    encodedTimeFramesTokens,
    encodedTypoGraphy,
    encodedUnderlyingTokens,
    referralCode,
    isDarkMode,
  ]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className="w-full h-screen p-4 flex items-center justify-center">
      {loading && (
        <div>
          <CircularProgress disableShrink={true} sx={{ color: "#12b3a8" }} size={300} />
        </div>
      )}
      <iframe
        title="ryze-widget"
        id="ryze-widget"
        className="p-4 rounded-2xl flex-1 w-full"
        src={process.env["NX_TRADE_WIDGET_URL"] + queryParams}
        style={{
          width: "100%",
          height: "100%",
          display: !loading ? "block" : "none",
          backgroundColor: isDarkMode
            ? backgroundItems["main-color-dark"]
            : backgroundItems["main-color-light"],
        }}
        allow="clipboard-read; clipboard-write"
        onLoad={handleIframeLoad}
      ></iframe>
    </div>
  );
}

export default Dashboard;
