import { BigNumber, Contract, Signer, ethers } from "ethers";
import { chains, isDev } from "@fantohm/shared-web3";

import marketABI from "../core/abi/BinaryMarket.json";
import marketManagerABI from "../core/abi/BinaryMarketManager.json";
import vaultABI from "../core/abi/BinaryVault.json";
import vaultManagerABI from "../core/abi/BinaryVaultManager.json";
import MockERC20ABI from "../core/abi/MockERC20.json";
import ERC20ABI from "../core/abi/ERC20.json";
import Weth from "../core/abi/Weth.json";
import configABI from "../core/abi/BinaryConfig.json";
import oracleABI from "../core/abi/Oracle.json";
import MulticallABI from "../core/abi/Multicall.json";
import oracleManagerABI from "../core/abi/OracleManager.json";
import BinaryReferralABI from "../core/abi/BinaryReferral.json";
import ryzeCreditABI from "../core/abi/RyzeCredit.json";
import ryzeCreditMinterABI from "../core/abi/RyzeCreditMinter.json";

import { MULTICALL2_ADDRESS, loadEnvVariable } from "../core/constants/network";
import BinaryMarketABI from "../core/abi/BinaryMarket.json";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { NotifyMessage, NotifyType } from "../core/constants/notification";
import { Underlying_Token } from "../core/constants/basic";
import { getMetamaskErrorMessage } from "./data-translations";
import { Multicall } from "ethereum-multicall";
import { createC } from "./encrypt-decrypt";
import { ECDSAProvider } from "@zerodev/sdk";
import { currentNetworkChain } from "../context/NetworkContext";

export const readOnlyProvider = (): Provider => {
  return new StaticJsonRpcProvider(chains[currentNetworkChain.id].rpcUrls[0]);
};

export const multicall = () =>
  new Multicall({
    ethersProvider: readOnlyProvider() as any,
    tryAggregate: true,
    multicallCustomContractAddress: MULTICALL2_ADDRESS(),
  });

export const getContract = ({
  abi,
  address,
  signer,
}: {
  abi: ethers.ContractInterface;
  address: string;
  signer?: ethers.providers.Provider | ethers.Signer | undefined;
}) => {
  if (!signer) {
    signer = readOnlyProvider();
  }
  return new Contract(address, abi, signer);
};

export const getVaultContract = (
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  const address = loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`);
  return getContract({ abi: vaultABI, address, signer });
};

export const getVaultManagerContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({
    abi: vaultManagerABI as ethers.ContractInterface,
    address,
    signer,
  });
};

export const getMarketContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: marketABI, address, signer });
};

export const getMarketManagerContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: marketManagerABI, address, signer });
};

export const getUnderlyingTokenContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: isDev ? ERC20ABI : MockERC20ABI, address, signer });
};

export const getReferralContract = (
  signer?: ethers.providers.Provider | ethers.Signer
) => {
  return getContract({
    abi: BinaryReferralABI,
    address: loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_DISTRIBUTOR_ADDRESS`),
    signer,
  });
};

export const getERC20Contract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: ERC20ABI, address, signer });
};

export const getWethContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: Weth, address, signer });
};

export const getConfigContract = (
  address: string,
  signer?: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: configABI, address, signer });
};

export const getOracleContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: oracleABI, address, signer });
};

export const getOracleManagerContract = (
  address: string,
  signer: ethers.providers.Provider | ethers.Signer | undefined
) => {
  return getContract({ abi: oracleManagerABI, address, signer });
};

export const getMulticallContract = (
  address: string,
  signer?: ethers.providers.Provider | ethers.Signer
) => {
  return getContract({ abi: MulticallABI, address, signer });
};

