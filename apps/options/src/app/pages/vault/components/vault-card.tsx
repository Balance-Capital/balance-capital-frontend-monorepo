import React from "react";
import { CryptoCurrency } from "../../../core/types/basic.types";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import { useNavigate } from "react-router-dom";
import { useERC20TokenBalanceOf } from "../../../hooks/useERC20Contract";
import { loadEnvVariable } from "../../../core/constants/network";
import Skeleton from "../../../components/skeleton/skeleton";
import { numberWithCommas } from "../../../helpers/data-translations";
import { useNetworkContext } from "../../../context/NetworkContext";

type Props = {
  currency: CryptoCurrency;
};

const VaultCard = ({ currency }: Props) => {
  const { currentNetworkChainId } = useNetworkContext();
  const navigate = useNavigate();
  const vaultAddress = loadEnvVariable(
    `NX_BINARY_${currentNetworkChainId}_VAULT_ADDRESS`
  );
  const { balance: vaultBalance } = useERC20TokenBalanceOf(vaultAddress);

  return (
    <div className="border-2 border-bunker bg-woodsmoke rounded-2xl p-25 flex flex-col gap-30">
      <div className="flex gap-20 items-center">
        <div className="relative border-[1px] border-success bg-success/40 w-35 h-35 flex items-center justify-center rounded-full">
          <NorthEastRoundedIcon className="text-24 text-success" />
          <img
            src={`./assets/images/${currency.symbol}.png`}
            alt={currency.symbol}
            className="w-[20px] h-[20px] rounded-full absolute -top-[8px] -right-[8px]"
          />
        </div>
        <div className="text-24 text-textWhite">{currency.symbol} Vault</div>
      </div>
      <div>
        <div className="text-second text-18">Vault APR</div>
        <div className="text-success text-22">30.00%</div>
      </div>

      <div>
        <div className="text-second text-18">Total value locked</div>
        <div className="text-success text-22 relative">
          {vaultBalance < 0 && (
            <div className="absolute w-full h-full left-0 top-0">
              <Skeleton />
            </div>
          )}
          ${numberWithCommas(vaultBalance)}
        </div>
      </div>

      <div>
        <div className="text-second text-18">Lock duration</div>
        <div className="text-textWhite text-22">24hrs</div>
      </div>

      <button
        className="rounded-2xl bg-success text-textWhite text-22 p-15"
        onClick={() => navigate(`/pool/${currency.symbol}`)}
      >
        View
      </button>
    </div>
  );
};

export default VaultCard;
