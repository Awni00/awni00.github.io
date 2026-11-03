import type { DiagramCanvas, Point } from "../../../lib/figures/diagram";
import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { drawGraph, ellipsis, type Graph, type NodeKind } from "./_shared";

// Redrawn by eye from public/blog/relational-convolutions/figs/relconv_diagram.png
// (no vector source was found); positions are the PNG's, scaled by 760/1800.
// Colours as published: edges (relations) blue, nodes (objects) red or blue
// by kind; edge opacities follow the published ones (relation strength).

const PENTAGON: Point[] = [
  { x: 0, y: 0 },
  { x: -39, y: 29 },
  { x: 39, y: 29 },
  { x: -19, y: 69 },
  { x: 19, y: 69 }
];
// Edge opacities, by node pair, for the three published subtensors
// (top, upper-left, upper-right, lower-left, lower-right).
const K5_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 4],
  [1, 2], [0, 3], [0, 4], [1, 4], [2, 3]
];
const SUBTENSORS: { kinds: NodeKind[]; opacity: number[] }[] = [
  { kinds: ["a", "a", "b", "a", "b"], opacity: [0.7, 0.7, 1, 1, 0.7, 1, 1, 0.4, 0.7, 0.7] },
  { kinds: ["a", "a", "b", "b", "a"], opacity: [0.7, 0.7, 1, 1, 0.7, 1, 1, 0.4, 0.7, 0.7] },
  { kinds: ["a", "b", "a", "b", "a"], opacity: [0.7, 0.7, 1, 1, 0.7, 1, 0.7, 0.4, 1, 0.7] }
];

const subtensor = (top: Point, k: number, s: number): Graph => ({
  nodes: PENTAGON.map((p, i) => ({ at: { x: top.x + p.x * s, y: top.y + p.y * s }, kind: SUBTENSORS[k].kinds[i] })),
  edges: K5_EDGES.map(([i, j], e) => [i, j, SUBTENSORS[k].opacity[e]])
});

const filter = (c: Point, s: number): Graph => ({
  nodes: [
    { at: { x: c.x, y: c.y - 25 * s }, kind: "a" },
    { at: { x: c.x - 28 * s, y: c.y + 13 * s }, kind: "a" },
    { at: { x: c.x + 28 * s, y: c.y + 13 * s }, kind: "a" }
  ],
  edges: [
    [0, 1, 0.7],
    [0, 2, 0.7],
    [1, 2, 1]
  ]
});

const REL = "$\\langle \\cdot, \\cdot \\rangle_{\\mathrm{rel}}$";
const F = "$\\boldsymbol{f} \\in \\mathbb{R}^{s \\times s \\times d_r \\times n_f}$";
const RG = "$R[g], g \\in \\mathcal{G}$";
const CONV = "$R * \\boldsymbol{f}$";
const Z = ["$z_1$", "$z_2$", "$z_{n_g}$"];

const relArrow = (d: DiagramCanvas, a: Point, b: Point, at: Point, anchor: "start" | "middle" | "end") => {
  d.arrow(a, b, { head: "both" });
  d.label(at, REL, { anchor, halo: true });
};

export default defineDiagram({
  size: "full",
  alt: "The relational convolution: a graphlet filter, drawn as a small graph, is compared by the relational inner product with each relation subtensor R[g] for g in G, drawn as small graphs over groups of objects, giving one output z_1, z_2, up to z_{n_g} per group; together these are R * f.",
  draw: ({ width, compact }) => (compact ? drawCompact(width) : drawWide(width))
});

function drawWide(width: number) {
  const k = width / 760;
  const d = canvas(width, 352);
  const X = (x: number) => x * k;

  // Row labels, in the left column.
  const lx = X(108);
  d.label({ x: lx, y: 34 }, "Graphlet filters");
  d.label({ x: lx, y: 56 }, F);
  d.label({ x: lx, y: 190 }, "Relation subtensors");
  d.label({ x: lx, y: 213 }, RG);
  d.label({ x: lx, y: 320 }, CONV);

  // Comparisons, under the graphs.
  relArrow(d, { x: X(287), y: 151 }, { x: X(384), y: 84 }, { x: X(318), y: 108 }, "end");
  relArrow(d, { x: X(428), y: 144 }, { x: X(428), y: 91 }, { x: X(440), y: 118 }, "start");
  relArrow(d, { x: X(654), y: 147 }, { x: X(502), y: 84 }, { x: X(596), y: 103 }, "start");

  drawGraph(d, filter({ x: X(435), y: 52 }, 1), 8);

  const xs = [X(274), X(428), X(681)];
  xs.forEach((x, i) => {
    drawGraph(d, subtensor({ x, y: 166 }, i, 1), 7);
    d.arrow({ x, y: 252 }, { x, y: 298 });
    d.label({ x, y: 320 }, Z[i]);
  });
  ellipsis(d, { x: X(554), y: 196 });
  ellipsis(d, { x: X(554), y: 320 });
  return d;
}

// Phone layout: the filter's label sits beside it, the subtensors' label
// under them, and the subtensors shrink to fit three across.
function drawCompact(width: number) {
  const k = width / 360;
  const X = (x: number) => x * k;
  const d = canvas(width, 306);
  const fc = { x: X(250), y: 44 };

  d.label({ x: 0, y: 18 }, "Graphlet filters", { anchor: "start" });
  d.label({ x: 0, y: 40 }, F, { anchor: "start" });

  const xs = [X(70), X(170), X(310)];
  const top = 136;

  relArrow(d, { x: xs[0] + 8, y: top - 8 }, { x: fc.x - 24, y: fc.y + 22 }, { x: X(140), y: 86 }, "end");
  relArrow(d, { x: xs[1], y: top - 8 }, { x: fc.x - 10, y: fc.y + 24 }, { x: X(206), y: 112 }, "start");
  relArrow(d, { x: xs[2] - 4, y: top - 8 }, { x: fc.x + 18, y: fc.y + 22 }, { x: X(298), y: 92 }, "start");

  drawGraph(d, filter(fc, 0.8), 7);

  xs.forEach((x, i) => {
    drawGraph(d, subtensor({ x, y: top }, i, 0.72), 6);
    d.arrow({ x, y: 240 }, { x, y: 268 });
    d.label({ x, y: 288 }, Z[i]);
  });
  ellipsis(d, { x: X(240), y: top + 22 });
  ellipsis(d, { x: X(240), y: 288 });

  d.label({ x: 0, y: 206 }, "Relation subtensors", { anchor: "start", size: "sm" });
  d.label({ x: 0, y: 224 }, RG, { anchor: "start", size: "sm" });
  d.label({ x: 0, y: 288 }, CONV, { anchor: "start" });
  return d;
}
