import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

const MODELS = ["Abstractor", "CoRelNet (Asymmetric)", "PrediNet", "CoRelNet", "MLP"];
const COLORS = [SERIES[0], SERIES[1], SERIES[2], SERIES[3], NEUTRAL];

export default defineFigure({
  data: "abstractor/pairwise-order-learning-curves.csv",
  size: "narrow",
  title: "Learning Asymmetric ≺ Relation",
  legend: MODELS.map((label, i) => ({ label, color: COLORS[i], key: "line" })),
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginBottom: 40,
    color: { domain: MODELS, range: COLORS },
    x: {
      label: "Training set size",
      ticks: [0, 500, 1000, 1500, 2000],
      tickFormat: "d",
      domain: [0, 2050]
    },
    y: {
      label: "Accuracy",
      domain: [0.46, 0.95],
      ticks: [0.5, 0.6, 0.7, 0.8, 0.9],
      tickFormat: ".1f"
    },
    marks: [
      Plot.gridY({ ticks: [0.5, 0.6, 0.7, 0.8, 0.9] }),
      Plot.areaY(data, {
        x: "train_size",
        y1: (d) => d.accuracy - d.band_halfwidth,
        y2: (d) => d.accuracy + d.band_halfwidth,
        fill: "model"
      }),
      Plot.lineY(data, {
        x: "train_size",
        y: "accuracy",
        stroke: "model",
        strokeWidth: 2
      }),
      Plot.dot(data, {
        x: "train_size",
        y: "accuracy",
        fill: "model",
        r: 3,
        title: (d) => `${d.model}\n${d.train_size} examples: ${d.accuracy}`
      })
    ]
  })
});
