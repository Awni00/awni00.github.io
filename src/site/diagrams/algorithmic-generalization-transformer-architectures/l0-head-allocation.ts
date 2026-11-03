import { NEUTRAL, SERIES } from "../../../lib/figures";
import { canvas, defineDiagram, STROKE, type Tone } from "../../../lib/figures/diagram";

// Redrawn from figures/L0_head_allocation.pdf (paper Fig. "l0", left), which
// is partly raster (bertviz thumbnails). The attention lines here are
// schematic, not the measured weights: each grouped head attends from a
// variable or rhs position back to the previous one, two or three tokens
// earlier, and from rhs it lands on its group's variable; the ungrouped heads
// get loose patterns like the published thumbnails (head 15 self-attends at
// rhs, as the paper notes). Groups follow the paper: ⟨var 0⟩ {4, 8},
// ⟨var 1⟩ {5, 12}, ⟨var 2⟩ {3, 7, 11, 14}, coloured as in the post's charts.
// The published example repeated x_0 in two slots; the zooms use roles.

type Link = [query: number, key: number, weight: number];

const GROUP: Record<number, 0 | 1 | 2> = { 4: 0, 8: 0, 5: 1, 12: 1, 3: 2, 7: 2, 11: 2, 14: 2 };
const TONES: Tone[] = [1, 2, 3];

// Positions: 0 sep, 1 var 0, 2 +, 3 var 1, 4 +, 5 var 2, 6 =, 7 rhs.
const VAR0: Link[] = [[7, 1, 1], [5, 0, 0.7]];
const VAR1: Link[] = [[7, 3, 1], [5, 1, 0.6], [3, 0, 0.5]];
const VAR2: Link[] = [[7, 5, 1], [5, 3, 0.8], [3, 1, 0.8]];
const PATTERNS: Link[][] = [
  [[2, 1, 0.9], [7, 6, 0.9]],
  [[6, 3, 0.4]],
  [[5, 2, 0.15], [7, 4, 0.15]],
  VAR2,
  VAR0,
  VAR1,
  [[6, 6, 0.9], [7, 6, 0.9]],
  VAR2,
  [[7, 1, 1]],
  [[6, 2, 0.9]],
  [[5, 4, 0.4], [6, 4, 0.4], [7, 3, 0.9]],
  VAR2,
  [[7, 3, 1], [3, 0, 0.6], [6, 4, 0.3], [2, 1, 0.2]],
  [[2, 1, 0.8], [3, 3, 0.7]],
  VAR2,
  [[1, 1, 1], [3, 3, 1], [5, 5, 1], [7, 7, 1]]
];
const ZOOMED = [4, 7, 12];

const toneOf = (head: number): Tone => (head in GROUP ? TONES[GROUP[head]] : "neutral");

