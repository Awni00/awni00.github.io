import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure } from "../../../lib/figures";

export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/l2-relative-error.csv",
  size: "medium",
  title: "L2 relative error distribution",
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 40,
    marginRight: 16,
    marginBottom: 40,
    x: { label: "L2 relative error", domain: [0.066, 0.106], ticks: [0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.1, 0.105] },
    y: { label: "Count", domain: [0, 26], ticks: [0, 5, 10, 15, 20, 25] },
    marks: [
      Plot.gridY({ ticks: [5, 10, 15, 20, 25] }),
      Plot.rectY(data, {
        x1: "bin_start",
        x2: "bin_end",
        y: "count",
        fill: SERIES[0],
        inset: 0.5,
        title: (d) => `${d.bin_start.toFixed(3)}–${d.bin_end.toFixed(3)}: ${d.count}`
      }),
      Plot.ruleY([0], { className: "figure-baseline" })
    ]
  })
});
