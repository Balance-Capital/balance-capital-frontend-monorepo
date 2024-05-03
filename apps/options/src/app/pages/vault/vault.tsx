/* eslint-disable node/no-unsupported-features/es-syntax */
import { lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setVaultData,
  loadVaultBalance,
  emptyUserPosotions,
  loadVaultUserPositions,
  addNewPosition,
} from "../../store/reducers/vault-slice";
import { RootState } from "../../store";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { NetworkStatus } from "../../core/types/basic.types";
import { LoadingBoundary } from "../../components/LoadingBoundary/LoadingBoundary";
import { BigNumber, ethers } from "ethers";
import { NetworkIds, chains } from "@fantohm/shared-web3";
import { getVaultContract } from "../../helpers/contractHelpers";
import { loadAccountBalances } from "../../store/reducers/account-slice";
import { LoadVaultBalanceInterval } from "../../core/constants/basic";
import { useAccount } from "../../hooks/useAccount";
import { useNetworkContext } from "../../context/NetworkContext";

const VaultOverview = lazy(async () => import("./tabs/vault-overview"));
const MyPositions = lazy(async () => import("./tabs/my-positions"));

const DelayTime = 2000;

const Vault = (): JSX.Element => {
  const dispatch = useDispatch();
  const networkStatus = useNetworkStatus();
  const { address } = useAccount();

  const { currentNetworkChainId } = useNetworkContext();

  // const { positions, loading } = useUserPositions(vaultAddress);
  const positions = useSelector((state: RootState) => state.vault.positions);

  // const [positions, setPositions] = useState([1, 2]);
  const [tabId, setTabId] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    dispatch(setVaultData());
    const timerId = setInterval(
      () => dispatch(loadVaultBalance(true)),
      LoadVaultBalanceInterval
    );

    return () => {
      clearInterval(timerId);
    };
  }, [currentNetworkChainId]);

  useEffect(() => {
    if (address) {
      dispatch(loadVaultUserPositions(address));

      let wssProvider;
      if (
        currentNetworkChainId === NetworkIds.Berachain ||
        currentNetworkChainId === NetworkIds.Blast ||
        currentNetworkChainId === NetworkIds.BlastMainnet
      ) {
        wssProvider = new ethers.providers.JsonRpcProvider(
          chains[currentNetworkChainId].rpcUrls[0]
        );
      } else {
        wssProvider = new ethers.providers.WebSocketProvider(
          chains[currentNetworkChainId].wssUrls[0]
        );
      }

      const vaultContract = getVaultContract(wssProvider);

      vaultContract.on(
        "LiquidityAdded",
        (
          owner: string,
          oldTokenId: BigNumber,
          newTokenId: BigNumber,
          amount: BigNumber,
          shareAmount: BigNumber,
          newSnapshot: BigNumber,
          newTokenValue: BigNumber
        ) => {
          if (owner.toLowerCase() === address.toLowerCase()) {
            setTimeout(() => {
              dispatch(
                addNewPosition({
                  userAddress: owner,
                  tokenId: newTokenId.toNumber(),
                })
              );
            }, DelayTime);
            dispatch(loadAccountBalances(address));
          }
          dispatch(loadVaultBalance(true));
        }
      );

      vaultContract.on(
        "LiquidityRemoved",
        (
          owner: string,
          oldTokenId: BigNumber,
          newTokenId: BigNumber,
          amount: BigNumber,
          shareAmount: BigNumber,
          newShares: BigNumber,
          newSnapshot: BigNumber,
          newTokenValue: BigNumber
        ) => {
          if (
            owner.toLowerCase() === address.toLowerCase() &&
            newTokenId.toNumber() > 0
          ) {
            setTimeout(() => {
              dispatch(
                addNewPosition({ userAddress: owner, tokenId: newTokenId.toNumber() })
              );
            }, DelayTime);
            dispatch(loadAccountBalances(address));
          }
          dispatch(loadVaultBalance(true));
        }
      );

      vaultContract.on(
        "PositionMerged",
        (
          owner: string,
          tokenIds: BigNumber[],
          newTokenId: BigNumber,
          newSnapshot: BigNumber,
          newTokenValue: BigNumber
        ) => {
          if (owner.toLowerCase() === address.toLowerCase()) {
            setTimeout(() => {
              dispatch(
                addNewPosition({ userAddress: owner, tokenId: newTokenId.toNumber() })
              );
            }, DelayTime);
          }
        }
      );
    } else {
      dispatch(emptyUserPosotions());
    }
  }, [address, currentNetworkChainId]);

  return (
    <div className="mt-30 px-20 md:px-30 lg:px-40 xl:px-60 2xl:px-100">
      <div className="title xs:flex flex-col items-center sm:block xs:px-20 sm:px-40 xs:py-0 sm:py-30 mt-[30px] mb-[10px] sm:mt-10 sm:my-10 sm:mb-50 bg-cover sm:bg-[url('./assets/images/bg-earn-sm.png')] lg:bg-[url('./assets/images/bg-earn-lg.png')] bg-no-repeat bg-center rounded-2xl">
        <p className="xs:text-34 sm:text-40 text-primary leading-10 mb-15">Vault</p>
        <p className="xs:text-18 sm:text-20 text-second leading-5">Deposit to earn</p>
      </div>
      <div className="flex pt-20 lg:hidden">
        {[
          "Overview",
          `My Positions ${
            address && networkStatus === NetworkStatus.Success
              ? `(${
                  positions.filter((pos) => pos.owner === address.toLowerCase()).length
                })`
              : ""
          }`,
        ].map((text, ind) => (
          <button
            className={`w-0 grow py-15 border-b-2 text-18 sm:text-20 ${
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
      <div className="grow grid grid-cols-1 lg:grid-cols-2 pb-30 xl:pb-55 gap-30 xl:gap-50 min-h-[calc(100vh-239px)] md:min-h-[calc(100vh-437px)] lg:min-h-0">
        <div
          className={`lg:border-obsidianBlack lg:border-2 rounded-3xl lg:bg-charcoalGray py-20 lg:py-40 lg:px-30 xl:px-40 h-auto lg:h-750 ${
            tabId !== 0 ? "hidden" : ""
          } lg:block`}
        >
          <LoadingBoundary>
            <VaultOverview />
          </LoadingBoundary>
        </div>
        <div
          className={`lg:border-obsidianBlack lg:border-2 rounded-3xl lg:bg-charcoalGray py-20 lg:py-40 lg:px-30 xl:px-40 h-auto lg:h-750 ${
            tabId !== 1 ? "hidden" : ""
          } lg:block`}
        >
          <LoadingBoundary>
            <MyPositions />
          </LoadingBoundary>
        </div>
      </div>
    </div>
  );
};

export default Vault;
