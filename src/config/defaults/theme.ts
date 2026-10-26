import type { ThemeConfig } from "../types";

export const defaultThemeConfig = {
  // Theme ids from `src/config/defaults/themes.ts`, or from `src/site/themes.ts`
  // if the site defines its own.
  light: "paper",
  dark: "ink",
  defaultMode: "system",
  allowToggle: true,
  typography: {
    body: "serif",
    ui: "sans",
    code: "mono",
    justify: {
      enabled: false,
      hyphenate: true,
      minWidth: "all"
    }
  },
  layout: {
    contentWidth: 1020
  },
  hoverNotes: {
    marker: "superscript",
    appearance: "card"
  },
  terms: {
    underline: "dotted"
  }
} as const satisfies ThemeConfig;
