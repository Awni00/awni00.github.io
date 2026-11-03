import { canvas, defineDiagram, type DiagramCanvas, type Tone } from "../../../lib/figures/diagram";
import { BLOCK_TONE, ICON } from "./mech-1-recurrence";

// M2, incremental computation schedule (2a, depth-supervised). Redesigned
// from figs/mechanisms/mech2.pdf (reference algorithm → model supervision
// arrows): each row is the latent state of five nodes after one recurrent
// iteration, time running upwards. A node is filled once computed: solid in
// the iteration that computes it, tinted after; dashed and empty before.
// Each iteration's state gets its own loss ℓ (series 1 arrows on the right).
// Cells use the family's model colour (series 2, the recurrent block's navy)
// in every icon; series 1 stays for supervision and the recurrence loop.
// Family conventions as in mech-1-recurrence.ts.

/** Node depths: iteration t computes the nodes of depth t − 1. */
export const DEPTH = [0, 1, 0, 2, 3];

export type CellState = "empty" | "new" | "done";

/** One state row. Cells are `size` squares `gap` apart, top-left at (x, y). */
export const stateRow = (
  d: DiagramCanvas,
  x: number,
  y: number,
  states: CellState[],
  {
    size = 18,
    gap = 4,
    empty = "",
    tone = BLOCK_TONE,
    wrap
  }: { size?: number; gap?: number; empty?: string; tone?: Tone; wrap?: (i: number) => [string, string] } = {}
) => {
  states.forEach((state, i) => {
    const cx = x + i * (size + gap);
    if (wrap) d.raw(wrap(i)[0]);
    if (state === "empty") {
      d.rect(cx, y, size, size, { tone: "neutral", fill: "none", dashed: true, radius: 3 });
      if (empty) d.label({ x: cx + size / 2, y: y + size / 2 + 0.5 }, empty, { size: "sm", tone: "muted" });
    } else {
      d.rect(cx, y, size, size, { tone, fill: state === "new" ? "solid" : "tint", radius: 3 });
    }
    if (wrap) d.raw(wrap(i)[1]);
  });
  return d;
};

export const rowWidth = (n: number, size = 18, gap = 4) => n * size + (n - 1) * gap;

export const scheduleStates = (depths: number[], t: number): CellState[] =>
  depths.map((depth) => (depth === t - 1 ? "new" : depth < t - 1 ? "done" : "empty"));

const ROWS = 4;
const PITCH = 36;

export const drawSchedule = () => {
  const d = canvas(ICON, ICON);
  const x0 = 38;
  const bottom = 142;
  const right = x0 + rowWidth(DEPTH.length);

  d.arrow({ x: 18, y: bottom + 18 }, { x: 18, y: bottom - (ROWS - 1) * PITCH - 6 }, { tone: "muted" });
  d.label({ x: 18, y: bottom + 30 }, "$t$", { tone: "muted" });

  for (let t = 1; t <= ROWS; t++) {
    const y = bottom - (t - 1) * PITCH;
    d.raw(`<g class="agta-m2-row agta-m2-row-${t}">`);
    stateRow(d, x0, y, scheduleStates(DEPTH, t));
    d.arrow({ x: right + 22, y: y + 9 }, { x: right + 5, y: y + 9 }, { tone: 1 });
    d.label({ x: right + 30, y: y + 8 }, "$\\ell$", { tone: 1 });
    d.raw("</g>");
  }
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Incremental computation schedule: four rows show the latent state of five nodes after iterations 1 to 4. Each iteration fills in the nodes one level deeper and leaves the rest unchanged, and each iteration's state is supervised by its own loss.",
  draw: drawSchedule
});
