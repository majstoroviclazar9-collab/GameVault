import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../lib/storage.js";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(storage.get("gamevault_theme", "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set("gamevault_theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme mora biti koriscen unutar ThemeProvider.");
  }
  return context;
}
