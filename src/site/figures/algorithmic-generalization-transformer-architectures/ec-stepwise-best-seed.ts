import * as Plot from "@observablehq/plot";
import { DASH, SERIES, defineFigure } from "../../../lib/figures";
import { SOLVE_RATE_Y, percent } from "./_methods";

// Graph size is ordinal (8–128): one hue, ramped by opacity toward SERIES[1],
// the colour of Discrete LSS + EC in the method comparison.
const SIZES = Array.from({ length: 16 }, (_, i) => 8 * (i + 1));
const opacity = (n: number) => 0.2 + (0.8 * (n - 8)) / 120;
const MAX_TRAIN_DEPTH = 6;

export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/ec-stepwise-best-seed.csv",
  size: "narrow",
  legend: [{ key: "ramp", label: "# Nodes", color: SERIES[1], opacities: SIZES.map(opacity), from: "8", to: "128" }],
  plot: ({ data, width }) => ({
    width,
    height: 250,
    marginLeft: 44,
    marginRight: 12,
    marginBottom: 40,
    x: { label: "# Recurrent iterations", domain: [0, 20], ticks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
    y: SOLVE_RATE_Y,
    marks: [
      Plot.gridX({ ticks: [2, 4, 8, 10, 12, 14, 16, 18] }),
      Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
      Plot.rect([0], { x1: 0, x2: MAX_TRAIN_DEPTH, y1: 0, y2: 1.02, fill: "currentColor", fillOpacity: 0.06 }),
      Plot.ruleX([MAX_TRAIN_DEPTH], { strokeDasharray: DASH, strokeOpacity: 0.5 }),
      ...SIZES.map((n) =>
        Plot.line(
          data.filter((d) => d.graph_size === n),
          { x: "step", y: "accuracy", stroke: SERIES[1], strokeOpacity: opacity(n), strokeWidth: 1.6 }
        )
      ),
      Plot.dot(data, {
        x: "step",
        y: "accuracy",
        r: 2,
        fill: SERIES[1],
        fillOpacity: (d) => opacity(d.graph_size),
        title: (d) => `N = ${d.graph_size}${d.graph_size === 32 ? " (largest training size)" : ""}, ${d.step} iterations\n${percent(d.accuracy)} solved`
      })
    ]
  })
});
