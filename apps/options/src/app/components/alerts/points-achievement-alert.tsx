import { SnackbarContent } from "@mui/material";
import Slide, { SlideProps } from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import { ReactElement } from "react";

type TransitionProps = Omit<SlideProps, "direction">;

function TransitionUp(props: TransitionProps) {
  return <Slide {...props} direction="up" />;
}

interface IPointAchievementAlert {
  points?: number;
  title: string;
  description: ReactElement | string;
  imgType:
    | "five-x"
    | "gimme-five"
    | "the-bull"
    | "satoshi"
    | "the-bear"
    | "meth-head"
    | "jack-of-all-trades"
    | "referral-vol"
    | "one-mint-master"
    | "triple-three"
    | "completionist";
  open: boolean;
  handleClose: () => void;
}

function PointAchievementAlert({
  open,
  points,
  title,
  description,
  imgType,
  handleClose,
}: IPointAchievementAlert) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionComponent={TransitionUp}
    >
      <SnackbarContent
        className={`xs:min-w-auto md:min-w-450 bg-popupBgColor border-2 ${
          imgType === "completionist" ? "border-yellowTxtColor" : "border-btnGreenBgColor"
        } rounded-3xl`}
        message={
          <div className="flex items-center gap-15 mx-10">
            <img src={`../../../assets/images/${imgType}.png`} alt="" />
            <div className="flex items-start flex-col gap-5 ml-10">
              {imgType !== "completionist" ? (
                <div className="font-OcrExtendedRegular text-14 bg-btnGreenBgColor/10 text-successTxtColor rounded-md p-5">
                  +{points} points
                </div>
              ) : null}
              <div className="font-InterRegular text-whiteTxtColor text-20">{title}</div>
              <div className="font-InterRegular text-grayTxtColor text-16">
                {description}
              </div>
            </div>
          </div>
        }
      />
    </Snackbar>
  );
}

export default PointAchievementAlert;
