import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, SERIES_ALT, type FigureRow } from "../../../lib/figures";

/**
 * A lighter shade of a series colour: mixed toward the page background, so
 * it stays opaque and follows the theme. Plot can't parse it as a constant,
 * so marks pass it through a channel (`() => …`) with `color: { type: "identity" }`.
 */
export const light = (color: string) => `color-mix(in srgb, ${color} 65%, var(--color-bg))`;

/**
 * The paper's seven methods, with their figure-legend names
 * (paper_figures/labels.py), coloured by family as in the paper's figures:
 * discrete-latent methods navy (the full method strongest), continuous-latent
 * methods greens (teal, olive), end-to-end baselines greys, and
 * chain-of-thought, the one token-space method, claret.
 */
export const METHODS = [
  { id: "end-to-end-feedforward", label: "Feedforward E2E", color: NEUTRAL },
  { id: "end-to-end-recurrent", label: "Recurrent E2E", color: light(NEUTRAL) },
  { id: "chain-of-thought-supervision", label: "Chain-of-Thought", color: SERIES[0] },
  { id: "continuous-latent-space-supervision", label: "Continuous LSS", color: SERIES[3] },
  { id: "self-scheduled-lss", label: "Self-Scheduled LSS", color: SERIES[5] },
  { id: "discrete-latent-space-supervision", label: "Discrete LSS", color: SERIES_ALT[1] },
  { id: "discrete-latent-space-supervision-on-policy-error-correction", label: "Discrete LSS + EC", color: SERIES[1] }
] as const;

/** A method's colour, by its legend name. */
export const colorOf = (label: (typeof METHODS)[number]["label"]) => METHODS.find((m) => m.label === label)!.color;

const byId = new Map<string, (typeof METHODS)[number]>(METHODS.map((m) => [m.id, m]));
export const methodOf = (d: FigureRow) => byId.get(d.method)!;

export type DirectLabel = {
  text: string;
  x: number;
  y: number;
  color: string;
  anchor?: "start" | "end" | "middle";
  /** Pixel offsets from (x, y). */
  dx?: number;
  dy?: number;
};

/**
 * Line labels set in their series colour, with a page-coloured halo so they
 * stay legible where they cross grid or bands. Needs `color: { type: "identity" }`.
 */
export function directLabels(labels: DirectLabel[]) {
  return labels.map((l) =>
    Plot.text([l], {
      x: "x",
      y: "y",
      text: "text",
      fill: () => l.color,
      stroke: () => "var(--color-bg)",
      strokeWidth: 3,
      textAnchor: l.anchor ?? "start",
      dx: l.dx ?? 0,
      dy: l.dy ?? 0,
      fontWeight: 500
    })
  );
}

export const percent = (v: number) => `${(v * 100).toFixed(1)}%`;

/** Solve-rate y axis, as the paper draws it (0–100%). */
export const SOLVE_RATE_Y = {
  label: "Solve rate",
  domain: [0, 1.02],
  ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
  tickFormat: ".0%"
} as const;

/** The paper's grey training-range region, with its label. */
export function trainingRange(x1: number, x2: number, label: string | null) {
  return [
    Plot.rect([0], { x1, x2, y1: 0, y2: 1.02, fill: "currentColor", fillOpacity: 0.06 }),
    Plot.ruleX([x2], { strokeDasharray: DASH, strokeOpacity: 0.5 }),
    ...(label
      ? [Plot.text([label], { x: (x1 + x2) / 2, y: 0.05, text: (d: string) => d, lineAnchor: "bottom", fontSize: 10, fillOpacity: 0.7 })]
      : [])
  ];
}

/** One line + markers per method, drawn baselines first so the LSS methods sit on top. */
export function methodLines(data: FigureRow[], y: string, title: (d: FigureRow) => string) {
  return METHODS.flatMap((m) => {
    const rows = data.filter((d) => d.method === m.id);
    return [
      Plot.line(rows, {
        x: "graph_size",
        y,
        stroke: () => m.color,
        strokeWidth: 1.75
      }),
      Plot.dot(rows, { x: "graph_size", y, r: 2.25, fill: () => m.color, title })
    ];
  });
}
