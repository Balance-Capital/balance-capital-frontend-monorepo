import { useCallback, useMemo } from "react";
import { useSigner } from "wagmi";
import { getMulticallContract } from "../helpers/contractHelpers";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { MULTICALL2_ADDRESS } from "../core/constants/network";
import { BigNumber, Signer, ethers } from "ethers";
import { useAccount } from "./useAccount";
import MulticallABI from "../core/abi/Multicall.json";
import { ECDSAProvider } from "@zerodev/sdk";
import { useNetworkContext } from "../context/NetworkContext";

const useMulticall = () => {
  const { data: signer } = useSigner();
  const { address, signer: provider } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(() => {
    return getMulticallContract(MULTICALL2_ADDRESS(), signer ? signer : undefined);
  }, [signer, currentNetworkChainId]);

  const multicallAggregate = useCallback(
    async (calls: { target: string; callData: string }[]) => {
      try {
        if (!address) {
          throw new Error("not connected");
        }
        console.log(calls);
        if (provider instanceof ECDSAProvider) {
          if (!provider) {
            console.log("Provider is not connected");
            throw new Error("not connected");
          }

          const uoHash = await provider.sendUserOperation({
            target: MULTICALL2_ADDRESS() as `0x${string}`,
            data: new ethers.utils.Interface(MulticallABI).encodeFunctionData(
              "aggregate",
              [calls]
            ) as `0x${string}`,
          });

          const txHash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.RequestWithdrawalSuccess,
            data: txHash as string,
          };
        } else {
          const tx = await contract["aggregate"](calls, { from: address });
          await tx.wait();
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.RequestWithdrawalSuccess,
            data: tx.hash as string,
          };
        }
      } catch (error) {
        console.error("multicallAggregate: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  const multicallTryAggregate = useCallback(
    async (requireSuccess: boolean, calls: { target: string; callData: string }[]) => {
      try {
        if (provider instanceof Signer) {
          if (!address || !signer || !signer.provider) {
            throw new Error("not connected");
          }
          let gas = BigNumber.from("0");
          for (let i = 0; i < calls.length; i++) {
            gas = gas.add(
              await signer.provider.estimateGas({
                to: calls[i].target,
                data: calls[i].callData,
                from: address,
              })
            );
          }
          const tx = await contract["tryAggregate"](requireSuccess, calls, {
            from: address,
            gasLimit: Math.floor(gas.toNumber() * 1.2) + "",
          });
          await tx.wait();
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.RequestWithdrawalSuccess,
            data: tx.hash,
          };
        } else {
          if (!provider) {
            console.log("Provider is not connected");
            throw new Error("not connected");
          }

          const uoHash = await provider.sendUserOperation({
            target: MULTICALL2_ADDRESS() as `0x${string}`,
            data: new ethers.utils.Interface(MulticallABI).encodeFunctionData(
              "tryAggregate",
              [requireSuccess, calls]
            ) as `0x${string}`,
          });

          const txHash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
          console.log("txhash: ", txHash);
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.RequestWithdrawalSuccess,
            data: txHash as string,
          };
        }
      } catch (error) {
        console.error("multicallTryAggregate: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return { multicallAggregate, multicallTryAggregate };
};

export default useMulticall;
