import { canvas, defineDiagram, type DiagramCanvas, type Point, type Tone } from "../../../lib/figures/diagram";

// Redrawn by eye from public/blog/dual-attention/static/figs/paper_main_figure.png
// (no TikZ or slide source was found under ~/Documents/project-code). Same two
// panels, rows (1, 2, ⋮, n), converging edges and labels as published; the
// query x sits midway down the rows.
//
// Tones by role, as in the paper's figure and the same across the relational
// posts: sensory information is red (series 1), so the objects x, y_i and
// their values v_i; relational information is blue (series 2), so r(x, y_i);
// symbols s_i are green (series 6).
const OBJECT: Tone = 1;
const VALUE: Tone = 1;
const RELATION: Tone = 2;
const SYMBOL: Tone = 6;

const OBJECT_SIZE = 26;
const PITCH = 38;
const TOP = 20;

const rows = (oy: number) => [oy + TOP, oy + TOP + PITCH, oy + TOP + 2 * PITCH, oy + TOP + 3 * PITCH];
const ROW_NAMES = ["1", "2", null, "n"] as const;

const square = (d: DiagramCanvas, c: Point, label: string) => {
  const s = OBJECT_SIZE;
  d.rect(c.x - s / 2, c.y - s / 2, s, s, { tone: OBJECT, fill: "strong", radius: 4 });
  d.label(c, label, { size: "lg", tone: "inverse" });
};

/** The query x and its incoming, weighted edges from points `from` (row order). */
const query = (d: DiagramCanvas, ox: number, oy: number, from: Point[]) => {
  const r = rows(oy);
  const x = { x: ox + OBJECT_SIZE / 2 + 1, y: (r[0] + r[3]) / 2 };
  from.forEach((p, i) => {
    const name = [1, 2, "n"][i];
    // Spread the tips along x's edge, so the three heads don't merge.
    const spread = Math.max(-1, Math.min(1, (p.y - x.y) / 60)) * (OBJECT_SIZE / 2 - 5);
    const tip = { x: x.x + OBJECT_SIZE / 2 + 1, y: x.y + spread };
    d.arrow(p, tip);
    // α label beside the edge, on the upper side, as published.
    const t = [0.4, 0.62, 0.58][i];
    const at = { x: tip.x + (p.x - tip.x) * t, y: tip.y + (p.y - tip.y) * t };
    const len = Math.hypot(p.x - tip.x, p.y - tip.y);
    const n = { x: (p.y - tip.y) / len, y: -(p.x - tip.x) / len };
    d.label({ x: at.x + n.x * 11, y: at.y + n.y * 11 }, `$\\alpha_${name}$`);
  });
  square(d, x, "$x$");
};

/** A vertical ellipsis drawn as dots (KaTeX's \vdots sits off-centre in a label). */
const vdots = (d: DiagramCanvas, c: Point) => {
  for (const dy of [-6, 0, 6]) d.dot({ x: c.x, y: c.y + dy }, { r: 1.4 });
};

const caption = (d: DiagramCanvas, cx: number, oy: number, text: string) =>
  d.label({ x: cx, y: rows(oy)[3] + 38 }, text);

/** Panel (a): x attends to values v_i, each computed from y_i. */
const attention = (d: DiagramCanvas, ox: number, oy: number, w: number) => {
  const r = rows(oy);
  const yx = ox + w - OBJECT_SIZE / 2 - 1;
  const vx = yx - 56;
  const vr = 13;
  const from: Point[] = [];
  r.forEach((y, i) => {
    const name = ROW_NAMES[i];
    if (name === null) {
      vdots(d, { x: (vx + yx) / 2, y });
      return;
    }
    d.arrow({ x: yx - OBJECT_SIZE / 2 - 1.5, y }, { x: vx + vr + 1.5, y });
    d.circle({ x: vx, y }, vr, { tone: VALUE, fill: "strong" });
    d.label({ x: vx, y }, `$v_${name}$`, { size: "lg", tone: "inverse" });
    square(d, { x: yx, y }, `$y_${name}$`);
    from.push({ x: vx - vr - 1.5, y });
  });
  query(d, ox, oy, from);
  caption(d, ox + w / 2, oy, "(a) $\\mathrm{Attention}(x, (y_1, \\ldots, y_n))$");
};

/** Panel (b): x attends to relations r(x, y_i), each tagged with a symbol s_i. */
const relational = (d: DiagramCanvas, ox: number, oy: number, w: number) => {
  const r = rows(oy);
  const yx = ox + w - OBJECT_SIZE / 2 - 1;
  const rule = yx - 28;
  const sr = 12;
  const sx = rule - 14 - sr;
  const plus = sx - sr - 11;
  const rw = 78;
  const rh = 26;
  const rx = plus - 11 - rw / 2;
  const from: Point[] = [];
  r.forEach((y, i) => {
    const name = ROW_NAMES[i];
    if (name === null) {
      vdots(d, { x: plus, y });
      vdots(d, { x: yx, y });
      return;
    }
    d.rect(rx - rw / 2, y - rh / 2, rw, rh, { tone: RELATION, fill: "strong", radius: rh / 2 });
    d.label({ x: rx, y }, `$r(x, y_${name})$`, { tone: "inverse" });
    d.label({ x: plus, y }, "$+$");
    d.circle({ x: sx, y }, sr, { tone: SYMBOL, fill: "strong" });
    d.label({ x: sx, y }, `$s_${name}$`, { tone: "inverse" });
    square(d, { x: yx, y }, `$y_${name}$`);
    from.push({ x: rx - rw / 2 - 1.5, y });
  });
  d.line({ x: rule, y: r[0] - OBJECT_SIZE / 2 - 2 }, { x: rule, y: r[3] + OBJECT_SIZE / 2 + 2 }, { tone: "muted", dashed: true });
  query(d, ox, oy, from);
  caption(d, ox + w / 2, oy, "(b) $\\mathrm{RelationalAttention}(x, (y_1, \\ldots, y_n))$");
};

const PANEL_HEIGHT = TOP + 3 * PITCH + 56;

export default defineDiagram({
  size: "medium",
  alt: "Two panels. In attention, the receiver x aggregates values v_1 to v_n, each computed from an object y_i, with attention weights alpha_1 to alpha_n. In relational attention, x aggregates relations r(x, y_i), each tagged with a symbol s_i, with the same kind of weights.",
  draw: ({ width, compact }) => {
    if (compact) {
      const w = 310;
      const ox = (width - w) / 2;
      const d = canvas(width, 2 * PANEL_HEIGHT + 12);
      attention(d, ox + 30, 0, w - 60);
      relational(d, ox, PANEL_HEIGHT + 12, w);
      return d;
    }
    const d = canvas(width, PANEL_HEIGHT);
    const wa = 220;
    const gap = 30;
    attention(d, 0, 0, wa);
    relational(d, wa + gap, 0, width - wa - gap);
    return d;
  }
});
