import ConnectWallet from "./connect-wallet";
import NotificationMenu from "./notification-menu";
import { NetworkStatus } from "../../core/types/basic.types";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export const UserMenu = (): JSX.Element => {
  const networkStatus = useNetworkStatus();

  return (
    <div
      className={`h-[60px] flex items-center gap-[6px] md:gap-[12px] px-[3px]
        ${
          networkStatus === NetworkStatus.Success &&
          " xs:border-0 xl:border-2 border-bunker rounded-[22px]"
        }
      `}
    >
      {networkStatus === NetworkStatus.Success && <NotificationMenu />}
      <ConnectWallet />
    </div>
  );
};

export default UserMenu;
