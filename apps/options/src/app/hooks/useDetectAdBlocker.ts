import { useState, useEffect } from "react";
export default function useDetectAdBlocker() {
  const [isAdblocker, setAdblocker] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://js-agent.newrelic.com/nr-spa-1216.min.js", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (!(xhr.status === 200)) {
            setAdblocker(true);
          }
        }
      };
      xhr.onerror = function (error) {
        console.log("Catched blocked_by_client", error);
      };
      xhr.send();
    })();
  }, []);

  return isAdblocker;
}
