import { canvas, defineDiagram, STROKE } from "../../../lib/figures/diagram";
import { ICON } from "./mech-1-recurrence";

// M3, anchored discrete latent space. Redesigned from figs/mechanisms/mech3.pdf
// (discretize / re-embed bottleneck): the latent space as a lattice of
// discrete states (neutral dots). Earlier iterations sit on lattice points
// (series 1); the block's next continuous output h̃ lands off the lattice
// (hollow) and is snapped to the nearest point z (dashed). Family conventions
// as in mech-1-recurrence.ts.
const STEP = 40;
const ORIGIN = 36;
const at = (i: number, j: number) => ({ x: ORIGIN + i * STEP, y: ORIGIN + j * STEP });

export const PATH = [at(0, 3), at(1, 2), at(2, 2)];
export const SNAP = { from: { x: 138, y: 58 }, to: at(3, 1) };

export const drawDiscrete = () => {
  const d = canvas(ICON, ICON);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) d.dot(at(i, j), { tone: "neutral", r: 2.5 });

  const node = (p: { x: number; y: number }) => ({ ...p, r: 5 });
  for (let k = 1; k < PATH.length; k++) d.edge(node(PATH[k - 1]), node(PATH[k]), { tone: 1 });
  d.raw('<g class="agta-m3-out">');
  d.edge(node(PATH[PATH.length - 1]), node(SNAP.from), { tone: "ink" });
  d.circle(SNAP.from, 5, { tone: "ink", fill: "none", strokeWidth: STROKE.line });
  d.label({ x: SNAP.from.x - 13, y: SNAP.from.y - 10 }, "$\\tilde h$");
  d.raw("</g>");
  d.raw('<g class="agta-m3-snapline">');
  d.edge(node(SNAP.from), { ...SNAP.to, r: 6 }, { tone: 1, dashed: true, gap: 1 });
  d.raw("</g>");

  for (const p of PATH) d.circle(p, 5, { tone: 1, fill: "solid", stroke: false });
  d.raw('<g class="agta-m3-snap">');
  d.circle(SNAP.to, 6, { tone: 1, fill: "solid", stroke: false });
  d.label({ x: SNAP.to.x + 14, y: SNAP.to.y + 2 }, "$z$", { tone: 1 });
  d.raw("</g>");
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Anchored discrete latent space: latent states sit on a lattice of discrete points. The block's next continuous output lands off the lattice and is snapped to the nearest discrete point before the next iteration.",
  draw: drawDiscrete
});
