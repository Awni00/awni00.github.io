// Dual Attention · option P1 · "One sender, two messages" (round 3)
// Three senders (square, disc, ring) each fork into two arrows toward one receiver (diamond).
// RED arrow: the sender's own shape, copied (sensory = what the object is).
// BLUE arrow: a pair glyph [sender shape -- link -- receiver shape] (relational = how the
// sender relates to the receiver; link weight = relation score). Arrow weight = attention.
// The receiver's interior shows the integrated state: red blend of shapes | blue relation star.
PreviewArt.register({
  slug: "dual-attention",
  option: "P1",
  round: 3,
  title: "One sender, two messages",
  concept: "Each sender sends what it is (a copy of its shape, red) and how it relates to the receiver (a link between the sender's shape and the receiver's shape, blue); the receiver ends up holding both kinds side by side.",
  legend: "ink shapes → senders; red shape on a red arrow → sensory message (the object itself); blue plate ⟨ sender shape — receiver shape ⟩ → relational message (a comparison of this sender with the receiver; link thickness = relation score); arrow weight → attention weight; message box → both messages combined, red blend of shapes (sensory) | blue relation star (relational); diamond → receiver",
  seed: 3,
  params: { alpha: [0.5, 0.2, 0.3], score: [0.9, 0.4, 0.65] },
  draw(p, C, { W, H, params: P, label, arrow, arrowHead }) {
    const RED = C.accent2, BLUE = C.accent;
    const rows = [225, 410, 596];
    const cy = rows[1];
    const dy = 36;
    const xS = 142, xFork0 = xS + 42, xLane0 = 250, xBend0 = 522, xBend1 = 650, xWall = 678;
    const box = { x0: xWall, x1: 872, y0: cy - 132, y1: cy + 132, mid: 775 };
    const rc = { x: 1012, y: cy, R: 80 }; // receiver diamond
    const portGap = 36;
    const kinds = ["square", "disc", "ring"];
    const aw = (j) => 8 + 12 * P.alpha[j]; // arrow weight ~ attention
    const HEAD = 26;
    const boxFill = C.mix("bg", "faint", 0.35);

    const glyph = (kind, x, y, r, col, o = {}) => {
      p.push();
      p.translate(x, y);
      if (kind === "diamond") p.rotate(p.QUARTER_PI);
      const hollow = o.hollow;
      const sw = o.sw ?? r * 0.38;
      if (hollow) { p.noFill(); p.stroke(col); p.strokeWeight(sw); }
      else { p.noStroke(); p.fill(col); }
      if (kind === "disc") { hollow ? p.circle(0, 0, r * 2 - sw) : p.circle(0, 0, r * 2); }
      else if (kind === "square") { p.rectMode(p.CENTER); hollow ? p.rect(0, 0, r * 1.75 - sw, r * 1.75 - sw, r * 0.3) : p.rect(0, 0, r * 1.75, r * 1.75, r * 0.3); }
      else if (kind === "diamond") { p.rectMode(p.CENTER); hollow ? p.rect(0, 0, r * 1.45 - sw, r * 1.45 - sw, r * 0.26) : p.rect(0, 0, r * 1.45, r * 1.45, r * 0.26); }
      else if (kind === "ring") { p.noFill(); p.stroke(col); p.strokeWeight(sw); p.circle(0, 0, r * 2 - sw); }
      p.pop();
    };

    // ---- lanes (fork at the sender, straight, ease into the box wall) ---------------
    const lanes = [];
    rows.forEach((y, j) => [-dy, dy].forEach((o, k) => lanes.push({ j, k, y0: y + o })));
    lanes.forEach((L, m) => { L.y1 = cy + (m - 2.5) * portGap; });
    const ease = (u) => u * u * (3 - 2 * u);
    const lanePts = (L) => {
      const pts = [];
      const yc = rows[L.j];
      for (let a = 0; a <= 20; a++) {
        const u = a / 20;
        pts.push({ x: xFork0 + (xLane0 - xFork0) * u, y: yc + (L.y0 - yc) * ease(u) });
      }
      pts.push({ x: xBend0, y: L.y0 });
      for (let a = 1; a <= 30; a++) {
        const u = a / 30;
        pts.push({ x: xBend0 + (xBend1 - xBend0) * u, y: L.y0 + (L.y1 - L.y0) * ease(u) });
      }
      pts.push({ x: xWall - 4 - HEAD * 0.9, y: L.y1 });
      return pts;
    };
    p.noFill();
    lanes.forEach((L) => {
      p.stroke(L.k === 0 ? RED : BLUE); p.strokeWeight(aw(L.j));
      p.beginShape(); lanePts(L).forEach((q) => p.vertex(q.x, q.y)); p.endShape();
    });
    lanes.forEach((L) => arrowHead(xWall - 4, L.y1, 0, { color: L.k === 0 ? RED : BLUE, size: HEAD }));

    // ---- message box: two halves, red sensory | blue relational ------------------------
    p.noStroke(); p.fill(boxFill); p.rectMode(p.CORNERS);
    p.rect(box.x0, box.y0, box.x1, box.y1, 26);
    p.noFill(); p.stroke(C.faint); p.strokeWeight(8);
    p.rect(box.x0, box.y0, box.x1, box.y1, 26);
    p.stroke(C.faint); p.strokeWeight(6); p.line(box.mid, box.y0 + 30, box.mid, box.y1 - 30);
    // arrowheads sit on the wall: redraw over the outline
    lanes.forEach((L) => arrowHead(xWall - 4, L.y1, 0, { color: L.k === 0 ? RED : BLUE, size: HEAD }));
    // red half: blend of the senders' shapes
    const bx = (box.x0 + box.mid) / 2 + 4;
    const bpos = [[-8, -52], [14, 0], [-8, 52]];
    const br = (j) => 17 + 24 * P.alpha[j];
    [2, 1, 0].forEach((j) => { p.noStroke(); p.fill(boxFill); p.circle(bx + bpos[j][0], cy + bpos[j][1], br(j) * 2 + 12); });
    [2, 1, 0].forEach((j) => glyph(kinds[j], bx + bpos[j][0], cy + bpos[j][1], br(j), RED));
    // blue half: relation star (the receiver's links to each sender)
    const sx = box.mid + 28;
    const leaf = [[56, -56], [64, 0], [56, 56]];
    leaf.forEach(([lx, ly], j) => {
      p.stroke(BLUE); p.strokeWeight(6 + 8 * P.score[j]); p.line(sx, cy, box.mid + lx, cy + ly);
    });
    leaf.forEach(([lx, ly], j) => {
      p.noStroke(); p.fill(boxFill); p.circle(box.mid + lx, cy + ly, 42);
      glyph(kinds[j], box.mid + lx, cy + ly, 14, BLUE, { hollow: true, sw: 6 });
    });
    p.noStroke(); p.fill(boxFill); p.circle(sx, cy, 52);
    glyph("diamond", sx, cy, 20, BLUE, { hollow: true, sw: 7 });

    // ---- box -> receiver ----------------------------------------------------------------
    arrow(box.x1 + 6, cy, rc.x - rc.R - 6, cy, { color: C.ink2, weight: 10, size: 30 });
    glyph("diamond", rc.x, rc.y, rc.R, C.ink);

    // ---- senders ----------------------------------------------------------------
    rows.forEach((y, j) => glyph(kinds[j], xS, y, 44, C.ink));

    // ---- messages on the lanes ------------------------------------------------------
    rows.forEach((y, j) => {
      // sensory: a red copy of the sender's shape
      p.noStroke(); p.fill(C.bg); p.circle(400, y - dy, 66);
      glyph(kinds[j], 400, y - dy, 26, RED);
      // relational: a comparison plate  < sender shape -- receiver shape >
      const yl = y + dy, px0 = 298, px1 = 502;
      p.noStroke(); p.fill(C.accentSoft); p.rectMode(p.CORNERS);
      p.rect(px0, yl - 36, px1, yl + 36, 20);
      label("⟨", px0 + 20, yl - 3, { color: BLUE, size: 58, upright: true });
      label("⟩", px1 - 20, yl - 3, { color: BLUE, size: 58, upright: true });
      glyph(kinds[j], px0 + 62, yl, 19, BLUE, { hollow: true, sw: 7 });
      glyph("diamond", px1 - 62, yl, 24, BLUE, { hollow: true, sw: 7 });
      p.stroke(BLUE); p.strokeWeight(5 + 7 * P.score[j]);
      p.line(px0 + 62 + 24, yl, px1 - 62 - 28, yl);
    });

    // ---- word labels: outside the lanes, each beside its own channel --------------------
    label("sensory", 360, rows[0] - dy - 60, { color: RED, size: 54, upright: true, align: "left" });
    label("relational", 360, rows[2] + dy + 78, { color: BLUE, size: 54, upright: true, align: "left" });
  },
});
