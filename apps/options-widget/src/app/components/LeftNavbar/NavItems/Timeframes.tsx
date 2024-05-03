import { enqueueSnackbar } from "notistack";
import { RootState } from "../../../store";
import { handleTimeframeChecked } from "../../../store/reducers/leftnavbarSlice";
import CheckBox from "../../InputFields/CheckBox";
import { useDispatch, useSelector } from "react-redux";
import { NOTIFY_MSG } from "../../../constants/notification";

function TimeFrames() {
  const list = useSelector((state: RootState) => state.leftnavbar.timeFrames);
  const dispatch = useDispatch();
  return (
    <>
      {list.map((item, i) => (
        <label
          htmlFor={item.name}
          className="flex items-center gap-2 cursor-pointer"
          key={i}
        >
          <CheckBox
            handleClick={(e) => {
              if (e && !e.target.checked) {
                const isTruthy = list.every(
                  (obj) => obj.name === item.name || !obj.isChecked
                );
                if (isTruthy) {
                  e.target.checked = true;
                  enqueueSnackbar(NOTIFY_MSG.CHECK_BOX, { variant: "warning" });
                  return;
                }
              }
              dispatch(handleTimeframeChecked(i));
            }}
            id={item.name}
            {...item}
          />
          <div>{item.name}</div>
        </label>
      ))}
    </>
  );
}

export default TimeFrames;
