import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure } from "../../../lib/figures";

// The published figure overlays the three groups' bars (so var 2 is hidden
// behind the others); here they sit side by side, as in the layer-0 chart.
const GROUPS = ["var 0", "var 1", "var 2"];
const COLORS = [SERIES[0], SERIES[1], SERIES[2]];
const FACTORS = ["syntax", "variable", "operation", "value"];

export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/l1-ov-operator-norm.csv",
  size: "narrow",
  mono: ["fx", "legend"],
  legend: GROUPS.map((g, i) => ({ label: `⟨${g}⟩`, color: COLORS[i], key: "swatch" })),
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginBottom: 28,
    color: { domain: GROUPS, range: COLORS },
    fx: { domain: FACTORS, label: null, axis: "bottom", padding: 0.14 },
    x: { domain: GROUPS, axis: null, paddingInner: 0.08, paddingOuter: 0 },
    y: { label: "Norm amplification", domain: [0, 21], ticks: [0, 5, 10, 15, 20] },
    marks: [
      Plot.gridY({ ticks: [5, 10, 15, 20] }),
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