export const getLedger = async (
  address: string,
  marketAddress: string,
  timeframeId: number,
  epoch: number
): Promise<{
  amount: string;
  position: number;
  claimed: boolean;
  isReverted: boolean;
}> => {
  try {
    const contract = new ethers.Contract(
      marketAddress,
      BinaryMarketABI,
      readOnlyProvider()
    );
    const res = await contract["ledger"](timeframeId, epoch, address);
    return {
      amount: res.amount.toString(),
      position: res.position,
      claimed: res.claimed,
      isReverted: res.isReverted,
    };
  } catch (error) {
    console.error("[getLedger] ", error);
    return {
      amount: "0",
      position: 0,
      claimed: false,
      isReverted: false,
    };
  }
};

export const getRound = async (
  marketAddress: string,
  timeframeId: number,
  epoch: number
): Promise<{ lockPrice: number; closePrice: number }> => {
  try {
    const contract = new ethers.Contract(
      marketAddress,
      BinaryMarketABI,
      readOnlyProvider()
    );
    const res = await contract["rounds"](timeframeId, epoch);
    return {
      lockPrice: parseInt(res.lockPrice) / Math.pow(10, 8),
      closePrice: parseInt(res.closePrice) / Math.pow(10, 8),
    };
  } catch (error) {
    console.error("[getRound] ", error);
    return {
      lockPrice: 0,
      closePrice: 0,
    };
  }
};

export const getRoundsMulticall = async (
  marketAddress: string,
  timeframeIds: number[],
  epochs: number[]
): Promise<{ lockPrice: number; closePrice: number }[]> => {
  try {
    const callData = [] as any;
    const context = {
      reference: "BinaryMarket",
      contractAddress: marketAddress,
      abi: BinaryMarketABI,
      calls: [],
    };
    epochs.map((epoch, index) =>
      callData.push({
        reference: "Round",
        methodName: "rounds",
        methodParameters: [timeframeIds[index], epoch],
      })
    );
    context.calls = callData;

    const res = await multicall().call(context);

    return res.results["BinaryMarket"].callsReturnContext.map((r) => ({
      lockPrice: BigNumber.from(r.returnValues[4].hex).toNumber() / Math.pow(10, 8),
      closePrice: BigNumber.from(r.returnValues[5].hex).toNumber() / Math.pow(10, 8),
    }));
  } catch (error) {
    console.error("getRoundsMulticall: ", error);
    return [];
  }
};

