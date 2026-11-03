import { defineDiagram } from "../../../lib/figures/diagram";
import { BLOCK_TONE } from "./mech-1-recurrence";
import base, { CODE, drawOriginal, STRIP, stripCell } from "./mech-3-original";

// Animated M3 (published layout): the block's continuous output h̃ rises into
// the bottleneck and first shows in z's slot as a continuous state (one soft
// navy bar of in-between intensities), which then snaps to the discrete code
// (each cell settles to on or off, with a small overshoot); then the
// re-embedded h(t+1) leaves at the top. About 3 s. The continuous overlay is
// hidden unless playing, so the static drawing is the final frame.
const P = "agta-m3o";
const CONTINUOUS = [0.75, 0.35, 0.55, 0.85, 0.2];

const STYLE = `<style>
.figure-diagram[data-armed]:not([data-play]) :is(.${P}-in, .${P}-z, .${P}-out) { opacity: 0; }
.figure-diagram .${P}-z rect { transform-box: fill-box; transform-origin: center; }
.figure-diagram[data-play] .${P}-in { animation: ${P}-fade .5s ease-out .2s both; }
.figure-diagram[data-play] .${P}-cont { animation: ${P}-cont 1.3s ease-in-out .7s both; }
.figure-diagram[data-play] .${P}-z { animation: ${P}-fade .01s linear 1.5s both; }
.figure-diagram[data-play] .${P}-z rect { animation: ${P}-snap .5s cubic-bezier(.3,1.6,.5,1) 1.5s both; }
.figure-diagram[data-play] .${P}-out { animation: ${P}-fade .5s ease-out 2.3s both; }
@keyframes ${P}-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ${P}-cont { 0% { opacity: 0; } 25%, 60% { opacity: 1; } 100% { opacity: 0; } }
@keyframes ${P}-snap { from { transform: scaleY(.4); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram :is(.${P}-in, .${P}-z, .${P}-z rect, .${P}-out) { animation: none !important; opacity: 1 !important; transform: none !important; }
  .figure-diagram .${P}-cont { animation: none !important; opacity: 0 !important; }
}
</style>`;

export default defineDiagram({
  ...base,
  animate: {},
  draw: () => {
    const d = drawOriginal();
    d.raw(`<g class="${P}-cont" opacity="0">`);
    // The continuous state: one soft, unbroken bar of in-between values,
    // spanning the strip, before it snaps to separate on/off cells.
    const first = stripCell(0);
    const last = stripCell(CODE.length - 1);
    const span = last.x + last.w - first.x;
    CODE.forEach((_, i) => {
      const w = span / CODE.length;
      d.raw(
        `<rect x="${first.x + i * w}" y="${STRIP.y}" width="${w + 0.5}" height="${STRIP.h}" class="d-region d-tone-${BLOCK_TONE} d-fill-solid d-no-stroke" fill-opacity="${CONTINUOUS[i]}" />`
      );
    });
    d.raw("</g>");
    return d.raw(STYLE);
  }
});
