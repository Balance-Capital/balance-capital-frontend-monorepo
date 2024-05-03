import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { NavPaths } from "../helpers/analytics";

const usePageTitle = () => {
  const location = useLocation();
  const page = useMemo(() => NavPaths[location.pathname], [location]);

  return page;
};

export default usePageTitle;
