import * as Plot from "@observablehq/plot";
import { defineFigure } from "../../../lib/figures";
import { colorOf, METHODS, SOLVE_RATE_Y, directLabels, methodLines, methodOf, percent, trainingRange } from "./_methods";

// Five-seed mean ± 1 SEM (bands clipped to [0, 1], as in the paper).
// Every line is labelled directly; there is no legend.
export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/method-ood-comparison.csv",
  size: "narrow",
  plot: ({ data, width }) => ({
    width,
    height: 260,
    marginTop: 18,
    marginLeft: 44,
    marginRight: 12,
    marginBottom: 40,
    x: { label: "Graph size", domain: [8, 128], ticks: [8, 32, 48, 64, 80, 96, 112, 128] },
    y: SOLVE_RATE_Y,
    color: { type: "identity" },
    marks: [
      Plot.gridX({ ticks: [32, 48, 64, 80, 96, 112] }),
      Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
      ...trainingRange(8, 32, "Training\nrange"),
      ...METHODS.map((m) =>
        Plot.areaY(
          data.filter((d) => d.method === m.id),
          {
            x: "graph_size",
            y1: (d) => Math.max(0, d.mean - d.sem),
            y2: (d) => Math.min(1, d.mean + d.sem),
            fill: () => m.color
          }
        )
      ),
      ...methodLines(
        data,
        "mean",
        (d) => `${methodOf(d).label}, N = ${d.graph_size}\n${percent(d.mean)} ± ${percent(d.sem)} (mean ± SEM, ${d.n_seeds} seeds)`
      ),
      ...directLabels([
        { text: "Discrete LSS + EC", x: 128, y: 1, color: colorOf("Discrete LSS + EC"), anchor: "end", dy: -9 },
        { text: "Discrete LSS", x: 128, y: 0.94, color: colorOf("Discrete LSS"), anchor: "end", dy: 11 },
        { text: "Self-Scheduled LSS", x: 128, y: 0.69, color: colorOf("Self-Scheduled LSS"), anchor: "end", dy: 14 },
        { text: "Continuous LSS", x: 128, y: 0.29, color: colorOf("Continuous LSS"), anchor: "end", dy: 14 },
        { text: "Chain-of-Thought", x: 66, y: 0, color: colorOf("Chain-of-Thought"), dy: -8 },
        { text: "Feedforward E2E", x: 34, dx: 6, y: 0.3, color: colorOf("Feedforward E2E") },
        { text: "Recurrent E2E", x: 34, dx: 6, y: 0.18, color: colorOf("Recurrent E2E") }
      ])
    ]
  })
});
