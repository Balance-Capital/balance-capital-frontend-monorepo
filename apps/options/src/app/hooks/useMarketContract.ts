/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber, Signer, ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadEnvVariable } from "../core/constants/network";
import { HistoryData } from "../core/types/basic.types";
import BinaryMarketABI from "../core/abi/BinaryMarket.json";
import { CallReturnContext } from "ethereum-multicall";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { formatUnits } from "ethers/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Underlying_Token } from "../core/constants/basic";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { useSigner } from "wagmi";
import {
  getMarketContract,
  multicall,
  readOnlyProvider,
} from "../helpers/contractHelpers";
import { useAccount } from "./useAccount";
import { currentNetworkChain, useNetworkContext } from "../context/NetworkContext";

export const useBinaryMarketContract = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const { currentNetworkChainId } = useNetworkContext();

  return useMemo(() => {
    return new ethers.Contract(
      loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
      ),
      BinaryMarketABI,
      signer ? signer : undefined
    );
  }, [signer, address, underlyingToken, currentNetworkChainId]);
};

export const useReadonlyBinaryMarketContract = () => {
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const { currentNetworkChainId } = useNetworkContext();

  return useMemo(() => {
    return new ethers.Contract(
      loadEnvVariable(
        `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
      ),
      BinaryMarketABI,
      readOnlyProvider()
    );
  }, [underlyingToken, currentNetworkChainId]);
};

export const useClaim = () => {
  const { address, signer } = useAccount();
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);
  const { currentNetworkChainId } = useNetworkContext();

  const claim = useCallback(
    async (marketAddress: string | undefined, timeframeId: number, epoch: number) => {
      if (!signer) {
        throw new Error("Not connected");
      }
      try {
        if (!marketAddress) {
          marketAddress = loadEnvVariable(
            `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
          );
        }
        let txHash;
        if (signer instanceof Signer) {
          const marketContract = getMarketContract(marketAddress, signer);
          const gas = await marketContract["estimateGas"]["claim"](
            address,
            timeframeId,
            epoch
          );
          const tx = await marketContract["claim"](address, timeframeId, epoch, {
            gasLimit: gas.mul(2),
          });
          await tx.wait();
          txHash = tx.hash;
        } else {
          const userops = await signer.sendUserOperation({
            target: marketAddress as `0x${string}`,
            data: new ethers.utils.Interface(BinaryMarketABI).encodeFunctionData(
              "claim",
              [address, timeframeId, epoch]
            ) as `0x${string}`,
          });

          txHash = await signer.waitForUserOperationTransaction(
            userops.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.ClaimSucceed,
          data: txHash,
        };
      } catch (e: any) {
        return {
          message: getMetamaskErrorMessage(e as any),
          severity: NotifyType.ERROR,
          data: "",
        };
      }
    },
    [signer, address, currentNetworkChainId]
  );

  return {
    claim,
  };
};

export const useMarketContract = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [loading, setLoading] = useState(false);
  const underlyingToken = useSelector((state: RootState) => state.trade.underlyingToken);

  const marketContract = useBinaryMarketContract();

  const multiCallProvider = multicall;
  const { currentNetworkChainId } = useNetworkContext();

  const getIsClaimable = useCallback(
    async (data: Array<HistoryData>) => {
      try {
        setLoading(true);
        const callData = [] as any;
        const context = {
          reference: "BinaryMarket",
          contractAddress: loadEnvVariable(
            `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
          ),
          abi: BinaryMarketABI,
          calls: [],
        };
        if (data)
          for (const item of data) {
            callData.push({
              reference: "currentLockedEpoch",
              methodName: "isClaimable",
              methodParameters: [item.timeframeId, item.round.epoch, address],
            });
          }
        context.calls = callData;

        const res = await multiCallProvider().call(context);
        if (
          !res.results["BinaryMarket"] ||
          !res.results["BinaryMarket"].callsReturnContext
        )
          return;
        return res.results["BinaryMarket"].callsReturnContext;
      } catch (e: any) {
        console.error(e);
        return;
      } finally {
        setLoading(false);
      }
    },
    [signer, address, currentNetworkChainId]
  );

  const getPlacedAmountandPosition = useCallback(
    async (
      timeframeId: number,
      epoch: number
    ): Promise<{ amount: number; position: number }> => {
      try {
        if (address) {
          const res = await marketContract["ledger"](timeframeId, epoch, address);
          return {
            amount: parseFloat(
              formatUnits(res[1], Underlying_Token[currentNetworkChainId].decimals)
            ),
            position: res.position,
          };
        }
        return { amount: 0, position: 0 };
      } catch (e) {
        console.log(`Invalid address: ${address}`);
        return { amount: 0, position: 0 };
      }
    },
    [marketContract, address]
  );

  const getBetStates = useCallback(
    async (timeframeId: number, epochs: number[]): Promise<CallReturnContext[]> => {
      try {
        if (!signer) return [];
        const callData = [] as any;
        const context = {
          reference: "BinaryMarket",
          contractAddress: loadEnvVariable(
            `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
          ),
          abi: BinaryMarketABI,
          calls: [],
        };
        if (epochs)
          epochs.map((epoch, index) =>
            callData.push({
              reference: "currentLockedEpoch",
              methodName: "ledger",
              methodParameters: [timeframeId, epoch + index, address],
            })
          );
        context.calls = callData;

        const res = await multiCallProvider().call(context);
        if (
          !res.results["BinaryMarket"] ||
          !res.results["BinaryMarket"].callsReturnContext
        )
          return [];
        return res.results["BinaryMarket"].callsReturnContext;
      } catch (e: any) {
        console.error(e);
        return [];
      }
    },
    [marketContract, address]
  );

  const getLedgers = useCallback(
    async (timeframeIds: number[], epochs: number[]) => {
      try {
        if (!signer) return;
        setLoading(true);
        const callData = [] as any;
        const context = {
          reference: "BinaryMarket",
          contractAddress: loadEnvVariable(
            `NX_BINARY_MARKET_${currentNetworkChainId}_${underlyingToken.symbol}_ADDRESS`
          ),
          abi: BinaryMarketABI,
          calls: [],
        };
        if (epochs)
          epochs.map((epoch, index) =>
            callData.push({
              reference: "ledger",
              methodName: "ledger",
              methodParameters: [timeframeIds[index], epoch, address],
            })
          );
        context.calls = callData;

        const res = await multiCallProvider().call(context);
        if (
          !res.results["BinaryMarket"] ||
          !res.results["BinaryMarket"].callsReturnContext
        )
          return;
        return res.results["BinaryMarket"].callsReturnContext;
      } catch (e: any) {
        console.error(e);
        return;
      } finally {
        setLoading(false);
      }
    },
    [signer, address, currentNetworkChainId]
  );

  return {
    getIsClaimable,
    getPlacedAmountandPosition,
    getBetStates,
    getLedgers,
    loading,
  };
};

