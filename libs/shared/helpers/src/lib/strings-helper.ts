export const addressEllipsis = (address: string, length = 4): string => {
  if (!address) return "";
  if (!address.startsWith("0x")) {
    address = "0x" + address;
  }

  if (address.length <= length * 2 + 2) return address;

  return `${address.slice(0, length + 2)}...${address.slice(address.length - length)}`;
};

export const convertToLocaleString = (
  str: string
): { strValue: string; numValue: number } => {
  const extractDigitWithDot = str
    .replace(/[^.\d]/g, "")
    .replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2");
  if (
    extractDigitWithDot.indexOf(".") > 0 &&
    extractDigitWithDot.indexOf(".") === extractDigitWithDot.length - 1
  ) {
    return {
      strValue: Number(extractDigitWithDot).toLocaleString("en-US") + ".",
      numValue: Number(extractDigitWithDot),
    };
  }
  const decimal = Number(Number(extractDigitWithDot).toFixed(2));
  return {
    strValue: decimal.toLocaleString("en-US"),
    numValue: decimal,
  };
};
