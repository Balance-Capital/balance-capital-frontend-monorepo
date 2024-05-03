import { BigNumber, Signer, ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { getVaultContract } from "../helpers/contractHelpers";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { useSigner } from "wagmi";
import { useAccount } from "./useAccount";
import { loadEnvVariable } from "../core/constants/network";
import vaultABI from "../core/abi/BinaryVault.json";
import { useNetworkContext } from "../context/NetworkContext";

export const useUserPositions = (vaultAddress: string) => {
  const { address } = useAccount();
  const [positions, setPositions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentNetworkChainId } = useNetworkContext();

  useEffect(() => {
    const func = async () => {
      try {
        if (address) {
          setLoading(true);
          const res = await getVaultContract(undefined)["tokensOfOwner"](address);
          setPositions(res.map((id: ethers.BigNumber) => id.toNumber()));
        }
      } catch (error) {
        console.error("useUserPositions: ", error);
      } finally {
        setLoading(false);
      }
    };

    func();
  }, [address, currentNetworkChainId]);

  return { positions, loading };
};

export const useAddLiquidity = () => {
  //  addNewLiquidity
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(
    () => getVaultContract(signer ? signer : undefined),
    [address, signer, currentNetworkChainId]
  );

  const addLiquidity = useCallback(
    async (tokenId: number, amount: ethers.BigNumber, isNew: boolean) => {
      let txhash;
      try {
        if (!provider) {
          throw "Not connected";
        }

        if (provider instanceof Signer) {
          const tx = await contract["addLiquidity"](tokenId, amount, isNew, {
            from: address,
          });
          await tx.wait();
          txhash = tx.hash;
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(vaultABI).encodeFunctionData(
              "addLiquidity",
              [tokenId, amount, isNew]
            ) as `0x${string}`,
          });

          txhash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.DepositSuccess,
          data: txhash as string,
        };
      } catch (error) {
        console.error("useLiquidity: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return addLiquidity;
};

export const useRequestWithdrawal = () => {
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(
    () => getVaultContract(signer ? signer : undefined),
    [address, signer, currentNetworkChainId]
  );

  const requestWithdrawal = useCallback(
    async (shareAmount: string, tokenId: number) => {
      try {
        if (!provider) {
          throw "Not connected";
        }
        let txhash;
        if (provider instanceof Signer) {
          const tx = await contract["requestWithdrawal"](
            BigNumber.from(shareAmount),
            tokenId,
            { from: address }
          );
          await tx.wait();
          txhash = tx.hash;
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(vaultABI).encodeFunctionData(
              "requestWithdrawal",
              [BigNumber.from(shareAmount), tokenId]
            ) as `0x${string}`,
          });

          txhash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.RequestWithdrawalSuccess,
          data: txhash as string,
        };
      } catch (error) {
        console.error("useRequestWithdrawal: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return requestWithdrawal;
};

export const useCancelWithdrawal = () => {
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(
    () => getVaultContract(signer ? signer : undefined),
    [address, signer, currentNetworkChainId]
  );

  const cancelWithdrawal = useCallback(
    async (tokenId: number) => {
      let txhash;
      try {
        if (!provider) {
          throw "Not connected";
        }
        if (provider instanceof Signer) {
          const tx = await contract["cancelWithdrawalRequest"](tokenId, {
            from: address,
          });
          await tx.wait();
          txhash = tx.hash;
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(vaultABI).encodeFunctionData(
              "cancelWithdrawalRequest",
              [tokenId]
            ) as `0x${string}`,
          });

          txhash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.CancelWithdrawalSuccess,
          data: txhash as string,
        };
      } catch (error) {
        console.error("useCancelWithdrawal: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return cancelWithdrawal;
};

export const useExecuteWithdrawal = () => {
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(
    () => getVaultContract(signer ? signer : undefined),
    [address, signer, currentNetworkChainId]
  );

  const executeWithdrawal = useCallback(
    async (tokenId: number) => {
      let txhash;
      try {
        if (!provider) {
          throw "Not connected";
        }
        if (provider instanceof Signer) {
          const tx = await contract["executeWithdrawalRequest"](tokenId, {
            from: address,
          });
          await tx.wait();
          txhash = tx.hash;
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(vaultABI).encodeFunctionData(
              "executeWithdrawalRequest",
              [tokenId]
            ) as `0x${string}`,
          });

          txhash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.ExecuteWithdrawalSuccess,
          data: txhash as string,
        };
      } catch (error) {
        console.error("useExecuteWithdrawal: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return executeWithdrawal;
};

export const useMergePositions = () => {
  const { address, signer: provider } = useAccount();
  const { data: signer } = useSigner();
  const { currentNetworkChainId } = useNetworkContext();

  const contract = useMemo(
    () => getVaultContract(signer ? signer : undefined),
    [address, signer, currentNetworkChainId]
  );

  const mergePositions = useCallback(
    async (tokenIds: number[]) => {
      let txhash;
      try {
        if (!provider) {
          throw "Not connected";
        }
        if (provider instanceof Signer) {
          const tx = await contract["mergePositions"](tokenIds, { from: address });
          await tx.wait();

          txhash = tx.hash;
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(vaultABI).encodeFunctionData(
              "mergePositions",
              [tokenIds]
            ) as `0x${string}`,
          });

          txhash = await provider.waitForUserOperationTransaction(
            uoHash.hash as `0x${string}`
          );
        }

        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.MergePositionsSuccess,
          data: txhash as string,
        };
      } catch (error) {
        console.error("useMergePositions: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );
  return mergePositions;
};
