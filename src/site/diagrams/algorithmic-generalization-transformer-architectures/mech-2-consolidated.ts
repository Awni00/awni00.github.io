import { type DiagramCanvas, defineDiagram } from "../../../lib/figures/diagram";
import { BLOCK_TONE } from "./mech-1-recurrence";
import { CELL, expandedStates, type Kind, REF_TONE, rowY } from "./mech-2-reference";
import { rowWidth, stateRow } from "./mech-2-schedule";
import { toggle } from "./mech-2-toggle";

// M2, the version in the post. Each row is the model's output, five nodes,
// after one recurrent iteration (time upwards), supervised at every
// iteration by the answer y (series 1 arrows). Cell key:
//   solid navy  = node computed in this iteration
//   tint navy   = node computed earlier, carried forward unchanged
//   dashed ∅    = ⟨empty⟩: not computed yet
//   olive ring  = (2a only) the depth schedule asks for this node's value
//                 at this iteration (Depth < t); the rings grow one depth
//                 level per row, and unringed nodes are supervised to ⟨empty⟩
// 2a, depth-supervised: the schedule comes from outside (node depth, series
// 6 olive, labelled "depth schedule"). 2b, self-discovered: no rings; the
// model abstains (∅) until it commits, in its own order ("own schedule").
// A CSS-only 2a/2b switch (mech-2-toggle.ts), top right in the heading row,
// picks the version; without
// :has() support only 2a shows.
//
// Animation hooks (see mech-2-consolidated-animated.ts): per-cell groups
// `${p}-cell ${p}-t${t}` with `--i`, a hidden block-coloured cover
// `${p}-cover` in each, the supervision arrow `${p}-sup ${p}-sup-${t}`, and
// the 2a rings `${p}-ring ${p}-ring-${t}`.
export const prefixes = (p: string) => ({ switch: p, a: `${p}a`, b: `${p}b` });

const ROWS = 4;
const X = { y: 30, row: 64 };
const RING = 1.75;
const SWITCH_BOX = { x: 96, y: 10, width: 84 };

const drawVersion = (d: DiagramCanvas, kind: Kind, p: string, dy: number) => {
  const w = rowWidth(5, CELL.size, CELL.gap);
  const step = CELL.size + CELL.gap;
  d.label({ x: X.y + 18, y: dy + 22 }, "supervision", { size: "sm", tone: 1 });

  for (let t = 1; t <= ROWS; t++) {
    const y = rowY(t, dy);
    const top = y - CELL.size / 2;
    const states = expandedStates(kind, t);
    d.label({ x: X.y, y }, "$y$", { tone: 1 });
    d.raw(`<g class="${p}-sup ${p}-sup-${t}">`);
    d.arrow({ x: X.y + 9, y }, { x: X.row - 4, y }, { tone: 1 });
    d.raw("</g>");
    stateRow(d, X.row, top, states, {
      ...CELL,
      tone: BLOCK_TONE,
      empty: "∅",
      wrap: (i) => [
        `<g class="${p}-cell ${p}-t${t}" style="--i: ${i}">`,
        `<rect x="${X.row + i * step - 1}" y="${top - 1}" width="${CELL.size + 2}" height="${CELL.size + 2}" rx="4" opacity="0" class="d-region d-tone-${BLOCK_TONE} d-fill-solid d-no-stroke ${p}-cover" /></g>`
      ]
    });
    if (kind === "2a") {
      d.raw(`<g class="${p}-ring ${p}-ring-${t}">`);
      states.forEach((state, i) => {
        if (state !== "empty")
          d.rect(X.row + i * step, top, CELL.size, CELL.size, {
            tone: REF_TONE,
            fill: "none",
            strokeWidth: RING,
            radius: 3
          });
      });
      d.raw("</g>");
    }
  }
  d.label({ x: X.row + w / 2, y: dy + 182 }, kind === "2a" ? "depth schedule" : "own schedule", {
    size: "sm",
    tone: kind === "2a" ? REF_TONE : BLOCK_TONE
  });
  return d;
};

/** `P` prefixes classes and names the radio group: unique per diagram. */
export const drawConsolidated = (P = prefixes("agta-m2c")) =>
  toggle(
    P.switch,
    (d, dy) => drawVersion(d, "2a", P.a, dy),
    (d, dy) => drawVersion(d, "2b", P.b, dy),
    // In the heading row, right of "supervision", above the rows: the icon
    // stays 192×192 like M1, M3 and M4, so the grid's captions line up.
    SWITCH_BOX
  );

export default defineDiagram({
  size: "narrow",
  alt: "Incremental computation schedule, with a switch between two versions. Each row is the model's output, five nodes, after one iteration, time running upwards, and every iteration is supervised by the answer y. 2a: an outside depth schedule marks which nodes must have values at each iteration, one depth level more per row; the rest are supervised to empty. 2b: no schedule is given; the model abstains (empty) on nodes until it can commit, filling them in its own order.",
  draw: () => drawConsolidated()
});
