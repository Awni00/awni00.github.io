import type { ThemeConfig } from "../types";

export const defaultThemeConfig = {
  defaultMode: "light",
  allowToggle: true,
  typography: {
    body: "serif",
    ui: "sans",
    code: "mono"
  }
} as const satisfies ThemeConfig;
