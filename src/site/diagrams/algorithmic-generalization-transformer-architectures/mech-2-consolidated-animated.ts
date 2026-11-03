import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawConsolidated, prefixes } from "./mech-2-consolidated";
import { expandStyle } from "./mech-2-reference";

// Animated M2 (the post's version): each iteration starts as one navy square
// (the model's latent state); the squares spread sideways into rows of
// output nodes, then the rows decode bottom-up, one iteration at a time,
// each with its y arrow (about 3.5 s). In 2a the olive depth-schedule rings
// for a row appear just before it decodes, so the schedule leads; 2b has no
// rings. Switching to the other version replays its decode (a group shown
// again restarts its CSS animations). The static drawing is the final frame.
const decode = (t: number) => 1.2 + (t - 1) * 0.6; // as in expandStyle

const ringStyle = (p: string) => `<style>
.figure-diagram[data-armed]:not([data-play]) .${p}-ring { opacity: 0; }
.figure-diagram[data-play] .${p}-ring { animation: ${p}-ring .35s ease-out both; }
${[1, 2, 3, 4].map((t) => `.figure-diagram[data-play] .${p}-ring-${t} { animation-delay: ${(decode(t) - 0.35).toFixed(2)}s; }`).join("\n")}
@keyframes ${p}-ring { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram .${p}-ring { animation: none !important; opacity: 1 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => {
    const P = prefixes("agta-m2cx");
    return drawConsolidated(P).raw(expandStyle(P.a)).raw(ringStyle(P.a)).raw(expandStyle(P.b));
  }
});
