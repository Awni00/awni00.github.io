import { canvas, defineDiagram, type DiagramCanvas, type DiagramContext, type Node, type Tone } from "../../../lib/figures/diagram";

// Redrawn from figures/formula_graph.pdf (paper: figs/dag_example_ops_colored.tex,
// fig:dag_example): the same nine variables, operations and topology, read
// left to right as leaves, depth 1, depth 2. Values sit under their nodes in
// the code face ("= 20") instead of on input arrows. Depth-1 nodes are not on
// the half rows: x91 sits higher and x55 lower, so x88's edge to "−" runs
// through a clear corridor between them.
//
// Every variable, leaf or computed, is a solid series 2 (navy) disc with its
// name in the page colour; operations are small solid series 1 (claret)
// squares, as the paper's circuit colours its operations red. Two looks share
// this geometry and differ only in how values are shown:
// - "outline" (this file): values in the code face under each node ("= 20").
// - "tag" (computation-graph-alt.ts): values in small outlined tags.

export type GraphParts = "leaves" | "header1" | "edges1" | "nodes1" | "values1" | "header2" | "edges2" | "nodes2" | "values2";

export type GraphOptions = {
  look: "outline" | "tag";
  /** Show the computed nodes' values (mod 23), not only the leaves'. */
  values: boolean;
  /** Wraps each part, in drawing order, e.g. in an animated group. */
  wrap?: (part: GraphParts, draw: () => void) => void;
  /** Drawn first, under everything; gets the two iteration bands' x-extents. */
  under?: (d: DiagramCanvas, bands: { x: number; w: number }[], top: number, bottom: number) => void;
};

const COMPUTED: Tone = 2;
const OPERATION: Tone = 1;
const ON_SOLID = "agta-cg-on-solid";
const ON_SOLID_STYLE = `<style>.figure-diagram .${ON_SOLID} .d-tone-inverse { --tone: var(--color-bg); }</style>`;
const OP_HALF = 9;

const mono = (d: DiagramCanvas, x: number, y: number, text: string, tone: Tone) =>
  d.raw(
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" class="d-label d-label--sm d-tone-${tone}" style="font-family: var(--font-mono); font-size: 11.5px">${text}</text>`
  );

