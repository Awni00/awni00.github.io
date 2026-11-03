import { defineDiagram, type DiagramCanvas } from "../../../lib/figures/diagram";
import { ALT, drawGraph, type GraphParts } from "./computation-graph";

// The computation graph, evaluated layer by layer as in "The natural
// algorithm": the leaves are given; a faint band marks iteration 1 while the
// depth-1 operations and nodes appear and their values (mod 23) fill in, then
// iteration 2 does the same for depth 2. Plays once (~3.8 s). The static
// drawing, with every value filled in, is the final frame.

const P = "agta-dag";

// [start, duration] in seconds for each part that animates in.
const TIMING: Partial<Record<GraphParts, [number, number]>> = {
  header1: [0, 0.4],
  edges1: [0.25, 0.5],
  nodes1: [0.75, 0.45],
  values1: [1.2, 0.35],
  header2: [1.95, 0.4],
  edges2: [2.2, 0.5],
  nodes2: [2.7, 0.45],
  values2: [3.15, 0.35]
};
// Iteration bands: [start, duration] of the fade in, hold and fade out.
const BANDS: [number, number][] = [
  [0, 2.0],
  [1.95, 1.9]
];

const parts = Object.entries(TIMING) as [GraphParts, [number, number]][];
const style =
  `<style>` +
  `.${P}-band{opacity:0}` +
  `.figure-diagram[data-armed]:not([data-play]) :is(${parts.map(([p]) => `.${P}-${p}`).join(",")}){opacity:0}` +
  `@keyframes ${P}-in{from{opacity:0}to{opacity:1}}` +
  `@keyframes ${P}-band{0%{opacity:0}18%{opacity:.35}78%{opacity:.35}100%{opacity:0}}` +
  parts
    .map(([p, [t, dur]]) => `.figure-diagram[data-play] .${P}-${p}{animation:${P}-in ${dur}s ease-out ${t}s both}`)
    .join("") +
  BANDS.map(([t, dur], i) => `.figure-diagram[data-play] .${P}-band-${i + 1}{animation:${P}-band ${dur}s ease-in-out ${t}s both}`).join(
    ""
  ) +
  `@media (prefers-reduced-motion: reduce){.figure-diagram [class^="${P}-"]{animation:none!important}}` +
  `</style>`;

export default defineDiagram({
  size: "medium",
  alt: ALT,
  // Top-right holds the "Depth 2" heading on phones; bottom-right is empty.
  animate: { delay: 400, replayCorner: "bottom-right" },
  draw: (context) => {
    let canvas: DiagramCanvas | undefined;
    return drawGraph(context, {
      look: "outline",
      values: true,
      under: (c, bands, top, bottom) => {
        canvas = c;
        c.raw(style);
        bands.forEach(({ x, w }, i) => {
          c.raw(`<g class="${P}-band ${P}-band-${i + 1}">`);
          c.rect(x, top, w, bottom - top, { tone: 2, stroke: false, radius: 6 });
          c.raw(`</g>`);
        });
      },
      wrap: (part, draw) => {
        if (!TIMING[part] || !canvas) return draw();
        canvas.raw(`<g class="${P}-${part}">`);
        draw();
        canvas.raw(`</g>`);
      }
    });
  }
});
