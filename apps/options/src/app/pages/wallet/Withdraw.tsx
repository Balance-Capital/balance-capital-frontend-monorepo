import { Address, zeroAddress } from "viem";
import useWallet from "../../hooks/useWallet";
import { BigNumber, ethers } from "ethers";
import { enqueueSnackbar } from "notistack";
import { useAccount } from "../../hooks/useAccount";
import { useDisconnect, useAccount as useEOAAccount, useSigner } from "wagmi";
import { useState } from "react";
import { convertNumbertoShortenForm } from "../../helpers/data-translations";
import { useERC20TokenBalanceOf } from "../../hooks/useERC20Contract";
import { Underlying_Token } from "../../core/constants/basic";
import { useMediaQuery } from "@mui/material";
import useWeb3CustomModal from "../../hooks/useWeb3CustomModal";
import { addressEllipsis } from "@fantohm/shared-helpers";
import { useNetworkContext } from "../../context/NetworkContext";

export default function Withdraw() {
  const { currentNetworkChainId } = useNetworkContext();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { transferAssetsFromSCA } = useWallet();
  const { address, signer, isConnected } = useAccount();
  const { address: eoaAddress, isConnected: isEOAConnected } = useEOAAccount();
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const { balanceInWei: uTokenBalance } = useERC20TokenBalanceOf(address);
  const [receipent, setReceipent] = useState<Address>("0x");
  const openConnectModal = useWeb3CustomModal();
  const onTransfer = async () => {
    // const res = await transferAssetsFromSCA(Underlying_Token.address[desiredNetworkId] as `0x${string}`, ethers.utils.parseUnits("10", 6), eoaAddress as Address);
    const res = await transferAssetsFromSCA(
      receipent,
      ethers.utils.parseUnits(withdrawAmount.toString(), 6),
      eoaAddress as Address
    );
    enqueueSnackbar(res.message, { variant: res.severity });
  };
  return (
    <div className="mt-[-30px] px-[10px]">
      <div className="flex justify-center pb-[10px] sm:pb-[20px] text-grayTxtColor text-18 sm:text-16 text-center">
        Withdraw {Underlying_Token[currentNetworkChainId].symbol} from your smart contract
        wallet
      </div>
      <div className="label flex flex-col sm:flex-row items-center sm:justify-between pb-[10px] sm:pb-[20px] sm:pt-[20px] pt-[10px]">
        <span className="">Amount to withdraw</span>
        <span className="text-grayTxtColor">
          Wallet:{" "}
          <span className="text-white">
            {convertNumbertoShortenForm(
              ethers.utils.formatUnits(Number(uTokenBalance || 0), 6)
            )}{" "}
            {Underlying_Token[currentNetworkChainId].symbol}{" "}
          </span>
          <span
            className="text-[#12b2a7] cursor-pointer"
            onClick={(e) => setWithdrawAmount(String(uTokenBalance))}
          >
            MAX
          </span>
        </span>
      </div>
      <div className="bg-btnBlackStrokeColor w-full border-btnBlackStrokeColor border-2 py-13 sm:p-15 rounded-3xl flex flex-row items-center">
        <div className="w-0 grow">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={!address}
            className="px-15 w-full text-btnBlackTxtColor disabled:text-grayTxtColor text-24 xl:text-22 2xl:text-26 grow outline-none bg-transparent"
            placeholder="0.00"
          />
        </div>
        <div className="bg-btnBlackBgColor rounded-[20px] px-[11px] py-[9px] flex items-center gap-15 border-2 border-solid border-btnBlackStrokeColor">
          <div className="flex items-center gap-[7px]">
            <img
              src={`./assets/images/${Underlying_Token[currentNetworkChainId].symbol}.png`}
              alt={`${Underlying_Token[currentNetworkChainId].name} logo`}
              className="w-[24px] h-[24px]"
            />
            <span className="font-InterMedium text-18 text-btnBlackTxtColor w-[fit-content]">
              {Underlying_Token[currentNetworkChainId].symbol}
            </span>
          </div>
        </div>
      </div>
      <></>
      {/* <p className="absolute top-[-14px] left-[20px] text-grayTxtColor bg-pageBgColor">From your wallet</p> */}
      <input
        type="text"
        value={receipent}
        onChange={(e) => setReceipent(e.target.value as `0x${string}`)}
        disabled={!address}
        className="bg-btnBlackBgColor from-layout mt-[20px] w-full flex flex-col border-2 border-solid border-btnBlackStrokeColor relative rounded-[20px] py-[13px] sm:py-[25px] px-[16px]"
      />
      {isConnected && !!withdrawAmount && !!receipent ? (
        <button
          className="bg-[#12b2a7] w-full rounded-3xl mt-[20px] py-[13px] sm:py-[25px]"
          onClick={() => onTransfer()}
        >
          Withdraw
        </button>
      ) : (
        <button
          className="bg-btnBlackStrokeColor w-full rounded-3xl mt-[20px] py-[13px] sm:py-[25px]"
          disabled
        >
          Enter an amount
        </button>
      )}
    </div>
  );
}
