import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";

import { useUnderlyingTokenContract } from "./useContracts";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { getMetamaskErrorMessage } from "../helpers/data-translations";
import { useSigner } from "wagmi";
import { useAccount } from "./useAccount";
import { useNetworkContext } from "../context/NetworkContext";

export const useERC20TokenBalanceOf = (address?: string) => {
  const defaultBalance = {
    balance: -1,
    balanceInWei: ethers.BigNumber.from(0),
    decimals: 18,
  };

  const { address: userAddr } = useAccount();
  const uTokenContract = useUnderlyingTokenContract();

  const [loading, setLoading] = useState(false);
  // const [balance, setBalance] = useState(-1);
  // const [balanceInWei, setBalanceInWei] = useState(ethers.BigNumber.from(0));

  const [balanceOf, setBalanceOf] = useState(defaultBalance);

  useEffect(() => {
    const func = async () => {
      try {
        setLoading(true);
        const balanceInWei = await uTokenContract["balanceOf"](address || userAddr);
        const decimals = await uTokenContract["decimals"]();
        setBalanceOf({
          decimals,
          balanceInWei,
          balance: parseFloat(ethers.utils.formatUnits(balanceInWei, decimals)),
        });
      } catch (error) {
        console.error(error);
        setBalanceOf(defaultBalance);
      } finally {
        setLoading(false);
      }
    };
    func();
  }, [address, userAddr, uTokenContract]);

  return { ...balanceOf, loading };
};

export const useERC20Allowance = (spender: string) => {
  const { address } = useAccount();

  const daiContract = useUnderlyingTokenContract();
  const [allowance, setAllowance] = useState(ethers.BigNumber.from(0));
  const [loading, setLoading] = useState(false);

  const getAllowance = useCallback(async () => {
    if (address) {
      try {
        setLoading(true);
        setAllowance(await daiContract["allowance"](address, spender));
      } catch (error) {
        console.error("useERC20Allowance: ", error);
        setAllowance(ethers.BigNumber.from(0));
      } finally {
        setLoading(false);
      }
    }
  }, [address, daiContract]);

  useEffect(() => {
    getAllowance();
  }, [address, daiContract]);

  return { allowance, loading, getAllowance };
};

export const useERC20Approve = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const contract = useUnderlyingTokenContract();

  const approve = useCallback(
    async (spender: string, isZero?: boolean) => {
      if (!address && !signer) {
        return {
          severity: NotifyType.ERROR,
          message: "",
          data: "",
        };
      }
      try {
        const tx = await contract["approve"](
          spender,
          isZero ? "0" : ethers.utils.parseEther(Number.MAX_SAFE_INTEGER.toString())
        );
        await tx.wait();
        return {
          severity: NotifyType.DEFAULT,
          message: NotifyMessage.ApproveSuccess,
          data: tx.hash as string,
        };
      } catch (error) {
        console.error("useERC20Approve: ", error);
        return {
          severity: NotifyType.ERROR,
          message: getMetamaskErrorMessage(error),
          data: "",
        };
      }
    },
    [contract]
  );

  return approve;
};
