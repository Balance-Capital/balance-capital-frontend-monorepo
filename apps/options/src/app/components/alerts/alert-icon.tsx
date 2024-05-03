import React from "react";

interface Props {
  variant: string;
}

const AlertIcon = ({ variant }: Props) => {
  return (
    <img
      src={`./assets/images/${variant}-icon.svg`}
      alt={variant}
      className="w-25 h-25 mr-10"
    />
  );
};

export default AlertIcon;
