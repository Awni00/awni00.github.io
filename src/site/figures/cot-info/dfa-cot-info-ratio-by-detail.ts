import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure, powerOfTen, type FigureRow } from "../../../lib/figures";

// CoT detail level is ordinal (1–10): one hue, ramped by opacity toward SERIES[0].
const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
const opacity = (level: number) => 0.18 + (0.82 * (level - 1)) / 9;

// The dashed curve in the published figure is the line y = ε, drawn from its formula.
const EPSILON_LINE = Array.from({ length: 61 }, (_, i) => 10 ** (-3 * (i / 60)));

export default defineFigure({
  data: "cot-info/dfa-cot-info-ratio-by-detail.csv",
  size: "narrow",
  legend: [{ key: "ramp", label: "CoT detail level", color: SERIES[0], opacities: LEVELS.map(opacity), from: "1", to: "10" }],
  plot: ({ data, width }) => {
    const rows: FigureRow[] = data.map((d) => ({ ...d, epsilon: 10 ** d.log10_epsilon }));
    return {
      width,
      height: 230,
      marginLeft: 44,
      marginRight: 20,
      marginBottom: 40,
      x: {
        type: "log",
        domain: [1, 1e-3],
        label: "$\\varepsilon$",
        ticks: [1, 1e-1, 1e-2, 1e-3],
        tickFormat: powerOfTen
      },
      y: {
        label: "$\\mathcal{I}^{\\mathrm{CoT}}_{\\mathcal{D},h^*}(\\varepsilon;\\mathcal{H})/\\varepsilon^+$",
        domain: [-15, 660],
        ticks: [0, 200, 400, 600]
      },
      marks: [
        Plot.gridX({ ticks: [1, 1e-1, 1e-2, 1e-3] }),
        Plot.gridY({ ticks: [0, 200, 400, 600] }),
        Plot.line(EPSILON_LINE, {
          x: (e) => e,
          y: (e) => e,
          stroke: NEUTRAL,
          strokeWidth: 1.5,
          strokeDasharray: DASH
        }),
        ...LEVELS.map((level) =>
          Plot.line(
            rows.filter((d) => d.detail_level === level),
            {
              x: "epsilon",
              y: "ratio",
              stroke: SERIES[0],
              strokeOpacity: opacity(level),
              strokeWidth: 1.75,
              title: () => `CoT detail level ${level}`
            }
          )
        ),
        Plot.dot(rows, {
          x: "epsilon",
          y: "ratio",
          r: 3,
          fill: SERIES[0],
          fillOpacity: 0,
          title: (d) => `CoT detail level ${d.detail_level}\nε = ${d.epsilon.toPrecision(3)}: ${d.ratio.toFixed(1)}`
        })
      ]
    };
  }
});
