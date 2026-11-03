import * as Plot from "@observablehq/plot";
import { DASH, defineFigure } from "../../../lib/figures";
import { METHODS, PHASE_ORDER } from "./_shared";

/** Arrow segment centred on the line, 18% of its length (ENDPOINT_LOLLIPOP_ARROW_*). */
const ARROW = [0.41, 0.59];

export default defineFigure({
  data: "latent-strategies-in-lms/phase-space.csv",
  size: "narrow",
  alt: "Training trajectories in fidelity-alignment phase space, from first to last checkpoint, for each objective variant.",
  legend: PHASE_ORDER.map((m) => ({ label: METHODS[m].label, color: METHODS[m].color, key: "line" as const, dashed: METHODS[m].dashed })),
  plot: ({ data, width }) => {
    const ends = PHASE_ORDER.map((method) => {
      const rows = data.filter((d) => d.method === method).sort((a, b) => a.checkpoint - b.checkpoint);
      const [s, e] = [rows[0], rows[rows.length - 1]];
      return { method, x1: s.fidelity, y1: s.alignment, x2: e.fidelity, y2: e.alignment, p1: s.progress, p2: e.progress };
    });
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const color = { domain: [...PHASE_ORDER], range: PHASE_ORDER.map((m) => METHODS[m].color) };
    const dashed = ends.filter((d) => METHODS[d.method].dashed);
    const solid = ends.filter((d) => !METHODS[d.method].dashed);
    const tip = (d: any, which: "start" | "end") =>
      `${METHODS[d.method].label}, ${which} of training\nFidelity ${(which === "start" ? d.x1 : d.x2).toFixed(3)} · Alignment ${(which === "start" ? d.y1 : d.y2).toFixed(3)}`;
    return {
      width,
      height: 290,
      marginLeft: 40,
      marginRight: 10,
      marginBottom: 38,
      color,
      x: { label: "Distributional Fidelity", domain: [0.6, 1.01], ticks: [0.6, 0.7, 0.8, 0.9, 1], tickFormat: ".1f" },
      y: { label: "Strategy-Alignment", domain: [0.4, 1.01], ticks: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], tickFormat: ".1f" },
      marks: [
        Plot.gridX({ ticks: [0.7, 0.8, 0.9, 1] }),
        Plot.gridY({ ticks: [0.5, 0.6, 0.7, 0.8, 0.9, 1] }),
        Plot.link(solid, { x1: "x1", y1: "y1", x2: "x2", y2: "y2", stroke: "method", strokeWidth: 1.75, strokeOpacity: 0.8 }),
        Plot.link(dashed, { x1: "x1", y1: "y1", x2: "x2", y2: "y2", stroke: "method", strokeWidth: 1.75, strokeOpacity: 0.8, strokeDasharray: DASH }),
        Plot.arrow(ends, {
          x1: (d) => lerp(d.x1, d.x2, ARROW[0]),
          y1: (d) => lerp(d.y1, d.y2, ARROW[0]),
          x2: (d) => lerp(d.x1, d.x2, ARROW[1]),
          y2: (d) => lerp(d.y1, d.y2, ARROW[1]),
          stroke: "method",
          strokeWidth: 1.5,
          headLength: 7
        }),
        Plot.dot(ends, { x: "x1", y: "y1", stroke: "method", fill: "var(--color-bg)", r: 4.5, strokeWidth: 1.6, title: (d) => tip(d, "start") }),
        Plot.dot(ends, { x: "x2", y: "y2", fill: "method", stroke: "var(--color-bg)", r: 5, strokeWidth: 1, title: (d) => tip(d, "end") })
      ]
    };
  }
});
