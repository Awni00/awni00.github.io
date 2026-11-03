import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawSchedule2a2b } from "./mech-2-schedule-2a2b";

// Animated M2 (2a and 2b): the iterations appear one at a time from the
// bottom in both panels together, so the two schedules fill in side by side.
// The static drawing is the final frame.
const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) .agta-m2ab-row { opacity: 0; }
.figure-diagram[data-play] .agta-m2ab-row { animation: agta-m2ab-in .45s ease-out both; }
.figure-diagram[data-play] .agta-m2ab-row-1 { animation-delay: .2s; }
.figure-diagram[data-play] .agta-m2ab-row-2 { animation-delay: .9s; }
.figure-diagram[data-play] .agta-m2ab-row-3 { animation-delay: 1.6s; }
.figure-diagram[data-play] .agta-m2ab-row-4 { animation-delay: 2.3s; }
@keyframes agta-m2ab-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram .agta-m2ab-row { animation: none !important; opacity: 1 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => drawSchedule2a2b().raw(STYLE)
});
