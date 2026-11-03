import * as Plot from "@observablehq/plot";
import { defineFigure } from "../../../lib/figures";
import { METRIC_COLORS } from "./_shared";

const LABELS: Record<string, string> = {
  distributional_fidelity: "Distributional Fidelity",
  strategy_alignment: "Strategy Alignment",
  posterior_router_kl: "KL / initial KL"
};
const ORDER = ["distributional_fidelity", "strategy_alignment", "posterior_router_kl"];
const COLORS = ORDER.map((key) => METRIC_COLORS[key as keyof typeof METRIC_COLORS]);

export default defineFigure({
  data: "latent-strategies-in-lms/elbo-failure-dynamics.csv",
  size: "medium",
  alt: "Standard ELBO training: distributional fidelity rises, posterior-router KL relative to initialization collapses, and strategy alignment stays low over training.",
  plot: ({ data, width }) => {
    const ends = ORDER.flatMap((metric) => {
      const rows = data.filter((d) => d.metric === metric);
      return [rows[0], rows[rows.length - 1]];
    });
    const last = ends.filter((_, i) => i % 2 === 1);
    return {
      width,
      height: 300,
      marginLeft: 44,
      marginRight: 14,
      marginBottom: 40,
      color: { domain: ORDER, range: COLORS },
      x: { label: "Training progress", domain: [0, 1], ticks: 5, inset: 6 },
      y: { label: "Metric value", domain: [0, 1.05], ticks: [0, 0.25, 0.5, 0.75, 1], tickFormat: ".2f" },
      marks: [
        Plot.gridY({ ticks: [0.25, 0.5, 0.75, 1] }),
        Plot.gridX({ ticks: 5 }),
        Plot.ruleY([0], { className: "figure-baseline" }),
        Plot.lineY(data, { x: "progress", y: "value", z: "metric", stroke: "metric", strokeWidth: 2 }),
        Plot.dot(ends, { x: "progress", y: "value", fill: "metric", r: 3 }),
        Plot.dot(data, {
          x: "progress",
          y: "value",
          fill: "metric",
          r: 6,
          fillOpacity: 0,
          title: (d) =>
            `${LABELS[d.metric]}\nprogress ${d.progress.toFixed(2)}: ${d.value.toFixed(3)}` +
            (d.metric === "posterior_router_kl" ? `\n(KL ${d.raw_value.toPrecision(3)})` : "")
        }),
        Plot.text(last, {
          x: "progress",
          y: "value",
          text: (d) => LABELS[d.metric],
          fill: "metric",
          textAnchor: "end",
          dx: -8,
          dy: -10,
          stroke: "var(--color-bg)",
          strokeWidth: 4,
          fontWeight: 500
        })
      ]
    };
  }
});
