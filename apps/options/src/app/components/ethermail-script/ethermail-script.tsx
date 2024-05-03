import { useEffect } from "react";

const EthermailScript = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.ethermail.io/sdk/ethermail.js";

    script.setAttribute("a", "649aebd41f957c2bdc84241a");
    script.setAttribute("b", "ryze");
    script.setAttribute("c", "ca143dd21c648bb6f8fe27807a4b7755");
    script.setAttribute(
      "d",
      JSON.stringify({
        http:
          process.env["NX_BINARY_CHAIN_MODE"] === "testnet"
            ? "https://arbitrum-goerli.publicnode.com"
            : "https://arb1.arbitrum.io/rpc",
      })
    );
    script.setAttribute("e", "subscribe");

    script.onload = () => {
      console.log("%c Ethermail script loaded successfully", "color:green");
    };

    script.onerror = () => {
      console.error("%c Error loading Ethermail script", "color:red");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return <></>;
};

export default EthermailScript;
