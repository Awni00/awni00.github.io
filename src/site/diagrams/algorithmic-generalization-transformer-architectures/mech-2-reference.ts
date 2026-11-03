import { canvas, defineDiagram, type DiagramCanvas } from "../../../lib/figures/diagram";
import { BLOCK_TONE, ICON } from "./mech-1-recurrence";
import { rowWidth, scheduleStates, stateRow, type CellState } from "./mech-2-schedule";

// M2, matching the published figs/mechanisms/mech2.pdf: a reference
// algorithm column (series 6 olive, for the published green) beside the
// model's recurrent states (solid series 2, the family's block colour), with
// a supervision arrow (series 1) from each algorithm step to the matching
// model iteration. Time runs upwards.
//
// This file also holds the shared builders for the other "reference" M2
// variants: the 2b version (target y at every iteration, the model may
// abstain with ∅), the 2a/2b toggle, and the expanded layout used by the
// animated variants, where each model state is a row of output cells.

export type Kind = "2a" | "2b";

export const REF_TONE = 6;
const ROWS = 4;
/** Row centres, bottom (t = 1) to top. */
export const rowY = (t: number, dy = 0) => dy + 154 - (t - 1) * 34;
const COL = { left: 44, right: 144 };
const SQUARE = 22;

/** 2b: what the model reads out at each iteration (∅ = abstains). */
const READOUT_2B = ["∅", "∅", "$\\hat y$", "$\\hat y$"];

/** The original-style figure: algorithm (2a) or target (2b) column → model column. */
export const drawReferenceInto = (d: DiagramCanvas, kind: Kind, dy = 0) => {
  const mid = (COL.left + COL.right) / 2;
  d.label({ x: mid, y: dy + 22 }, "supervision", { size: "sm", tone: 1 });

  for (let t = 1; t <= ROWS; t++) {
    const y = rowY(t, dy);
    if (t > 1) {
      const below = rowY(t - 1, dy);
      d.arrow({ x: COL.right, y: below - SQUARE / 2 - 1 }, { x: COL.right, y: y + SQUARE / 2 + 1 }, { tone: BLOCK_TONE });
      if (kind === "2a") d.arrow({ x: COL.left, y: below - 11 }, { x: COL.left, y: y + 11 }, { tone: REF_TONE });
    }
    d.rect(COL.right - SQUARE / 2, y - SQUARE / 2, SQUARE, SQUARE, {
      tone: BLOCK_TONE,
      fill: "solid",
      stroke: false,
      radius: 5
    });
    if (kind === "2a") {
      d.circle({ x: COL.left, y }, 10, { tone: REF_TONE, fill: "solid", stroke: false });
      d.arrow({ x: COL.left + 14, y }, { x: COL.right - SQUARE / 2 - 3, y }, { tone: 1 });
    } else {
      // Target y → readout cell ← model state.
      d.label({ x: COL.left, y }, "$y$", { tone: 1 });
      const cell = { x: mid - 10, y: y - 10, s: 20 };
      const abstain = READOUT_2B[t - 1] === "∅";
      d.rect(cell.x, cell.y, cell.s, cell.s, {
        tone: abstain ? "neutral" : BLOCK_TONE,
        fill: abstain ? "none" : "tint",
        dashed: abstain,
        radius: 3
      });
      d.label({ x: mid, y: y + 0.5 }, READOUT_2B[t - 1], { size: "sm", tone: abstain ? "muted" : "ink" });
      d.arrow({ x: COL.left + 10, y }, { x: cell.x - 3, y }, { tone: 1 });
      d.arrow({ x: COL.right - SQUARE / 2 - 2, y }, { x: cell.x + cell.s + 3, y });
    }
  }
  const foot = dy + 182;
  if (kind === "2a") {
    d.label({ x: COL.left, y: foot }, "reference", { size: "sm", tone: REF_TONE });
  } else {
    d.label({ x: COL.left, y: foot }, "target", { size: "sm", tone: 1 });
    d.label({ x: mid, y: foot }, "output", { size: "sm", tone: "muted" });
  }
  d.label({ x: COL.right, y: foot }, "model", { size: "sm", tone: BLOCK_TONE });
  return d;
};

export const drawReference = (kind: Kind) => drawReferenceInto(canvas(ICON, ICON), kind);

// ── Expanded layout (animated variants) ─────────────────────────────────────
// Each model state is a row of five output cells in the block colour: solid
// in the iteration that computes the node, tinted after, dashed before (2b:
// dashed with ∅, the model abstaining). Every cell is wrapped in a group
// `${p}-cell ${p}-t${t}` with `--i` = its index, and carries a solid block-
// coloured cover `${p}-cover` (opacity 0 unless an animation shows it), so a variant can
// start from one block-coloured square per iteration and expand it.

export const DEPTH = [0, 1, 0, 2, 3];
/** 2b: the iteration at which the model stops abstaining on each node. */
export const COMMIT = [1, 3, 2, 3, 4];
export const CELL = { size: 18, gap: 4 };
const EX = { left: 30, rowX: 64 };

export const expandedStates = (kind: Kind, t: number): CellState[] =>
  kind === "2a"
    ? scheduleStates(DEPTH, t)
    : COMMIT.map((c) => (c === t ? "new" : c < t ? "done" : "empty"));

