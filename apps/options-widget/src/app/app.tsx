// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LeftNavbar from "./components/LeftNavbar/LeftNavBar";
import Dashboard from "./components/Dashboard/Dashboard";
import "./app.module.scss";

export function App() {
  return (
    <div className="xs:bg-darkgreen-3 lg:bg-[#DFE8EA]">
      <div className="xs:hidden lg:flex h-screen w-screen">
        <LeftNavbar />
        <Dashboard />
      </div>
      <div className="xs:flex lg:hidden text-greenish-0 px-5 h-screen w-screen items-center justify-center">
        For the best experience, please access this application on a desktop, laptop, or
        PC. Kindly note that the app is not optimized for use on mobile or tablet devices.
      </div>
    </div>
  );
}

export default App;
