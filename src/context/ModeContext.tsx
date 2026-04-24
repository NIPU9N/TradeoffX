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
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem("tradeoffx-mode");
    if (savedMode === "practice" || savedMode === "real") {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem("tradeoffx-mode", newMode);
  };

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
