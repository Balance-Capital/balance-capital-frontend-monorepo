/* eslint-disable node/no-unsupported-features/es-syntax */
import React, { lazy, useState } from "react";
import { NetworkStatus, PositionData } from "../../../core/types/basic.types";
import { useNetworkStatus } from "../../../hooks/useNetworkStatus";

const PositionDeposit = lazy(() => import("../components/position-deposit"));
const PositionDetail = lazy(() => import("../components/position-detail"));
const PositionList = lazy(() => import("../components/position-list"));
const PositionWithdraw = lazy(() => import("../components/position-withdraw"));
const ConnectWallet = lazy(() => import("../../../components/navbar/connect-wallet"));

export enum TabId {
  POSITION_LIST = 1,
  POSITION_DETAIL = 2,
  POSITION_DEPOSIT = 3,
  POSITION_WITHDRAW = 4,
}

const MyPositions = () => {
  const networkState = useNetworkStatus();

  const [selectedPosition, setSelectedPosition] = useState<PositionData | undefined>(
    undefined
  );
  const [selectedTab, setSelectedTab] = useState(TabId.POSITION_LIST);

  return (
    <div className="h-full customize-scrollbar">
      {networkState === NetworkStatus.Success ? (
        selectedTab === TabId.POSITION_LIST ? (
          <PositionList
            setSelectedPosition={setSelectedPosition}
            setSelectedTab={setSelectedTab}
          />
        ) : selectedTab === TabId.POSITION_DEPOSIT ? (
          <PositionDeposit
            position={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            setSelectedTab={setSelectedTab}
          />
        ) : selectedTab === TabId.POSITION_WITHDRAW ? (
          selectedPosition && (
            <PositionWithdraw
              position={selectedPosition}
              setSelectedPosition={setSelectedPosition}
              setSelectedTab={setSelectedTab}
            />
          )
        ) : (
          selectedPosition && (
            <PositionDetail
              position={selectedPosition}
              setSelectedPosition={setSelectedPosition}
              setSelectedTab={setSelectedTab}
            />
          )
        )
      ) : (
        <div className="h-full flex flex-col justify-center items-center gap-20 py-60 grow">
          <div className="w-40 h-40 flex items-center justify-center bg-second/20 rounded-full">
            <div className="w-25 h-25 flex items-center justify-center border-2 border-second text-second rounded-full font-semibold">
              i
            </div>
          </div>
          <div className="text-second text-center">
            Connect your wallet to create a new position.
          </div>
          <ConnectWallet />
        </div>
      )}
    </div>
  );
};

export default MyPositions;
