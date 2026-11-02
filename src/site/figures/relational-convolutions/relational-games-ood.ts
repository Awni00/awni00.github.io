import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure } from "../../../lib/figures";

const MODELS = ["RelConvNet", "CoRelNet", "PrediNet", "Transformer"];
const COLORS = SERIES.slice(0, 4);
const TASKS = ["same", "occurs", "xoccurs", "between", "match pattern"];

export default defineFigure({
  data: "relational-convolutions/relational-games-ood.csv",
  size: "full",
  title: "Out-of-Distribution Generalization Performance on Relational Games Tasks",
  legend: MODELS.map((label, i) => ({
    label,
    color: COLORS[i],
    key: "swatch"
  })),
  plot: ({ data, width, compact }) => ({
    width,
    height: compact ? 300 : 320,
    marginLeft: 44,
    marginRight: compact ? 52 : 60,
    marginTop: 22,
    marginBottom: compact ? 34 : 26,
    color: { domain: MODELS, range: COLORS },
    fx: {
      domain: TASKS,
      label: null,
      axis: "bottom",
      padding: compact ? 0.12 : 0.16,
      tickFormat: compact ? (t: string) => t.replace(" ", "\n") : undefined
    },
    fy: {
      domain: ["Hexos", "Stripes"],
      label: null,
      axis: "right",
      padding: 0.18
    },
    x: { domain: MODELS, axis: null, paddingInner: 0.08, paddingOuter: 0 },
    y: {
      label: "Accuracy",
      domain: [0, 1.05],
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
      tickFormat: ".1f"
    },
    marks: [
      Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
      Plot.barY(data, {
        fx: "task",
        fy: "split",
        x: "model",
        y: "accuracy",
        fill: "model",
        title: (d) => `${d.model} · ${d.split} · ${d.task}\n${d.accuracy.toFixed(3)} ± ${d.error.toFixed(3)}`
      }),
      Plot.ruleX(data, {
        fx: "task",
        fy: "split",
        x: "model",
        y1: (d) => d.accuracy - d.error,
        y2: (d) => Math.min(d.accuracy + d.error, 1.05),
        className: "figure-error"
      }),
      Plot.ruleY([0], { className: "figure-baseline" })
    ]
  })
});
