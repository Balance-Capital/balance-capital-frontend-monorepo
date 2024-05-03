import CircularProgress from "@mui/material/CircularProgress";
import { RootState } from "../../../../store";
import { Dispatch, SetStateAction, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NotifyMessage, NotifyType } from "../../../../core/constants/notification";
import { enqueueSnackbar } from "notistack";
import {
  addClaimedRounds,
  setClaimingRounds,
} from "../../../../store/reducers/closedRounds-slice";
import { getMarketContract, readOnlyProvider } from "../../../../helpers/contractHelpers";
import useMulticall from "../../../../hooks/useMulticall";
import { PageTitles, emitTradeClaimAllClickedTrack } from "../../../../helpers/analytics";
import { useAccount } from "../../../../../app/hooks/useAccount";

interface Props {
  loadHistory: () => void;
  getAllClaimableRounds: any;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const ClaimAllButton = ({
  loadHistory,
  getAllClaimableRounds,
  visible,
  setVisible,
}: Props) => {
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);

  const dispatch = useDispatch();
  const { address, signer } = useAccount();
  const { multicallTryAggregate } = useMulticall();

  const [loading, setLoading] = useState(false);

  const handleClaimAll = async () => {
    setLoading(true);
    if (!signer || !address) return;

    const { epochs, rounds, timeframeIds, markets, totalAmount } =
      await getAllClaimableRounds();

    try {
      if (timeframeIds.length === 0) {
        enqueueSnackbar(NotifyMessage.NoRoundToClaim, { variant: NotifyType.INFO });
        setLoading(false);
        return;
      }

      dispatch(setClaimingRounds(rounds));

      const calls: { target: string; callData: string }[] = [];
      for (let i = 0; i < markets.length; i++) {
        const contract = getMarketContract(markets[i], readOnlyProvider());
        const callData = contract.interface.encodeFunctionData("claimBatch", [
          address,
          timeframeIds[i],
          epochs[i],
        ]);
        calls.push({ target: markets[i], callData });
      }
      const res = await multicallTryAggregate(true, calls);

      if (res.severity === NotifyType.DEFAULT) {
        enqueueSnackbar(NotifyMessage.ClaimSucceed, { variant: NotifyType.DEFAULT });

        emitTradeClaimAllClickedTrack(
          address,
          PageTitles.Trade,
          underlyingToken.symbol + "USD",
          totalAmount
        );

        setVisible(false);
        dispatch(
          addClaimedRounds({
            underlyingToken: underlyingToken.symbol,
            claimedRounds: rounds.map((r: any) => ({ ...r, claimedHash: "" })),
          })
        );
        setTimeout(loadHistory, 10000);
      } else {
        enqueueSnackbar(res.message, { variant: res.severity });
      }
    } catch (error) {
      console.error("claim all: ", error);
      enqueueSnackbar(NotifyMessage.DefaultError, { variant: NotifyType.ERROR });
    }

    dispatch(setClaimingRounds([]));
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-150 h-[54px]">
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        visible && (
          <button
            className="bg-brandColor rounded-2xl w-full h-full text-18 font-semibold text-whiteTxtColor transition-all"
            onClick={handleClaimAll}
          >
            Claim All
          </button>
        )
      )}
    </div>
  );
};

export default ClaimAllButton;
