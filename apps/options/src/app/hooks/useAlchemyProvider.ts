import { gasManagerPolicyId, ALCHEMY_RPC_URL } from "../core/constants/aa";
import {
  LightSmartContractAccount, getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  SmartAccountSigner,
} from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address } from "viem";
import { chain } from "../core/constants/network";

export const useAlchemyProvider = () => {
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      rpcUrl: ALCHEMY_RPC_URL,
      entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect((provider) => {
          return new LightSmartContractAccount({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            factoryAddress: getDefaultLightAccountFactoryAddress(chain),
            accountAddress: account,
          });
        })
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
        });

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return { provider, connectProviderToAccount, disconnectProviderFromAccount };
};
