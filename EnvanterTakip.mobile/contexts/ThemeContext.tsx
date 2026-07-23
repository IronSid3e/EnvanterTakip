import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  warning: string;
  cardBg: string;
  headerBg: string;
  headerBorder: string;
  inputBg: string;
  inputBorder: string;
  chipBg: string;
  chipBorder: string;
  divider: string;
  statusBar: "light" | "dark";
}

const lightColors: ThemeColors = {
  bg: "#f4f7f6",
  surface: "#ffffff",
  surfaceHover: "#f0f0f0",
  border: "#e0e0e0",
  text: "#2c3e50",
  textMuted: "#95a5a6",
  textSecondary: "#666666",
  primary: "#2ecc71",
  primaryText: "#ffffff",
  danger: "#e74c3c",
  success: "#27ae60",
  warning: "#f39c12",
  cardBg: "#ffffff",
  headerBg: "#ffffff",
  headerBorder: "#eeeeee",
  inputBg: "#ffffff",
  inputBorder: "#dddddd",
  chipBg: "#ffffff",
  chipBorder: "#dddddd",
  divider: "#f0f0f0",
  statusBar: "dark",
};

const darkColors: ThemeColors = {
  bg: "#0f172a",
  surface: "#1e293b",
  surfaceHover: "#334155",
  border: "#334155",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textSecondary: "#94a3b8",
  primary: "#2ecc71",
  primaryText: "#ffffff",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#eab308",
  cardBg: "#1e293b",
  headerBg: "#1e293b",
  headerBorder: "#334155",
  inputBg: "#1e293b",
  inputBorder: "#475569",
  chipBg: "#1e293b",
  chipBorder: "#475569",
  divider: "#334155",
  statusBar: "light",
};

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  colors: lightColors,
  setMode: () => {},
});

const THEME_KEY = "app_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setMode(stored);
      }
    });
  }, []);

  const handleSetMode = (m: ThemeMode) => {
    setMode(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  const colors = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode: handleSetMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
