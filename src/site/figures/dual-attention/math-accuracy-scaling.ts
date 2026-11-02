import * as Plot from "@observablehq/plot";
import { ERROR_BAR, NEUTRAL, SERIES, defineFigure, type FigureRow } from "../../../lib/figures";
import { niceTicks, panelGrid, tickFormat, type Panel } from "../../../lib/figures/panels";

const TASKS = [
  "algebra__linear_1d",
  "algebra__sequence_next_term",
  "calculus__differentiate",
  "polynomials__add",
  "polynomials__expand"
];
const MODELS = ["DAT", "Transformer"];
const COLORS = [SERIES[0], NEUTRAL];
const X: [number, number] = [650_000, 1_780_000];
const X_TICKS = [750_000, 1_000_000, 1_250_000, 1_750_000];
const X_TICKS_COMPACT = [750_000, 1_250_000, 1_750_000];
const formatParams = (v: number) => (v >= 1e6 ? `${v / 1e6}M` : `${v / 1e3}k`);

// Each panel keeps its own accuracy range, as in the published subplots:
// the tasks sit anywhere from 0.53 to 0.99999.
function panels(data: FigureRow[], compact: boolean): Panel[] {
  return TASKS.map((task) => {
    const rows = data.filter((d) => d.task === task);
    const lo = Math.min(...rows.map((d) => d.accuracy - d.error));
    const hi = Math.max(...rows.map((d) => d.accuracy + d.error));
    const pad = (hi - lo) * 0.06;
    const y: [number, number] = [lo - pad, hi + pad];
    return {
      // Phones: underscores mark where a long task name may wrap.
      key: compact ? task.replace("__", "__\n") : task,
      x: X,
      xTicks: compact ? X_TICKS_COMPACT : X_TICKS,
      y,
      yTicks: niceTicks(...y, 4)
    };
  });
}

export default defineFigure({
  data: "dual-attention/math-accuracy-scaling.csv",
  size: "full",
  title: "Mathematical Problem Solving",
  mono: ["fx"],
  legend: MODELS.map((label, i) => ({ label, color: COLORS[i], key: "line" })),
  plot: ({ data, width, compact }) => {
    const grid = panelGrid({
      panels: panels(data, compact),
      columns: compact ? 2 : 3,
      panelOf: (d) => (compact ? d.task.replace("__", "__\n") : d.task),
      xFormat: formatParams,
      yFormat: (p) => tickFormat(p.yTicks),
      xLabelsBottomOnly: false,
      xLabel: "Parameter Count",
      yLabel: "Accuracy",
      yLabelOffset: compact ? 60 : 50
    });
    const at = { x: (d: FigureRow) => grid.nx(d, d.params), fx: grid.fxOf, fy: grid.fyOf };
    return {
      width,
      height: compact ? 660 : 470,
      marginTop: compact ? 36 : 22,
      marginLeft: compact ? 72 : 64,
      marginRight: compact ? 18 : 12,
      marginBottom: 44,
      fx: { ...grid.fx, padding: compact ? 0.3 : 0.26 },
      fy: { ...grid.fy, padding: compact ? 0.36 : 0.3 },
      x: grid.x,
      y: grid.y,
      color: { domain: MODELS, range: COLORS },
      marks: [
        ...grid.marks,
        Plot.ruleX(data, {
          ...at,
          y1: (d) => grid.ny(d, d.accuracy - d.error),
          y2: (d) => grid.ny(d, d.accuracy + d.error),
          className: ERROR_BAR
        }),
        Plot.lineY(data, { ...at, y: (d) => grid.ny(d, d.accuracy), z: "model", stroke: "model", strokeWidth: 1.75 }),
        Plot.dot(data, {
          ...at,
          y: (d) => grid.ny(d, d.accuracy),
          fill: "model",
          r: 2.5,
          title: (d) =>
            `${d.model} · ${d.task}\n${formatParams(d.params)} parameters\naccuracy ${d.accuracy.toFixed(4)} ± ${d.error.toFixed(4)} (${d.trials} runs)`
        })
      ]
    };
  }
});
