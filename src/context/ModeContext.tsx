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
          "--primary": "#FFB800",
          "--accent": "#FFB800",
          "--bg-primary": "#0B0500",
          "--bg-secondary": "#120D00",
          "--bg-card": "#1F1600",
          "--border-color": "rgba(255, 184, 0, 0.1)",
          "--glass-bg": "rgba(255, 184, 0, 0.08)",
          "--shadow-glow": "0 0 20px rgba(255, 184, 0, 0.15)",
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