export function drawGraph({ width, compact }: DiagramContext, { look, values, wrap = (_, f) => f(), under }: GraphOptions) {
  const r = compact ? 16 : 17;
  const row = compact ? 62 : 70;
  const top = 50;
  const height = top + 3 * row + r + 26;
  const d = canvas(width, height);
  d.raw(ON_SOLID_STYLE);

  // Columns: leaves, ops (depth 1), depth 1, the "−" op, ops (depth 2), depth 2.
  const [cLeaf, cOp1, cD1, cMinus, cOp2, cD2] = compact ? [24, 88, 146, 204, 262, 330] : [44, 148, 238, 326, 412, 506];
  const y = (k: number) => top + k * row;
  const node = (x: number, k: number): Node => ({ x, y: y(k), r });
  const op = (x: number, k: number): Node => ({ x, y: y(k), r: OP_HALF + 2 });

  const x7 = node(cLeaf, 0);
  const x42 = node(cLeaf, 1);
  const x88 = node(cLeaf, 2);
  const x115 = node(cLeaf, 3);
  const a23 = op(cOp1, 0.4);
  const a91 = op(cOp1, 1.3);
  const m55 = op(cOp1, 2.75);
  const x23 = node(cD1, 0.4);
  const x91 = node(cD1, 1.3);
  const x55 = node(cD1, 2.75);
  const m101 = op(cOp2, 0.85);
  const s30 = op(cMinus, 2);
  const a30 = op(cOp2, 2.2);
  const x101 = node(cD2, 0.85);
  const x30 = node(cD2, 2.2);

  const pad = 12;
  under?.(
    d,
    [
      { x: cOp1 - OP_HALF - pad, w: cD1 + r + pad - (cOp1 - OP_HALF - pad) },
      { x: cMinus - OP_HALF - pad, w: cD2 + r + pad - (cMinus - OP_HALF - pad) }
    ],
    4,
    height - 4
  );

  const header = (x: number, text: string) => d.label({ x, y: 16 }, text, { size: "sm", tone: "muted" });
  const opBox = (at: Node, symbol: string) => {
    d.rect(at.x - OP_HALF, at.y - OP_HALF, 2 * OP_HALF, 2 * OP_HALF, {
      tone: OPERATION,
      fill: "solid",
      stroke: false,
      radius: 4
    });
    // The symbol in the page colour, like the labels on the mechanism icons' solid blocks.
    d.raw(
      `<text x="${at.x}" y="${at.y + 0.5}" text-anchor="middle" dominant-baseline="central" class="d-label d-label--md" style="fill: var(--color-bg); font-weight: 600">${symbol}</text>`
    );
  };
  // Variables are solid navy discs with their name in the page colour, the
  // same filled style as the operations (and the mechanism icons' blocks).
  const variable = (at: Node, index: number) => {
    d.circle(at, r, { tone: COMPUTED, fill: "solid", stroke: false });
    d.raw(`<g class="${ON_SOLID}">`);
    d.label(at, `$x_{${index}}$`, { size: "md", tone: "inverse" });
    d.raw(`</g>`);
  };
  const leaf = variable;
  const computed = variable;
  const value = (at: Node, v: number, tone: Tone) => {
    const cy = at.y + r + 11;
    if (look === "tag") {
      const w = 8 + 7 * String(v).length;
      d.rect(at.x - w / 2, cy - 7.5, w, 15, { tone, fill: "none", strokeWidth: 1, radius: 7.5 });
      mono(d, at.x, cy + 0.5, String(v), tone);
    } else {
      mono(d, at.x, cy, `= ${v}`, tone);
    }
  };

  wrap("leaves", () => {
    header(cLeaf, "Leaves");
    for (const [at, i, v] of [[x7, 7, 20], [x42, 42, 2], [x88, 88, 6], [x115, 115, 14]] as const) {
      leaf(at, i);
      value(at, v, "ink");
    }
  });

  wrap("header1", () => header(cD1, "Depth 1"));
  wrap("edges1", () => {
    for (const [from, to] of [[x7, a23], [x42, a23], [x42, a91], [x88, a91], [x88, m55], [x115, m55]]) d.edge(from, to);
    opBox(a23, "+");
    opBox(a91, "+");
    opBox(m55, "×");
  });
  wrap("nodes1", () => {
    d.edge(a23, x23);
    d.edge(a91, x91);
    d.edge(m55, x55);
    computed(x23, 23);
    computed(x91, 91);
    computed(x55, 55);
  });
  if (values)
    wrap("values1", () => {
      value(x23, 22, COMPUTED);
      value(x91, 8, COMPUTED);
      value(x55, 15, COMPUTED);
    });

  wrap("header2", () => header(cD2, "Depth 2"));
  wrap("edges2", () => {
    for (const [from, to] of [[x23, m101], [x91, m101], [x91, s30], [x88, s30], [s30, a30], [x55, a30]]) d.edge(from, to);
    opBox(m101, "×");
    opBox(s30, "−");
    opBox(a30, "+");
  });
  wrap("nodes2", () => {
    d.edge(m101, x101);
    d.edge(a30, x30);
    computed(x101, 101);
    computed(x30, 30);
  });
  if (values)
    wrap("values2", () => {
      value(x101, 15, COMPUTED);
      value(x30, 17, COMPUTED);
    });

  return d;
}

export const ALT =
  "Computation graph. Leaves x7 = 20, x42 = 2, x88 = 6 and x115 = 14. At depth 1, x23 = x7 + x42, x91 = x42 + x88 and x55 = x88 × x115. At depth 2, x101 = x23 × x91 and x30 = x91 − x88 + x55.";

export default defineDiagram({
  size: "medium",
  alt: ALT,
  draw: (context) => drawGraph(context, { look: "outline", values: false })
});
