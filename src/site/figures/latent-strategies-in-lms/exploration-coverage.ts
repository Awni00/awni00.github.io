import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

const IID = SERIES[1];
const EXPLORE = SERIES[0];

export default defineFigure({
  data: "latent-strategies-in-lms/exploration-coverage.csv",
  size: "narrow",
  title: "Strategy coverage (%) at T = 4",
  alt: "Strategy coverage after four samples for each objective under latent IID sampling and latent exploration, against the base model.",
  legend: [
    { label: "Base", color: NEUTRAL, key: "dot" },
    { label: "IID", color: IID, key: "dot" },
    { label: "Explore", color: EXPLORE, key: "dot" }
  ],
  plot: ({ data, width }) => {
    const order = data.map((d) => d.method_label);
    const base = data[0].base;
    return {
      width,
      height: 250,
      marginLeft: 104,
      marginRight: 12,
      marginTop: 8,
      marginBottom: 26,
      x: { domain: [66, 85], ticks: [68, 72, 76, 80, 84], label: null },
      y: {
        domain: [order.length - 0.6, -0.4],
        ticks: order.map((_, i) => i),
        tickFormat: (i: number) => order[i] ?? "",
        label: null,
        tickSize: 0
      },
      marks: [
        Plot.gridX({ ticks: [68, 72, 76, 80, 84] }),
        // Dividers between proposed objectives, the ablation and the baselines (make_figures.py).
        Plot.ruleY([2.5, 3.5], { className: "figure-baseline", strokeOpacity: 0.6 }),
        Plot.ruleX([base], { stroke: NEUTRAL, strokeDasharray: "4,3", strokeWidth: 1.2 }),
        Plot.link(data, { x1: "iid", x2: "explore", y1: "order", y2: "order", stroke: NEUTRAL, strokeOpacity: 0.6 }),
        Plot.dot(data, {
          x: "base",
          y: "order",
          symbol: "diamond",
          r: 4.2,
          fill: "var(--color-bg)",
          stroke: NEUTRAL,
          strokeWidth: 1.4,
          title: (d) => `Base model: ${d.base.toFixed(1)}%`
        }),
        Plot.dot(data, {
          x: "iid",
          y: "order",
          r: 4.2,
          fill: "var(--color-bg)",
          stroke: IID,
          strokeWidth: 1.6,
          title: (d) => `${d.method_label}, latent IID: ${d.iid.toFixed(1)}%`
        }),
        Plot.dot(data, {
          x: "explore",
          y: "order",
          r: 4.4,
          fill: EXPLORE,
          title: (d) => `${d.method_label}, latent exploration: ${d.explore.toFixed(1)}%`
        })
      ]
    };
  }
});
