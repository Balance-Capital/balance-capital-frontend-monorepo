import { NetworkIds } from "@fantohm/shared-web3";
import { OPENLOGIN_NETWORK } from "@web3auth/openlogin-adapter";
export const gasManagerPolicyId =
  process.env.NX_ALCHEMY_GAS_MANAGER_POLICY_ID!;

export const ALCHEMY_RPC_URL = process.env.NX_ALCHEMY_RPC_URL as string;

export const CLIENT_ID = process.env.NX_WEB3AUTH_CLIENTID as string;
export const WEB3AUTH_NETWORK = process.env.NX_WEB3AUTH_NETWORK as string;

export const ZERODEV_PROJECT_ID = process.env.NX_ZERODEV_PROJECT_ID as string;


export const WEB3AUTH_SETTINGS: {
  [chainId: number]: {
    WEB3AUTH_CLIENT_ID: string,
    ZERODEV_PROJECT_ID: string
  }
} = {
  [NetworkIds.GoerliArbitrum]: {
    WEB3AUTH_CLIENT_ID: "BF1w_A3yLZB-wr6Vh5swIDKDeuzp2c06cXP5IADAgQf7ZK9CVYZeqZtFwFUbxq4QSBrtmgl8WDebg3KN2icYhLY",
    ZERODEV_PROJECT_ID: "8a40c777-8ff2-4431-89a3-13b45da11d5f",
  },
  [NetworkIds.Goerli]: {
    WEB3AUTH_CLIENT_ID: "BF1w_A3yLZB-wr6Vh5swIDKDeuzp2c06cXP5IADAgQf7ZK9CVYZeqZtFwFUbxq4QSBrtmgl8WDebg3KN2icYhLY",
    ZERODEV_PROJECT_ID: "a8e19a50-e9a6-4d8c-ad89-6d7a00b686bf",
  },
}