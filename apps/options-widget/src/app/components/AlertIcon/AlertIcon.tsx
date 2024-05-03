import React from "react";

interface Props {
  variant: string;
}

const AlertIcon = ({ variant }: Props) => {
  return (
    <img
      src={`./assets/svgs/${variant}-icon.svg`}
      alt={variant}
      className="w-5 h-5 mr-3"
    />
  );
};

export default AlertIcon;
