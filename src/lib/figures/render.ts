import * as Plot from "@observablehq/plot";
import { autoType, csvParse } from "d3-dsv";
import { parseHTML } from "linkedom";

/**
 * Build-time chart rendering.
 *
 * Charts are drawn with Observable Plot when the page is built and inlined as
 * SVG, so they ship no JavaScript, use the page's fonts, and recolour with the
 * theme toggle. Plot needs a DOM to draw into; linkedom supplies one.
 *
 * Colour is the one thing Plot can't take as a CSS variable, because it parses
 * colours. Figures draw with the sentinel hexes below instead, and the output
 * has each sentinel swapped for its `var(--figure-*)` token. Every other colour
 * (ink, axes, grid) is set from the theme in `figures.css`.
 */

/** Widths the chart is drawn at, in CSS px. Type sizes assume 1:1 display. */
export const FIGURE_SIZES = { narrow: 360, medium: 560, full: 760 } as const;
export type FigureSize = keyof typeof FIGURE_SIZES;

/** Phone layout: a `full` chart is also drawn at this width and swapped in. */
export const FIGURE_COMPACT_WIDTH = 360;

/** Series colours, in their fixed order. Never cycle past six. */
export const SERIES = ["#000101", "#000102", "#000103", "#000104", "#000105", "#000106"] as const;
/** Baselines, catch-all groups and reference lines. */
export const NEUTRAL = "#000107";

const TOKENS: Record<string, string> = {
  ...Object.fromEntries(SERIES.map((hex, i) => [hex, `var(--figure-${i + 1})`])),
  [NEUTRAL]: "var(--figure-neutral)"
};

// Rows come from CSV through autoType, so field types are only known per figure.
export type FigureRow = Record<string, any>;

export type FigureContext = {
  data: FigureRow[];
  width: number;
  /** True for the phone layout of a `full` chart. */
  compact: boolean;
};

/**
 * One legend entry. Legends are drawn by <Chart>, not Plot, so every chart
 * gets the same one: above the plot, left-aligned, with line keys for lines
 * (dashed when the series is) and square keys for fills.
 */
export type LegendItem = {
  label: string;
  /** A SERIES sentinel or NEUTRAL. */
  color: string;
  key: "line" | "swatch";
  dashed?: boolean;
};

export type FigureDefinition = {
  /** Path under `src/data/figures/`. */
  data: string;
  size: FigureSize;
  /** Default alt text; the page can override it. */
  alt?: string;
  /** Panel title, drawn small and left-aligned above the legend. */
  title?: string;
  legend?: LegendItem[];
  /** Parts set in the code face because they name identifiers. */
  mono?: Array<"x" | "fx" | "legend">;
  plot: (context: FigureContext) => Plot.PlotOptions;
};

/** Dash pattern for the secondary series of a pair, in px. */
export const DASH = "5,2.5";

export const colorToken = (color: string) => TOKENS[color] ?? color;

export const defineFigure = (definition: FigureDefinition) => definition;

export const parseFigureData = (csv: string): FigureRow[] => csvParse(csv, autoType) as FigureRow[];

export function renderFigure(options: Plot.PlotOptions, ariaLabel: string): string {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  // Axis labels name the quantity; Plot's direction arrows aren't in the spec.
  const unarrowed = Object.fromEntries(
    (["x", "y", "fx", "fy"] as const).map((key) => [key, { labelArrow: "none", ...options[key] }])
  );
  const node = Plot.plot({
    ...options,
    ...unarrowed,
    className: "figure-plot",
    ariaLabel,
    document: document as unknown as Document
  });
  let html = (node as unknown as Element).outerHTML;
  for (const [sentinel, token] of Object.entries(TOKENS)) {
    html = html.replaceAll(sentinel, token);
  }
  return html;
}
