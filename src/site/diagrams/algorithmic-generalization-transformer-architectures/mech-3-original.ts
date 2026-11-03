import { canvas, defineDiagram, type DiagramCanvas } from "../../../lib/figures/diagram";
import { BLOCK_TONE, ICON, onBlockText, recurrentBlock } from "./mech-1-recurrence";

// M3, anchored discrete latent space, close to the published
// figs/mechanisms/mech3.pdf: the recurrent block's continuous output h̃
// passes through a bottleneck: "discretize" projects it to a discrete state
// z (a strip of factored one-hot components), "re-embed" maps z back to the
// next continuous input h(t+1). Site style: the block is the family's solid
// series 2 navy; the two bottleneck modules (the mechanism) are solid series
// 1 claret, the family accent, named on the module in the page colour like
// the block; z is a crisp strip of separate navy cells (model colour; solid
// = active component, tint = inactive), so the discrete state reads as
// distinct from the continuous states h, h̃, which are plain arrows.
export const C = 96;
const W = { wide: 92, narrow: 48 };
const FUNNEL = 30;
export const STRIP = { y: 66, h: 13, n: 5, gap: 1.5 };
export const CODE = [true, false, true, true, false];

/** A solid claret funnel from width `topW` at `top` to `bottomW` at `bottom`, named in the page colour. */
const funnel = (d: DiagramCanvas, top: number, bottom: number, topW: number, bottomW: number, name: string) => {
  d.raw(
    `<path d="M${C - topW / 2},${top}H${C + topW / 2}L${C + bottomW / 2},${bottom}H${C - bottomW / 2}Z" class="d-region d-tone-1 d-fill-solid d-no-stroke" />`
  );
  // Nudge the name toward the wide end, where there is room.
  const towardWide = topW > bottomW ? -2 : 2;
  onBlockText(d, C, (top + bottom) / 2 + towardWide, name, "sm");
};

export const stripCell = (i: number) => {
  const w = (W.narrow - (STRIP.n - 1) * STRIP.gap) / STRIP.n;
  return { x: C - W.narrow / 2 + i * (w + STRIP.gap), w };
};

export const drawOriginal = () => {
  const d = canvas(ICON, ICON);
  const block = { y: 128, h: 32 };
  const zTop = STRIP.y;
  const zBottom = STRIP.y + STRIP.h;
  const embedTop = zTop - 1 - FUNNEL;
  const discBottom = zBottom + 1 + FUNNEL;

  // Input and block.
  d.arrow({ x: C, y: 176 }, { x: C, y: block.y + block.h + 1 });
  d.label({ x: C, y: 186 }, "$h^{(t)}$", { size: "sm" });
  recurrentBlock(d, C - W.wide / 2, block.y, W.wide, block.h, ["Recurrent", "Block"], "sm");

  // Continuous output into the bottleneck.
  d.raw('<g class="agta-m3o-in">');
  d.arrow({ x: C, y: block.y - 1 }, { x: C, y: discBottom + 1 });
  d.label({ x: C + 7, y: (block.y + discBottom) / 2 + 1 }, "$\\tilde h^{(t+1)}$", { size: "sm", anchor: "start" });
  d.raw("</g>");

  funnel(d, zBottom + 1, discBottom, W.narrow, W.wide, "discretize");

  // Discrete state z.
  d.raw('<g class="agta-m3o-z">');
  CODE.forEach((on, i) => {
    const { x, w } = stripCell(i);
    d.rect(x, STRIP.y, w, STRIP.h, { tone: BLOCK_TONE, fill: on ? "solid" : "tint", strokeWidth: 1, radius: 1.5 });
  });
  d.raw("</g>");
  d.label({ x: C + W.narrow / 2 + 7, y: STRIP.y + STRIP.h / 2 }, "$z^{(t+1)}$", { size: "sm", anchor: "start" });

  // Re-embed and output.
  d.raw('<g class="agta-m3o-out">');
  funnel(d, embedTop, zTop - 1, W.wide, W.narrow, "re-embed");
  d.arrow({ x: C, y: embedTop - 1 }, { x: C, y: 22 });
  d.label({ x: C, y: 10 }, "$h^{(t+1)}$", { size: "sm" });
  d.raw("</g>");
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Anchored discrete latent space: the recurrent block's continuous output is discretized into a discrete state z, a strip of one-hot components, which is re-embedded as the input to the next iteration.",
  draw: drawOriginal
});
