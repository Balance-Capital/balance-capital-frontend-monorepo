import { useCallback } from "react";
import { useAccount } from "./useAccount";
import { erc20ABI, useAccount as useEOAAccount, useSigner } from "wagmi";
import { BigNumber, Signer, ethers } from "ethers";
import { Underlying_Token } from "../core/constants/basic";
import { ERC20Abi } from "@zerodev/sdk";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { Address, zeroAddress } from "viem";
import { useNetworkContext } from "../context/NetworkContext";

export default function useWallet() {
  const { address, signer: scaSigner } = useAccount();
  const { address: eoaAddress } = useEOAAccount();
  const { data: signer } = useSigner();

  const { currentNetworkChainId } = useNetworkContext();

  const depositToSCAFromEOA = useCallback(
    async (tokenAmount: BigNumber) => {
      if (!signer) {
        console.log("Not connecte");
        return {
          severity: NotifyType.ERROR,
          message: NotifyMessage.DefaultError,
          data: "Not connected",
        };
      }

      try {
        const uTokenContract = new ethers.Contract(
          Underlying_Token[currentNetworkChainId].address,
          ERC20Abi,
          signer
        );

        const tx = await uTokenContract["transfer"](address, tokenAmount);
        await tx.wait();
        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.DepositSuccess,
          data: tx.hash as string,
        };
      } catch (err) {
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(err),
          data: "",
        };
      }
    },
    [address, eoaAddress, signer, currentNetworkChainId]
  );

  const transferAssetsFromSCA = useCallback(
    async (tokenAddress: Address, amount: BigNumber, receipent: Address) => {
      if (!scaSigner || scaSigner instanceof Signer) {
        console.log("Not connecte");
        return {
          severity: NotifyType.ERROR,
          message: NotifyMessage.TransferError,
          data: "Not connected",
        };
      }

      if (tokenAddress == zeroAddress) {
        // eth transfer
        const uoHash = await scaSigner.sendUserOperation({
          target: receipent,
          data: "0x",
          value: amount.toBigInt(),
        });
        const txHash = await scaSigner.waitForUserOperationTransaction(
          uoHash.hash as `0x${string}`
        );
        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.TransferSucceed,
          data: txHash,
        };
      } else {
        const uoHash = await scaSigner.sendUserOperation({
          target: tokenAddress,
          data: new ethers.utils.Interface(erc20ABI).encodeFunctionData("transfer", [
            receipent,
            amount,
          ]) as `0x${string}`,
        });

        const txHash = await scaSigner.waitForUserOperationTransaction(
          uoHash.hash as `0x${string}`
        );

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.TransferSucceed,
          data: txHash,
        };
      }
    },
    [scaSigner]
  );

  return { depositToSCAFromEOA, transferAssetsFromSCA };
}
