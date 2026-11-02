import * as Plot from "@observablehq/plot";
import { DASH, NEUTRAL, SERIES, defineFigure, type FigureRow } from "../../../lib/figures";

const MODELS = ["DAT", "Transformer"];
const COLORS = [SERIES[0], NEUTRAL];
const formatCount = (v: number) => (v >= 1e9 ? `${+(v / 1e9).toFixed(2)}B` : `${+(v / 1e6).toFixed(0)}M`);

// One label per perplexity level, beside the pair's right ends (geometric
// mean, since y is log).
function endLabels(data: FigureRow[]) {
  const levels = [...new Set(data.map((d) => d.perplexity))];
  return levels.map((perplexity) => {
    const ends = MODELS.map((model) => {
      const rows = data.filter((d) => d.perplexity === perplexity && d.model === model);
      return rows.reduce((a, b) => (b.params > a.params ? b : a));
    });
    return { perplexity, tokens: Math.sqrt(ends[0].tokens * ends[1].tokens) };
  });
}

export default defineFigure({
  data: "dual-attention/language-modeling-scaling-laws.csv",
  size: "medium",
  title: "Language Modeling Scaling Laws",
  legend: [
    { label: "DAT", color: COLORS[0], key: "line" },
    { label: "Transformer", color: COLORS[1], key: "line", dashed: true }
  ],
  plot: ({ data, width }) => ({
    width,
    height: 380,
    marginLeft: 48,
    marginRight: 40,
    marginTop: 22,
    marginBottom: 40,
    x: {
      label: "Parameter Count",
      domain: [300e6, 1.35e9],
      ticks: [350e6, 750e6, 1.3e9],
      tickFormat: formatCount
    },
    y: {
      type: "log",
      label: "Tokens",
      domain: [0.7e9, 10e9],
      ticks: [1e9, 2e9, 5e9, 10e9],
      tickFormat: formatCount
    },
    color: { domain: MODELS, range: COLORS },
    marks: [
      Plot.gridY({ ticks: [1e9, 2e9, 5e9, 10e9] }),
      Plot.frame({ anchor: "bottom" }),
      ...MODELS.map((model, i) =>
        Plot.lineY(
          data.filter((d) => d.model === model),
          {
            x: "params",
            y: "tokens",
            z: "perplexity",
            stroke: COLORS[i],
            strokeWidth: 1.75,
            strokeDasharray: model === "Transformer" ? DASH : undefined
          }
        )
      ),
      Plot.dot(data, {
        x: "params",
        y: "tokens",
        fill: "model",
        r: 2.5,
        title: (d) =>
          `${d.model} · perplexity ${d.perplexity}\n${formatCount(d.params)} parameters\n${formatCount(d.tokens)} tokens`
      }),
      Plot.text(endLabels(data), {
        x: 1.31e9,
        y: "tokens",
        text: (d) => String(d.perplexity),
        textAnchor: "start",
        dx: 8
      }),
      Plot.text(["Perplexity"], {
        frameAnchor: "top-right",
        textAnchor: "end",
        lineAnchor: "bottom",
        dx: 34,
        dy: -6
      })
    ]
  })
});
