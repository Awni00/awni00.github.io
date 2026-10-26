// Relational Bottleneck · option P2 · "Wall with a slot"
// A sieve that stops node features and passes only edges. Five varied objects
// press against a wall (their own features are blocked); a slot lets one bundle
// of thin relation threads through, one thread per related pair (C(5,2) = 10).
// The threads fan out into the relation matrix R, R_ij = <phi(x_i), phi(x_j)>:
// cell tone = similarity, diagonal strongest. No object appears right of the wall.
PreviewArt.register({
  slug: "relational-bottleneck",
  option: "P2",
  round: 2,
  title: "Wall with a slot",
  concept: "The relational bottleneck blocks object features and passes only pairwise relations, which arrive as a similarity matrix R.",
  legend: "shapes left of the wall → objects (features blocked by the wall); slot → ⟨·,·⟩ inner product; threads → one relation per pair; grid → relation matrix R, darker = more similar",
  seed: 5,
  params: { n: 5, cell: 80, gap: 12 },
  draw(p, C, { W, H, params: P, label }) {
    const n = P.n, cell = P.cell, gap = P.gap, pitch = cell + gap;
    const gridW = n * cell + (n - 1) * gap;
    const gx0 = 1098 - gridW, gy0 = 420 - gridW / 2;
    const wallX = 390, slotY = 420, slotHalf = 46;
    const colX = 175;

    // ---- relation matrix values: unit feature vectors phi(x_i) -> cosine similarity ----
    // (angles chosen so one pair is near-identical; objects look different regardless)
    const ang = [0, 55, 105, 10, 160].map((a) => (a * Math.PI) / 180);
    const R = ang.map((a) => ang.map((b) => Math.max(0, Math.cos(a - b))));

    // ---- wall (two segments, slot between) ----
    p.stroke(C.ink); p.strokeWeight(20);
    p.line(wallX, 125, wallX, slotY - slotHalf);
    p.line(wallX, slotY + slotHalf, wallX, 715);

    // ---- threads: 10 pairs, ordered, so they never cross ----
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
    const m = pairs.length; // 10
    const tx0 = wallX + 14, tx1 = gx0 - 14;
    p.noFill(); p.stroke(C.accent); p.strokeWeight(4.5);
    pairs.forEach((_, k) => {
      const y0 = slotY + (k - (m - 1) / 2) * 5.4;
      // two threads per grid row, centred on the row
      const row = Math.floor(k / 2), side = k % 2 ? 1 : -1;
      const y1 = gy0 + row * pitch + cell / 2 + side * 15;
      const d = tx1 - tx0;
      p.beginShape();
      const xb = tx0 + 60; // parallel ribbon through the slot, then fan out
      p.vertex(tx0, y0);
      p.vertex(xb, y0);
      p.bezierVertex(xb + (tx1 - xb) * 0.55, y0, tx1 - (tx1 - xb) * 0.55, y1, tx1, y1);
      p.endShape();
    });

    // ---- objects (blocked): varied, pressed against the wall ----
    const ys = [0, 1, 2, 3, 4].map((i) => slotY + (i - 2) * 92);
    const objs = [
      { s: "ring", d: 84, c: "ink2" },
      { s: "disc", d: 54, c: "ink" },
      { s: "sq", d: 82, c: "ink" },
      { s: "ring", d: 58, c: "ink" },
      { s: "disc", d: 74, c: "ink2" },
    ];
    objs.forEach((o, i) => {
      p.push(); p.translate(colX, ys[i]);
      const col = C[o.c];
      if (o.s === "disc") { p.noStroke(); p.fill(col); p.circle(0, 0, o.d); }
      else if (o.s === "ring") { p.noFill(); p.stroke(col); p.strokeWeight(10); p.circle(0, 0, o.d - 10); }
      else { p.noStroke(); p.fill(col); p.rectMode(p.CENTER); p.rect(0, 0, o.d, o.d, 20); }
      p.pop();
    });

    // ---- relation matrix R ----
    const radius = 16;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = R[i][j];
        const x = gx0 + j * pitch, y = gy0 + i * pitch;
        p.noStroke();
        p.fill(i === j ? C.accent : C.mix("faint", "accent", Math.pow(v, 1.6)));
        p.rect(x, y, cell, cell, radius);
      }
    }

    // ---- labels ----
    label("⟨·,·⟩", 298, slotY, { size: 64, color: C.accent, upright: true });
    label("R", gx0 + gridW / 2, 140, { size: 66, color: C.ink });
  },
});
