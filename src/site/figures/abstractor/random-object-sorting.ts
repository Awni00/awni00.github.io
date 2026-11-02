import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

// Transformer keeps SERIES[1] here and in random-object-sorting-generalization.ts.
const MODELS = ["Abstractor", "Ablation Model", "Transformer"];
const COLORS = [SERIES[0], NEUTRAL, SERIES[1]];
const TICKS = [0, 0.25, 0.5, 0.75, 1];

export default defineFigure({
  data: "abstractor/random-object-sorting.csv",
  size: "narrow",
  title: "Random Object Sorting",
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
      ticks: [0, 500, 1000, 1500, 2000, 2500, 3000],
      tickFormat: "d",
      domain: [0, 3080]
    },
    y: { label: "Sorting accuracy", domain: [-0.04, 1.06], ticks: TICKS, tickFormat: ".2f" },
    marks: [
      Plot.gridY({ ticks: TICKS }),
      Plot.areaY(data, { x: "train_size", y1: "lo", y2: "hi", fill: "model", clip: true }),
      Plot.lineY(data, { x: "train_size", y: "accuracy", stroke: "model", strokeWidth: 1.75 }),
      Plot.dot(data, {
        x: "train_size",
        y: "accuracy",
        fill: "model",
        r: 2,
        title: (d) => `${d.model}\n${d.train_size} examples: ${d.accuracy.toFixed(3)}`
      })
    ]
  })
});
