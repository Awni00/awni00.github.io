import * as Plot from "@observablehq/plot";
import { defineFigure } from "../../../lib/figures";
import { colorOf, SOLVE_RATE_Y, directLabels, methodLines, methodOf, percent, trainingRange } from "./_methods";

// Best of five seeds per method (the paper's selection); single seeds, so no bands.
export default defineFigure({
  data: "algorithmic-generalization-transformer-architectures/stronger-ood-best-seed.csv",
  size: "medium",
  plot: ({ data, width }) => ({
    width,
    height: 280,
    marginTop: 18,
    marginLeft: 44,
    marginRight: 14,
    marginBottom: 40,
    x: { label: "Graph size", domain: [8, 256], ticks: [8, 32, 64, 96, 128, 160, 192, 224, 256] },
    y: SOLVE_RATE_Y,
    color: { type: "identity" },
    marks: [
      Plot.gridX({ ticks: [32, 64, 96, 128, 160, 192, 224] }),
      Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
      ...trainingRange(8, 32, "Training\nrange"),
      ...methodLines(
        data,
        "accuracy",
        (d) => `${methodOf(d).label}, N = ${d.graph_size}\n${percent(d.accuracy)} (${d.correct_count} / ${d.examples} solved)`
      ),
      ...directLabels([
        { text: "Discrete LSS + EC", x: 256, y: 1, color: colorOf("Discrete LSS + EC"), anchor: "end", dy: -9 },
        { text: "Discrete LSS", x: 256, y: 0.967, color: colorOf("Discrete LSS"), anchor: "end", dy: 13 },
        { text: "Self-Scheduled LSS", x: 256, y: 0.716, color: colorOf("Self-Scheduled LSS"), anchor: "end", dy: 14 },
        { text: "Continuous LSS", x: 160, y: 0.345, color: colorOf("Continuous LSS"), anchor: "end", dx: -8, dy: 10 },
        { text: "Chain-of-Thought", x: 70, y: 0, color: colorOf("Chain-of-Thought"), dy: -8 },
        { text: "Feedforward E2E", x: 34, dx: 8, y: 0.3, color: colorOf("Feedforward E2E") },
        { text: "Recurrent E2E", x: 34, dx: 8, y: 0.18, color: colorOf("Recurrent E2E") }
      ])
    ]
  })
});
