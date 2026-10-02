import { useState } from "react";

const DEMO_STORAGE_KEY = "masar.map.demo";

/**
 * Hook for managing demo mode toggle
 */
export function useDemoMode() {
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(DEMO_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleDemoMode = () => {
    setDemoMode((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(DEMO_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Storage unavailable (private mode etc.) — keep the in-memory toggle.
      }
      return next;
    });
  };

  return { demoMode, toggleDemoMode };
}
