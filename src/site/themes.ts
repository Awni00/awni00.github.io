import type { ThemeInput } from "../config/types";
import { builtInThemes } from "../config/defaults/themes";

/**
 * Chart colours for this site's two themes (paper, ink). The blog's figures
 * colour by meaning across posts (src/site/figures/_roles.ts): slot 1 is
 * red (sensory, CoT), slot 2 blue (relational, E2E), slot 5 violet (both),
 * so the slot order differs from the template's accent-first default.
 * Values are the ones the figures were reviewed in; every companion is
 * stated, so none is copied from the built-in's old slots.
 */
const CHART_COLORS = {
  paper: {
    "figure-1": "#902343",
    "figure-2": "#2e64a6",
    "figure-3": "#c0851f",
    "figure-4": "#109488",
    "figure-5": "#7b52a4",
    "figure-6": "#6c9539",
    "figure-1-alt": "#be7d90",
    "figure-2-alt": "#6b91c0",
    "figure-3-alt": "#775213",
    "figure-4-alt": "#0a5c54",
    "figure-5-alt": "#a184be",
    "figure-6-alt": "#435c23",
    "figure-neutral": "#8e9095"
  },
  ink: {
    "figure-1": "#d36d86",
    "figure-2": "#5290d3",
    "figure-3": "#b68f1b",
    "figure-4": "#20a89b",
    "figure-5": "#9468c2",
    "figure-6": "#77a246",
    "figure-1-alt": "#934e60",
    "figure-2-alt": "#3b6593",
    "figure-3-alt": "#796017",
    "figure-4-alt": "#196f68",
    "figure-6-alt": "#4f6b32",
    "figure-neutral": "#74757a"
  }
} as const;

// A copy of the built-in under its own id (`paper-site`, `ink-site`, chosen in
// src/site/config.ts), so the shipped theme stays registered as it is. The
// built-in's own chart colours are dropped first, so any companion not stated
// above is derived from this slot rather than copied from the built-in's.
const withChartColors = (id: keyof typeof CHART_COLORS): ThemeInput => {
  const theme = builtInThemes.find((t) => t.id === id)!;
  const colors = Object.fromEntries(Object.entries(theme.colors).filter(([key]) => !key.startsWith("figure-")));
  return { ...theme, id: `${id}-site`, label: `${theme.label} (site)`, colors: { ...colors, ...CHART_COLORS[id] } } as ThemeInput;
};

/**
 * Site-owned themes.
 *
 * The template ships eighteen themes (`src/config/defaults/themes.ts`); pick two of
 * them with `theme: { light, dark }` in `src/site/config.ts`. Define a theme
 * here only when you want colours the built-ins do not offer. Giving a theme
 * here the same `id` as a built-in replaces it, which is the supported way to
 * retune a shipped theme without editing template files.
 *
 * Only `bg`, `fg` and `accent` are required. Everything omitted is derived
 * from those three — surfaces and borders are mixed from `bg` toward `fg`, and
 * the hued semantics fall back to accessible defaults for the appearance you
 * declare. Fill in more as you want more control.
 *
 * Two optional roles split jobs off the accent: `link` for links in running
 * text and `annotation` for `<Term>` words and `<HoverNote>` marks. Each
 * defaults to the accent. See "Levels of control" in docs/theming.md.
 *
 * `npm run validate` checks every theme defined here for contrast, derived
 * tokens included, so a colour that would be unreadable fails the build with
 * the measured ratio rather than shipping.
 *
 * The dev server reads this at startup — restart it after editing.
 */
export const customThemes: readonly ThemeInput[] = [
  withChartColors("paper"),
  withChartColors("ink")
  // {
  //   id: "seminar",
  //   label: "Seminar",
  //   appearance: "light",
  //   shiki: "min-light",
  //   colors: {
  //     bg: "#fffdf8",
  //     fg: "#1b1a17",
  //     accent: "#8a3324",
  //     // Optional — anything you leave out is derived from the three above.
  //     link: "#1f5f8b",
  //     muted: "#6a655c",
  //     "graph-teaching": "#3f6b46"
  //   }
  // }
];
