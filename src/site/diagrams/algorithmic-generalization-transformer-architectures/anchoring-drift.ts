import { canvas, defineDiagram, type DiagramContext, type Point, type Tone } from "../../../lib/figures/diagram";
import { DISCRETE } from "../../figures/algorithmic-generalization-transformer-architectures/_methods";

// Redrawn from the paper's figs/mechanisms/anchoring_drift.svg, using the
// geometry of its generator (gen_anchoring_figure.py): the same step spacing,
// lanes, band, trajectories and error/correction iterations, scaled from the
// 1200px original to the column. The phone layout keeps the story with ten
// iterations instead of thirteen and puts the row names above the rows.
//
// Tones follow the post's charts: Continuous LSS is series 4 (teal),
// Discrete LSS + EC series 2 (navy), and Discrete LSS cerulean (DISCRETE in the
// charts' _methods.ts, between teal and navy at comparable weight; drawn by
// re-pointing tone 2 inside a group).
// Errors take series 3 (ochre) and corrections series 6 (olive), the nearest
// the palette has to the original's red and green that neither navy row nor
// the teal row uses.

const CONT: Tone = 4;
const DISC: Tone = 2; // drawn cerulean, inside LIGHT
const DISC_EC: Tone = 2;
/** A group whose tone-2 marks take Discrete LSS's cerulean. */
const LIGHT = "agta-anchor-light";
const LIGHT_STYLE =
  `<style>.figure-diagram .${LIGHT} .d-tone-2 { --tone: ${DISCRETE}; }</style>`;
const ERR: Tone = 3;
const FIX: Tone = 6;

type Sequences = {
  /** Continuous row: deviation from the band centre, in original px (30 per lane). */
  cont: number[];
  /** The target path through the discrete states (lane indices). */
  correct: number[];
  /** Discrete row: mis-projects and never rejoins. */
  disc: number[];
  /** Discrete + self-correction row: mis-projects, then repairs. */
  ec: number[];
};

const WIDE: Sequences = {
  cont: [0, 24, 0, -22, -6, -34, -84, -100, -92, -108, -96, -104, -99],
  correct: [-1, 0, -1, -2, -1, 0, 1, 0, -1, 0, -1, -2, -1],
  disc: [-1, 0, -1, -2, -1, 0, 1, 0, -1, 1, 0, 1, 0],
  ec: [-1, 0, -1, -2, -1, 0, 1, 0, -1, 1, -1, -2, -1]
};

// Ten iterations: three trained, the continuous state leaves the band at 5,
// both discrete rows mis-project at 6 and the corrected row repairs at 7.
const COMPACT: Sequences = {
  cont: [0, 24, 0, -22, -34, -84, -100, -92, -108, -99],
  correct: [-1, 0, -1, -2, -2, -1, 0, -1, -2, -1],
  disc: [-1, 0, -1, -2, -2, -1, 1, 0, -1, 0],
  ec: [-1, 0, -1, -2, -2, -1, 1, -1, -2, -1]
};

const LANES = [-2, -1, 0, 1, 2];

/** Animation phases: each transition's duration (s) by where it falls. */
export type AnchoringPhase = "trained" | "extrapolate" | "approach" | "error" | "correction" | "finish";

/** Timing for the animated variant; the static drawing passes none. */
export type AnchoringAnimation = {
  start: number;
  /** Duration of a transition into an iteration in this phase. */
  step: Record<AnchoringPhase, number>;
  /** Pauses after the state that escapes the band, the error, and the correction. */
  hold: { escape: number; error: number; correction: number };
  /** How long the error and correction rings take to settle. */
  ring: number;
};

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Catmull-Rom smoothing, one cubic per segment (as in the generator). */
const smoothSegments = (pts: Point[], tension = 0.5) => {
  const segs: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1 = { x: p1.x + ((p2.x - p0.x) * tension) / 3, y: p1.y + ((p2.y - p0.y) * tension) / 3 };
    const c2 = { x: p2.x - ((p3.x - p1.x) * tension) / 3, y: p2.y - ((p3.y - p1.y) * tension) / 3 };
    segs.push(`M${fmt(p1.x)},${fmt(p1.y)}C${fmt(c1.x)},${fmt(c1.y)} ${fmt(c2.x)},${fmt(c2.y)} ${fmt(p2.x)},${fmt(p2.y)}`);
  }
  return segs;
};

