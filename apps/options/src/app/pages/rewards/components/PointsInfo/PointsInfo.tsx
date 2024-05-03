import { useCallback, useMemo, useState } from "react";
import { useSwitchNetwork } from "wagmi";
import { NetworkStatus } from "../../../../../app/core/types/basic.types";
import { useNetworkStatus } from "../../../../../app/hooks/useNetworkStatus";
import Button from "./Button";
import PointBar from "./PointBar";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";
import SelectWeb3ModePopup from "../../../../../app/components/pop-up/select-web3-mode";
import useLocalstorage from "../../../../../app/hooks/useLocalstorage";
import { useAccount } from "../../../../../app/hooks/useAccount";
import { useNetworkContext } from "../../../../../app/context/NetworkContext";

function PointsInfo() {
  const { connect } = useAccount();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [connectModalOpened, setConnectModalOpened] = useState<boolean>(false);
  const { isWalletModeSetted } = useLocalstorage();
  const networkStatus = useNetworkStatus();

  const { currentNetworkChainId } = useNetworkContext();
  const userPoint = useSelector((state: RootState) => state.reward.userPoint);
  const tasks = useSelector((state: RootState) => state.reward.tasks);

  const overview = useMemo(
    () => [
      {
        name: "Point earned",
        value:
          userPoint.current_point === -1
            ? 0
            : userPoint.current_point > 0
            ? userPoint.current_point
            : "0",
      },
      {
        name: "Rank",
        value: userPoint.rank === -1 ? 0 : userPoint.rank > 0 ? userPoint.rank : "0",
      },
      {
        name: "Tasks completed",
        value: tasks.length ? `${userPoint.completed_tasks.length}/${tasks.length}` : 0,
      },
    ],
    [userPoint, tasks]
  );

  const handleConnect = useCallback(() => {
    if (isWalletModeSetted) {
      connect();
    } else {
      setConnectModalOpened(true);
    }
  }, [connect]);

  return (
    <div
      className={`xs:bg-transparent lg:bg-charcoalGray rounded-2xl border-obsidianBlack xs:border-0 lg:border-2 xs:p-0 lg:p-20 font-InterRegular xs:text-18 sm:text-22 ${
        networkStatus === NetworkStatus.Success
          ? "grid xs:grid-rows-3 xl:grid-rows-none xl:grid-cols-3"
          : "text-center"
      } xs:gap-15 md:gap-20`}
    >
      {networkStatus === NetworkStatus.Success ? (
        <>
          {overview.map((item, i) => (
            <PointBar key={item.name} {...item} />
          ))}
        </>
      ) : networkStatus === NetworkStatus.WrongNetwork ? (
        <Button
          className="bg-orange-500"
          handleClick={() => {
            if (switchNetworkAsync) {
              switchNetworkAsync(currentNetworkChainId);
            }
          }}
        >
          Switch Network
        </Button>
      ) : (
        <Button className="bg-success" handleClick={handleConnect}>
          Connect
        </Button>
      )}

      <SelectWeb3ModePopup open={connectModalOpened} onClose={setConnectModalOpened} />
    </div>
  );
}

export default PointsInfo;
