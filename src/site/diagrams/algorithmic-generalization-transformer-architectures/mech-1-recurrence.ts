import { canvas, defineDiagram, STROKE, type DiagramCanvas } from "../../../lib/figures/diagram";

// M1, recurrence and adaptive computation. Redesigned from
// figs/mechanisms/mech1.pdf as one of four 192px icons shown in a 4-column
// grid: the recurrent block (solid series 2 navy with its name, like the
// published deep-blue box) with input x and h(t) below, output ŷ above, and
// the recurrence as a loop in the family accent (series 1), labelled h(t+1)
// and with the input-dependent iteration count T(x).
// Shared family conventions (mech-1 … mech-4): 192×192 canvas whatever the
// preset width, recurrent blocks / model states solid series 2 with text in
// the page colour (`recurrentBlock`), ink arrows, series 1 for the
// mechanism's key element, 2px for that element's strokes.
export const ICON = 192;
export const BLOCK_TONE = 2;

/** Text in the page background colour, to sit on a solid block. */
export const onBlockText = (d: DiagramCanvas, x: number, y: number, text: string, size: "sm" | "md" = "md") =>
  d.raw(
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" class="d-label d-label--${size}" style="fill: var(--color-bg); font-weight: 600">${text}</text>`
  );

/** The recurrent block: a solid series 2 rounded box with its name, one line per entry. */
export const recurrentBlock = (
  d: DiagramCanvas,
  x: number,
  y: number,
  w: number,
  h: number,
  lines: string[] = ["Recurrent", "Block"],
  size: "sm" | "md" = "md"
) => {
  d.rect(x, y, w, h, { tone: BLOCK_TONE, fill: "solid", stroke: false, radius: 8 });
  const lh = size === "md" ? 15 : 14;
  lines.forEach((line, i) => onBlockText(d, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * lh, line, size));
  return d;
};

/** The loop's path, drawn by hand so the animated variant can trace it. */
const LOOP = { x: 68, top: 44, bottom: 150, right: 136, r: 18 };

export const drawRecurrence = () => {
  const d = canvas(ICON, ICON);
  const { x, top, bottom, right, r } = LOOP;
  const block = { x: x - 40, y: 66, w: 80, h: 60 };

  d.arrow({ x, y: 176 }, { x, y: block.y + block.h + 1 });
  d.arrow({ x, y: block.y - 1 }, { x, y: 22 });
  d.label({ x, y: 184 }, "$x$");
  d.label({ x, y: 10 }, "$\\hat y$");

  const loop =
    `M${x},${top}H${right - r}A${r},${r} 0 0 1 ${right},${top + r}` +
    `V${bottom - r}A${r},${r} 0 0 1 ${right - r},${bottom}H${x + 9}`;
  d.raw('<g class="agta-m1-loop">');
  d.raw(
    `<path d="${loop}" pathLength="1" class="d-line d-tone-1 agta-m1-trace" stroke-width="${STROKE.emphasis}" />`
  );
  d.raw("</g>");
  d.raw('<g class="agta-m1-head">');
  d.arrow({ x: x + 10, y: bottom }, { x: x + 1, y: bottom }, { tone: 1, strokeWidth: STROKE.emphasis });
  d.raw("</g>");
  d.dot({ x, y: top }, { tone: 1, r: 2.5 });

  recurrentBlock(d, block.x, block.y, block.w, block.h);
  d.label({ x: right + 24, y: (top + bottom) / 2 }, "$T(x)$", { tone: 1 });
  d.label({ x: (x + right) / 2 + 4, y: top - 13 }, "$h^{(t+1)}$", { size: "sm" });
  d.label({ x: x - 7, y: bottom + 1 }, "$h^{(t)}$", { size: "sm", anchor: "end" });
  return d;
};

export default defineDiagram({
  size: "narrow",
  alt: "Recurrence: one recurrent Transformer block maps the input x to the output y-hat, and a loop feeds its output back into it, repeated T(x) times, a number of iterations that adapts to the input.",
  draw: drawRecurrence
});
