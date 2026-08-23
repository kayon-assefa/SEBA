// src/features/Appointments/hooks/useDarkMode.ts

import { useEffect, useState } from "react";

const STORAGE_KEY = "appointments_dark_mode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "1" : "0");
    } catch {
      // ignore
    }
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark((d) => !d) };
}
