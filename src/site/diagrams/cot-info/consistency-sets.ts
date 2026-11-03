import { SERIES } from "../../../lib/figures";
import { canvas, defineDiagram } from "../../../lib/figures/diagram";

// Redrawn from figs/diagrams/cotcons_dynamic_diagram.pdf. Radii are the
// published ones as fractions of the frame's half-width, at three sample
// sizes; the arrows keep their published angles. CoT takes series 1 and E2E
// series 2, as in the post's charts.
const E2E = [0.9, 0.72, 0.45];
const COT = [0.72, 0.45, 0.15];
const E2E_ANGLE = -45;
const COT_ANGLE = 60;

const toward = (angle: number, r: number) => ({
  x: r * Math.cos((angle * Math.PI) / 180),
  y: r * Math.sin((angle * Math.PI) / 180)
});

export default defineDiagram({
  size: "medium",
  alt: "Three panels of the hypothesis class H as sample size m grows: the E2E consistency set is a disc around the true hypothesis that shrinks slowly, while the CoT consistency set inside it shrinks much faster.",
  legend: [
    { key: "dot", label: "$h_\\star$", color: "var(--color-fg-soft)" },
    { key: "region", label: "$\\texttt{E2E-Cons}(S_m;\\mathcal{H})$", color: SERIES[1] },
    { key: "region", label: "$\\texttt{CoT-Cons}(S_m;\\mathcal{H})$", color: SERIES[0] },
    { key: "arrow", label: "$\\varepsilon \\asymp d/m$", color: SERIES[1] },
    { key: "arrow", label: "$\\varepsilon \\asymp (\\mathcal{I}^{\\mathrm{CoT}}_{\\mathcal{D},h_\\star})^{-1}(d/m)$", color: SERIES[0] }
  ],
  draw: ({ width, compact }) => {
    const gap = compact ? 18 : 40;
    const side = (width - 2 * gap) / 3;
    const height = side + 46;
    const d = canvas(width, height);

    for (let i = 0; i < 3; i++) {
      const x = i * (side + gap);
      const c = { x: x + side / 2, y: side / 2 };
      const half = side / 2;
      d.frame(x, 0, side, side);
      d.circle(c, E2E[i] * half, { tone: 2 });
      d.circle(c, COT[i] * half, { tone: 1 });
      const e = toward(E2E_ANGLE, E2E[i] * half);
      const t = toward(COT_ANGLE, COT[i] * half);
      d.arrow(c, { x: c.x + e.x, y: c.y + e.y }, { tone: 2 });
      d.arrow(c, { x: c.x + t.x, y: c.y + t.y }, { tone: 1 });
      d.dot(c, { r: 2.75 });
      d.label({ x: x + side - 6, y: 4 }, "$\\mathcal{H}$", { anchor: "end", baseline: "top" });
    }

    const y = side + 16;
    const from = side / 2;
    const to = width - side / 2;
    d.arrow({ x: from, y }, { x: to, y }, { tone: "muted" });
    d.label({ x: width / 2, y: y + 18 }, "Increasing sample size $m$", { size: "sm", tone: "muted" });
    return d;
  }
});
