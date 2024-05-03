import { BigNumber, ethers } from "ethers";
import { getERC20Contract, getWethContract } from "../helpers/contractHelpers";

export const erc20Decimals = async (tokenAddress: string) => {
  const contract = getERC20Contract(tokenAddress, undefined);
  const decimals = await contract["decimals"]();
  return decimals as number;
};

export const erc20BalanceOf = async (tokenAddress: string, userAddress: string) => {
  const contract = getERC20Contract(tokenAddress, undefined);
  const balance = await contract["balanceOf"](userAddress);
  return balance as ethers.BigNumber;
};

export const erc20Mint = async (
  tokenAddress: string,
  mintAmount: string,
  signer: ethers.providers.JsonRpcSigner | ethers.Signer
) => {
  const contract = getERC20Contract(tokenAddress, signer);
  const tx = await contract["mint"](mintAmount);
  await tx.wait();
  return tx as ethers.BigNumber;
};

export const wethDeposit = async (
  tokenAddress: string,
  amt: string,
  signer: ethers.providers.JsonRpcSigner | ethers.Signer
) => {
  const contract = getWethContract(tokenAddress, signer);
  const tx = await contract["deposit"]({ value: amt });
  await tx.wait();
  return tx as ethers.BigNumber;
};

export const wethWithdraw = async (
  tokenAddress: string,
  amt: string,
  signer: ethers.providers.JsonRpcSigner | ethers.Signer
) => {
  const contract = getWethContract(tokenAddress, signer);
  const tx = await contract["withdraw"](amt);
  await tx.wait();
  return tx as ethers.BigNumber;
};
