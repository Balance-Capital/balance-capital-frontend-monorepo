import IconButton from "@mui/material/IconButton";
import React, { useState } from "react";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";

const CopiedTextAlertTime = 2000;

interface Props {
  copyText: string;
  copiedAction?: () => void;
  children?: React.ReactNode;
}

const ClipboardButton = ({ copyText, copiedAction, children }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!copied) {
      navigator.clipboard.writeText(copyText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), CopiedTextAlertTime);
        if (copiedAction) {
          copiedAction();
        }
      });
    }
  };

  return (
    <IconButton
      size="small"
      onClick={(e) => {
        handleCopy();
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {children}
      {copied ? (
        <CheckBoxRoundedIcon className="text-white !text-[16px]" />
      ) : (
        <ContentCopyRoundedIcon className="text-white !text-[16px]" />
      )}
    </IconButton>
  );
};

export default ClipboardButton;
