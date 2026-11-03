import type { DiagramCanvas, Point, Tone } from "../../../lib/figures/diagram";

/**
 * Tones shared by the post's two diagrams, as in the paper's figures: the
 * inner product relation (and the relation subtensors it produces) is blue,
 * the relational posts' colour for relational information (series 2); the
 * relational convolution and its graphlet filters are red (series 1); the
 * initial embedder is green (series 6).
 */
export const TONE = {
  embedder: 6,
  relation: 2,
  convolution: 1
} as const satisfies Record<string, Tone>;

/** Node kinds in the small graphs: the published red and blue objects. */
export type NodeKind = "a" | "b";

export type Graph = {
  nodes: { at: Point; kind: NodeKind }[];
  /** Node index pairs, each with an opacity (the published relation strength). */
  edges: [number, number, number][];
};

/**
 * A small relation graph, as published: edges are relations, so blue, at
 * their opacities (relation strength); nodes are objects, red for kind "a"
 * and blue for kind "b". Each node has a ring in the page colour so it
 * stands off the edges it joins.
 */
export const drawGraph = (d: DiagramCanvas, graph: Graph, r: number) => {
  for (const [i, j, opacity] of graph.edges) {
    d.raw(`<g opacity="${opacity}">`);
    d.line(graph.nodes[i].at, graph.nodes[j].at, { tone: TONE.relation, strokeWidth: 1.75 });
    d.raw(`</g>`);
  }
  for (const node of graph.nodes) {
    d.raw(`<circle cx="${node.at.x}" cy="${node.at.y}" r="${r + 1.5}" fill="var(--color-bg)" />`);
    d.circle(node.at, r, { tone: node.kind === "a" ? NODE_A : NODE_B, fill: "strong" });
  }
};

const NODE_A: Tone = 1;
const NODE_B: Tone = 2;

/** Three dots in a row, for "…" between drawn items. */
export const ellipsis = (d: DiagramCanvas, c: Point, gap = 7, vertical = false) => {
  for (const k of [-1, 0, 1]) {
    d.dot(vertical ? { x: c.x, y: c.y + k * gap } : { x: c.x + k * gap, y: c.y }, { r: 1.75 });
  }
};
