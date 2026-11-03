import { defineDiagram } from "../../../lib/figures/diagram";
import base, { drawDiscrete, SNAP } from "./mech-3-discrete";

// Animated M3: the continuous output h̃ appears off the lattice, then the
// state snaps from there onto the nearest lattice point z. The static
// drawing is the final frame.
const dx = SNAP.from.x - SNAP.to.x;
const dy = SNAP.from.y - SNAP.to.y;
const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) :is(.agta-m3-out, .agta-m3-snap, .agta-m3-snapline) { opacity: 0; }
.figure-diagram[data-play] .agta-m3-out { animation: agta-m3-fade .5s ease-out .3s both; }
.figure-diagram[data-play] .agta-m3-snapline { animation: agta-m3-fade .4s ease-out 1.5s both; }
.figure-diagram[data-play] .agta-m3-snap { animation: agta-m3-snap .7s cubic-bezier(.5,0,.2,1.35) 1.2s both; }
@keyframes agta-m3-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes agta-m3-snap {
  0% { opacity: 0; transform: translate(${dx}px, ${dy}px); }
  25% { opacity: 1; transform: translate(${dx}px, ${dy}px); }
  100% { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .figure-diagram :is(.agta-m3-out, .agta-m3-snap, .agta-m3-snapline) { animation: none !important; opacity: 1 !important; transform: none !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => drawDiscrete().raw(STYLE)
});
