import { NEUTRAL, SERIES } from "../../../lib/figures";
import { canvas, defineDiagram, type Point, type Tone } from "../../../lib/figures/diagram";

// Redrawn from figures/2-layer-illustrated.pdf (paper: figs/.../mech_interp,
// Section "Mechanistic Interpretability"). The circuit at the rhs position of
// "⟨sep⟩ ⟨var 0⟩ + ⟨var 1⟩ + ⟨var 2⟩ = ⟨rhs⟩", read bottom to top: layer-1
// head groups copy each variable's name to rhs; layer-2 head groups use those
// names as queries to fetch each variable's value from earlier equations (an
// induction head); the final MLP adds the values mod 23. Head groups are the
// paper's, coloured as in the post's mechanistic-interpretability charts:
// ⟨var 0⟩ series 1, ⟨var 1⟩ series 2, ⟨var 2⟩ series 3. Heads outside these
// groups are not drawn. The published history box listed "var1: 15" for the
// third variable; it is var 2 here.

const GROUP_TONES: Tone[] = [1, 2, 3];
const LAYER1 = [[4, 8], [5, 12], [3, 7, 11, 14]];
const LAYER2 = [[0, 8, 15], [5, 10], [2, 3, 4, 7, 9]];
const VALUES = [11, 13, 15];
const RESULT = (VALUES[0] + VALUES[1] + VALUES[2]) % 23;

