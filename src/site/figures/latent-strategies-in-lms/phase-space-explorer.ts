import * as Plot from "@observablehq/plot";
import { DASH, defineFigure, powerOfTen, type FigureRow } from "../../../lib/figures";
import { METHODS, PHASE_ORDER } from "./_shared";

/** x metrics: the four phase-space families that share the alignment axis (phase_space_dynamics/specs.py). */
export const X_METRICS = {
  fidelity: { label: "Distributional Fidelity", log: false, invert: false, reference: null },
  kl: { label: "Prior KL", log: true, invert: false, reference: null },
  token_recon: { label: "Token-weighted reconstruction 𝒯θ", log: true, invert: true, reference: "𝒯θ = 1" },
  base_recon: { label: "Baseline-normalized reconstruction ℛθ", log: true, invert: true, reference: "ℛθ = 1" }
} as const;
export type XMetric = keyof typeof X_METRICS;

const extent = (values: number[], log: boolean): [number, number] => {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (log) return [lo / 1.13, hi * 1.13]; // X_LIMIT_PADDING_FACTOR
  const pad = 0.06 * (hi - lo); // rendering.py _axis_limits
  return [lo - pad, hi + pad];
};

/**
 * The paper's "rolling" smoothing (phase_space_dynamics/rendering.py _smooth):
 * pandas rolling(6, center=True, min_periods=1).mean() on the raw values,
 * i.e. the mean over checkpoints i-2 .. i+3, truncated at the ends.
 */
export const SMOOTH_WINDOW = 6;
function smoothRows(rows: FigureRow[], keys: string[]): FigureRow[] {
  const lo = Math.floor(SMOOTH_WINDOW / 2) - 1;
  const hi = SMOOTH_WINDOW - Math.floor(SMOOTH_WINDOW / 2);
  return rows.map((row, i) => {
    const window = rows.slice(Math.max(0, i - lo), Math.min(rows.length, i + hi + 1));
    const out = { ...row };
    for (const key of keys) out[key] = window.reduce((sum, d) => sum + d[key], 0) / window.length;
    return out;
  });
}

/**
 * Trajectories up to (fractional) checkpoint index `t` (0-based), for the
 * methods in `visible`. Shared by the build-time figure and its client.
 */
export function phaseOptions(
  data: FigureRow[],
  opts: { width: number; metric: XMetric; t: number; visible: Set<string>; smooth: boolean }
): Plot.PlotOptions {
  const spec = X_METRICS[opts.metric];
  const [lo, hi] = extent(
    data.map((d) => d[opts.metric]),
    spec.log
  );
  const yDomain = extent(
    data.map((d) => d.alignment),
    false
  );
  const k = Math.floor(opts.t);
  const f = opts.t - k;
  const paths: FigureRow[] = [];
  const heads: FigureRow[] = [];
  const starts: FigureRow[] = [];
  for (const method of PHASE_ORDER) {
    if (!opts.visible.has(method)) continue;
    const raw = data.filter((d) => d.method === method).sort((a, b) => a.checkpoint - b.checkpoint);
    const rows = opts.smooth ? smoothRows(raw, [opts.metric, "alignment"]) : raw;
    const shown: FigureRow[] = rows.slice(0, k + 1).map((d) => ({ ...d, x: d[opts.metric] }));
    const next = rows[k + 1];
    if (f > 0 && next) {
      const a = rows[k];
      const lerp = (u: number, v: number) => (spec.log ? Math.exp(Math.log(u) + (Math.log(v) - Math.log(u)) * f) : u + (v - u) * f);
      shown.push({
        ...a,
        x: lerp(a[opts.metric], next[opts.metric]),
        alignment: a.alignment + (next.alignment - a.alignment) * f,
        progress: a.progress + (next.progress - a.progress) * f
      });
    }
    paths.push(...shown);
    starts.push(shown[0]);
    heads.push(shown[shown.length - 1]);
  }
  const tip = (d: FigureRow) =>
    `${METHODS[d.method].label}, ${Math.round(d.progress * 100)}% of training\n${spec.label}: ${
      spec.log ? d.x.toPrecision(3) : d.x.toFixed(3)
    }\nStrategy-Alignment: ${d.alignment.toFixed(3)}`;
  const dashed = (d: FigureRow) => Boolean(METHODS[d.method].dashed);
  const logTicks = [1e-3, 1e-2, 1e-1, 1, 10, 100].filter((v) => v >= Math.min(lo, hi) && v <= Math.max(lo, hi));
  return {
    width: opts.width,
    height: Math.round(Math.min(opts.width, 560) * 0.62),
    marginLeft: 42,
    marginRight: 14,
    marginTop: 22,
    marginBottom: 40,
    color: { domain: [...PHASE_ORDER], range: PHASE_ORDER.map((m) => METHODS[m].color) },
    x: spec.log
      ? { type: "log", label: spec.label, domain: spec.invert ? [hi, lo] : [lo, hi], ticks: logTicks, tickFormat: powerOfTen }
      : { label: spec.label, domain: [lo, hi], ticks: 6, tickFormat: ".2f" },
    y: { label: "Strategy-Alignment", domain: yDomain, ticks: 6, tickFormat: ".1f" },
    marks: [
      Plot.gridY({ ticks: 6 }),
      spec.log ? Plot.gridX({ ticks: logTicks }) : Plot.gridX({ ticks: 6 }),
      ...(spec.reference
        ? [
            Plot.ruleX([1], { className: "figure-baseline" }),
            Plot.text([spec.reference], { x: 1, frameAnchor: "top", text: (d: string) => d, textAnchor: "start", dx: 4, dy: 2, fillOpacity: 0.7 })
          ]
        : []),
      Plot.line(
        paths.filter((d) => !dashed(d)),
        { x: "x", y: "alignment", z: "method", stroke: "method", strokeWidth: 1.6, strokeOpacity: 0.8 }
      ),
      Plot.line(
        paths.filter(dashed),
        { x: "x", y: "alignment", z: "method", stroke: "method", strokeWidth: 1.6, strokeOpacity: 0.8, strokeDasharray: DASH }
      ),
      Plot.dot(paths, { x: "x", y: "alignment", r: 5, fill: "method", fillOpacity: 0, title: tip }),
      Plot.dot(starts, { x: "x", y: "alignment", stroke: "method", fill: "var(--color-bg)", r: 4, strokeWidth: 1.5 }),
      Plot.dot(heads, { x: "x", y: "alignment", fill: "method", stroke: "var(--color-bg)", strokeWidth: 1, r: 5, title: tip })
    ]
  };
}

export default defineFigure({
  data: "latent-strategies-in-lms/phase-space.csv",
  size: "medium",
  alt: "Training trajectories of each objective variant in fidelity-alignment phase space over 51 checkpoints, with a time slider, method toggles and a choice of x-axis metric.",
  legend: PHASE_ORDER.map((m) => ({ label: METHODS[m].label, color: METHODS[m].color, key: "line" as const, dashed: METHODS[m].dashed })),
  plot: ({ data, width }) =>
    phaseOptions(data, { width, metric: "fidelity", t: 50, visible: new Set(PHASE_ORDER), smooth: true })
});
