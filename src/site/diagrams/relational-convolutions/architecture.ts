import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { TONE, ellipsis } from "./_shared";

// Redrawn by eye from public/blog/relational-convolutions/figs/relconv_architecture.png
// (no vector source was found). Same stack, read bottom to top, with each
// tensor's shape beside the arrow that carries it. Blocks take their fixed
// tones (see _shared.ts); arrows and labels are ink, shapes muted (at 13px,
// not 12, so their scripts stay legible).
const BLOCK = { w: 158, h: 30 };
const ARROW = 30;

export default defineDiagram({
  size: "narrow",
  alt: "Relational convolutional network, read bottom to top: the input objects pass through an initial embedder, then alternating inner product relation and relational convolution layers, repeated up to layer l, with the shape of each intermediate tensor annotated.",
  draw: ({ width }) => {
    const cx = BLOCK.w / 2 + 1;
    const note = BLOCK.w + 18;
    const top = 14;
    // Top to bottom: each step is an arrow (with its shape) or a block.
    type Step =
      | { kind: "arrow"; shape?: string }
      | { kind: "block"; name: string; tone: 1 | 2 | 6 }
      | { kind: "dots" };
    const steps: Step[] = [
      { kind: "arrow", shape: "$\\left(z_1^{(l)}, \\ldots, z_{n_l}^{(l)}\\right) \\in \\mathbb{R}^{n_l \\times d_l}$" },
      { kind: "block", name: "Relational convolution", tone: TONE.convolution },
      { kind: "arrow", shape: "$R^{(l-1)} \\in \\mathbb{R}^{n_{l-1} \\times n_{l-1} \\times r_{l-1}}$" },
      { kind: "block", name: "Inner product relation", tone: TONE.relation },
      { kind: "arrow" },
      { kind: "dots" },
      { kind: "arrow", shape: "$\\left(z_1^{(2)}, \\ldots, z_{n_2}^{(2)}\\right) \\in \\mathbb{R}^{n_2 \\times d_2}$" },
      { kind: "block", name: "Relational convolution", tone: TONE.convolution },
      { kind: "arrow", shape: "$R^{(1)} \\in \\mathbb{R}^{n \\times n \\times r_1}$" },
      { kind: "block", name: "Inner product relation", tone: TONE.relation },
      { kind: "arrow", shape: "$\\left(z_1^{(1)}, \\ldots, z_n^{(1)}\\right) \\in \\mathbb{R}^{n \\times d}$" },
      { kind: "block", name: "Initial embedder", tone: TONE.embedder },
      { kind: "arrow" }
    ];
    const extent = (s: Step) => (s.kind === "arrow" ? ARROW : s.kind === "block" ? BLOCK.h : 26);
    const height = top + steps.reduce((sum, s) => sum + extent(s), 0) + 26;
    const d = canvas(width, height);

    let y = top;
    for (const step of steps) {
      const h = extent(step);
      if (step.kind === "arrow") {
        d.arrow({ x: cx, y: y + h }, { x: cx, y });
        if (step.shape) d.label({ x: note, y: y + h / 2 }, step.shape, { anchor: "start", tone: "muted" });
      } else if (step.kind === "block") {
        d.rect(cx - BLOCK.w / 2, y, BLOCK.w, BLOCK.h, { tone: step.tone, fill: "strong", radius: 4 });
        d.label({ x: cx, y: y + BLOCK.h / 2 }, step.name, { tone: "inverse" });
      } else {
        ellipsis(d, { x: cx, y: y + h / 2 }, 6, true);
      }
      y += h;
    }
    d.label({ x: cx, y: y + 13 }, "$(x_1, \\ldots, x_n) \\in \\mathcal{X}^n$");
    return d;
  }
});
