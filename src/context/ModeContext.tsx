"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Mode = "real" | "practice";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isPractice: boolean;
  isReal: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("real");

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("tradeoffx-mode");
    if (savedMode === "practice" || savedMode === "real") {
      window.requestAnimationFrame(() => setModeState(savedMode));
    }
  }, []);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("tradeoffx-mode", newMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = mode;

    const themeVars = mode === "practice"
      ? {
          "--primary": "#00FF94",
          "--accent": "#00FF94",
          "--bg-primary": "#08080F",
          "--bg-secondary": "#0F0F1A",
          "--bg-card": "#13131F",
          "--border-color": "rgba(0, 255, 148, 0.1)",
          "--glass-bg": "rgba(0, 255, 148, 0.08)",
          "--shadow-glow": "0 0 20px rgba(0, 255, 148, 0.15)",
        }
      : {
          "--primary": "#4EA8FF",
          "--accent": "#4EA8FF",
          "--bg-primary": "#08080F",
          "--bg-secondary": "#0F0F1A",
          "--bg-card": "#13131F",
          "--border-color": "rgba(78, 168, 255, 0.12)",
          "--glass-bg": "rgba(78, 168, 255, 0.08)",
          "--shadow-glow": "0 0 20px rgba(78, 168, 255, 0.15)",
        };

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [mode]);

  // Prevent hydration mismatch by not rendering until mounted
  // or providing a default that matches SSR
  // For context providers, we just return the state
  
  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        isPractice: mode === "practice",
        isReal: mode === "real",
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
