import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";
import { directLabels } from "./_methods";

// One line per training seed, ranked by its solve rate at N = 128 (the
// paper's legend order). The dotted line is the depth-supervised schedule T = d + 1.
const RANKS = [1, 2, 3, 4, 5];
const DOTTED = "1.5,3";

// Each seed is labelled at its line's end with the paper's legend values:
// schedule rate (depth levels per iteration; the CSV's levels_per_iteration)
// and solve rate at N = 128 (solve_rate_n128). Label heights are nudged
// apart where the lines end close together.
const SEED_LABELS = [
  { rank: 5, text: "0.8 levels/iter. · 31%", y: 22.4 },
  { rank: 4, text: "0.9 levels/iter. · 36%", y: 18.8 },
  { rank: 1, text: "1.6 levels/iter. · 99%", y: 12.9 },
  { rank: 3, text: "1.6 levels/iter. · 87%", y: 11.1 },
  { rank: 2, text: "2.1 levels/iter. · 94%", y: 9 }
];

export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/self-scheduled-first-fill.csv",
  size: "medium",
  plot: ({ data, width }) => ({
    width,
    height: 260,
    marginLeft: 40,
    marginRight: 150,
    marginTop: 26,
    marginBottom: 40,
    x: { label: "Node depth $d$", domain: [0.7, 19.3], ticks: [1, 4, 7, 10, 13, 16, 19] },
    color: { type: "identity" },
    y: { label: "Median first-fill time", domain: [0, 23.5], ticks: [1, 5, 10, 15, 20] },
    marks: [
      Plot.gridX({ ticks: [4, 7, 10, 13, 16] }),
      Plot.gridY({ ticks: [5, 10, 15, 20] }),
      Plot.line([[1, 2], [19, 20]], { x: "0", y: "1", stroke: NEUTRAL, strokeWidth: 1.5, strokeDasharray: DOTTED }),
      ...RANKS.flatMap((rank) => {
        const rows = data.filter((d) => d.rank === rank);
        return [
          Plot.line(rows, { x: "node_depth", y: "median_first_fill", stroke: SERIES[rank - 1], strokeWidth: 1.6 }),
          Plot.dot(rows, {
            x: "node_depth",
            y: "median_first_fill",
            r: 2.25,
            fill: SERIES[rank - 1],
            title: (d) =>
              `Seed ${d.rank}, depth ${d.node_depth}\nMedian first-fill time ${d.median_first_fill} (${(d.coverage * 100).toFixed(1)}% of nodes filled)`
          })
        ];
      }),
      ...directLabels([
        ...SEED_LABELS.map((l) => ({ text: l.text, x: 19, y: l.y, color: SERIES[l.rank - 1], dx: 8 })),
        { text: "Layer-by-layer", x: 19, y: 20.6, color: NEUTRAL, dx: 8 }
      ]),
      Plot.text(["Schedule rate · solve rate at N = 128"], {
        x: 19,
        y: 23.5,
        dx: 8,
        dy: -14,
        textAnchor: "start",
        fontSize: 11,
        fillOpacity: 0.75,
        text: (d: string) => d
      })
    ]
  })
});

