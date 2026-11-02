import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure } from "../../../lib/figures";

/**
 * One-hue ramp from the page background to SERIES[0], as a colour-mix, so
 * cells stay opaque (no seams) and recolour with the theme.
 */
const ramp = (v: number) =>
  `color-mix(in srgb, ${SERIES[0]} ${(Math.max(0, Math.min(1, v)) * 100).toFixed(1)}%, var(--color-bg))`;

// Colour key, drawn beyond the x domain (Plot doesn't clip by default).
const KEY_X1 = 1.045;
const KEY_X2 = 1.085;
const KEY_STEPS = Array.from({ length: 60 }, (_, i) => i / 60);

export default defineFigure({
  data: "latent-strategies-in-lms/entanglement-heatmap.csv",
  size: "medium",
  alt: "Heatmap with rows as benchmark tasks and columns as normalized token positions; color gives linear-probe accuracy for predicting the ground-truth strategy from the base model's hidden states.",
  plot: ({ data, width }) => {
    const labels = new Map(data.map((d) => [d.row, d.task_label]));
    const rows = labels.size;
    const y = (v: number) => rows - 0.5 - v * rows;
    return {
      width,
      height: 290,
      marginLeft: 84,
      marginRight: 74,
      marginTop: 26,
      marginBottom: 40,
      color: { type: "identity" },
      x: { label: "Position", labelAnchor: "center", domain: [0, 1], ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], tickFormat: ".1f" },
      y: {
        label: "Task",
        domain: [rows - 0.5, -0.5],
        ticks: [...labels.keys()],
        tickFormat: (v: number) => labels.get(v) ?? "",
        tickSize: 0
      },
      marks: [
        Plot.rect(data, {
          x1: "x1",
          x2: "x2",
          y1: (d) => d.row - 0.5,
          y2: (d) => d.row + 0.5,
          fill: (d) => ramp(d.accuracy),
          shapeRendering: "crispEdges",
          title: (d) => `${d.task_label}, position ${((d.x1 + d.x2) / 2).toFixed(2)}\nProbe accuracy ${d.accuracy.toFixed(3)}`
        }),
        Plot.rect(KEY_STEPS, {
          x1: KEY_X1,
          x2: KEY_X2,
          y1: (v: number) => y(v),
          y2: (v: number) => y(v + 1 / KEY_STEPS.length),
          fill: (v: number) => ramp(v + 0.5 / KEY_STEPS.length),
          shapeRendering: "crispEdges"
        }),
        Plot.rect([0], { x1: KEY_X1, x2: KEY_X2, y1: y(0), y2: y(1), fill: "none", className: "figure-baseline", stroke: "currentColor", strokeOpacity: 0.35 }),
        Plot.text([0, 0.25, 0.5, 0.75, 1], {
          x: KEY_X2,
          y: (v: number) => y(v),
          text: (v: number) => v.toFixed(2),
          textAnchor: "start",
          dx: 5,
          fillOpacity: 0.8
        }),
        Plot.text(["Probe accuracy"], {
          x: KEY_X2,
          y: y(1),
          text: (d: string) => d,
          textAnchor: "end",
          dx: 38,
          dy: -14,
          fontSize: 13
        })
      ]
    };
  }
});