export default defineDiagram({
  size: "full",
  alt: "The 16 first-layer attention heads, each with a thumbnail of its attention pattern, grouped by the variable position they attend to from rhs: heads 4 and 8 attend to var 0, heads 5 and 12 to var 1, and heads 3, 7, 11 and 14 to var 2; the rest attend elsewhere. Zoomed views of heads 4, 7 and 12 show the rhs token attending to var 0, var 2 and var 1.",
  legend: [
    { key: "region", label: "⟨var 0⟩ heads", color: SERIES[0] },
    { key: "region", label: "⟨var 1⟩ heads", color: SERIES[1] },
    { key: "region", label: "⟨var 2⟩ heads", color: SERIES[2] },
    { key: "line", label: "Other heads", color: NEUTRAL }
  ],
  draw: ({ width, compact }) => {
    const W = width;
    const perRow = compact ? 8 : 16;
    const cellW = W / perRow;
    const cellH = compact ? 40 : 50;
    const numH = 18;
    const rows = 16 / perRow;
    const stripH = rows * (numH + cellH) + (rows - 1) * 6;

    const calloutTop = stripH + (compact ? 18 : 34);
    const rowPitch = compact ? 16 : 20;
    const calloutH = (compact ? 52 : 74) + 7 * rowPitch + 24;
    const H = calloutTop + calloutH + 2;
    const d = canvas(W, H);

    const path = (pts: [number, number][], tone: Tone, width: number, opacity: number) =>
      d.raw(
        `<path d="M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join("L")}" class="d-line d-tone-${tone}" stroke-width="${width}"${opacity < 1 ? ` stroke-opacity="${opacity}"` : ""} />`
      );

    // The strip of heads, each with a thumbnail of its pattern.
    const cells: { x: number; y: number }[] = [];
    for (let h = 0; h < 16; h++) {
      const row = Math.floor(h / perRow);
      const x = (h % perRow) * cellW;
      const y = row * (numH + cellH + 6) + numH;
      cells.push({ x, y });
      const tone = toneOf(h);
      if (h in GROUP) d.rect(x, y, cellW, cellH, { tone, stroke: false });
      d.label({ x: x + cellW / 2, y: y - numH / 2 }, String(h), {
        size: "sm",
        tone: h in GROUP ? tone : "muted"
      });
      const pad = compact ? 9 : 11;
      const top = y + 7;
      const step = (cellH - 14) / 7;
      for (const [q, k, w] of PATTERNS[h]) {
        path(
          [
            [x + pad, top + q * step],
            [x + cellW - pad, top + k * step]
          ],
          tone,
          STROKE.line,
          Math.max(0.12, w)
        );
      }
    }
    for (let r = 0; r < rows; r++) {
      const y = r * (numH + cellH + 6) + numH;
      d.frame(0.5, y, W - 1, cellH);
    }

    // Zoomed views.
    const n = 3;
    const gap = compact ? 9 : 26;
    const cw = (W - gap * (n - 1)) / n;
    const tokens = compact
      ? ["sep", "var 0", "+", "var 1", "+", "var 2", "=", "rhs"]
      : ["⟨sep⟩", "⟨var 0⟩", "+", "⟨var 1⟩", "+", "⟨var 2⟩", "=", "⟨rhs⟩"];
    ZOOMED.forEach((h, i) => {
      const x = i * (cw + gap);
      const tone = toneOf(h);
      const group = GROUP[h];
      const cell = cells[h];
      // Mark the head in the strip and point to its zoom.
      d.rect(cell.x + 0.5, cell.y, cellW - 1, cellH, { tone: "ink", fill: "none" });
      if (!compact) {
        d.line({ x: cell.x + cellW / 2, y: cell.y + cellH }, { x: x + cw / 2, y: calloutTop }, { tone: "ink" });
      }
      d.rect(x + 0.5, calloutTop, cw - 1, calloutH, { tone, radius: 6, fill: "none", strokeWidth: 1 });
      const titleY = calloutTop + (compact ? 14 : 18);
      d.label({ x: x + cw / 2, y: titleY }, `Head ${h}`, { size: compact ? "md" : "lg" });
      if (!compact) {
        d.label({ x: x + cw / 2, y: titleY + 18 }, `rhs attends to ⟨var ${group}⟩`, { size: "sm", tone });
      }

      const qx = x + (compact ? 41 : 84);
      const kx = x + cw - (compact ? 41 : 84);
      const head0 = calloutTop + (compact ? 32 : 60);
      d.label({ x: qx, y: head0 }, "query", { anchor: "end", size: "sm", tone: "muted" });
      d.label({ x: kx, y: head0 }, "key", { anchor: "start", size: "sm", tone: "muted" });
      const rowY = (p: number) => head0 + 20 + p * rowPitch;

      // Highlight rhs and the variable it reads.
      const target = 2 * group + 1;
      const pillW = compact ? 36 : 56;
      const pillH = compact ? 15 : 18;
      d.rect(qx - pillW + 2, rowY(7) - pillH / 2, pillW + 2, pillH, { tone: "neutral", radius: pillH / 2, stroke: false });
      d.rect(kx - 4, rowY(target) - pillH / 2, pillW + 2, pillH, { tone, radius: pillH / 2, stroke: false });
      tokens.forEach((t, p) => {
        d.label({ x: qx - 4, y: rowY(p) }, t, { anchor: "end", size: "sm" });
        d.label({ x: kx + 4, y: rowY(p) }, t, { anchor: "start", size: "sm" });
      });
      for (const [q, k, w] of PATTERNS[h]) {
        const main = q === 7;
        path(
          [
            [qx + 4, rowY(q)],
            [kx - 4, rowY(k)]
          ],
          tone,
          main ? STROKE.emphasis : STROKE.line,
          main ? 1 : Math.max(0.25, w * 0.55)
        );
      }
    });
    return d;
  }
});
