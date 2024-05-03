import Colorbox from "../../InputFields/ColorBox";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { handleTypoColorsHexChange } from "../../../store/reducers/leftnavbarSlice";
import FontFamilyDropDown from "./FontFamilyDropDown";

function Typography() {
  const { colors, fontFamilys, fontSize } = useSelector(
    (state: RootState) => state.leftnavbar.typoGraphy
  );
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.leftnavbar.isDarkMode);

  return (
    <>
      {colors.map((item, index) =>
        isDarkMode === item.isDark ? (
          <div key={index} className="space-y-3">
            <div>{item.name}</div>
            <div className="bg-darkgreen-0 p-3 flex items-center gap-2 rounded-xl">
              <Colorbox
                onChangeHandler={(e) => {
                  dispatch(handleTypoColorsHexChange({ e, index }));
                }}
                id={item.id}
                name={item.id}
                value={item.hexValue}
              />
              <input
                className="bg-transparent border-transparent focus:border-transparent focus:outline-none focus:ring-0 w-40"
                placeholder="#000000"
                type="text"
                value={item.hexValue}
                onChange={(e) => {
                  dispatch(handleTypoColorsHexChange({ e, index }));
                }}
              />
            </div>
          </div>
        ) : (
          <></>
        )
      )}
      <div className="space-y-3">
        <div>Font family</div>
        <FontFamilyDropDown fontFamilys={fontFamilys} />
      </div>
      {/* <div className="space-y-3">
        <div>Font size</div>
        <input
          className="w-full bg-darkgreen-0 p-3 rounded-xl focus:outline-none placeholder:text-greenish-0/20"
          type="text"
          value={fontSize}
          onChange={(e) => dispatch(handleTypoFontSize(e.target.value))}
          name="font-family"
          id="font-family"
          placeholder="0px"
        />
      </div> */}
    </>
  );
}

export default Typography;
