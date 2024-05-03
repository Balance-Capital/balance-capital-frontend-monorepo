import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";

function useWeb3CustomModal() {
  const { open: openWeb3Modal, isOpen } = useWeb3Modal();
  const [active, setActive] = useState(false);

  const fetchHeader = () => {
    const w3mConnectWalletView = document
      .querySelector("w3m-modal")
      ?.shadowRoot?.querySelector(".w3m-container")
      ?.querySelector("w3m-modal-router")
      ?.shadowRoot?.querySelector("w3m-connect-wallet-view")?.shadowRoot;

    const androidHeader = w3mConnectWalletView
      ?.querySelector("w3m-android-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-header")?.shadowRoot;
    const androidContent = w3mConnectWalletView
      ?.querySelector("w3m-android-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-content");
    const androidFooter = w3mConnectWalletView
      ?.querySelector("w3m-android-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-footer");

    const desktopHeader = w3mConnectWalletView
      ?.querySelector("w3m-desktop-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-header")?.shadowRoot;
    const desktopContent = w3mConnectWalletView
      ?.querySelector("w3m-desktop-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-content");
    const desktopFooter = w3mConnectWalletView
      ?.querySelector("w3m-desktop-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-footer");

    const mobileHeader = w3mConnectWalletView
      ?.querySelector("w3m-mobile-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-header")?.shadowRoot;
    const mobileContent = w3mConnectWalletView
      ?.querySelector("w3m-mobile-wallet-selection")
      ?.shadowRoot?.querySelector("w3m-modal-content");

    return {
      androidHeader,
      androidContent,
      androidFooter,
      desktopHeader,
      desktopContent,
      desktopFooter,
      mobileHeader,
      mobileContent,
    };
  };

  const toggleComps = () => {
    const {
      androidContent,
      androidFooter,
      desktopContent,
      desktopFooter,
      mobileContent,
    } = fetchHeader();
    if (active) {
      if (desktopContent) desktopContent.style.display = "block";
      if (desktopFooter) desktopFooter.style.display = "block";
      if (androidContent) androidContent.style.display = "block";
      if (androidFooter) androidFooter.style.display = "block";
      if (mobileContent) mobileContent.style.display = "block";
    } else {
      if (desktopContent) desktopContent.style.display = "none";
      if (desktopFooter) desktopFooter.style.display = "none";
      if (androidContent) androidContent.style.display = "none";
      if (androidFooter) androidFooter.style.display = "none";
      if (mobileContent) mobileContent.style.display = "none";
    }
  };

  useEffect(() => {
    toggleComps();
  }, [active]);

  const handleCheck = () => {
    setActive((prev) => !prev);
  };

  const injectTermAndPolicy = () => {
    const { androidHeader, desktopHeader, mobileHeader } = fetchHeader();
    let selectActive;
    if (androidHeader) {
      selectActive = androidHeader;
    } else if (desktopHeader) {
      selectActive = desktopHeader;
    } else {
      selectActive = mobileHeader;
    }
    if (selectActive && !selectActive.querySelector(".custom-Header")) {
      const divElement = document.createElement("div");
      divElement.classList.add("custom-Header");
      divElement.style.paddingLeft = "13px";
      divElement.style.paddingRight = "13px";
      if (desktopHeader) {
        divElement.style.paddingBottom = "25px";
      } else {
        divElement.style.paddingBottom = "13px";
      }
      divElement.style.textAlign = "center";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "termsCheckbox";
      checkbox.style.appearance = "auto";
      checkbox.style.marginRight = "10px";
      checkbox.style.cursor = "pointer";
      checkbox.checked = active;
      toggleComps();
      checkbox.addEventListener("change", handleCheck);

      const label = document.createElement("label");
      label.htmlFor = "termsCheckbox";

      const labelText = document.createElement("span");
      labelText.textContent = "Accept ";

      const termsLink = document.createElement("a");
      termsLink.href = "https://ryze.fi/legal";
      termsLink.target = "_blank";
      termsLink.textContent = "Terms of Service";
      termsLink.style.color = "#12b3a8";

      const separator = document.createTextNode(" and ");

      const privacyLink = document.createElement("a");
      privacyLink.href = "https://ryze.fi/legal";
      privacyLink.target = "_blank";
      privacyLink.textContent = "Privacy Policy";
      privacyLink.style.color = "#12b3a8";

      labelText.appendChild(termsLink);
      labelText.appendChild(separator);
      labelText.appendChild(privacyLink);

      label.appendChild(labelText);

      divElement.appendChild(checkbox);
      divElement.appendChild(label);
      selectActive.appendChild(divElement);
    }
  };

  useEffect(() => {
    let id = {} as NodeJS.Timeout;
    if (isOpen) {
      id = setInterval(() => {
        injectTermAndPolicy();
      }, 500);
    }
    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [isOpen, active]);

  const openConnectModal = () => {
    openWeb3Modal();
  };
  return openConnectModal;
}

export default useWeb3CustomModal;
