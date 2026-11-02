import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

const GROUPS = ["var 0", "var 1", "var 2", "others"];
const COLORS = [SERIES[0], SERIES[1], SERIES[2], NEUTRAL];
const FACTORS = ["syntax", "variable", "operation", "value"];

export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/l0-ov-operator-norm.csv",
  size: "narrow",
  mono: ["fx", "legend"],
  legend: GROUPS.map((g, i) => ({
    label: `⟨${g}⟩`,
    color: COLORS[i],
    key: "swatch"
  })),
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginBottom: 28,
    color: { domain: GROUPS, range: COLORS },
    fx: { domain: FACTORS, label: null, axis: "bottom", padding: 0.14 },
    x: { domain: GROUPS, axis: null, paddingInner: 0.08, paddingOuter: 0 },
    y: {
      label: "Norm amplification",
      domain: [0, 31],
      ticks: [0, 5, 10, 15, 20, 25, 30]
    },
    marks: [
      Plot.gridY({ ticks: [5, 10, 15, 20, 25, 30] }),
      Plot.barY(data, {
        fx: "factor",
        x: "head_group",
        y: "norm_amplification",
        fill: "head_group",
        title: (d) => `⟨${d.head_group}⟩ · ${d.factor}: ${d.norm_amplification}`
      }),
      Plot.ruleY([0], { className: "figure-baseline" })
    ]
  })
});
