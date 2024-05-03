import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const routes = ["/trade-widget"];

function useHideCompsForRoutes() {
  const { pathname } = useLocation();
  const [isActive, setIsActive] = useState(() => true);

  useEffect(() => {
    routes.forEach((val) => {
      if (pathname.includes(val)) setIsActive(false);
    });
  }, []);

  return isActive;
}

export default useHideCompsForRoutes;
