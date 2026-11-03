import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawCorrection, GEOMETRY } from "./mech-4-correction";

// Animated M4: the wrong node flashes, the next state appears with the error
// still in it, then that node turns to the correct colour ("repaired"). An
// ochre overlay on the repaired node, hidden unless playing, carries the
// error forward. The static drawing is the final frame.
const STYLE = `<style>
.figure-diagram .agta-m4-carry { opacity: 0; }
.figure-diagram[data-armed]:not([data-play]) .agta-m4-out { opacity: 0; }
.figure-diagram[data-play] .agta-m4-error { animation: agta-m4-flash 1s ease-in-out .2s both; }
.figure-diagram[data-play] .agta-m4-out { animation: agta-m4-fade .45s ease-out 1.3s both; }
.figure-diagram[data-play] .agta-m4-carry { animation: agta-m4-carry 1.8s ease-in-out 1.3s both; }
.figure-diagram[data-play] .agta-m4-label { animation: agta-m4-fade .4s ease-out 2.4s both; }
@keyframes agta-m4-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: .25; } }
@keyframes agta-m4-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes agta-m4-carry { 0% { opacity: 0; } 25%, 60% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram :is(.agta-m4-error, .agta-m4-out, .agta-m4-label) { animation: none !important; opacity: 1 !important; }
  .figure-diagram .agta-m4-carry { animation: none !important; opacity: 0 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => {
    const d = drawCorrection();
    const { cell, x, top } = GEOMETRY;
    d.raw('<g class="agta-m4-carry">');
    d.rect(x, top, cell, cell, { tone: 3, fill: "solid", radius: 3 });
    d.raw("</g>");
    return d.raw(STYLE);
  }
});
