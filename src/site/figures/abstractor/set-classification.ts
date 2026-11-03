import * as Plot from "@observablehq/plot";
import { defineFigure } from "../../../lib/figures";
import { ROLE } from "../_roles";

// Legend order of the published figure. Colours match pairwise-order.ts.
const MODELS = ["Abstractor", "CoRelNet", "CoRelNet (No Softmax)", "PrediNet", "MLP"];
// Abstractor blue (relational); the two CoRelNet variants share a hue; MLP neutral.
const COLORS = [ROLE.relational, ROLE.baseline, ROLE.baselineAlt, ROLE.otherBaseline, ROLE.generic];

export default defineFigure({
  data: "abstractor/set-classification.csv",
  size: "narrow",
  title: "SET Classification",
  legend: MODELS.map((label, i) => ({ label, color: COLORS[i], key: "line" })),
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginRight: 14,
    marginBottom: 40,
    color: { domain: MODELS, range: COLORS },
    x: {
      label: "Training set size",
      ticks: [1000, 2000, 3000, 4000, 5000],
      tickFormat: "d",
      domain: [300, 5150]
    },
    y: {
      label: "Accuracy",
      domain: [0.465, 1.01],
      ticks: [0.6, 0.8, 1],
      tickFormat: ".1f"
    },
    marks: [
      Plot.gridY({ ticks: [0.6, 0.8, 1] }),
      Plot.areaY(data, { x: "train_size", y1: "lo", y2: "hi", fill: "model" }),
      Plot.lineY(data, { x: "train_size", y: "accuracy", stroke: "model", strokeWidth: 2 }),
      Plot.dot(data, {
        x: "train_size",
        y: "accuracy",
        fill: "model",
        r: 3,
        title: (d) => `${d.model}\n${d.train_size} examples: ${d.accuracy.toFixed(3)}`
      })
    ]
  })
});