export const drawAnchoringDrift = ({ width, compact }: DiagramContext, animation?: AnchoringAnimation) => {
  const seq = compact ? COMPACT : WIDE;
  const n = seq.correct.length;

  // ---- geometry ------------------------------------------------------------
  const s = compact ? 0 : width / 1200;
  const lane = compact ? 16 : 30 * s;
  const k = lane / 30; // original px → this layout, vertically
  const bandHalf = compact ? 42 : 78 * s;
  const x0 = compact ? 6 : 195 * s;
  const x1 = compact ? width - 6 : 1170 * s;
  const firstX = compact ? x0 + 16 : 225 * s;
  const lastX = compact ? x1 - 16 : (225 + 76 * 12) * s;
  const stepX = Array.from({ length: n }, (_, i) => firstX + ((lastX - firstX) * i) / (n - 1));
  const trained = compact ? 3 : 4; // iterations inside the training range
  const divider = (stepX[trained - 1] + stepX[trained]) / 2;
  const rowY = compact ? [90, 212, 334] : [164 * s, 348 * s, 532 * s];
  const bandTop = rowY[0] - bandHalf;
  const bandBot = rowY[2] + bandHalf;
  const shadePad = compact ? 9 : 14 * s;
  const axisY = bandBot + shadePad;
  const legendY = axisY + (compact ? 40 : 48);
  const height = legendY + (compact ? 28 : 10);

  const sq = compact ? 7 : 8;
  const circleR = compact ? 3 : 3.5;
  const contR = compact ? 3.2 : 3.8;
  const ringR = compact ? 7 : 8.5;
  const xhFrac = compact ? 0.52 : 0.6;
  const line = 1.5;

  const d = canvas(width, height);
  d.raw(LIGHT_STYLE);
  const laneY = (yc: number, l: number) => yc + l * lane;

  // ---- animation hooks (no-ops when static) --------------------------------
  // Phases come from the sequences: the trained range, the continuous escape,
  // the discrete error and the correction.
  const escapeAt = seq.cont.findIndex((dv) => Math.abs(dv * k) > bandHalf);
  const errorAt = seq.ec.findIndex((l, i) => l !== seq.correct[i]);
  const correctionAt = errorAt + 1;
  const phase = (to: number): AnchoringPhase =>
    to < trained ? "trained" : to <= escapeAt ? "extrapolate" : to < errorAt ? "approach"
      : to === errorAt ? "error" : to === correctionAt ? "correction" : "finish";
  const holdAt = (i: number) =>
    !animation ? 0 : i === escapeAt ? animation.hold.escape : i === errorAt ? animation.hold.error
      : i === correctionAt ? animation.hold.correction : 0;
  const nodeT: number[] = [animation?.start ?? 0];
  const departT: number[] = [];
  const durT: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    departT.push(nodeT[i] + holdAt(i));
    durT.push(animation ? animation.step[phase(i + 1)] : 0);
    nodeT.push(departT[i] + durT[i]);
  }
  /** The state at iteration i appears at node(i); things that follow it, after `delay`. */
  const node = (i: number, delay = 0) => nodeT[i] + delay;
  /** A point `frac` of the way along transition i (after any hold at i). */
  const at = (i: number, frac: number) => departT[i] + frac * durT[i];
  const ringDur = animation?.ring ?? 0;
  const open = (t: number, duration?: number) => {
    if (animation)
      d.raw(`<g class="agta-ad-in" style="animation-delay:${fmt(t)}s${duration ? `;animation-duration:${fmt(duration)}s` : ""}">`);
  };
  const close = () => {
    if (animation) d.raw("</g>");
  };
  const drawCls = (t: number, dur: number) =>
    animation ? ` pathLength="1" style="animation-delay:${fmt(t)}s;animation-duration:${fmt(dur)}s"` : "";
  const drawClass = animation ? " agta-ad-draw" : "";

  const path = (dAttr: string, tone: Tone, extra = "", draw?: { t: number; dur: number }) =>
    d.raw(
      `<path d="${dAttr}" class="d-line d-tone-${tone}${draw ? drawClass : ""}" stroke-width="${line}"${extra}${draw ? drawCls(draw.t, draw.dur) : ""} />`
    );
  const square = (c: Point, side: number, tone: Tone, opacity?: number) =>
    d.raw(
      `<rect x="${fmt(c.x - side / 2)}" y="${fmt(c.y - side / 2)}" width="${side}" height="${side}" rx="1" class="d-dot d-tone-${tone}"${opacity ? ` opacity="${opacity}"` : ""} />`
    );
  const openSquare = (c: Point, side: number, tone: Tone) =>
    d.raw(
      `<rect x="${fmt(c.x - side / 2)}" y="${fmt(c.y - side / 2)}" width="${side}" height="${side}" rx="1" class="d-region d-tone-${tone} d-fill-none" stroke-width="1" />`
    );
  const hollow = (c: Point, r: number, tone: Tone) =>
    d.raw(
      `<circle cx="${fmt(c.x)}" cy="${fmt(c.y)}" r="${r}" class="d-line d-tone-${tone}" style="fill:var(--color-bg)" stroke-width="1.25" />`
    );
  const ring = (c: Point, r: number, tone: Tone, opacity = 1, t = 0) =>
    d.raw(
      `<circle cx="${fmt(c.x)}" cy="${fmt(c.y)}" r="${fmt(r)}" class="d-line d-tone-${tone}${animation ? " agta-ad-ring" : ""}" stroke-width="1.25"${opacity < 1 ? ` opacity="${opacity}"` : ""}${animation ? ` style="animation-delay:${fmt(t)}s;animation-duration:${fmt(ringDur)}s"` : ""} />`
    );
  /** Arrow from a hollow circle to a square's edge, with the library's head. */
  const toSquare = (from: Point, to: Point, tone: Tone) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    const u = { x: dx / len, y: dy / len };
    const edge = sq / 2 / Math.max(Math.abs(u.x), Math.abs(u.y)) + 1.25;
    const a = { x: from.x + u.x * (circleR + 1), y: from.y + u.y * (circleR + 1) };
    const b = { x: to.x - u.x * edge, y: to.y - u.y * edge };
    d.arrow(a, b, { tone, strokeWidth: line });
  };

  // ---- trained range and header --------------------------------------------
  d.raw(
    `<rect x="${fmt(x0)}" y="${fmt(bandTop - shadePad)}" width="${fmt(divider - x0)}" height="${fmt(bandBot - bandTop + 2 * shadePad)}" class="d-tone-neutral" style="fill:var(--tone);fill-opacity:0.1" />`
  );
  d.line({ x: divider, y: bandTop - shadePad }, { x: divider, y: axisY }, { tone: "muted", strokeWidth: 1, dashed: true });
  const headerY = compact ? 10 : 19;
  if (compact) {
    d.label({ x: x0, y: headerY }, "Trained", { size: "sm", tone: "muted", anchor: "start" });
    d.label({ x: (divider + x1) / 2, y: headerY }, "Scaling beyond training", { size: "sm", tone: "muted" });
  } else {
    d.label({ x: (x0 + divider) / 2, y: headerY }, "Trained iteration range", { size: "md", tone: "muted" });
    d.label({ x: (divider + x1) / 2, y: headerY }, "Scaling beyond the training regime", { size: "md", tone: "muted" });
  }

  // ---- row names -----------------------------------------------------------
  const names: Array<[string, string | null, Tone]> = [
    ["Continuous", null, CONT],
    ["Discrete", null, DISC],
    ["Discrete", "+ self-correction", DISC_EC]
  ];
  names.forEach(([first, second, tone], r) => {
    const yc = rowY[r];
    if (r === 1) d.raw(`<g class="${LIGHT}">`);
    if (compact) {
      const text = second ? `${first} ${second}` : first;
      d.label({ x: x0 + 2, y: yc - bandHalf - 8 }, text, { size: "md", tone, anchor: "start", baseline: "bottom" });
    } else if (second) {
      d.label({ x: 178 * s, y: yc - 9 }, first, { size: "lg", tone, anchor: "end" });
      d.label({ x: 178 * s, y: yc + 10 }, second, { size: "md", tone, anchor: "end" });
    } else {
      d.label({ x: 178 * s, y: yc }, first, { size: "lg", tone, anchor: "end" });
    }
    if (r === 1) d.raw("</g>");
  });

  // ---- the manifold band (translucent, so the trained shading shows through)
  for (const yc of rowY) {
    d.raw(
      `<rect x="${fmt(x0)}" y="${fmt(yc - bandHalf)}" width="${fmt(x1 - x0)}" height="${fmt(2 * bandHalf)}" rx="${compact ? 7 : 9}" class="d-tone-neutral" style="fill:var(--tone);fill-opacity:0.12;stroke:var(--tone)" stroke-width="1" stroke-dasharray="4,3" />`
    );
  }

  // ---- row 1: continuous ---------------------------------------------------
  {
    const yc = rowY[0];
    // The band's centre, dotted as in the original.
    d.raw(
      `<path d="M${fmt(x0)},${fmt(yc)}L${fmt(x1)},${fmt(yc)}" class="d-line d-tone-neutral" stroke-width="0.8" stroke-dasharray="1.5,4" />`
    );

    const manifold = compact
      ? { x: x1 - 6, y: yc + bandHalf - 9 }
      : { x: 1150 * s, y: yc + 50 * s };
    d.label(manifold, "Learned representation manifold", { size: "sm", tone: "muted", anchor: "end", italic: true });

    const pts = seq.cont.map((dv, i) => ({ x: stepX[i], y: yc + dv * k }));
    const escape = escapeAt;
    const fade = (i: number) => (i <= escape ? 1 : Math.max(0.3, 1 - 0.14 * (i - escape)));
    smoothSegments(pts).forEach((seg, i) => {
      const dashed = i + 1 > escape;
      const op = fade(i + 1);
      const extra = `${dashed ? ' stroke-dasharray="4,3"' : ""}${op < 1 ? ` opacity="${fmt(op)}"` : ""}`;
      if (dashed) {
        open(at(i, 0.05), animation ? durT[i] : undefined);
        path(seg, CONT, extra);
        close();
      } else {
        open(at(i, 0.05));
        path(seg, CONT, extra, { t: at(i, 0.05), dur: durT[i] * 0.9 });
        close();
      }
    });
    pts.forEach((p, i) => {
      const escaped = Math.abs(seq.cont[i] * k) > bandHalf;
      open(node(i));
      d.raw(
        `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${contR}" class="d-dot d-tone-${escaped ? ERR : CONT}"${fade(i) < 1 ? ` opacity="${fmt(fade(i))}"` : ""} />`
      );
      close();
    });
  }

  // ---- rows 2 and 3: discrete, without and with self-correction ------------
  const rows: Array<[number[], Tone, boolean]> = [
    [seq.disc, DISC, false],
    [seq.ec, DISC_EC, true]
  ];
  rows.forEach(([lanes, tone, corrects], r) => {
    const yc = rowY[r + 1];
    if (r === 0) d.raw(`<g class="${LIGHT}">`);
    const wrong = lanes.map((l, i) => l !== seq.correct[i]);

    // Decision boundaries between neighbouring states.
    for (const off of [-1.5, -0.5, 0.5, 1.5]) {
      d.raw(
        `<path d="M${fmt(x0)},${fmt(yc + off * lane)}L${fmt(x1)},${fmt(yc + off * lane)}" class="d-line d-tone-muted" stroke-width="0.75" stroke-dasharray="1.5,5" opacity="0.4" />`
      );
    }
    // The codebook: every discrete state (the occupied one is covered by its
    // square, so the grid doesn't give the path away while it animates).
    stepX.forEach((x) => {
      for (const l of LANES) square({ x, y: laneY(yc, l) }, compact ? 2.75 : 3.25, "muted", 0.45);
    });

    // The target path, shown only where the row has left it.
    const runs: number[][] = [];
    let cur: number[] = [];
    wrong.forEach((w, i) => {
      if (w) cur.push(i);
      else if (cur.length) {
        runs.push(cur);
        cur = [];
      }
    });
    if (cur.length) runs.push(cur);
    for (const run of runs) {
      open(node(run[0], 0.35), 0.5);
      const span = (run[0] ? [run[0] - 1] : []).concat(run);
      if (span.length > 2) {
        const dAttr = "M" + span.map((i) => `${fmt(stepX[i])},${fmt(laneY(yc, seq.correct[i]))}`).join("L");
        d.raw(`<path d="${dAttr}" class="d-line d-tone-muted" stroke-width="1" stroke-dasharray="1,3" />`);
      }
      for (const i of run) openSquare({ x: stepX[i], y: laneY(yc, seq.correct[i]) }, sq + 1, "muted");
      close();
    }

    // Error rings (behind the transitions) and correction basins.
    wrong.forEach((w, i) => {
      if (w && !(i && wrong[i - 1])) ring({ x: stepX[i], y: laneY(yc, lanes[i]) }, ringR, ERR, 1, node(i, 0.05));
    });
    if (corrects) {
      for (let i = 1; i < n; i++) {
        if (wrong[i - 1] && !wrong[i]) {
          const c = { x: stepX[i], y: laneY(yc, lanes[i]) };
          ring(c, ringR + 0.5, FIX, 0.5, node(i, 0.05));
          ring(c, ringR + 6, FIX, 0.25, node(i, 0.25));
        }
      }
    }

    // Transitions: a continuous update that lands off the lattice, then the
    // projection onto the nearest discrete state.
    for (let i = 0; i < n - 1; i++) {
      const onset = wrong[i + 1] && !wrong[i];
      const t: Tone = wrong[i + 1] ? ERR : wrong[i] ? FIX : tone;
      const xs = stepX[i];
      const xt = stepX[i + 1];
      const ys = laneY(yc, lanes[i]);
      const yt = laneY(yc, lanes[i + 1]);
      const xh = xs + xhFrac * (xt - xs);
      let yh: number;
      if (onset) {
        const intended = seq.correct[i + 1];
        const side = lanes[i + 1] > intended ? 1 : -1;
        yh = laneY(yc, intended) + side * 21 * k;
      } else {
        yh = yt + 8 * k * (i % 2 ? 1 : -1);
      }
      const c1x = xs + 0.45 * (xh - xs);
      const c2x = xs + 0.58 * (xh - xs);
      open(at(i, 0.05));
      path(
        `M${fmt(xs + sq / 2)},${fmt(ys)}C${fmt(c1x)},${fmt(ys)} ${fmt(c2x)},${fmt(yh)} ${fmt(xh)},${fmt(yh)}`,
        t,
        "",
        { t: at(i, 0.05), dur: durT[i] * 0.5 }
      );
      close();
      open(at(i, 0.55));
      toSquare({ x: xh, y: yh }, { x: xt, y: yt }, t);
      hollow({ x: xh, y: yh }, circleR, t);
      close();
    }

    // States, then one-off annotations.
    stepX.forEach((x, i) => {
      open(node(i));
      square({ x, y: laneY(yc, lanes[i]) }, sq, wrong[i] ? ERR : tone);
      close();
    });
    stepX.forEach((x, i) => {
      const y = laneY(yc, lanes[i]);
      if (wrong[i] && !(i && wrong[i - 1])) {
        open(node(i, 0.3), 0.4);
        d.label({ x: x + (compact ? 8 : 10), y: y + (compact ? 13 : 17) }, "error", {
          size: "sm",
          tone: ERR,
          anchor: "start",
          italic: true
        });
        close();
      } else if (!wrong[i] && i && wrong[i - 1]) {
        open(node(i, 0.4), 0.4);
        d.label({ x: x + (compact ? 9 : 11), y: y + (compact ? 15 : 19) }, "correction", {
          size: "sm",
          tone: FIX,
          anchor: "start",
          italic: true
        });
        close();
      }
    });
    if (r === 0) d.raw("</g>");
  });

  // ---- iteration axis -------------------------------------------------------
  d.line({ x: x0, y: axisY }, { x: x1, y: axisY }, { tone: "muted", strokeWidth: 0.75 });
  for (const x of stepX) d.line({ x, y: axisY - 3 }, { x, y: axisY + 3 }, { tone: "muted", strokeWidth: 0.75 });
  d.label({ x: (x0 + x1) / 2, y: axisY + (compact ? 14 : 18) }, "Recurrent iterations", { size: "sm", tone: "muted" });

  // ---- legend ---------------------------------------------------------------
  const glyph = 18;
  const pad = 7;
  const gap = 22;
  const charW = 6.5; // 12px UI face, roughly
  type Item = [kind: "square" | "circle" | "arrow", text: string];
  const items: Item[] = [
    ["square", "Discrete state"],
    ["circle", "Continuous state"],
    ["arrow", "Discretize + re-embed"]
  ];
  const lines: Item[][] = compact ? [items.slice(0, 2), items.slice(2)] : [items];
  lines.forEach((row, li) => {
    const widths = row.map(([, text]) => glyph + pad + text.length * charW);
    let x = (width - widths.reduce((a, b) => a + b, 0) - gap * (row.length - 1)) / 2;
    const y = legendY + li * 18;
    row.forEach(([kind, text], j) => {
      const g = { x: x + glyph / 2, y };
      if (kind === "square") square(g, sq, "ink");
      else if (kind === "circle") hollow(g, circleR + 0.5, "ink");
      else d.arrow({ x, y }, { x: x + glyph, y }, { tone: "ink", strokeWidth: line });
      d.label({ x: x + glyph + pad, y }, text, { size: "sm", anchor: "start" });
      x += widths[j] + gap;
    });
  });

  return d;
};

export default defineDiagram({
  size: "full",
  alt: "Three rows trace one token's latent state across recurrent iterations, with a shaded band for the representation space learned in training and the trained iteration range shaded on the left. Continuous states follow the band during training but drift off it beyond the training regime. Discrete states move between grid points inside the band and follow the target path much longer, until one step projects onto a neighbouring state; the error then persists. With self-correction, the next iteration returns to the target path.",
  draw: (context) => drawAnchoringDrift(context)
});
