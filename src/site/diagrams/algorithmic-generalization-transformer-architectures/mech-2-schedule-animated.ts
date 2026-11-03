import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawSchedule } from "./mech-2-schedule";

// Animated M2: the iterations appear one at a time from the bottom, so the
// nodes fill in level by level. The static drawing is the final frame.
const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) .agta-m2-row { opacity: 0; }
.figure-diagram[data-play] .agta-m2-row { animation: agta-m2-in .45s ease-out both; }
.figure-diagram[data-play] .agta-m2-row-1 { animation-delay: .2s; }
.figure-diagram[data-play] .agta-m2-row-2 { animation-delay: .9s; }
.figure-diagram[data-play] .agta-m2-row-3 { animation-delay: 1.6s; }
.figure-diagram[data-play] .agta-m2-row-4 { animation-delay: 2.3s; }
@keyframes agta-m2-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram .agta-m2-row { animation: none !important; opacity: 1 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => drawSchedule().raw(STYLE)
});
