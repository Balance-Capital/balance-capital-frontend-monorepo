import MuiSkeleton from "@mui/material/Skeleton";

const Skeleton = () => {
  return (
    <div className="rounded-md w-full h-full overflow-hidden bg-woodsmoke">
      <MuiSkeleton
        variant="rectangular"
        height={"100%"}
        width={"100%"}
        sx={{ backgroundColor: "#32424d", opacity: 0.2 }}
      />
    </div>
  );
};

export default Skeleton;
