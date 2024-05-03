import Colorbox from "../../InputFields/ColorBox";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { handleBackgroundItemHexChange } from "../../../store/reducers/leftnavbarSlice";

function BackgroundItems() {
  const list = useSelector((state: RootState) => state.leftnavbar.backgroundItems);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.leftnavbar.isDarkMode);

  return (
    <>
      {list.map((item, index) =>
        isDarkMode === item.isDark ? (
          <div key={index} className={`space-y-3`}>
            <div>{item.name}</div>
            <div className="bg-darkgreen-0 p-3 flex items-center gap-2 rounded-xl">
              <Colorbox
                onChangeHandler={(e) =>
                  dispatch(handleBackgroundItemHexChange({ e, index }))
                }
                value={item.hexValue}
                id={item.id}
                name={item.id}
              />
              <input
                className="bg-transparent border-transparent focus:border-transparent focus:ring-0 focus:outline-none w-40"
                placeholder="#000000"
                type="text"
                value={item.hexValue}
                onChange={(e) => {
                  dispatch(handleBackgroundItemHexChange({ e, index }));
                }}
              />
            </div>
          </div>
        ) : (
          <></>
        )
      )}
    </>
  );
}

export default BackgroundItems;
