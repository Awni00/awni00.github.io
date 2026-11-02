import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

const MODELS = ["Transformer", "Transformer+", "Abstractor (pos. symbols)", "Abstractor (symbolic attn)"];
const COLORS = [NEUTRAL, SERIES[1], SERIES[0], SERIES[2]];

/**
 * Each panel has its own y range, which Plot facets can't do (they share
 * scales). So y is drawn normalised to [0, 1] per task, and each panel's
 * grid and tick labels are marks placed in the same normalised units.
 */
const TASKS: Array<{ task: string; domain: [number, number]; ticks: number[]; format: string }> = [
  { task: "calculus__differentiate", domain: [0.936, 1.003], ticks: [0.95, 0.975, 1], format: ".3f" },
  { task: "algebra__sequence_next_term", domain: [0.71, 0.965], ticks: [0.8, 0.9], format: ".1f" },
  { task: "algebra__linear_1d", domain: [0.5, 0.85], ticks: [0.6, 0.8], format: ".1f" },
  { task: "polynomials__expand", domain: [0.695, 0.83], ticks: [0.7, 0.75, 0.8], format: ".2f" },
  { task: "polynomials__add", domain: [0.778, 0.875], ticks: [0.8, 0.85], format: ".2f" }
];

const fmt = (format: string) => (v: number) => v.toFixed(Number(format.slice(1, -1)));

export default defineFigure({
  data: "abstractor/math-training-curves.csv",
  size: "full",
  legend: MODELS.map((label, i) => ({ label, color: COLORS[i], key: "line" })),
  mono: ["fx"],
  plot: ({ data, width, compact }) => {
    const columns = compact ? 2 : 3;
    const spec = new Map(TASKS.map((t, i) => [t.task, { ...t, col: i % columns, row: Math.floor(i / columns) }]));
    const place = (task: string) => spec.get(task)!;
    const norm = (task: string, v: number) => {
      const [lo, hi] = place(task).domain;
      return (v - lo) / (hi - lo);
    };
    const rows = data.map((d) => ({
      ...d,
      col: place(d.task).col,
      row: place(d.task).row,
      ny: norm(d.task, d.accuracy),
      nlo: norm(d.task, d.lo),
      nhi: norm(d.task, d.hi)
    }));
    const ticks = TASKS.flatMap((t) =>
      t.ticks.map((v) => ({ col: place(t.task).col, row: place(t.task).row, ny: norm(t.task, v), label: fmt(t.format)(v) }))
    );
    const panels = TASKS.map((t) => ({ ...place(t.task), label: compact ? t.task.replace("__", "__\n") : t.task }));
    const facet = { fx: "col", fy: "row" } as const;
    return {
      width,
      height: compact ? 3 * 150 + 40 : 2 * 150 + 30,
      marginLeft: 58,
      marginRight: 6,
      marginTop: compact ? 34 : 22,
      marginBottom: 40,
      fx: { axis: null, paddingInner: compact ? 0.25 : 0.2, paddingOuter: 0, domain: [...Array(columns).keys()] },
      fy: { axis: null, paddingInner: compact ? 0.36 : 0.3, paddingOuter: 0 },
      color: { domain: MODELS, range: COLORS },
      x: { label: "epoch", domain: [-1.5, 50.5], ticks: [0, 20, 40], tickFormat: "d" },
      y: { axis: null, domain: [0, 1] },
      marks: [
        Plot.gridX({ ticks: [0, 20, 40] }),
        Plot.ruleY(ticks, { ...facet, y: "ny", ariaLabel: () => "y-grid" }),
        Plot.text(ticks, {
          ...facet,
          y: "ny",
          text: "label",
          frameAnchor: "left",
          textAnchor: "end",
          dx: -5,
          ariaLabel: () => "y-axis tick label"
        }),
        Plot.text(panels, {
          ...facet,
          text: "label",
          frameAnchor: "top-left",
          textAnchor: "start",
          lineAnchor: "bottom",
          dy: -6,
          ariaLabel: () => "fx-axis tick label"
        }),
        Plot.areaY(rows, { ...facet, x: "epoch", y1: "nlo", y2: "nhi", fill: "model", clip: true }),
        Plot.lineY(rows, { ...facet, x: "epoch", y: "ny", stroke: "model", strokeWidth: 1.5 }),
        Plot.dot(rows, {
          ...facet,
          x: "epoch",
          y: "ny",
          r: 2.5,
          fill: "model",
          fillOpacity: 0,
          title: (d) => `${d.model} · ${d.task}\nepoch ${d.epoch}: ${d.accuracy.toFixed(3)}`
        }),
        Plot.text(
          [...new Set(TASKS.map((t) => place(t.task).row))].map((row) => ({ col: 0, row })),
          {
            ...facet,
            text: () => "TF accuracy (val)",
            y: () => 0.5,
            frameAnchor: "left",
            textAnchor: "middle",
            rotate: -90,
            dx: -46,
            ariaLabel: () => "y-axis label"
          }
        )
      ]
    };
  }
});
