import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawRecurrence } from "./mech-1-recurrence";

// Animated M1: the recurrence loop traces once from the output back to the
// input, then its arrowhead appears. The static drawing is the final frame.
const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) .agta-m1-trace { opacity: 0; }
.figure-diagram[data-armed]:not([data-play]) .agta-m1-head { opacity: 0; }
.figure-diagram[data-play] .agta-m1-trace { stroke-dasharray: 1; animation: agta-m1-trace 1.6s cubic-bezier(.45,0,.3,1) .2s both; }
.figure-diagram[data-play] .agta-m1-head { animation: agta-m1-fade .3s ease-out 1.7s both; }
@keyframes agta-m1-trace { 0% { stroke-dashoffset: 1; opacity: 0; } 2% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }
@keyframes agta-m1-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram .agta-m1-trace, .figure-diagram .agta-m1-head { animation: none !important; stroke-dashoffset: 0 !important; opacity: 1 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => drawRecurrence().raw(STYLE)
});
