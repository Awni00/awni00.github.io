import { canvas, defineDiagram, type DiagramCanvas } from "../../../lib/figures/diagram";
import { ICON } from "./mech-1-recurrence";
import { drawReferenceInto } from "./mech-2-reference";

// M2 with a 2a/2b switch: both versions of the reference-style figure
// (mech-2-reference.ts, mech-2-reference-2b.ts) in one SVG, with a two-option
// switch drawn above them. CSS-only: the switch is a pair of visually hidden
// radio inputs in a foreignObject, and `.figure-diagram:has(… :checked)`
// shows the matching group. Without :has() support (or CSS), 2a shows alone.
// The switch is 26px tall, so this icon is 26px taller than the others.
export const SWITCH = 26;

const switchStyle = (P: string) => `<style>
.figure-diagram .${P}-b { display: none; }
.figure-diagram:has(.${P}-switch input[value="2b"]:checked) .${P}-b { display: inline; }
.figure-diagram:has(.${P}-switch input[value="2b"]:checked) .${P}-a { display: none; }
.figure-diagram .${P}-switch { display: flex; justify-content: center; height: 100%; align-items: flex-start; font-family: var(--font-ui); }
.figure-diagram .${P}-switch fieldset { display: inline-flex; margin: 0; padding: 2px; border: 1px solid var(--color-rule); border-radius: 999px; }
.figure-diagram .${P}-switch legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.figure-diagram .${P}-switch label { position: relative; cursor: pointer; }
.figure-diagram .${P}-switch input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
.figure-diagram .${P}-switch span { display: block; padding: 1px 11px; border-radius: 999px; font-size: 12px; line-height: 16px; color: var(--color-muted); }
.figure-diagram .${P}-switch input:checked + span { background: var(--color-fg-soft); color: var(--color-bg); font-weight: 600; }
.figure-diagram .${P}-switch input:focus-visible + span { outline: 2px solid var(--figure-2); outline-offset: 1px; }
</style>`;

const option = (P: string, value: string, checked: boolean) =>
  `<label><input type="radio" name="${P}" value="${value}"${checked ? " checked" : ""} /><span>${value}</span></label>`;

/**
 * A 2a/2b switch above two drawings, CSS-only. `P` prefixes the classes and
 * names the radio group, so it must be unique per diagram. Each draw callback
 * draws into the canvas shifted down by `dy`.
 */
export const toggle = (
  P: string,
  drawA: (d: DiagramCanvas, dy: number) => void,
  drawB: (d: DiagramCanvas, dy: number) => void,
  /**
   * Where the switch goes. Default: its own 26px band above the drawing
   * (canvas ICON + SWITCH tall, drawings shifted down by SWITCH). `inset`
   * places it inside a plain ICON×ICON canvas at the given box instead, so
   * the drawing must leave that box free.
   */
  inset?: { x: number; y: number; width: number }
) => {
  const dy = inset ? 0 : SWITCH;
  const box = inset ?? { x: 0, y: 0, width: ICON };
  const d = canvas(ICON, ICON + dy);
  d.raw(
    `<foreignObject x="${box.x}" y="${box.y}" width="${box.width}" height="${SWITCH}">` +
      `<div xmlns="http://www.w3.org/1999/xhtml" class="${P}-switch"><fieldset><legend>Schedule</legend>` +
      option(P, "2a", true) +
      option(P, "2b", false) +
      `</fieldset></div></foreignObject>`
  );
  d.raw(`<g class="${P}-a">`);
  drawA(d, dy);
  d.raw("</g>");
  d.raw(`<g class="${P}-b">`);
  drawB(d, dy);
  d.raw("</g>");
  return d.raw(switchStyle(P));
};

export default defineDiagram({
  size: "narrow",
  alt: "Two ways to learn the schedule, switchable. 2a: a column of reference-algorithm steps supervises the matching iterations of the model. 2b: the final answer y supervises the model's output at every iteration, and the model abstains (outputs empty) in early iterations.",
  draw: () =>
    toggle(
      "agta-m2t",
      (d, dy) => drawReferenceInto(d, "2a", dy),
      (d, dy) => drawReferenceInto(d, "2b", dy)
    )
});
