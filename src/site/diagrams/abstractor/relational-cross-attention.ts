import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { TONE, TOKENS, bundle, sequence, slideMap, tensor, tensorHeading } from "./_parts";

// Redrawn from the right picture on slide 6 (PDF page 9) of
// public/publications/slides/abstractor-slides.pdf: sequence boxes, token
// positions, the 8x8 relation tensor, the bottleneck rule and both arrows
// keep the slide's geometry (see _parts.ts). Labels follow the blog PNG
// (m tokens, phi_1/phi_2); the published dash-dot rule is dashed here.
export default defineDiagram({
  size: "narrow",
  alt: "depiction of relational cross-attention",
  draw: ({ width }) => {
    const m = slideMap(2.45, { x: 191.3, y: 46 }, { x: 10, y: 16 });
    const d = canvas(width, 238);

    const ins = [197.0, 209.1, 220.6, 235.2, 247.2].map(m.x);
    const xs = [271.4, 283.5, 294.3, 309.3, 320.8].map(m.x);
    const lines = [xs[0], xs[1], xs[2], xs[4]];
    const input = { x0: m.x(191.3), x1: m.x(255.6), y0: m.y(109.6), y1: m.y(121.8) };
    const top = { x0: m.x(265.1), x1: m.x(329.4), y0: m.y(63.5), y1: m.y(75.6) };
    const bottom = { x0: m.x(265.1), x1: m.x(329.4), y0: m.y(109.6), y1: m.y(121.8) };

    // Relational bottleneck: a rule between the input side and the symbols.
    const rx = m.x(263.4);
    d.line({ x: rx, y: m.y(65) }, { x: rx, y: m.y(121.8) }, { tone: "muted", dashed: true });
    // Set above the tensor's formula (the slide's sits beside it), at 13px
    // so it stays legible on phones.
    d.label({ x: rx, y: 10 }, "Relational", { tone: "muted" });
    d.label({ x: rx, y: 25 }, "bottleneck", { tone: "muted" });

    bundle(d, lines, lines, top.y1, bottom.y0, TONE.relation);
    sequence(d, input, ins, TOKENS("x"), TONE.input);
    sequence(d, top, xs, TOKENS("A"), TONE.abstract);
    sequence(d, bottom, xs, TOKENS("s"), TONE.symbols);
    d.label({ x: (top.x0 + top.x1) / 2, y: top.y0 - 13 }, "Abstract states");
    d.label({ x: (input.x0 + input.x1) / 2, y: input.y1 + 18 }, "Input sequence");
    d.label({ x: (bottom.x0 + bottom.x1) / 2, y: bottom.y1 + 18 }, "Symbols");

    const g = { x: m.x(207.9), y: m.y(71.4), size: m.len(30.8) };
    const cx = g.x + g.size / 2;
    tensor(d, g.x, g.y, g.size, TONE.relation);
    tensorHeading(d, cx, m.y(57) - 16);

    // Input to tensor, and tensor to the attention between symbols and states.
    d.arrow({ x: cx, y: input.y0 - 2 }, { x: cx, y: g.y + g.size + 2 });
    const ay = m.y(87.3);
    d.arrow({ x: g.x + g.size + 4, y: ay }, { x: xs[0] - 5, y: ay });
    return d;
  }
});
