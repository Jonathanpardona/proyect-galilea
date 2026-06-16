import { useState, useEffect } from "react";

// Concrete color values per theme, kept in sync with the CSS variables in App.css.
// Use this where var() can't be resolved (SVG presentation attributes, Recharts props).
const PALETTES = {
  light: {
    text: "#1e293b",
    muted: "#64748b",
    border: "#e2e8f0",
    surface: "#f8fafc",
    page: "#eef2f7",
    card: "#ffffff",
    input: "#ffffff",
  },
  dark: {
    text: "#e6eef7",
    muted: "#93a7bd",
    border: "#1e3a5c",
    surface: "#102a44",
    page: "#050f1e",
    card: "#0f2942",
    input: "#0a1f38",
  },
};

const currentMode = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

export function useThemeColors() {
  const [mode, setMode] = useState(currentMode);

  useEffect(() => {
    const obs = new MutationObserver(() => setMode(currentMode()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return PALETTES[mode];
}
