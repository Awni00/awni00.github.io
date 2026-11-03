import { defineDiagram } from "../../../lib/figures/diagram";
import still, { drawAnchoringDrift, type AnchoringAnimation } from "./anchoring-drift";

// Play-once variant of anchoring-drift, in phases (~8.5 s wide, ~7 s on a
// phone): the trained range draws at a steady pace; the extrapolation a
// little slower, with a beat after the continuous state leaves the band; then
// a slow step into the error (the ring settles, "error" appears, a hold); a
// slower step still for the correction in the bottom row while the middle row
// carries its error on (the olive rings settle, a hold); the remaining
// iterations finish quickly. The final frame is the static figure, which is
// also what shows without `data-play` (no JS, reduced motion).

const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) :is(.agta-ad-in, .agta-ad-ring) { opacity: 0; }
.figure-diagram[data-play] .agta-ad-in { animation: agta-ad-in 0.2s ease-out both; }
.figure-diagram[data-play] .agta-ad-draw { stroke-dasharray: 1 1; animation: agta-ad-draw 0.25s linear both; }
.figure-diagram[data-play] .agta-ad-ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: agta-ad-ring 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both;
}
@keyframes agta-ad-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes agta-ad-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes agta-ad-ring { from { opacity: 0; transform: scale(2); } to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram[data-play] :is(.agta-ad-in, .agta-ad-draw, .agta-ad-ring) { animation: none; }
}
</style>`;

const TIMING: AnchoringAnimation = {
  start: 0.15,
  step: { trained: 0.4, extrapolate: 0.55, approach: 0.5, error: 1, correction: 1.1, finish: 0.3 },
  hold: { escape: 0.4, error: 0.8, correction: 0.7 },
  ring: 0.8
};

export default defineDiagram({
  size: "full",
  alt: still.alt,
  animate: { delay: 400 },
  draw: (context) => {
    return drawAnchoringDrift(context, TIMING).raw(STYLE);
  }
});
