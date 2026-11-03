import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

// The published axis titles, in TeX.
const axisLabel = (pc: string) => `$\\langle R[g], \\boldsymbol{f} \\rangle_{\\mathrm{rel}}$ [${pc}]`;

export default defineFigure({
  data: "relational-convolutions/contains-set-conv-rep.csv",
  size: "medium",
  title: "Convolutional Representation (PC1 vs PC2)",
  legend: [
    { label: "not set", color: NEUTRAL, key: "dot" },
    { label: "set", color: SERIES[0], key: "dot" }
  ],
  plot: ({ data, width }) => ({
    width,
    height: 380,
    marginLeft: 48,
    marginBottom: 40,
    x: { label: axisLabel("PC1"), nice: true, inset: 6 },
    y: { label: axisLabel("PC2"), nice: true, inset: 6 },
    color: { domain: ["not set", "set"], range: [NEUTRAL, SERIES[0]] },
    marks: [
      Plot.gridX(),
      Plot.gridY(),
      // 2,160 points: no per-point hover tip, to keep the inline SVG small.
      Plot.dot(data, { x: "pc1", y: "pc2", fill: "label", r: 2, fillOpacity: 0.6 })
    ]
  })
});
