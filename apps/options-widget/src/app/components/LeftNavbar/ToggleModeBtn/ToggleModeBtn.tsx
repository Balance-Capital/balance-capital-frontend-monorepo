import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { toggleDarkMode } from "../../../store/reducers/leftnavbarSlice";

function ToggleModeBtn() {
  const isDarkMode = useSelector((state: RootState) => state.leftnavbar.isDarkMode);
  const dispatch = useDispatch();
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        onChange={() => dispatch(toggleDarkMode())}
        type="checkbox"
        checked={isDarkMode}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-darkgreen-0/50 peer-focus:outline-none ring-2 ring-darkgreen-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[url('./assets/svgs/moon.svg')] after:absolute after:top-[2px] after:left-[2px] after:bg-darkgreen-1 after:rounded-full after:h-5 after:w-5 after:transition after:duration-200 after:flex after:items-center after:justify-center peer-checked:bg-darkgreen-0"></div>
    </label>
  );
}

export default ToggleModeBtn;
