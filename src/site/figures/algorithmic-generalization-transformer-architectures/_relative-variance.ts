import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure } from "../../../lib/figures";

/**
 * Layer-1 relative-variance heatmaps: query token × head, one figure per
 * perturbed position. One-hue ramp from the page background to SERIES[0],
 * as a colour-mix so cells stay opaque and recolour with the theme.
 */
const QUERIES = ["<SEP>", "var_0", "ADD_0", "var_1", "ADD_1", "var_2", "=", "rhs"];
const HEADS = Array.from({ length: 16 }, (_, i) => i);
const ramp = (v: number) =>
  `color-mix(in srgb, ${SERIES[0]} ${(Math.max(0, Math.min(1, v)) * 100).toFixed(1)}%, var(--color-bg))`;

export const relativeVarianceHeatmap = (perturbed: string) =>
  defineFigure({
    data: "algorithmic-generalization-transformer-architectures/l0-relative-variance.csv",
    size: "narrow",
    legend: [
      { key: "ramp", label: "Relative variance", color: SERIES[0], opacities: [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1], from: "0", to: "1" }
    ],
    plot: ({ data, width }) => ({
      width,
      height: 220,
      marginLeft: 62,
      marginRight: 6,
      marginBottom: 40,
      color: { type: "identity" },
      x: { label: "Head index", domain: HEADS, ticks: HEADS, tickSize: 0, padding: 0 },
      y: { label: "Query token", domain: QUERIES, tickSize: 0, padding: 0 },
      marks: [
        Plot.cell(
          data.filter((d) => d.perturbed === perturbed),
          {
            x: "head",
            y: "query_token",
            fill: (d) => ramp(d.relative_variance),
            shapeRendering: "crispEdges",
            title: (d) => `Head ${d.head}, query ${d.query_token}\nRelative variance ${d.relative_variance.toFixed(3)}`
          }
        )
      ]
    })
  });
