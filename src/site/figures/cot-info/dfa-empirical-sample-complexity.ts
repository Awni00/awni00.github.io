import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure, powerOfTen, type FigureRow } from "../../../lib/figures";

const RULES = ["CoT-Cons", "E2E-Cons"];

export default defineFigure({
  data: "cot-info/dfa-empirical-sample-complexity.csv",
  size: "narrow",
  legend: [
    { label: "CoT-Cons", color: SERIES[0], key: "line" },
    { label: "E2E-Cons", color: SERIES[1], key: "line" },
    { label: "E2E error", color: NEUTRAL, key: "line" },
    { label: "CoT error", color: NEUTRAL, key: "line", dashed: true }
  ],
  plot: ({ data, width }) => {
    const rows: FigureRow[] = data.map((d) => ({
      ...d,
      epsilon: 10 ** d.log10_epsilon
    }));
    const line = (error: string, dashed: boolean) =>
      Plot.line(
        rows.filter((d) => d.error_type === error),
        {
          x: "epsilon",
          y: "sample_complexity",
          z: "learning_rule",
          stroke: "learning_rule",
          strokeWidth: 2,
          strokeDasharray: dashed ? DASH : undefined,
          title: (d) => `${d.learning_rule}, ${error}`
        }
      );
    // Step vertices, for per-step hover tips.
    const steps = Plot.dot(rows, {
      x: "epsilon",
      y: "sample_complexity",
      r: 4,
      fill: "learning_rule",
      fillOpacity: 0,
      title: (d) => `${d.learning_rule}, ${d.error_type}\nε = ${d.epsilon.toPrecision(3)}: ${d.sample_complexity}`
    });
    return {
      width,
      height: 230,
      marginLeft: 44,
      marginRight: 20,
      marginBottom: 40,
      color: { domain: RULES, range: [SERIES[0], SERIES[1]] },
      x: {
        type: "log",
        domain: [1, 1e-4],
        label: "$\\varepsilon$",
        ticks: [1, 1e-1, 1e-2, 1e-3, 1e-4],
        tickFormat: powerOfTen
      },
      y: {
        label: "Empirical sample complexity",
        domain: [0, 1040],
        ticks: [0, 200, 400, 600, 800, 1000],
        tickFormat: String
      },
      marks: [
        Plot.gridY({ ticks: [200, 400, 600, 800, 1000] }),
        line("E2E error", false),
        line("CoT error", true),
        steps
      ]
    };
  }
});
