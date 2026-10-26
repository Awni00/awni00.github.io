// Abstractor · option P2 · "Attention returns symbols"
// Relational cross-attention. The 5x5 grid is the softmax relation matrix R built from
// object queries (rows, left) and object keys (columns, top): five genuinely different
// objects serve as both. One query (full strength, outlined row) attends over the keys;
// the values under the columns are plain symbols s_j instead of the objects, so the
// output (disc area = attention weight) is a mix of symbols only.
PreviewArt.register({
  slug: "abstractor",
  option: "P2",
  round: 3,
  title: "Attention returns symbols",
  concept: "Queries and keys come from the objects, but the values are learned symbols, so the attention output carries relations and no object content.",
  legend: "ink glyphs (top) → objects as keys, (left) → the same objects as queries, only the selected query at full strength; grid R → softmax relation matrix, tone = weight; outlined row → the selected query's attention pattern; accent discs s → plain symbols used as values (disc area = that row's weight on the symbol)",
  seed: 5,
  params: { n: 5, query: 2, sharp: 1.7, cellW: 110, cellH: 72, pitchX: 122, pitchY: 90, s: 0.85 },
  draw(p, C, { W, H, params: P, label }) {
    const n = P.n, q = P.query;
    const cx = (j) => 488 + j * P.pitchX;
    const ry = (i) => 262 + i * P.pitchY;
    const yHead = 150, ySym = 734, xQuery = 352;
    // Relation matrix: scores from 3-d object features, row-wise softmax.
    const f = Array.from({ length: n }, () => [p.randomGaussian(), p.randomGaussian(), p.randomGaussian()]);
    const R = f.map((fi) => {
      const e = f.map((fj) => Math.exp((P.sharp * (fi[0] * fj[0] + fi[1] * fj[1] + fi[2] * fj[2])) / 3));
      const z = e.reduce((a, b) => a + b, 0);
      return e.map((v) => v / z);
    });
    const rowMax = R.map((r) => Math.max(...r)), wmaxRow = rowMax[q];
    // Five different objects: shape and fill both vary.
    // disc (solid ink), triangle (solid ink2), ring (hollow), diamond (half-filled), bar (solid ink).
    const glyph = (k, x, y, fade) => {
      const s = P.s, ink = fade ? C.faint : C.ink, ink2 = fade ? C.faint : C.ink2;
      p.push();
      p.strokeJoin(p.ROUND);
      if (k === 0) { p.noStroke(); p.fill(ink); p.circle(x, y, 88 * s); }
      else if (k === 1) {
        const R0 = 52 * s, rIn = R0 - 5, pts = [-90, 30, 150].map((d) => [x + rIn * Math.cos((d * Math.PI) / 180), y + 0.12 * R0 + rIn * Math.sin((d * Math.PI) / 180)]);
        p.fill(ink2); p.stroke(ink2); p.strokeWeight(10);
        p.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
      } else if (k === 2) { p.noFill(); p.stroke(ink); p.strokeWeight(12); p.circle(x, y, 84 * s); }
      else if (k === 3) {
        const R0 = 54 * s - 5;
        p.noStroke(); p.fill(ink);
        p.beginShape(); p.vertex(x, y - R0); p.vertex(x - R0, y); p.vertex(x, y + R0); p.endShape(p.CLOSE);
        p.noFill(); p.stroke(ink); p.strokeWeight(10);
        p.beginShape(); p.vertex(x, y - R0); p.vertex(x + R0, y); p.vertex(x, y + R0); p.vertex(x - R0, y); p.endShape(p.CLOSE);
      } else { p.noStroke(); p.fill(ink); p.rect(x - 50 * s, y - 20 * s, 100 * s, 40 * s, 20 * s); }
      p.pop();
    };
    // Grid cells: tone = attention weight (linear in w / row max). The selected row is
    // tinted with the accent, so its tones visibly match the accent discs below.
    p.noStroke();
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const u = R[i][j] / rowMax[i];
      p.fill(i === q ? C.mix("bg", "accent", 0.1 + 0.85 * u) : C.mix("bg", "ink2", 0.12 + 0.8 * u));
      p.rect(cx(j) - P.cellW / 2, ry(i) - P.cellH / 2, P.cellW, P.cellH, 14);
    }
    // The selected query's row, outlined.
    const x0 = cx(0) - P.cellW / 2 - 5, x1 = cx(n - 1) + P.cellW / 2 + 5;
    p.noFill(); p.stroke(C.ink); p.strokeWeight(8);
    p.rect(x0, ry(q) - P.cellH / 2 - 5, x1 - x0, P.cellH + 10, 18);
    p.line(xQuery + 46, ry(q), x0, ry(q));
    // Objects: keys above the columns (full strength); queries down the left, faded
    // except the selected one.
    for (let j = 0; j < n; j++) glyph(j, cx(j), yHead, false);
    for (let i = 0; i < n; i++) glyph(i, xQuery, ry(i), i !== q);
    // Values: plain symbols under the columns; disc area = this row's weight on that symbol.
    const rSym = 42;
    for (let j = 0; j < n; j++) {
      p.stroke(C.faint); p.strokeWeight(6);
      p.line(cx(j), ry(n - 1) + P.cellH / 2 + 8, cx(j), ySym - rSym - 4);
      p.noFill(); p.circle(cx(j), ySym, 2 * rSym);
      p.noStroke(); p.fill(C.accent); p.circle(cx(j), ySym, 2 * (rSym - 4) * Math.sqrt(R[q][j] / wmaxRow));
    }
    label("⟨q,k⟩", xQuery, yHead, {});
    label("R", 1098, ry(1), {});
    label("s", 1098, ySym, {});
  },
});
