import * as Plot from "@observablehq/plot";
import { SERIES, defineFigure, powerOfTen } from "../../../lib/figures";

const RULES = ["CoT-Cons", "E2E-Cons"];
const fmt = (v: number) => v.toFixed(3);

export default defineFigure({
  data: "cot-info/linear-thresh-learning-curves.csv",
  size: "narrow",
  legend: [
    { label: "CoT-Cons", color: SERIES[0], key: "line" },
    { label: "E2E-Cons", color: SERIES[1], key: "line" }
  ],
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marginLeft: 44,
    marginRight: 14,
    marginBottom: 40,
    color: { domain: RULES, range: [SERIES[0], SERIES[1]] },
    x: {
      type: "log",
      domain: [0.8, 125],
      label: "Sample size m",
      ticks: [1, 10, 100],
      tickFormat: powerOfTen
    },
    y: {
      label: "ℙ(L(𝒜(Sₘ)) = 0)",
      domain: [-0.04, 1.05],
      ticks: [0, 0.2, 0.4, 0.6, 0.8, 1]
    },
    marks: [
      Plot.gridX({ ticks: [1, 10, 100] }),
      Plot.gridY({ ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] }),
      Plot.areaY(data, { x: "m", y1: "lower", y2: "upper", z: "learning_rule", fill: "learning_rule" }),
      Plot.line(data, { x: "m", y: "p_zero_error", z: "learning_rule", stroke: "learning_rule", strokeWidth: 2 }),
      Plot.dot(data, {
        x: "m",
        y: "p_zero_error",
        r: 4,
        fill: "learning_rule",
        fillOpacity: 0,
        title: (d) => `${d.learning_rule}, m = ${d.m}\n${fmt(d.p_zero_error)} (${fmt(d.lower)}–${fmt(d.upper)})`
      })
    ]
  })
});
