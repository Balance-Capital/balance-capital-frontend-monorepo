const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind");
const { join } = require("path");

module.exports = {
  darkMode: "class",
  content: [
    join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      screens: {
        xs: "320px",
        sm: "600px",
        md: "900px",
        lg: "1024px",
        xl: "1280px",
        "1xl": "1400px",
        "2xl": "1600px",
        "3xl": "1920px",
      },
      colors: {
        primary: "#0D181A",
        greenish: { 0: "#BDE0EB", 1: "#12B3A8", 3: "#13C9BD", 4: "#DBF6FF" },
        darkgreen: { 0: "#173033", 1: "#23484D", 3: "#102022", 4: "#0A1314" },
        grayish: { 0: "#5B7481" },
      },
      fontFamily: {
        OcrExtendedRegular: ["OcrExtendedRegular", "sans-serif"],
        InterLight: ["InterLight", "sans-serif"],
        InterMedium: ["InterMedium", "sans-serif"],
        InterRegular: ["InterRegular", "sans-serif"],
      },
    },
  },
  plugins: [],
};
