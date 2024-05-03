import { Link } from "react-router-dom";
import OptionsLogo from "../../../assets/images/Options_logo.svg";
import OptionsLogoDark from "../../../assets/images/Options_logo_dark.svg";
import LogoMobile from "../../../assets/images/logo-mobile.svg";

export interface LogoProps {
  className?: string;
  dark?: boolean;
}

export function Logo({ className, dark }: LogoProps) {
  return (
    <Link to="/" className="inline-block">
      <img
        className={(className && `${className}`) + " hidden md:block"}
        src={dark ? OptionsLogoDark : OptionsLogo}
        alt="Options Logo"
      />
      <img
        className={(className && `${className}`) + " block md:hidden"}
        src={LogoMobile}
        alt="Options Logo"
      />
    </Link>
  );
}

export default Logo;
