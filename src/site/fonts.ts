import { fontProviders } from "astro/config";

const googleProvider = fontProviders.google();
const normalWeights = [400, 500, 600, 700] as [400, 500, 600, 700];
const normalStyles = ["normal"] as ["normal"];
const latinSubset = ["latin"] as ["latin"];
const fontDisplay = "swap" as const;

export const siteFontCssVariables = {
  serif: "--font-serif-loaded",
  sans: "--font-sans-loaded",
  mono: "--font-mono-loaded"
} as const;

export const siteFonts = [
  {
    name: "Source Serif 4",
    cssVariable: siteFontCssVariables.serif,
    provider: googleProvider,
    weights: normalWeights,
    styles: normalStyles,
    subsets: latinSubset,
    display: fontDisplay,
    fallbacks: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"]
  },
  {
    name: "Inter",
    cssVariable: siteFontCssVariables.sans,
    provider: googleProvider,
    weights: normalWeights,
    styles: normalStyles,
    subsets: latinSubset,
    display: fontDisplay,
    fallbacks: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif"
    ]
  },
  {
    name: "Source Code Pro",
    cssVariable: siteFontCssVariables.mono,
    provider: googleProvider,
    weights: normalWeights,
    styles: normalStyles,
    subsets: latinSubset,
    display: fontDisplay,
    fallbacks: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
  }
];
