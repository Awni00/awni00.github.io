import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure, type FigureRow } from "../../../lib/figures";
import { niceTicks, panelGrid, tickFormat, type Panel } from "../../../lib/figures/panels";

/**
 * Layer-2 attention-head statistics for one variable position: three panels
 * (each with its own y range) of one bar per head.
 */
const STATS = [
  { id: "variance", title: "Variance per head" },
  { id: "average_norm", title: "Average norm" },
  { id: "relative_variance", title: "Relative variance" }
];
const titleOf = new Map(STATS.map((s) => [s.id, s.title]));
const fmt = (v: number) => (v >= 10 ? v.toFixed(1) : v.toFixed(3));

function panels(rows: FigureRow[]): Panel[] {
  return STATS.map((s) => {
    const hi = Math.max(...rows.filter((d) => d.statistic === s.id).map((d) => d.value));
    const y: [number, number] = [0, hi * 1.06];
    return { key: s.title, x: [-0.7, 15.7], xTicks: [0, 5, 10, 15], y, yTicks: niceTicks(0, hi, 4) };
  });
}

export const headStatistics = (variable: string) =>
  defineFigure({
    data: "algorithmic-generalization-transformer-architectures/l1-attention-head-statistics.csv",
    size: "full",
    plot: ({ data, width, compact }) => {
      const rows = data.filter((d) => d.variable === variable);
      const grid = panelGrid({
        panels: panels(rows),
        columns: compact ? 1 : 3,
        panelOf: (d) => titleOf.get(d.statistic)!,
        xFormat: (v) => String(v),
        yFormat: (p) => tickFormat(p.yTicks),
        xLabel: "Head",
        yLabel: "",
        yLabelOffset: 0
      });
      return {
        width,
        height: compact ? 520 : 200,
        marginTop: 24,
        marginLeft: 44,
        marginRight: 10,
        marginBottom: 44,
        fx: { ...grid.fx, padding: 0.2 },
        fy: { ...grid.fy, padding: 0.32 },
        x: grid.x,
        y: grid.y,
        marks: [
          ...grid.marks,
          Plot.rect(rows, {
            x1: (d) => grid.nx(d, d.head - 0.38),
            x2: (d) => grid.nx(d, d.head + 0.38),
            y1: (d) => grid.ny(d, 0),
            y2: (d) => grid.ny(d, d.value),
            fx: grid.fxOf,
            fy: grid.fyOf,
            fill: SERIES[0],
            title: (d) => `Head ${d.head}\n${titleOf.get(d.statistic)}: ${fmt(d.value)}`
          })
        ]
      };
    }
  });
