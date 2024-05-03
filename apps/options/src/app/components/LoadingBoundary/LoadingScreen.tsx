import { Loader } from "./Loader";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-[80vh]">
      <Loader />
    </div>
  );
}
