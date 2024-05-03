import CircularProgress from "@mui/material/CircularProgress";

const PageSpinner = () => {
  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex items-center justify-center z-50 backdrop-blur-sm bg-[#0003]">
      <div className="w-250 h-[250px] bg-btnBlackBgColor rounded-3xl flex items-center justify-center border-2 border-btnBlackStrokeColor">
        <div className="flex flex-col items-center gap-10">
          <CircularProgress sx={{ color: "#12b3a8" }} />
          <span className="text-second">Loading round details...</span>
        </div>
      </div>
    </div>
  );
};

export default PageSpinner;
