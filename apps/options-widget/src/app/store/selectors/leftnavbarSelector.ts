import { RootState } from "..";
import { createSelector } from "@reduxjs/toolkit";
import {
  IAffiliateSetting,
  IBackgroundItem,
  ITimeframe,
  ITypography,
  IUnderlyingToken,
} from "../reducers/leftnavbarSlice";

export const getUnderlyingTokensWithoutImgProp = createSelector(
  (state: RootState) => state.leftnavbar.underlyingTokens,
  (underlyingTokens: IUnderlyingToken[]) => {
    return underlyingTokens
      .filter((obj) => obj.isChecked)
      .map((obj) => ({
        symbol: obj.symbol,
      }));
  }
);

export const getTimeFrames = createSelector(
  (state: RootState) => state.leftnavbar.timeFrames,
  (timeFrames: ITimeframe[]) => {
    return timeFrames.filter((obj) => obj.isChecked).map((obj) => ({ min: obj.min }));
  }
);

export const getBackgroundItemsWithoutNameProp = createSelector(
  (state: RootState) => state.leftnavbar.backgroundItems,
  (backgroundItems: IBackgroundItem[]) => {
    const obj = {} as any;
    backgroundItems.forEach(({ hexValue, id }) => {
      obj[id] = hexValue;
    });
    return obj;
  }
);

export const getTypographyWithoutNamePropFromColor = createSelector(
  (state: RootState) => state.leftnavbar.typoGraphy,
  (typoGraphy: ITypography) => {
    const fontFamily = typoGraphy.fontFamilys.filter((obj) => obj.isSelected)[0].name;
    const colors = {} as any;
    typoGraphy.colors.forEach(({ hexValue, id }) => {
      colors[id] = hexValue;
    });
    return { ...colors, fontFamily };
  }
);

export const getAffiliateSetting = createSelector(
  (state: RootState) => state.leftnavbar.affiliateSetting,
  (affiliateSetting: IAffiliateSetting) => affiliateSetting
);
