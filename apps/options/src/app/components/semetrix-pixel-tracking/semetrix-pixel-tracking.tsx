import React, { memo } from "react";
import { useAccount } from "../../hooks/useAccount";

export const injectSemetrixPixelImg = (address: string) => {
  const imgElement = document.querySelector(
    `img[src="https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10201355&ec=trade&wid=${address}"]`
  );
  if (imgElement) {
    document.body.removeChild(imgElement);
  }
  const img = document.createElement("img");
  img.setAttribute(
    "src",
    `https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10201355&ec=trade&wid=${address}`
  );
  document.body.appendChild(img);
};

function SemetrixPixelTracking() {
  const { address } = useAccount();
  return address ? (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{ opacity: 0, position: "absolute" }}
      src={`https://sp.analytics.yahoo.com/spp.pl?a=10000&.yp=10201355&ec=connect&wid=${address}`}
    />
  ) : null;
}

export default memo(SemetrixPixelTracking);
