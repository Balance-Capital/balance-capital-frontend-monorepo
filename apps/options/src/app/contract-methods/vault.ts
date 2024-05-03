import { getVaultContract } from "../helpers/contractHelpers";

// Read Methods

export const vaultBalanceOf = async (userAddress: string) => {
  const contract = getVaultContract(undefined);
  const balance = await contract["balanceOf"](userAddress);
  return parseInt(balance + "");
};

export const vaultTokenUri = async (tokenId: number) => {
  const contract = getVaultContract(undefined);
  const uri: string = await contract["tokenURI"](tokenId);
  return uri;
};
