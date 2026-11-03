import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure, powerOfTen } from "../../../lib/figures";

const FAMILIES = [
  ["elbo_baseline", "ELBO baseline", NEUTRAL],
  ["global_scale", "global scale", SERIES[2]],
  ["token_weighting", "token weighting", SERIES[1]],
  ["global_plus_token", "global + token", SERIES[0]],
  ["token_inverse", "token inverse", SERIES[3]]
] as const;
// metric_association_scatter/style.py TASK_MARKERS: o s ^ D P X, as Plot's filled symbols
// (Plot has no filled X; "wye" stands in for it).
const TASK_SYMBOLS = {
  base_conversion: "circle",
  grid_pathfinding: "square",
  linear_equation_solving: "triangle",
  list_summation: "diamond",
  multidigit_addition: "cross",
  sorting_algorithms: "wye"
};
const PAD = 1.22; // LOG_LIMIT_PADDING_FACTOR, applied twice when the x = 1 reference is included

export default defineFigure({
  data: "latent-strategies-in-lms/token-recon-vs-alignment.csv",
  size: "narrow",
  alt: "Scatter of token-weighted reconstruction loss versus Strategy Alignment at training endpoints; outlined points show method centroids and translucent points show individual runs.",
  legend: FAMILIES.map(([, label, color]) => ({ label, color, key: "dot" as const })),
  plot: ({ data, width }) => {
    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const lo = Math.min(...xs, 1) / PAD / PAD;
    const hi = Math.max(...xs, 1) * PAD * PAD;
    const runs = data.filter((d) => d.point_type === "task_point");
    const centroids = data.filter((d) => d.point_type === "centroid");
    const familyLabel = new Map<string, string>(FAMILIES.map(([key, label]) => [key, label]));
    const tip = (d: any) =>
      `${familyLabel.get(d.family)} · ${d.loss_setting}\n${d.point_type === "centroid" ? "task average" : d.task.replaceAll("_", " ")}\n` +
      `token-weighted recon. ${d.x.toPrecision(3)} · alignment ${d.y.toFixed(3)}`;
    return {
      width,
      height: 290,
      marginLeft: 40,
      marginRight: 12,
      marginBottom: 38,
      color: { domain: FAMILIES.map(([key]) => key), range: FAMILIES.map(([, , color]) => color) },
      symbol: { domain: Object.keys(TASK_SYMBOLS), range: Object.values(TASK_SYMBOLS) },
      x: {
        type: "log",
        label: "Token-Weighted Reconstruction",
        domain: [hi, lo],
        ticks: [1, 0.1, 0.01, 0.001],
        tickFormat: powerOfTen
      },
      y: {
        label: "Strategy-Alignment",
        domain: [Math.max(0, Math.min(...ys) - 0.035), Math.min(1.02, Math.max(...ys) + 0.035)],
        ticks: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        tickFormat: ".1f"
      },
      marks: [
        Plot.gridX({ ticks: [1, 0.1, 0.01, 0.001] }),
        Plot.gridY({ ticks: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }),
        Plot.ruleX([1], { className: "figure-baseline" }),
        Plot.dot(runs, {
          x: "x",
          y: "y",
          symbol: "task",
          fill: "family",
          fillOpacity: 0.4,
          r: 3.2,
          title: tip
        }),
        Plot.dot(centroids, {
          x: "x",
          y: "y",
          fill: "family",
          fillOpacity: 0.85,
          stroke: "currentColor",
          strokeWidth: 0.9,
          r: 4.5,
          title: tip
        })
      ]
    };
  }
});
