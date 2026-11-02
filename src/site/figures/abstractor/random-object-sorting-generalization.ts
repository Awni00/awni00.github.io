import * as Plot from "@observablehq/plot";
import { DASH, SERIES, defineFigure } from "../../../lib/figures";

// Colour is the model, dash marks training from scratch; pre-trained is solid.
const COLOR: Record<string, string> = { Abstractor: SERIES[0], Transformer: SERIES[1] };
const series = (d: Record<string, any>) => `${d.model}${d.pretrained ? ", pre-trained" : ""}`;

export default defineFigure({
  data: "abstractor/random-object-sorting-generalization.csv",
  size: "narrow",
  title: "Random Object Sorting Generalization",
  // Published legend wording: Abstractor / Pre-trained / Transformer / Pre-trained.
  legend: [
    { label: "Abstractor", color: SERIES[0], key: "line", dashed: true },
    { label: "Pre-trained", color: SERIES[0], key: "line" },
    { label: "Transformer", color: SERIES[1], key: "line", dashed: true },
    { label: "Pre-trained", color: SERIES[1], key: "line" }
  ],
  plot: ({ data, width }) => {
    const scratch = data.filter((d) => !d.pretrained);
    const pretrained = data.filter((d) => d.pretrained);
    const marks = (rows: typeof data, dashed: boolean) => [
      Plot.lineY(rows, {
        x: "train_size",
        y: "accuracy",
        z: "model",
        stroke: (d) => COLOR[d.model],
        strokeWidth: 1.75,
        strokeDasharray: dashed ? DASH : undefined
      }),
      Plot.dot(rows, {
        x: "train_size",
        y: "accuracy",
        fill: (d) => COLOR[d.model],
        r: 2,
        title: (d) => `${series(d)}\n${d.train_size} examples: ${d.accuracy.toFixed(3)}`
      })
    ];
    return {
      width,
      height: 230,
      marginLeft: 44,
      marginRight: 14,
      marginBottom: 40,
      x: {
        label: "Training set size",
        ticks: [0, 500, 1000, 1500, 2000, 2500, 3000],
        tickFormat: "d",
        domain: [0, 3080]
      },
      y: { label: "Sorting accuracy", domain: [-0.08, 1.1], ticks: [0, 0.5, 1], tickFormat: ".1f" },
      marks: [
        Plot.gridY({ ticks: [0, 0.5, 1] }),
        Plot.areaY(data, {
          x: "train_size",
          y1: "lo",
          y2: "hi",
          z: series,
          fill: (d) => COLOR[d.model],
          clip: true
        }),
        ...marks(scratch, true),
        ...marks(pretrained, false)
      ]
    };
  }
});
