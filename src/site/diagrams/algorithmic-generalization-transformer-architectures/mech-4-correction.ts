import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { BLOCK_TONE, ICON, recurrentBlock } from "./mech-1-recurrence";
import { rowWidth, stateRow } from "./mech-2-schedule";

// M4, error correction. Redesigned from figs/mechanisms/mech4.pdf (random
// noise on z(t)); the paper now trains on the model's own predicted states,
// so the icon shows a state with one wrong node (series 3 ochre, the error
// colour) passing through the block and coming out repaired (series 2, like
// every correct node). The block is the family's solid series 2 recurrent
// block. Time runs upwards as in M2. Family conventions as in
// mech-1-recurrence.ts.
const N = 5;
export const ERROR = 2;
const CELL = 18;
const GAP = 4;

export const GEOMETRY = { cell: CELL, x: (ICON - rowWidth(N, CELL, GAP)) / 2 + ERROR * (CELL + GAP), top: 40 };

export const drawCorrection = () => {
  const d = canvas(ICON, ICON);
  const w = rowWidth(N, CELL, GAP);
  const x0 = (ICON - w) / 2;
  const cx = ICON / 2;
  const top = 40;
  const bottom = 134;
  const block = { y: 80, h: 32 };
  const errorX = x0 + ERROR * (CELL + GAP);

  // Input state, with one wrong node.
  stateRow(d, x0, bottom, Array(N).fill("done"));
  d.raw('<g class="agta-m4-error">');
  d.rect(errorX, bottom, CELL, CELL, { tone: 3, fill: "solid", radius: 3 });
  d.raw("</g>");
  d.label({ x: errorX + CELL / 2, y: bottom + CELL + 14 }, "error", { size: "sm", tone: 3 });

  d.arrow({ x: cx, y: bottom - 1 }, { x: cx, y: block.y + block.h + 1 });
  recurrentBlock(d, x0, block.y, w, block.h, ["Recurrent Block"], "sm");
  d.arrow({ x: cx, y: block.y - 1 }, { x: cx, y: top + CELL + 1 });

  // Output state, repaired.
  d.raw('<g class="agta-m4-out">');
  stateRow(d, x0, top, Array(N).fill("done"));
  d.raw('<g class="agta-m4-fixed">');
  d.rect(errorX, top, CELL, CELL, { tone: BLOCK_TONE, fill: "solid", radius: 3 });
  d.raw('<g class="agta-m4-label">');
  d.label({ x: errorX + CELL / 2, y: top - 14 }, "repaired", { size: "sm", tone: BLOCK_TONE });
  d.raw("</g>");
  d.raw("</g>");
  d.raw("</g>");
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Error correction: a latent state with one wrong node passes through the recurrent block, and the next state comes out with that node repaired.",
  draw: drawCorrection
});