export default defineDiagram({
  size: "full",
  alt: `Two-layer circuit at the rhs position of an equation with three variables. Layer-1 attention heads, grouped by variable (heads 4 and 8 for var 0, 5 and 12 for var 1, 3, 7, 11 and 14 for var 2), copy each variable's name to rhs. Layer-2 heads (0, 8 and 15; 5 and 10; 2, 3, 4, 7 and 9) use those names as queries to fetch each variable's value from earlier equations, an induction head. The final MLP adds the values, 11 + 13 + 15 mod 23 = ${RESULT}.`,
  legend: [
    { key: "region", label: "⟨var 0⟩ heads", color: SERIES[0] },
    { key: "region", label: "⟨var 1⟩ heads", color: SERIES[1] },
    { key: "region", label: "⟨var 2⟩ heads", color: SERIES[2] },
    { key: "region", label: "Other tokens", color: NEUTRAL }
  ],
  draw: ({ width, compact }) => {
    const W = width;
    // Token row: eight tokens, right-aligned so rhs sits at the right edge.
    const pitch = compact ? 44 : 74;
    const tokW = compact ? 40 : 64;
    const right = compact ? W - 2 : W;
    const tokX = (i: number) => right - tokW / 2 - pitch * (7 - i);
    const varX = (k: number) => tokX(2 * k + 1);
    const rhsX = tokX(7);
    const sq = compact ? 18 : 22;
    const sqPitch = compact ? 20 : 26;
    const tokH = compact ? 28 : 32;
    const stripH = 28;
    const gap = compact ? 30 : 34;

    // Rows, top to bottom.
    const mlpTop = 8;
    const mlpH = compact ? 28 : 32;
    const s2Top = mlpTop + mlpH + gap;
    const l2Top = s2Top + stripH + gap;
    const s1Top = l2Top + sq + (compact ? 32 : 40);
    const l1Top = s1Top + stripH + gap;
    const tokTop = l1Top + sq + (compact ? 30 : 50);
    const histTop = compact ? tokTop + tokH + 14 : tokTop + tokH - 68;
    const histH = compact ? 28 : 68;
    const H = compact ? histTop + histH + 2 : tokTop + tokH + 2;
    const d = canvas(W, H);

    const sm = compact ? ("sm" as const) : ("md" as const);
    const varName = (k: number) => (compact ? `var ${k}` : `⟨var ${k}⟩`);

    // A strip of the rhs position's state: one cell per variable, centred on
    // that variable's token, and the rhs cell.
    const strip = (top: number, texts: string[]) => {
      const edges = [varX(0) - pitch, varX(0) + pitch, varX(1) + pitch, varX(2) + pitch, right];
      for (let c = 0; c < 4; c++) {
        d.rect(edges[c], top, edges[c + 1] - edges[c], stripH, {
          tone: c < 3 ? GROUP_TONES[c] : "neutral",
          strokeWidth: 1
        });
      }
      d.rect(edges[0], top, right - edges[0], stripH, { tone: "ink", fill: "none", radius: 0 });
      texts.forEach((t, c) => d.label({ x: (edges[c] + edges[c + 1]) / 2, y: top + stripH / 2 }, t, { size: sm }));
      return edges;
    };

    // A row of head groups, each centred on its variable's token.
    const heads = (top: number, groups: number[][]) =>
      groups.map((group, k) => {
        const x0 = varX(k) - (group.length * sqPitch - (sqPitch - sq)) / 2;
        group.forEach((h, j) => {
          const x = x0 + j * sqPitch;
          d.rect(x, top, sq, sq, { tone: GROUP_TONES[k], radius: 3 });
          d.label({ x: x + sq / 2, y: top + sq / 2 + 0.5 }, String(h), { size: "sm" });
        });
        return { left: x0, right: x0 + group.length * sqPitch - (sqPitch - sq) };
      });

    // Residual stream at rhs: straight up from the token through both strips.
    const rhsLine = (from: number, to: number) => d.arrow({ x: rhsX, y: from }, { x: rhsX, y: to + 1 });
    rhsLine(tokTop - 1, s1Top + stripH);
    rhsLine(s1Top - 1, s2Top + stripH);

    // Layer 1: keys from the variable tokens, query from rhs, outputs up.
    const g1 = heads(l1Top, LAYER1);
    const l1y = l1Top + sq / 2;
    for (let k = 0; k < 3; k++) {
      d.arrow({ x: varX(k), y: tokTop - 2 }, { x: varX(k), y: l1Top + sq + 2 }, { tone: GROUP_TONES[k] });
      d.arrow({ x: varX(k), y: l1Top - 2 }, { x: varX(k), y: s1Top + stripH + 1 }, { tone: GROUP_TONES[k] });
    }
    d.arrow({ x: rhsX, y: l1y }, { x: g1[2].right + 3, y: l1y });
    if (!compact) d.label({ x: (rhsX + g1[2].right) / 2, y: l1y - 9 }, "query", { size: "sm", tone: "muted" });

    // Layer 2: keys from earlier equations, query from rhs, outputs up.
    const g2 = heads(l2Top, LAYER2);
    const l2y = l2Top + sq / 2;
    for (let k = 0; k < 3; k++) {
      d.arrow({ x: varX(k), y: l2Top - 2 }, { x: varX(k), y: s2Top + stripH + 1 }, { tone: GROUP_TONES[k] });
    }
    d.arrow({ x: rhsX, y: l2y }, { x: g2[2].right + 3, y: l2y });
    if (!compact) d.label({ x: (rhsX + g2[2].right) / 2, y: l2y - 9 }, "query", { size: "sm", tone: "muted" });

    strip(s1Top, [0, 1, 2].map((k) => (compact ? varName(k) : `name of ${varName(k)}`)).concat(compact ? "rhs" : "⟨rhs⟩"));
    const edges = strip(
      s2Top,
      VALUES.map((v, k) => (compact ? String(v) : `value of ${varName(k)}: ${v}`)).concat(compact ? "rhs" : "⟨rhs⟩")
    );

    // Final MLP and its output.
    const stripMid = (edges[0] + right) / 2;
    const mlpW = compact ? 190 : 250;
    const mlpX = stripMid - mlpW / 2 - (compact ? 22 : 40);
    d.arrow({ x: mlpX + mlpW / 2, y: s2Top - 1 }, { x: mlpX + mlpW / 2, y: mlpTop + mlpH + 1 });
    d.rect(mlpX, mlpTop, mlpW, mlpH, { tone: "neutral", radius: 4 });
    d.label({ x: mlpX + mlpW / 2, y: mlpTop + mlpH / 2 }, `MLP: (${VALUES.join(" + ")}) mod 23`, { size: sm });
    const resW = compact ? 40 : 64;
    const resX = right - resW;
    d.arrow({ x: mlpX + mlpW + 1, y: mlpTop + mlpH / 2 }, { x: resX - 2, y: mlpTop + mlpH / 2 });
    d.rect(resX, mlpTop, resW, mlpH, { tone: "neutral", radius: 4 });
    d.label({ x: resX + resW / 2, y: mlpTop + mlpH / 2 }, compact ? String(RESULT) : `⟨${RESULT}⟩`, { size: "lg" });

    // Current equation's tokens.
    const tokens = ["⟨sep⟩", varName(0), "+", varName(1), "+", varName(2), "=", compact ? "rhs" : "⟨rhs⟩"];
    tokens.forEach((t, i) => {
      const k = i % 2 === 1 && i < 7 ? (i - 1) / 2 : -1;
      d.rect(tokX(i) - tokW / 2, tokTop, tokW, tokH, { tone: k >= 0 ? GROUP_TONES[k] : "neutral", radius: 4 });
      d.label({ x: tokX(i), y: tokTop + tokH / 2 }, compact && i === 0 ? "sep" : t, { size: sm });
    });

    // Earlier equations, which layer 2 searches (keys and values).
    const route = (points: Point[]) => {
      for (let i = 0; i < points.length - 2; i++) d.line(points[i], points[i + 1]);
      d.arrow(points[points.length - 2], points[points.length - 1]);
    };
    if (compact) {
      d.rect(12, histTop, right - 12, histH, { tone: "neutral", radius: 4, dashed: true });
      d.label(
        { x: (12 + right) / 2, y: histTop + histH / 2 },
        `Earlier: ${VALUES.map((v, k) => `var ${k} = ${v}`).join(" · ")}`,
        { size: "sm" }
      );
      route([
        { x: 12, y: histTop + histH / 2 },
        { x: 5, y: histTop + histH / 2 },
        { x: 5, y: l2y },
        { x: g2[0].left - 3, y: l2y }
      ]);
      d.label({ x: 12, y: l1y }, "L1", { anchor: "start", size: "sm", tone: "muted" });
      d.label({ x: 10, y: l2Top - 8 }, "L2", { anchor: "start", size: "sm", tone: "muted" });
    } else {
      const histW = 172;
      d.rect(0, histTop, histW, histH, { tone: "neutral", radius: 4, dashed: true });
      d.label({ x: 12, y: histTop + 14 }, "Earlier equations", { anchor: "start", size: "sm", tone: "muted" });
      VALUES.forEach((v, k) =>
        d.label({ x: 12, y: histTop + 31 + k * 14 }, `⟨var ${k}⟩ = ${v}`, { anchor: "start", size: "sm" })
      );
      const lane = histW + 22;
      route([
        { x: histW + 1, y: histTop + histH / 2 },
        { x: lane, y: histTop + histH / 2 },
        { x: lane, y: l2y },
        { x: g2[0].left - 3, y: l2y }
      ]);
      d.label({ x: lane + 6, y: l2y - 9 }, "keys", { anchor: "start", size: "sm", tone: "muted" });

      // Stage names, left of each row.
      const stage = (y: number, name: string, note: string) => {
        d.label({ x: 0, y: y - 8 }, name, { anchor: "start" });
        d.label({ x: 0, y: y + 9 }, note, { anchor: "start", size: "sm", tone: "muted" });
      };
      stage(l1y, "Layer 1 attention", "copies variable names");
      stage(l2y, "Layer 2 attention", "induction head: fetches values");
      stage(mlpTop + mlpH / 2, "Final MLP", "adds the values mod 23");
    }
    return d;
  }
});
