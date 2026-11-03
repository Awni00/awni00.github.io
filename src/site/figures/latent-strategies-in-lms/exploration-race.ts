import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, defineFigure, type FigureRow } from "../../../lib/figures";
import { METHODS } from "./_shared";

/** Objectives in additional_results/make_figures.py ROLES order. */
export const RACE_ORDER = ["global_plus_token", "token_pressure", "global_norm", "token_inverse", "standard_cvae", "beta_elbo"];
export const BASE_DASH = "1.5,3";
export const SAMPLING = { explore: "Latent exploration", iid: "Latent IID" } as const;
export type Sampling = keyof typeof SAMPLING;

/** Coverage curves up to (fractional) decoding budget `T` (1..64). */
export function raceOptions(data: FigureRow[], opts: { width: number; T: number; sampling: Sampling }): Plot.PlotOptions {
  const upTo = (rows: FigureRow[]) => {
    const k = Math.floor(opts.T);
    const shown = rows.filter((d) => d.step <= k);
    const a = rows.find((d) => d.step === k);
    const b = rows.find((d) => d.step === k + 1);
    if (a && b && opts.T > k) {
      const f = opts.T - k;
      shown.push({ ...a, step: opts.T, coverage: a.coverage + (b.coverage - a.coverage) * f });
    }
    return shown;
  };
  const series = RACE_ORDER.map((method) => upTo(data.filter((d) => d.method === method && d.sampling === opts.sampling)));
  const base = upTo(data.filter((d) => d.method === "base"));
  const lines = series.flat();
  const heads = [...series, base].map((rows) => rows[rows.length - 1]).filter(Boolean);
  const label = (d: FigureRow) => (d.method === "base" ? "Base model" : METHODS[d.method].label);
  const tip = (d: FigureRow) =>
    `${label(d)}${d.method === "base" ? "" : `, ${SAMPLING[opts.sampling].toLowerCase()}`}\n${Math.floor(d.step)} samples: ${d.coverage.toFixed(1)}%`;
  return {
    width: opts.width,
    height: Math.round(Math.min(opts.width, 560) * 0.6),
    marginLeft: 42,
    marginRight: 14,
    marginTop: 22,
    marginBottom: 40,
    color: { domain: RACE_ORDER, range: RACE_ORDER.map((m) => METHODS[m].color) },
    x: { type: "log", base: 2, domain: [1, 64], ticks: [1, 2, 4, 8, 16, 32, 64], tickFormat: "d", label: "Decoded samples" },
    y: { domain: [28, 102], ticks: [30, 40, 50, 60, 70, 80, 90, 100], label: "Task-local strategy coverage (%)" },
    marks: [
      Plot.gridY({ ticks: [40, 50, 60, 70, 80, 90, 100] }),
      Plot.gridX({ ticks: [2, 4, 8, 16, 32, 64] }),
      Plot.ruleX([opts.T], { className: "figure-baseline", strokeOpacity: opts.T < 64 ? 0.8 : 0 }),
      Plot.line(base, { x: "step", y: "coverage", stroke: NEUTRAL, strokeWidth: 2, strokeDasharray: BASE_DASH }),
      Plot.line(
        lines.filter((d) => !METHODS[d.method].dashed),
        { x: "step", y: "coverage", z: "method", stroke: "method", strokeWidth: 1.6 }
      ),
      Plot.line(
        lines.filter((d) => METHODS[d.method].dashed),
        { x: "step", y: "coverage", z: "method", stroke: "method", strokeWidth: 1.6, strokeDasharray: DASH }
      ),
      Plot.dot([...lines, ...base].filter((d) => Number.isInteger(d.step)), {
        x: "step",
        y: "coverage",
        r: 5,
        fill: NEUTRAL,
        fillOpacity: 0,
        title: tip
      }),
      Plot.dot(heads, {
        x: "step",
        y: "coverage",
        r: 3.5,
        fill: (d) => (d.method === "base" ? NEUTRAL : METHODS[d.method].color),
        stroke: "var(--color-bg)",
        strokeWidth: 1,
        title: tip
      }),
      Plot.text([`${SAMPLING[opts.sampling]} · T = ${Math.floor(opts.T)}`], {
        frameAnchor: "bottom-right",
        dx: -6,
        dy: -6,
        text: (d: string) => d,
        textAnchor: "end"
      })
    ]
  };
}

export default defineFigure({
  data: "latent-strategies-in-lms/exploration-curves.csv",
  size: "medium",
  alt: "Strategy coverage against the number of decoded samples for each objective, under latent exploration or latent IID sampling, with the base model for reference.",
  legend: [
    ...RACE_ORDER.map((m) => ({ label: METHODS[m].label, color: METHODS[m].color, key: "line" as const, dashed: METHODS[m].dashed })),
    { label: "Base model", color: NEUTRAL, key: "line" as const, dashed: true }
  ],
  plot: ({ data, width }) => raceOptions(data, { width, T: 64, sampling: "explore" })
});
