import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure, powerOfTen } from "../../../lib/figures";

const RULES = ["CoT-Cons", "E2E-Cons"];
const fmt = (v: number) => v.toFixed(3);

export default defineFigure({
  data: "cot-info/dfa-learning-curves.csv",
  size: "narrow",
  legend: [
    { label: "CoT-Cons", color: SERIES[0], key: "line" },
    { label: "E2E-Cons", color: SERIES[1], key: "line" },
    { label: "E2E error", color: NEUTRAL, key: "line" },
    { label: "CoT error", color: NEUTRAL, key: "line", dashed: true }
  ],
  plot: ({ data, width }) => {
    const series = (error: string) => data.filter((d) => d.error_type === error);
    const curve = (error: string, dashed: boolean) => [
      Plot.areaY(series(error), { x: "m", y1: "lower", y2: "upper", z: "learning_rule", fill: "learning_rule" }),
      Plot.line(series(error), {
        x: "m",
        y: "p_zero_error",
        z: "learning_rule",
        stroke: "learning_rule",
        strokeWidth: 2,
        strokeDasharray: dashed ? DASH : undefined
      }),
      Plot.dot(series(error), {
        x: "m",
        y: "p_zero_error",
        r: 4,
        fill: "learning_rule",
        fillOpacity: 0,
        title: (d) =>
          `${d.learning_rule}, ${error}, m = ${d.m}\n${fmt(d.p_zero_error)} (${fmt(d.lower)}–${fmt(d.upper)})`
      })
    ];
    return {
      width,
      height: 230,
      marginLeft: 44,
      marginRight: 14,
      marginBottom: 40,
      color: { domain: RULES, range: [SERIES[0], SERIES[1]] },
      x: {
        type: "log",
        domain: [0.71, 1410],
        label: "Sample size m",
        ticks: [1, 10, 100, 1000],
        tickFormat: powerOfTen
      },
      y: {
        label: "ℙ(ℛ(𝒜(Sₘ)) = 0)",
        domain: [-0.04, 1.05],
        ticks: [0, 0.2, 0.4, 0.6, 0.8, 1]
      },
      marks: [
        Plot.gridX({ ticks: [1, 10, 100, 1000] }),
        Plot.gridY({ ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] }),
        ...curve("E2E error", false),
        ...curve("CoT error", true)
      ]
    };
  }
});
