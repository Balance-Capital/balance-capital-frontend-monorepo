import { SnackbarContent, CustomContentProps, enqueueSnackbar } from "notistack";
import React from "react";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";
import { NotifyMessage, NotifyType } from "../../core/constants/notification";
import { useClaim } from "../../hooks/useMarketContract";
import { useDispatch } from "react-redux";
import { addClaimedRounds } from "../../store/reducers/closedRounds-slice";
import { loadEnvVariable } from "../../core/constants/network";
import AlertIcon from "./alert-icon";
import { useNetworkContext } from "../../context/NetworkContext";

interface Props extends CustomContentProps {
  currency: string;
  position: number;
  isWin: boolean;
  roundId: number;
  isReverted: boolean;
  timeframeId?: number;
}

const BetResultAlert = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    id,
    message,
    currency,
    position,
    isWin,
    roundId,
    isReverted,
    timeframeId,
    ...other
  } = props;

  const { claim } = useClaim();
  const dispatch = useDispatch();
  const { currentNetworkChainId } = useNetworkContext();

  const handleClaim = async () => {
    if (timeframeId === undefined) {
      return;
    }
    const isClaim = false;

    const result = await claim(
      loadEnvVariable(`NX_BINARY_MARKET_${currentNetworkChainId}_${currency}_ADDRESS`),
      timeframeId,
      roundId
    );
    if (result.severity === NotifyType.DEFAULT) {
      dispatch(
        addClaimedRounds({
          underlyingToken: currency,
          claimedRounds: [
            {
              claimedHash: result.data,
              epoch: roundId,
              timeframeId: timeframeId,
            },
          ],
        })
      );

      if (isClaim) {
        enqueueSnackbar(NotifyMessage.ClaimSucceed, { variant: NotifyType.SUCCESS });
      } else {
        enqueueSnackbar(NotifyMessage.RefundSucceed, { variant: NotifyType.SUCCESS });
      }
    } else {
      enqueueSnackbar(result.message, { variant: result.severity });
    }
  };

  return (
    <SnackbarContent ref={ref} role="alert" {...other}>
      <div className="flex items-center gap-15 rounded-[15px] border-2 border-bunker bg-woodsmoke px-20 py-10 max-w-350 min-h-60">
        {!isReverted ? (
          <>
            <div className="relative">
              <img
                src={`./assets/images/${currency}.png`}
                alt={currency}
                className="w-40 h-40"
              />
              <div
                className={`w-20 h-20 rounded-full border-2 absolute -right-[5px] -top-[5px] text-textWhite flex justify-center items-center ${
                  isWin ? "border-success bg-success/80" : "border-danger bg-danger/80"
                }`}
              >
                {isWin ? (
                  <NorthEastRoundedIcon className="text-16 block" />
                ) : (
                  <SouthEastRoundedIcon className="text-16 block" />
                )}
              </div>
            </div>
            <div>
              <div className="text-textWhite">
                You{" "}
                <span className={isWin ? "text-success" : "text-danger"}>
                  {isWin ? "won" : "lost"}
                </span>
              </div>
              <div className="text-second text-14">
                Round <span className="text-textWhite">#{roundId}</span> has ended.
              </div>
            </div>
          </>
        ) : (
          <>
            <AlertIcon variant="error" />
            <div className="text-textWhite">
              Round full. Please claim{" "}
              <span
                className="text-success underline cursor-pointer"
                onClick={handleClaim}
              >
                refund
              </span>{" "}
              .
            </div>
          </>
        )}
      </div>
    </SnackbarContent>
  );
});

export default BetResultAlert;
