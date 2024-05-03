import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAccount } from "../../hooks/useAccount";

export default function WalletHint() {
  const { address } = useAccount();

  return !address ? (
    <a
      href="https://www.ryze.fi/docs/how-to-connect-wallet-on-mobile"
      target="_blank"
      className="fixed md:hidden left-1/2 -translate-x-1/2 bottom-70 bg-heavybunker border-3 w-[220px] border-light-woodsmoke rounded-[20px] z-[88] gap-5 px-[10px] py-[10px] items-center"
      rel="noreferrer"
    >
      <div className="flex items-center gap-10">
        <div className="flex justify-center items-center w-[30px] h-[30px] bg-light-woodsmoke rounded-full">
          <InfoOutlinedIcon className="text-textWhite" />
        </div>
        <span className="text-textWhite text-[14px]">How to connect wallet</span>
      </div>
    </a>
  ) : (
    <></>
  );
}
