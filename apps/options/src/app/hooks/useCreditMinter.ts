import { useCallback } from "react";
import { getRyzeCreditMinterContract } from "../helpers/contractHelpers";
import { useAccount } from "./useAccount";
import { Signer, ethers } from "ethers";
import { loadEnvVariable } from "../core/constants/network";
import ryzeCreditMinterABI from "../core/abi/RyzeCreditMinter.json";
import { useNetworkContext } from "../context/NetworkContext";

interface ICreditMinterTokenClaim {
  address: string;
  tokenId: number;
  amount: number;
  userTotalClaimed: number;
  generatedAt: number;
  signature: string;
}
export const useCreditMinter = () => {
  const { address, signer } = useAccount();
  const { currentNetworkChainId } = useNetworkContext();

  const claim = useCallback(
    async ({
      address,
      tokenId,
      amount,
      userTotalClaimed,
      generatedAt,
      signature,
    }: ICreditMinterTokenClaim) => {
      try {
        if (!signer) {
          console.log("Invalid signer");
          return;
        }
        if (signer instanceof Signer) {
          const response = await getRyzeCreditMinterContract(signer)["claim"](
            address,
            tokenId,
            amount,
            userTotalClaimed,
            generatedAt,
            signature
          );
          return response;
        } else {
          const uoHash = await signer.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_CREDIT_TOKEN_MINTER_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(ryzeCreditMinterABI).encodeFunctionData(
              "claim",
              [address, tokenId, amount, userTotalClaimed, generatedAt, signature]
            ) as `0x${string}`,
          });

          await signer.waitForUserOperationTransaction(uoHash.hash as `0x${string}`);
        }
      } catch (error) {
        throw error as any;
      }
    },
    [signer, address, currentNetworkChainId]
  );
  return { claim };
};
