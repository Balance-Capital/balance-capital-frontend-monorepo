import React, { useCallback, useMemo } from "react";
import { useSigner } from "wagmi";
import { getReferralContract } from "../helpers/contractHelpers";
import { BigNumber, Signer, ethers } from "ethers";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { useAccount } from "./useAccount";
import { loadEnvVariable } from "../core/constants/network";
import BinaryReferralABI from "../core/abi/BinaryReferral.json";
import { useNetworkContext } from "../context/NetworkContext";

const useReferralContract = () => {
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();
  const contract = useMemo(
    () => getReferralContract(signer ? signer : undefined),
    [signer, currentNetworkChainId]
  );

  const claimReferralFee = useCallback(
    async (allocation: BigNumber, signature: string) => {
      try {
        if (provider instanceof Signer) {
          const tx = await contract["claim"](allocation, signature, { from: address });
          await tx.wait();
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.ClaimSucceed,
            data: tx.hash,
          };
        } else {
          if (!provider) {
            console.log("Provider is not connected");
            throw new Error("not connected");
          }

          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_DISTRIBUTOR_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(BinaryReferralABI).encodeFunctionData(
              "claim",
              [allocation, signature]
            ) as `0x${string}`,
          });

          const txHash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}}`
          );
          return {
            severity: NotifyType.DEFAULT,
            message: NotifyMessage.ClaimSucceed,
            data: txHash as string,
          };
        }
      } catch (error) {
        console.error("claimReferralFee: ", error);
        return {
          message: getMetamaskErrorMessage(error as any),
          severity: NotifyType.ERROR,
          data: "",
        };
      }
    },
    [contract]
  );

  return {
    claimReferralFee,
  };
};

export default useReferralContract;
