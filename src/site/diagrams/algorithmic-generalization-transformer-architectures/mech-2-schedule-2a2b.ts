import { canvas, defineDiagram } from "../../../lib/figures/diagram";
import { ICON } from "./mech-1-recurrence";
import { rowWidth, scheduleStates, stateRow } from "./mech-2-schedule";

// M2 alternative: both ways to learn the schedule, side by side. Rows are the
// state of four nodes after iterations 1–4 (time upwards), as in
// mech-2-schedule.ts. 2a, depth-supervised: nodes fill strictly by depth,
// and every iteration has a loss against that target (series 1 arrows).
// 2b, self-discovered: the model abstains with ⟨empty⟩ (∅) until it can
// commit to a node, so it picks its own order and pace, and halts once no
// node is empty. Family conventions as in mech-1-recurrence.ts.
const ROWS = 4;
const PITCH = 27;
const CELL = { size: 15, gap: 3 };
/** 2a: node depths. 2b: the iteration at which the model commits to each node. */
const DEPTH = [0, 2, 1, 3];
const COMMIT = [2, 4, 1, 3];

export const drawSchedule2a2b = () => {
  const d = canvas(ICON, ICON);
  const w = rowWidth(4, CELL.size, CELL.gap);
  const left = 12;
  const right = ICON - 12 - w;
  const bottom = 136;
  const top = bottom - (ROWS - 1) * PITCH;

  d.label({ x: left + w / 2, y: top - 30 }, "2a", { size: "lg" });
  d.label({ x: right + w / 2, y: top - 30 }, "2b", { size: "lg" });
  d.label({ x: left + w / 2, y: bottom + CELL.size + 18 }, "depth", { size: "sm", tone: "muted" });
  d.label({ x: right + w / 2, y: bottom + CELL.size + 18 }, "abstain", { size: "sm", tone: "muted" });

  for (let t = 1; t <= ROWS; t++) {
    const y = bottom - (t - 1) * PITCH;
    d.raw(`<g class="agta-m2ab-row agta-m2ab-row-${t}">`);
    stateRow(d, left, y, scheduleStates(DEPTH, t), CELL);
    d.arrow({ x: left + w + 17, y: y + CELL.size / 2 }, { x: left + w + 4, y: y + CELL.size / 2 }, { tone: 1 });
    stateRow(
      d,
      right,
      y,
      COMMIT.map((c) => (c === t ? "new" : c < t ? "done" : "empty")),
      { ...CELL, empty: "∅" }
    );
    d.raw("</g>");
  }
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Two ways to learn the schedule. 2a: nodes are filled in strictly by depth, one level per iteration, with a loss on every iteration. 2b: the model abstains, predicting an empty value, until it can commit to a node, so it fills nodes in its own order over the iterations.",
  draw: drawSchedule2a2b
});
