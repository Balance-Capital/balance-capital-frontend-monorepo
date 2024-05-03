import ConnectWallet from "../../components/navbar/connect-wallet";
import { useAccount } from "../../hooks/useAccount";
import { useDisconnect, useAccount as useEOAAccount, useSigner } from "wagmi";
import useWeb3CustomModal from "../../hooks/useWeb3CustomModal";
import { BigNumber, Signer, ethers } from "ethers";
import useWallet from "../../hooks/useWallet";
import { useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Underlying_Token } from "../../core/constants/basic";
import { Address, zeroAddress } from "viem";
import CreditsDropDown from "../../components/dropdown/credits-dropdown";
import {
  convertNumbertoShortenForm,
  formatUtoken,
} from "../../helpers/data-translations";

import { useERC20TokenBalanceOf } from "../../hooks/useERC20Contract";
import { addressEllipsis } from "@fantohm/shared-helpers";
import { useMediaQuery } from "@mui/material";
import { useNetworkContext } from "../../context/NetworkContext";

export default function Topup() {
  const { currentNetworkChainId } = useNetworkContext();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { address, signer, isConnected } = useAccount();
  const { address: eoaAddress, isConnected: isEOAConnected } = useEOAAccount();
  const openConnectModal = useWeb3CustomModal();
  const { disconnect: disconnectEOA } = useDisconnect();
  const { depositToSCAFromEOA } = useWallet();
  const [depositAmount, setDepositAmount] = useState<string>("");
  const { balanceInWei: uTokenBalance } = useERC20TokenBalanceOf(eoaAddress);

  const onDeposit = async () => {
    const res = await depositToSCAFromEOA(ethers.utils.parseUnits(depositAmount, 6));
    enqueueSnackbar(res.message, { variant: res.severity });
  };

  return (
    <div className="mt-[-30px] px-[10px]">
      <div className="flex justify-center pb-[10px] sm:pb-[20px] text-grayTxtColor text-18 sm:text-16 text-center">
        Deposit {Underlying_Token[currentNetworkChainId].symbol} directly from your crypto
        wallet
      </div>
      <div className="label flex flex-col sm:flex-row items-center sm:justify-between pb-[10px] sm:pb-[20px] sm:pt-[20px] pt-[10px]">
        <span className="">Amount to deposit</span>
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
            onClick={(e) => setDepositAmount(String(uTokenBalance))}
          >
            MAX
          </span>
        </span>
      </div>
      <div className="bg-btnBlackStrokeColor w-full border-btnBlackStrokeColor border-2 py-13 sm:p-15 rounded-3xl flex flex-row items-center">
        <div className="w-0 grow">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={!address || !eoaAddress}
            className="w-full text-btnBlackTxtColor disabled:text-grayTxtColor text-24 xl:text-22 2xl:text-26 grow outline-none bg-transparent px-20"
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
      <div className="from-layout mt-[20px] w-full flex flex-col border-2 border-solid border-btnBlackStrokeColor relative rounded-[20px] py-[13px] sm:py-[25px] px-[16px]">
        <p className="absolute top-[-14px] left-[20px] text-grayTxtColor bg-pageBgColor">
          From your wallet
        </p>
        {!isEOAConnected && (
          <button
            onClick={openConnectModal}
            className="bg-[#12b2a7] w-full h-[44px] rounded-3xl"
          >
            Connect Metamask
          </button>
        )}
        {isEOAConnected && (
          <>
            <p>{isMobile && addressEllipsis(address || "")}</p>
            <p>{!isMobile && (address || "")}</p>
          </>
        )}
      </div>
      <div className="to-layout mt-[20px] w-full flex flex-col border-2 border-solid border-btnBlackStrokeColor relative rounded-[20px] py-[13px] sm:py-[25px] px-[16px]">
        <p className="absolute top-[-14px] left-[20px] text-grayTxtColor bg-pageBgColor">
          To your smart contract wallet
        </p>
        {!isConnected && <ConnectWallet />}
        {isConnected && (
          <>
            <p>{isMobile && addressEllipsis(address || "")}</p>
            <p>{!isMobile && (address || "")}</p>
          </>
        )}
      </div>
      {isEOAConnected && !!depositAmount && (
        <button
          className="bg-[#12b2a7] w-full rounded-3xl mt-[20px] py-[13px] sm:py-[25px]"
          onClick={() => onDeposit()}
        >
          Deposit
        </button>
      )}
      {isEOAConnected && !depositAmount && (
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
