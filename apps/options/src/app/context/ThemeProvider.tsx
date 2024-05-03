// ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setDarkMode] = useState(() => true);

  useEffect(() => {
    if (window.location?.pathname.includes("/trade-widget")) {
      if (localStorage.getItem("themeMode")) {
        if (localStorage.getItem("themeMode") === "dark") {
          setDarkMode(true);
        } else {
          setDarkMode(false);
        }
      }
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("themeMode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme: ThemeContextProps = {
    isDarkMode,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