export const useMinBetAmount = () => {
  const [minBetAmount, setMinBetAmount] = useState(0.1);
  const marketContract = useReadonlyBinaryMarketContract();

  const getMinBetAmount = useCallback(async () => {
    try {
      if (marketContract) {
        const res = await marketContract["minBetAmount"]();
        if (res) {
          setMinBetAmount(
            parseFloat(
              formatUnits(
                BigNumber.from(res),
                Underlying_Token[currentNetworkChain.id].decimals
              )
            )
          );
        }
      }
    } catch (error) {
      console.error("[getMinBetAmount]", error);
    }
  }, [marketContract]);

  useEffect(() => {
    getMinBetAmount();
  }, [getMinBetAmount]);

  return minBetAmount;
};

export const useClaimAll = () => {
  const { address, signer } = useAccount();
  const marketContract = useBinaryMarketContract();

  const claimAll = useCallback(
    async (timeframeIds: number[], epochs: number[][]) => {
      if (!signer) {
        console.log("Invalid signer");
        return;
      }
      if (!marketContract) return;
      let txHash;
      try {
        if (signer instanceof Signer) {
          const gas = await marketContract["estimateGas"]["claimBatch"](
            timeframeIds,
            epochs
          );
          const tx = await marketContract["claimBatch"](timeframeIds, epochs, {
            gasLimit: gas.mul(2),
          });
          await tx.wait();
          txHash = tx.hash;
        } else {
          const userops = await signer.sendUserOperation({
            target: marketContract.address as `0x${string}`,
            data: new ethers.utils.Interface(BinaryMarketABI).encodeFunctionData(
              "claim",
              [timeframeIds, epochs]
            ) as `0x${string}`,
          });

          txHash = await signer.waitForUserOperationTransaction(
            userops.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.ClaimSucceed,
          data: txHash,
        };
      } catch (e: any) {
        console.error(e);
        return {
          message: getMetamaskErrorMessage(e as any),
          severity: NotifyType.ERROR,
          data: "",
        };
      }
    },
    [marketContract, address]
  );

  return claimAll;
};

export const useGetCurrentBettableAmount = () => {
  const marketContract = useReadonlyBinaryMarketContract();

  const getCurrentBettableAmount = useCallback(
    async (timeframeId: number, epoch: number): Promise<ethers.BigNumber[]> => {
      const res = await marketContract["getCurrentBettableAmount"](timeframeId, epoch);
      const bullAmount: BigNumber = res;
      const bearAmount: BigNumber = res;
      // if (timeframeId === 2) {
      //   bullAmount = bullAmount.div(BigNumber.from(8));
      //   bearAmount = bearAmount.div(BigNumber.from(8));
      // }
      return [bullAmount, bearAmount];
    },
    [marketContract]
  );

  return getCurrentBettableAmount;
};

export const getLedgers = async (
  marketAddress: string,
  timeframeIds: number[],
  epochs: number[],
  account: string
) => {
  const multiCallProvider = multicall;
  const context = {
    reference: "BinaryMarket",
    contractAddress: marketAddress,
    abi: BinaryMarketABI,
    calls: [],
  };
  const callData = [] as any;
  for (let i = 0; i < timeframeIds.length; i++) {
    callData.push({
      reference: "ledger",
      methodName: "ledger",
      methodParameters: [timeframeIds[i], epochs[i], account],
    });
  }
  context.calls = callData;

  const res = await multiCallProvider().call(context);
  const ledgers = res.results.BinaryMarket.callsReturnContext.map(
    (returndata) => returndata.returnValues
  );
  return ledgers;
};
