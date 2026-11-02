import * as Plot from "@observablehq/plot";
import { ERROR_BAR, NEUTRAL, SERIES, defineFigure, type FigureRow } from "../../../lib/figures";
import { panelGrid, type Panel } from "../../../lib/figures/panels";

const TASKS = ["same", "occurs", "xoccurs", "between", "match pattern"];
const MODELS = [
  { key: "DAT 0 2", label: "DAT ($n_h^{sa}=0,\\ n_h^{ra}=2$)", color: SERIES[0] },
  { key: "DAT 1 1", label: "DAT ($n_h^{sa}=1,\\ n_h^{ra}=1$)", color: SERIES[1] },
  { key: "Transformer 2 0", label: "Transformer ($n_h^{sa}=2,\\ n_h^{ra}=0$)", color: NEUTRAL }
];
const modelKey = (d: FigureRow) => `${d.model} ${d.n_sa} ${d.n_ra}`;
const labelOf = (d: FigureRow) => MODELS.find((m) => m.key === modelKey(d))!.label;

const Y: [number, number] = [0.48, 1];
const Y_TICKS = [0.5, 0.6, 0.7, 0.8, 0.9, 1];
// Match pattern was trained on ten times more data than the other tasks, so
// its panel has its own x range, as in the published subplots.
const SMALL = { x: [150, 2600] as [number, number], xTicks: [500, 1000, 1500, 2000, 2500] };
const LARGE = { x: [1500, 26000] as [number, number], xTicks: [5000, 10000, 15000, 20000, 25000] };
// Phones get every other x tick.
const panels = (compact: boolean): Panel[] =>
  TASKS.map((task) => {
    const { x, xTicks } = task === "match pattern" ? LARGE : SMALL;
    return { key: task, x, xTicks: compact ? xTicks.filter((_, i) => i % 2 === 0) : xTicks, y: Y, yTicks: Y_TICKS };
  });
const formatSize = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

export default defineFigure({
  data: "dual-attention/relgames-learning-curves.csv",
  size: "full",
  title: "Relational Games: Data Efficiency in Relational Learning",
  mono: ["fx"],
  legend: MODELS.map((m) => ({ label: m.label, color: m.color, key: "line" })),
  plot: ({ data, width, compact }) => {
    const grid = panelGrid({
      panels: panels(compact),
      columns: compact ? 2 : 3,
      panelOf: (d) => d.task,
      xFormat: formatSize,
      yFormat: () => (v) => v.toFixed(1),
      yLabelsFirstColumnOnly: true,
      xLabel: "Training Set Size",
      yLabel: "Accuracy",
      yLabelOffset: 40
    });
    const at = { x: (d: FigureRow) => grid.nx(d, d.train_size), fx: grid.fxOf, fy: grid.fyOf };
    return {
      width,
      height: compact ? 580 : 460,
      marginTop: 22,
      marginLeft: 50,
      marginRight: compact ? 16 : 12,
      marginBottom: 44,
      fx: { ...grid.fx, padding: compact ? 0.1 : 0.08 },
      fy: { ...grid.fy, padding: compact ? 0.24 : 0.28 },
      x: grid.x,
      y: grid.y,
      color: { domain: MODELS.map((m) => m.key), range: MODELS.map((m) => m.color) },
      marks: [
        ...grid.marks,
        Plot.ruleX(data, {
          ...at,
          y1: (d) => grid.ny(d, d.accuracy - d.error),
          y2: (d) => grid.ny(d, d.accuracy + d.error),
          className: ERROR_BAR
        }),
        Plot.lineY(data, {
          ...at,
          y: (d) => grid.ny(d, d.accuracy),
          z: modelKey,
          stroke: modelKey,
          strokeWidth: 1.75,
          title: (d) => labelOf(d)
        }),
        Plot.dot(data, {
          ...at,
          y: (d) => grid.ny(d, d.accuracy),
          fill: modelKey,
          r: 3,
          fillOpacity: 0,
          title: (d) =>
            `${labelOf(d)} · ${d.task}\n${d.train_size.toLocaleString("en-US")} training examples\naccuracy ${d.accuracy.toFixed(3)} ± ${d.error.toFixed(3)}`
        })
      ]
    };
  }
});
