import { useState, useEffect } from "react";

export default function useInternetStatus() {
  const [isOnline, setIsOnline] = useState(true);

  const setTrue = () => setIsOnline(true);
  const setFalse = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener("online", setTrue);
    window.addEventListener("offline", setFalse);

    return () => {
      window.removeEventListener("online", setTrue);
      window.removeEventListener("offline", setFalse);
    };
  }, [isOnline]);

  return { isOnline };
}
