import LeaderBoardTable from "./components/LeaderBoardTable";
import PointCardsSlider from "./components/PointCards/PointCardsSlider";
import Header from "./components/Header";
import PointsInfo from "./components/PointsInfo/PointsInfo";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAccount } from "../../hooks/useAccount";
import {
  loadCurrentSeasonThunk,
  loadTaskProgressThunk,
  loadTaskTiersThunk,
  loadTasksThunk,
  loadUserPointThunk,
} from "../../store/reducers/reward-slice";
import { useNetworkContext } from "../../context/NetworkContext";

function Rewards() {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    dispatch(loadTasksThunk());
    dispatch(loadTaskTiersThunk());
    dispatch(loadCurrentSeasonThunk());
  }, []);

  useEffect(() => {
    if (address) {
      dispatch(loadTaskProgressThunk({ address }));
      dispatch(loadUserPointThunk({ address }));
    }
  }, [address, currentNetworkChainId]);

  return (
    <div className="min-h-screen flex flex-col customize-scrollbar">
      <div className="xs:p-[0.8rem_0.8rem] sm:p-[1rem_2rem] xl:p-[1.5rem_2rem] 2xl:p-[2rem_4rem] grow space-y-35">
        <Header />
        <PointsInfo />
        <PointCardsSlider />
        <LeaderBoardTable />
      </div>
    </div>
  );
}

export default Rewards;
