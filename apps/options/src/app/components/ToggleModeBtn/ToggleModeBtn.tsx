import { useTheme } from "../../context/ThemeProvider";

function ToggleModeBtn() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <div className="fixed bottom-20 right-20">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          onChange={toggleDarkMode}
          type="checkbox"
          checked={isDarkMode}
          className="sr-only peer"
        />
        <div className="w-80 h-40 bg-pageBgColor/50 peer-focus:outline-none ring-2 ring-pageBgColor rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[url('./assets/icons/moon.svg')] after:absolute after:top-[2px] after:left-[2px] after:bg-pagering-pageBgColor after:rounded-full after:h-40 after:w-40 after:transition after:duration-200 after:flex after:items-center after:justify-center peer-checked:bg-pageBgColor"></div>
      </label>
    </div>
  );
}

export default ToggleModeBtn;
