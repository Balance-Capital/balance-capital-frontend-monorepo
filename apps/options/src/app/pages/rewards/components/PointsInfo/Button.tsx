import { ReactNode } from "react";

interface IProps {
  handleClick: () => void;
  className: string;
  children?: ReactNode;
}

function Button({ className, handleClick, children }: IProps) {
  return (
    <button
      className={`${className} text-buttontext rounded-2xl py-15 px-50 text-20`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export default Button;
