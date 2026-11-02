import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure, powerOfTen } from "../../../lib/figures";

// The dashed curve is the line y = ε, drawn from its formula.
const EPSILON_LINE = Array.from({ length: 101 }, (_, i) => 10 ** (-2 * (i / 100)));

export default defineFigure({
  data: "cot-info/linear-thresh-cot-info-vs-epsilon.csv",
  size: "narrow",
  plot: ({ data, width }) => {
    const curve = data
      .filter((d) => d.series === "cot_information")
      .map((d) => ({ epsilon: 10 ** d.log10_epsilon, value: d.value }));
    const rule = data.filter((d) => d.series === "vertical_rule").map((d) => 10 ** d.log10_epsilon);
    return {
      width,
      height: 230,
      marginLeft: 44,
      marginRight: 20,
      marginBottom: 40,
      x: {
        type: "log",
        domain: [1, 1e-2],
        label: "ε",
        ticks: [1, 1e-1, 1e-2],
        tickFormat: powerOfTen
      },
      y: {
        label: "ℐᶜᵒᵀ(ε; ℋ, h*)",
        domain: [-0.15, 3.3],
        ticks: [0, 1, 2, 3],
        tickFormat: String
      },
      marks: [
        Plot.gridX({ ticks: [1, 1e-1, 1e-2] }),
        Plot.gridY({ ticks: [0, 1, 2, 3] }),
        Plot.line(EPSILON_LINE, {
          x: (e) => e,
          y: (e) => e,
          stroke: NEUTRAL,
          strokeWidth: 1.5,
          strokeDasharray: DASH
        }),
        Plot.ruleX(rule, {
          stroke: NEUTRAL,
          strokeWidth: 1.5,
          strokeDasharray: DASH,
          title: (e) => `ε = ${e.toPrecision(3)}`
        }),
        Plot.line(curve, { x: "epsilon", y: "value", stroke: SERIES[0], strokeWidth: 2, clip: true }),
        Plot.dot(curve, {
          x: "epsilon",
          y: "value",
          r: 4,
          fill: SERIES[0],
          fillOpacity: 0,
          clip: true,
          title: (d) => `ε = ${d.epsilon.toPrecision(3)}\nℐᶜᵒᵀ = ${d.value.toFixed(3)}`
        })
      ]
    };
  }
});
