import ToggleModeBtn from "./ToggleModeBtn/ToggleModeBtn";
import PoweredBy from "../PoweredBy/PoweredBy";
import NavItems from "./NavItems/NavItems";
import ExportModal from "../ExportModal/ExportModal";
import { useState } from "react";

function LeftNavbar() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="shrink-0 overflow-hidden w-[21rem] bg-primary rounded-tr-3xl rounded-br-3xl">
      <ExportModal open={open} setOpen={setOpen} />
      <div className="overflow-y-auto h-screen">
        <div className="flex flex-col h-screen gap-1">
          <div className="p-6">
            <div className="font-InterMedium text-xl text-greenish-0 flex items-center justify-between">
              <span>Settings</span>
              <ToggleModeBtn />
            </div>
            <h2 className="mt-6 text-lg text-grayish-0">General settings</h2>
          </div>
          <hr className="border-grayish-0/10 border-[2px]" />
          <NavItems />
          <div className="mt-auto bg-darkgreen-3 p-5 rounded-2xl">
            <button
              onClick={() => setOpen(true)}
              className="w-full font-InterMedium text-xl text-greenish-4 p-4 rounded-2xl bg-greenish-1 border-greenish-3 border-2"
            >
              Export code
            </button>
          </div>
          <PoweredBy />
        </div>
      </div>
    </div>
  );
}

export default LeftNavbar;