export const drawExpanded = (kind: Kind, p: string) => drawExpandedInto(canvas(ICON, ICON), kind, p);

export const drawExpandedInto = (d: DiagramCanvas, kind: Kind, p: string, dy = 0) => {
  const w = rowWidth(DEPTH.length, CELL.size, CELL.gap);
  d.label({ x: (EX.left + EX.rowX) / 2 + 6, y: dy + 22 }, "supervision", { size: "sm", tone: 1 });

  for (let t = 1; t <= ROWS; t++) {
    const y = rowY(t, dy);
    d.raw(`<g class="${p}-row ${p}-row-${t}">`);
    if (kind === "2a") {
      if (t > 1) d.arrow({ x: EX.left, y: rowY(t - 1, dy) - 9 }, { x: EX.left, y: y + 9 }, { tone: REF_TONE });
      d.circle({ x: EX.left, y }, 8, { tone: REF_TONE, fill: "solid", stroke: false });
    } else {
      d.label({ x: EX.left, y }, "$y$", { tone: 1 });
    }
    d.raw(`<g class="${p}-sup ${p}-sup-${t}">`);
    d.arrow({ x: EX.left + 11, y }, { x: EX.rowX - 3, y }, { tone: 1 });
    d.raw("</g>");
    const top = y - CELL.size / 2;
    stateRow(d, EX.rowX, top, expandedStates(kind, t), {
      ...CELL,
      tone: BLOCK_TONE,
      empty: kind === "2b" ? "∅" : "",
      wrap: (i) => [
        `<g class="${p}-cell ${p}-t${t}" style="--i: ${i}">`,
        `<rect x="${EX.rowX + i * (CELL.size + CELL.gap) - 1}" y="${top - 1}" width="${CELL.size + 2}" height="${CELL.size + 2}" rx="4" opacity="0" class="d-region d-tone-${BLOCK_TONE} d-fill-solid d-no-stroke ${p}-cover" /></g>`
      ]
    });
    d.raw("</g>");
  }
  const foot = dy + 182;
  d.label({ x: EX.left, y: foot }, kind === "2a" ? "reference" : "target", {
    size: "sm",
    tone: kind === "2a" ? REF_TONE : 1
  });
  d.label({ x: EX.rowX + w / 2, y: foot }, "model output", { size: "sm", tone: BLOCK_TONE });
  return d;
};

/**
 * Animation A, "expand then decode": each iteration starts as one block-
 * coloured square (its latent state), the squares spread sideways into rows
 * of output cells, then the rows are decoded bottom-up, one iteration at a
 * time, each with its supervision arrow.
 */
export const expandStyle = (p: string) => {
  const step = CELL.size + CELL.gap;
  const decode = (t: number) => 1.2 + (t - 1) * 0.6;
  const rows = [1, 2, 3, 4]
    .map(
      (t) =>
        `.figure-diagram[data-play] .${p}-t${t} .${p}-cover { animation-delay: ${decode(t)}s; }\n` +
        `.figure-diagram[data-play] .${p}-sup-${t} { animation-delay: ${decode(t)}s; }`
    )
    .join("\n");
  return `<style>
.figure-diagram[data-armed]:not([data-play]) .${p}-cell { transform: translateX(calc(var(--i) * -${step}px)); }
.figure-diagram[data-armed]:not([data-play]) .${p}-cover { opacity: 1; }
.figure-diagram[data-armed]:not([data-play]) .${p}-sup { opacity: 0; }
.figure-diagram[data-play] .${p}-cell { animation: ${p}-spread .7s cubic-bezier(.3,0,.2,1) .2s both; }
.figure-diagram[data-play] .${p}-cover { animation: ${p}-uncover .45s ease-out both; }
.figure-diagram[data-play] .${p}-sup { animation: ${p}-fade .45s ease-out both; }
${rows}
@keyframes ${p}-spread { from { transform: translateX(calc(var(--i) * -${step}px)); } to { transform: none; } }
@keyframes ${p}-uncover { from { opacity: 1; } to { opacity: 0; } }
@keyframes ${p}-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram :is(.${p}-cell, .${p}-cover, .${p}-sup) { animation: none !important; transform: none !important; }
  .figure-diagram .${p}-cover { opacity: 0 !important; }
}
</style>`;
};

/**
 * Animation B, "step by step": the figure builds bottom-up, one iteration at
 * a time: its reference step (2a) or target (2b), the supervision arrow, and
 * the row of output cells.
 */
export const stepStyle = (p: string) => {
  const rows = [1, 2, 3, 4]
    .map((t) => `.figure-diagram[data-play] .${p}-row-${t} { animation-delay: ${0.2 + (t - 1) * 0.75}s; }`)
    .join("\n");
  return `<style>
.figure-diagram[data-armed]:not([data-play]) .${p}-row { opacity: 0; }
.figure-diagram[data-play] .${p}-row { animation: ${p}-in .5s ease-out both; }
${rows}
@keyframes ${p}-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .figure-diagram .${p}-row { animation: none !important; opacity: 1 !important; transform: none !important; }
}
</style>`;
};

export default defineDiagram({
  size: "narrow",
  alt: "Depth-supervised schedule: a column of reference-algorithm steps beside a column of the model's recurrent states, with a supervision arrow from each algorithm step to the matching model iteration.",
  draw: () => drawReference("2a")
});
