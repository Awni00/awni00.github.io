/**
 * Colour and label assignments shared by this post's figures (no default
 * export: not a figure definition itself).
 *
 * Objectives: the post's main objective (global + token) takes SERIES[0];
 * the other model-directed objectives follow; the ELBO baselines are NEUTRAL,
 * β-ELBO dashed.
 */
import { NEUTRAL, SERIES } from "../../../lib/figures";

export type MethodStyle = { label: string; color: string; dashed?: boolean };

export const METHODS: Record<string, MethodStyle> = {
  global_plus_token: { label: "global + token", color: SERIES[0] },
  token_pressure: { label: "token weighting", color: SERIES[1] },
  global_norm: { label: "global scale", color: SERIES[2] },
  token_inverse: { label: "token inverse", color: SERIES[3] },
  standard_cvae: { label: "ELBO", color: NEUTRAL },
  beta_elbo: { label: "β-ELBO", color: NEUTRAL, dashed: true }
};

/** Legend order of the phase-space figures (the paper's method_order). */
export const PHASE_ORDER = [
  "standard_cvae",
  "beta_elbo",
  "global_norm",
  "token_pressure",
  "global_plus_token",
  "token_inverse"
] as const;

/** Metrics drawn as series. */
export const METRIC_COLORS = {
  strategy_alignment: SERIES[0],
  distributional_fidelity: SERIES[1],
  posterior_router_kl: SERIES[2]
} as const;

/** Tasks, in latent_dynamics/specs.py TASK_ORDER, with their labels. */
export const TASKS = [
  ["base_conversion", "Base conv."],
  ["grid_pathfinding", "Grid paths"],
  ["linear_equation_solving", "Linear eqs."],
  ["list_summation", "Summation"],
  ["multidigit_addition", "Addition"],
  ["sorting_algorithms", "Sorting"]
] as const;

export const TASK_LABEL: Record<string, string> = Object.fromEntries(TASKS);
export const TASK_COLOR: Record<string, string> = Object.fromEntries(TASKS.map(([task], i) => [task, SERIES[i]]));

export const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * Axis limits of the posterior PCA plane: min/max over all 51 checkpoints with
 * a 5% margin, as the paper's `_axis_limits` computes them (also stored in
 * posterior-frames.json as `limits`).
 */
export const POSTERIOR_LIMITS: { x: [number, number]; y: [number, number] } = {
  x: [-7.915, 10.72],
  y: [-9.023, 7.655]
};

/**
 * `render` override for dense scatters: draws each colour's points as one
 * path of zero-length round-capped segments instead of one <circle> each, so
 * thousands of points stay a small SVG. Hover tips are dropped.
 */
export function compactDots(radius: number, opacity: number) {
  return (index: number[], _scales: unknown, values: any, _dimensions: unknown, context: any) => {
    const ns = "http://www.w3.org/2000/svg";
    const doc: Document = context.document;
    const g = doc.createElementNS(ns, "g");
    const byColor = new Map<string, string[]>();
    for (const i of index) {
      const color = values.fill?.[i] ?? "currentColor";
      const x = values.x[i];
      const y = values.y[i];
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (!byColor.has(color)) byColor.set(color, []);
      byColor.get(color)!.push(`M${x.toFixed(1)} ${y.toFixed(1)}h0`);
    }
    for (const [color, parts] of byColor) {
      const path = doc.createElementNS(ns, "path");
      path.setAttribute("d", parts.join(""));
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", String(radius * 2));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-opacity", String(opacity));
      path.setAttribute("fill", "none");
      g.append(path);
    }
    return g as unknown as SVGElement;
  };
}
