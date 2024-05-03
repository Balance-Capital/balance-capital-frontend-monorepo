import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  setAffiliateSetting,
  setTimeFrames,
  setUnderlyingTokens,
} from "../store/reducers/widget-slice";
import { RootState } from "../store";
import {
  setBettingCryptoCurrencies,
  setBettingTimeframes,
} from "../store/reducers/trade-slice";

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");

  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r} ${g} ${b}`;
}

const changeFontFamilyStyle = (fontName: string) => {
  return `
  * { font-family: ${fontName}Regular; }
  .font-InterRegular {
    font-family: ${fontName}Regular !important;
  }
  .font-InterMedium {
    font-family: ${fontName}Medium !important;
  }
  .font-InterLight {
    font-family: ${fontName}Light !important;
  }`;
};

const primaryColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-btn-black-txtColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-btn-black-txtColor: ${hexToRgb(hexDark)}
  }
  `;
};

const secondaryColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-gray-txtColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-gray-txtColor: ${hexToRgb(hexDark)}
  }
  `;
};

const mainColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-page-bgColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-page-bgColor: ${hexToRgb(hexDark)}
  }
  `;
};

const panelColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-btn-black-bgColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-btn-black-bgColor: ${hexToRgb(hexDark)}
  }
  `;
};

const modalColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-modal-bgColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-modal-bgColor: ${hexToRgb(hexDark)}
  }
  `;
};

const borderColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-btn-black-strokeColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-btn-black-strokeColor: ${hexToRgb(hexDark)}
  }
  `;
};

const brandColorStyle = (hexLight: string, hexDark: string) => {
  return `
  :root {
    --color-brandColor: ${hexToRgb(hexLight)}
  }
  :root[class~="dark"] {
    --color-brandColor: ${hexToRgb(hexDark)}
  }
  `;
};

function useWidgetParams() {
  const [searchParams] = useSearchParams();
  const bettingCryptoCurrencies = useSelector(
    (state: RootState) => state.trade.bettingCryptoCurrencies
  );
  const bettingTimeframes = useSelector(
    (state: RootState) => state.trade.bettingTimeframes
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const _underlyingTokens = JSON.parse(
      decodeURIComponent(searchParams.get("underlyingTokens") || "[]")
    );
    const _timeFrames = JSON.parse(
      decodeURIComponent(searchParams.get("timeFrames") || "[]")
    );
    const _affiliateSetting = JSON.parse(
      decodeURIComponent(searchParams.get("affiliateSetting") || "{}")
    );
    const _typoGraphy = JSON.parse(
      decodeURIComponent(searchParams.get("typoGraphy") || "{}")
    );
    const _backgroundItems = JSON.parse(
      decodeURIComponent(searchParams.get("backgroundItems") || "{}")
    );
    if (_underlyingTokens?.length) {
      const filteredTokens = bettingCryptoCurrencies.filter((obj) =>
        _underlyingTokens.some((obj1: any) => obj.symbol.includes(obj1.symbol))
      );
      dispatch(setBettingCryptoCurrencies(filteredTokens));
      dispatch(setUnderlyingTokens(_underlyingTokens));
    }
    if (_timeFrames.length) {
      const filteredTF = bettingTimeframes.filter((obj) =>
        _timeFrames.some((obj1: any) => obj.minute === obj1.min)
      );
      dispatch(setBettingTimeframes(filteredTF));
      dispatch(setTimeFrames(_timeFrames));
    }
    if (Object.keys(_affiliateSetting)?.length) {
      dispatch(setAffiliateSetting(_affiliateSetting));
    }
    if (searchParams.get("isDarkMode")) {
      localStorage.setItem(
        "themeMode",
        searchParams.get("isDarkMode") === "true" ? "dark" : "light"
      );
    }

    const styleSheet = document.createElement("style");
    let styles = "";
    if (Object.keys(_typoGraphy)?.length) {
      if (_typoGraphy?.fontFamily) {
        styles += changeFontFamilyStyle(_typoGraphy.fontFamily);
      }
      if (_typoGraphy["primary-color-light"] && _typoGraphy["primary-color-dark"]) {
        styles += primaryColorStyle(
          _typoGraphy["primary-color-light"],
          _typoGraphy["primary-color-dark"]
        );
      }
      if (_typoGraphy["secondary-color-light"] && _typoGraphy["secondary-color-dark"]) {
        styles += secondaryColorStyle(
          _typoGraphy["secondary-color-light"],
          _typoGraphy["secondary-color-dark"]
        );
      }
    }
    if (Object.keys(_backgroundItems)?.length) {
      if (_backgroundItems["main-color-light"] && _backgroundItems["main-color-dark"]) {
        styles += mainColorStyle(
          _backgroundItems["main-color-light"],
          _backgroundItems["main-color-dark"]
        );
      }
      if (_backgroundItems["panel-color-light"] && _backgroundItems["panel-color-dark"]) {
        styles += panelColorStyle(
          _backgroundItems["panel-color-light"],
          _backgroundItems["panel-color-dark"]
        );
      }
      if (_backgroundItems["modal-color-light"] && _backgroundItems["modal-color-dark"]) {
        styles += modalColorStyle(
          _backgroundItems["modal-color-light"],
          _backgroundItems["modal-color-dark"]
        );
      }
      if (
        _backgroundItems["border-color-light"] &&
        _backgroundItems["border-color-dark"]
      ) {
        styles += borderColorStyle(
          _backgroundItems["border-color-light"],
          _backgroundItems["border-color-dark"]
        );
      }
      if (_backgroundItems["brand-color-light"] && _backgroundItems["brand-color-dark"]) {
        styles += brandColorStyle(
          _backgroundItems["brand-color-light"],
          _backgroundItems["brand-color-dark"]
        );
      }
    }
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }, []);
}

export default useWidgetParams;
