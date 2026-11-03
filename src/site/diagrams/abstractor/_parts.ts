import type { DiagramCanvas, Point, Tone } from "../../../lib/figures/diagram";

/**
 * Shared pieces of the post's two attention diagrams, redrawn from slide 6
 * (PDF page 9) of public/publications/slides/abstractor-slides.pdf, which
 * holds both pictures as vectors. Positions are the slide's, in points,
 * mapped to pixels by `slideMap`.
 *
 * Colour by role, as in the paper's figures and the same across the
 * relational posts: sensory information is red (series 1), relational
 * information blue (series 2) and symbols green (series 6). So the input
 * sequence is red; the relation tensor, the attention it drives and the
 * abstract states are blue; encoder states, which mix the two, keep the
 * published purple (series 5).
 */
export const TONE = {
  input: 1,
  relation: 2,
  symbols: 6,
  encoder: 5,
  abstract: 2
} as const satisfies Record<string, Tone>;

/** Map slide points to canvas pixels: `scale` px per pt, slide `origin` at `offset`. */
export const slideMap = (scale: number, origin: Point, offset: Point) => ({
  x: (x: number) => offset.x + (x - origin.x) * scale,
  y: (y: number) => offset.y + (y - origin.y) * scale,
  len: (l: number) => l * scale
});

/** A rounded sequence box holding token labels at `xs`. */
export const sequence = (
  d: DiagramCanvas,
  box: { x0: number; x1: number; y0: number; y1: number },
  xs: number[],
  names: string[],
  tone: Tone
) => {
  const h = box.y1 - box.y0;
  d.rect(box.x0, box.y0, box.x1 - box.x0, h, { tone, fill: "strong", radius: h / 2 });
  const y = (box.y0 + box.y1) / 2;
  names.forEach((name, i) => d.label({ x: xs[i], y }, name, { size: "lg", tone: "inverse" }));
};

/** Complete bipartite attention lines between token positions on two rows. */
export const bundle = (d: DiagramCanvas, top: number[], bottom: number[], y0: number, y1: number, tone: Tone) => {
  for (const a of top) for (const b of bottom) d.line({ x: a, y: y0 }, { x: b, y: y1 }, { tone, strokeWidth: 1 });
};

/** An n-by-n relation tensor drawn as solid cells with gaps. */
export const tensor = (d: DiagramCanvas, x: number, y: number, size: number, tone: Tone, n = 8, gap = 1.5) => {
  const pitch = (size + gap) / n;
  const cell = pitch - gap;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) d.rect(x + j * pitch, y + i * pitch, cell, cell, { tone, fill: "strong" });
};

/** Relation tensor heading and its formula, centred over the tensor. */
export const tensorHeading = (d: DiagramCanvas, cx: number, y: number) => {
  d.label({ x: cx, y }, "Relation tensor");
  d.label({ x: cx, y: y + 19 }, "$R_{ij} = \\langle \\phi_1(x_i), \\phi_2(x_j) \\rangle$");
};

export const TOKENS = (symbol: string) => [1, 2, 3].map((i) => `$${symbol}_${i}$`).concat(["$\\cdots$", `$${symbol}_m$`]);