export const betToRound = async (
  walletAddress: string,
  marketAddress: string,
  timeframeId: number,
  roundId: number,
  tokenAmount: BigNumber,
  direction: number,
  creditSelected: { img: string; name: string },
  provider: ethers.providers.JsonRpcSigner | ethers.Signer | ECDSAProvider,
  feeWallet?: string,
  feeBps?: number
) => {
  const tokenAddress = Underlying_Token[currentNetworkChain.id].address;
  const vaultAddress = loadEnvVariable(
    `NX_BINARY_${currentNetworkChain.id}_VAULT_ADDRESS`
  );

  let signer: ethers.providers.Provider | ethers.Signer;

  if (provider instanceof ECDSAProvider) {
    signer = readOnlyProvider();
  } else {
    signer = provider;
  }

  try {
    const marketContract = new ethers.Contract(marketAddress, marketABI, signer);
    if (creditSelected.name === "CREDITS") {
      const uTokenContract = new ethers.Contract(
        loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_CREDIT_TOKEN_ADDRESS`),
        ryzeCreditABI,
        signer
      );
      const isApproved = await uTokenContract["isApprovedForAll"](
        walletAddress,
        vaultAddress
      );
      if (!isApproved) {
        if (provider instanceof Signer) {
          const tokenTx = await uTokenContract["setApprovalForAll"](vaultAddress, true);
          await tokenTx.wait();
        } else {
          const uoHash = await provider.sendUserOperation({
            target: loadEnvVariable(
              `NX_BINARY_${currentNetworkChain.id}_CREDIT_TOKEN_ADDRESS`
            ) as `0x${string}`,
            data: new ethers.utils.Interface(ryzeCreditABI).encodeFunctionData(
              "setApprovalForAll",
              [vaultAddress, true]
            ) as `0x${string}`,
          });

          await provider.waitForUserOperationTransaction(uoHash.hash as `0x${string}`);
        }
      }
    } else {
      const uTokenContract = new ethers.Contract(tokenAddress, MockERC20ABI, signer);
      const allowance: BigNumber = await uTokenContract["allowance"](
        walletAddress,
        vaultAddress
      );

      if (allowance.lt(tokenAmount)) {
        if (provider instanceof Signer) {
          const tokenTx = await uTokenContract["approve"](
            vaultAddress,
            ethers.utils.parseEther(Number.MAX_SAFE_INTEGER.toString())
          );
          await tokenTx.wait();
        } else {
          const uoHash = await provider.sendUserOperation({
            target: tokenAddress as `0x${string}`,
            data: new ethers.utils.Interface(MockERC20ABI).encodeFunctionData("approve", [
              vaultAddress,
              ethers.utils.parseEther(Number.MAX_SAFE_INTEGER.toString()),
            ]) as `0x${string}`,
          });

          await provider.waitForUserOperationTransaction(uoHash.hash as `0x${string}`);
        }
      }
    }

    const isBettable = await marketContract["isBettable"](timeframeId, roundId);
    const ledger = await marketContract["ledger"](timeframeId, roundId, walletAddress);
    const c = createC();
    if (isBettable && ledger.amount.isZero()) {
      const params = {
        amount: tokenAmount,
        timeframeId: timeframeId,
        epoch: roundId,
        position: direction,
        creditUsed: creditSelected.name === "CREDITS",
        feeWallet: feeWallet || ethers.constants.AddressZero,
        feeBps: feeBps || 0,
        challenge: c,
      };

      let marketHash;
      if (provider instanceof Signer) {
        const gas = await marketContract["estimateGas"]["openPosition"](params);
        const marketTx = await marketContract["openPosition"](params, {
          gasLimit: gas.mul(2),
        });
        await marketTx.wait();
        marketHash = marketTx.hash;
      } else {
        const uoHash = await provider.sendUserOperation({
          target: marketAddress as `0x${string}`,
          data: new ethers.utils.Interface(marketABI).encodeFunctionData("openPosition", [
            params,
          ]) as `0x${string}`,
        });

        marketHash = await provider.waitForUserOperationTransaction(
          uoHash.hash as `0x${string}`
        );
      }

      return {
        severity: NotifyType.DEFAULT,
        message: NotifyMessage.BetSucceed,
        data: marketHash,
      };
    }
  } catch (error) {
    console.error("betToRound: ", error);
    const errorMessage = getMetamaskErrorMessage(error as any);
    return {
      message:
        errorMessage === NotifyMessage.DefaultError
          ? NotifyMessage.BetNotSuccess
          : errorMessage,
      severity: NotifyType.ERROR,
      data: "",
    };
  }
  return {
    message: NotifyMessage.NotBettable,
    severity: NotifyType.ERROR,
  };
};

export const getEthBalance = async (address: string): Promise<number> => {
  try {
    const provider = readOnlyProvider();
    const balance = await provider.getBalance(address);
    return parseFloat(ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("[getEthBalance] ", error);
    return 0;
  }
};

export const getVaultSharesOfToken = async (tokenId: number) => {
  try {
    const contract = getVaultContract(undefined);
    const res = await contract["getSharesOfToken"](tokenId);
    return res;
  } catch (error) {
    console.error("getVaultSharesOfToken", error);
  }
};

export const getRyzeCreditContract = () => {
  return getContract({
    abi: ryzeCreditABI,
    address: loadEnvVariable(`NX_BINARY_${currentNetworkChain.id}_CREDIT_TOKEN_ADDRESS`),
  });
};

export const getRyzeCreditMinterContract = (
  signer: ethers.providers.JsonRpcSigner | ethers.Signer
) => {
  return getContract({
    signer,
    abi: ryzeCreditMinterABI,
    address: loadEnvVariable(
      `NX_BINARY_${currentNetworkChain.id}_CREDIT_TOKEN_MINTER_ADDRESS`
    ),
  });
};
