import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

const fmt = (v: number) => v.toFixed(3);

export default defineFigure({
  data: "cot-info/linear-thresh-cot-info-vs-e2e-diff.csv",
  size: "narrow",
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginRight: 14,
    marginBottom: 40,
    x: {
      label: "$\\mathbb{P}(h_1^{e2e}(x) \\neq h_2^{e2e}(x))$",
      domain: [-0.05, 1.05],
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1]
    },
    y: {
      label: "$\\mathcal{I}^{\\mathrm{CoT}}_{\\mathcal{D}}(h_1, h_2)$",
      domain: [-0.2, 5.1],
      ticks: [0, 1, 2, 3, 4, 5],
      tickFormat: String
    },
    marks: [
      Plot.gridX({ ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] }),
      Plot.gridY({ ticks: [0, 1, 2, 3, 4, 5] }),
      Plot.line(
        [
          [0, 0],
          [1, 1]
        ],
        { stroke: NEUTRAL, strokeWidth: 1.5, strokeDasharray: DASH }
      ),
      Plot.dot(data, {
        x: "e2e_disagreement",
        y: "cot_information",
        r: 3,
        fill: SERIES[0],
        fillOpacity: 0.85,
        title: (d) => `ℙ(h₁ᵉ²ᵉ(x) ≠ h₂ᵉ²ᵉ(x)) = ${fmt(d.e2e_disagreement)}\nℐᶜᵒᵀ(h₁, h₂) = ${fmt(d.cot_information)}`
      })
    ]
  })
});
