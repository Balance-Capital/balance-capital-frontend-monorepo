import React from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "../../../store/reducers/app-slice";
import { AppMode } from "../../../components/tvchart/api/types";

const MaintenanceMode = () => {
  const mode = useSelector(getAppMode);

  return mode !== AppMode.Success ? (
    <div className="h-40 text-14 lg:text-16 flex justify-center items-center bg-amber-600 text-whiteTxtColor transition-all">
      {mode === AppMode.MaintenanceMode
        ? "Maintenance Mode"
        : mode === AppMode.OfflineMode
        ? "You are offline. Please check your network."
        : ""}
    </div>
  ) : null;
};

export default MaintenanceMode;
