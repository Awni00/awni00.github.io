import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { TONE, TOKENS, bundle, sequence, slideMap, tensor, tensorHeading } from "./_parts";

// Redrawn from the left picture on slide 6 (PDF page 9) of
// public/publications/slides/abstractor-slides.pdf: sequence boxes, token
// positions, the 8x8 relation tensor and both arrows keep the slide's
// geometry (see _parts.ts). Labels follow the blog PNG (m tokens, phi_1/phi_2).
export default defineDiagram({
  size: "narrow",
  alt: "depiction of self-attention",
  draw: ({ width }) => {
    const m = slideMap(2.6, { x: 46.2, y: 46 }, { x: 12, y: 8 });
    const d = canvas(width, 236);

    const xs = [53.1, 65.3, 76.1, 90.2, 102.5].map(m.x);
    const lines = [xs[0], xs[1], xs[2], xs[4]];
    const top = { x0: m.x(46.2), x1: m.x(110.5), y0: m.y(59), y1: m.y(71.2) };
    const bottom = { x0: m.x(46.2), x1: m.x(110.5), y0: m.y(107.9), y1: m.y(120.1) };

    bundle(d, lines, lines, top.y1, bottom.y0, TONE.relation);
    sequence(d, top, xs, TOKENS("E"), TONE.encoder);
    sequence(d, bottom, xs, TOKENS("x"), TONE.input);
    d.label({ x: (top.x0 + top.x1) / 2, y: top.y0 - 13 }, "Encoder states");
    d.label({ x: (bottom.x0 + bottom.x1) / 2, y: bottom.y1 + 18 }, "Input sequence");

    // The tensor sits a little right of the slide's, to clear the formula.
    const shift = 10;
    const g = { x: m.x(124.3) + shift, y: m.y(74.1), size: m.len(30.5) };
    tensor(d, g.x, g.y, g.size, TONE.relation);
    tensorHeading(d, g.x + g.size / 2, m.y(58.5) - 14);

    // Tensor to attention, and input to tensor (curving up from the box's end).
    const ay = m.y(90.3);
    d.arrow({ x: g.x - 4, y: ay }, { x: xs[4] + 6, y: ay });
    d.edge(
      { x: bottom.x1 + 2, y: (bottom.y0 + bottom.y1) / 2, r: 0 },
      { x: g.x + g.size / 2, y: g.y + g.size + 2, r: 0 },
      { bend: -32 }
    );
    return d;
  }
});
