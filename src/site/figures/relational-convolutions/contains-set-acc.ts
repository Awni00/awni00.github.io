import * as Plot from "@observablehq/plot";
import { BASELINE, ERROR_BAR, NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

// Same colours as relational-games-ood for the models both charts share; the
// three graph baselines (a seventh series) fold into NEUTRAL.
const MODELS = ["RelConvNet", "CoRelNet", "PrediNet", "Transformer", "GCN", "GAT", "GIN"];
const COLORS = [...SERIES.slice(0, 4), NEUTRAL, NEUTRAL, NEUTRAL];

export default defineFigure({
  data: "relational-convolutions/contains-set-acc.csv",
  size: "medium",
  title: "Accuracy for 'Contains SET' Task",
  plot: ({ data, width }) => ({
    width,
    height: 300,
    marginLeft: 44,
    marginBottom: 40,
    x: { domain: MODELS, label: "Model", paddingInner: 0.22, paddingOuter: 0.1 },
    y: {
      label: "Accuracy",
      domain: [0, 1.04],
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
      tickFormat: ".1f"
    },
    color: { domain: MODELS, range: COLORS },
    marks: [
      Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
      Plot.barY(data, {
        x: "model",
        y: "accuracy",
        fill: "model",
        title: (d) => `${d.model}\n${d.accuracy.toFixed(3)} ± ${d.error.toFixed(3)} (${d.trials} trials)`
      }),
      Plot.ruleX(data, {
        x: "model",
        y1: (d) => d.accuracy - d.error,
        y2: (d) => d.accuracy + d.error,
        className: ERROR_BAR
      }),
      Plot.ruleY([0], { className: BASELINE })
    ]
  })
});
