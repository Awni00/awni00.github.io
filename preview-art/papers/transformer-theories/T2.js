// Transformer Theories · option T2 · "Theories around the world" (round 7)
// Five theory blobs ring one globe (the real world), each holding its own kind of mathematics:
// a small boolean/threshold circuit (circuit complexity), a C-RASP count #[j ≤ i : P(j)] over the
// tokens up to i, machines exchanging one all-to-all round (MPC), a 3D loss landscape with one sharp
// well (sensitivity), and an FO[<] formula (formal logic). Each theory sends one radial prediction
// arrow to the globe; the verdict sits on the arrow: blue tick if it held, red cross if it failed.
// Blobs are placed so every arrow has the same length (equal gap from blob edge to globe rim).
PreviewArt.register({
  slug: "transformer-theories",
  option: "T2",
  round: 7,
  title: "Theories around the world",
  concept: "Five kinds of theory of what transformers can do (circuits, C-RASP counting, parallel computation, sensitivity, first-order logic) each make a prediction about the real world; tested there, some hold and some fail.",
  legend: "globe → the real world; blob with a layered gate diagram (∧, ∨, ≥) → circuit complexity (AC⁰/TC⁰ circuits); blob with #[j ≤ i : P(j)] over a row of tokens → C-RASP counting (bracket spans every token up to position i, the square; filled tokens are those where P holds); blob with two rows of boxes wired all-to-all → MPC, parallel machines exchanging one communication round; blob with a wireframe surface and one sharp well → sensitivity, a sharp loss landscape; blob with ∀i (Q_b(i) → ∃j<i Q_a(j)) → formal logic, FO[<] (every b is preceded by some a); grey radial arrows → predictions; blue ✓ on an arrow → the prediction held; red ✗ → it failed",
  seed: 4,
  params: {
    globe: { x: 600, y: 452, r: 80 },
    gap: 140,                       // blob edge → globe rim, identical for every arrow
    // direction from the globe (degrees, screen coords), blob half-size, inner drawing, outcome
    theories: [
      { angle: -138, rx: 126, ry: 92, kind: "circuit", ok: 1 },
      { angle: -42, rx: 168, ry: 86, kind: "crasp", ok: 0 },
      { angle: 12, rx: 130, ry: 88, kind: "mpc", ok: 1 },
      { angle: 90, rx: 290, ry: 56, kind: "fo", ok: 1 },
      { angle: 168, rx: 146, ry: 94, kind: "sensitivity", ok: 0 },
    ],
  },
  draw(p, C, { params: P, label, check, cross, arrow, arrowHead }) {
    const G = P.globe;
    const wire = (w = 5) => { p.noFill(); p.stroke(C.ink2); p.strokeWeight(w); };
    const inkLine = (w = 7) => { p.noFill(); p.stroke(C.ink); p.strokeWeight(w); };

    // --- organic blob: an ellipse whose radius carries smooth, band-limited loop noise --------
    const makeBlob = (rx, ry) => {
      const H = [2, 3, 4].map((h) => ({ h, a: p.random(0.03, 0.07) / (h - 1) ** 0.5, ph: p.random(p.TWO_PI) }));
      const R = (th) => 1 + H.reduce((s, { h, a, ph }) => s + a * Math.cos(h * th + ph), 0);
      const b = { cx: 0, cy: 0, rx, ry };
      b.at = (th) => ({ x: b.cx + rx * R(th) * Math.cos(th), y: b.cy + ry * R(th) * Math.sin(th) });
      // distance from the blob's centre to its edge in direction (dx, dy)
      b.edge = (dx, dy) => { const th = Math.atan2(dy / ry, dx / rx); return Math.hypot(rx * R(th) * Math.cos(th), ry * R(th) * Math.sin(th)); };
      return b;
    };
    const drawBlob = (b) => {
      p.fill(C.mix("bg", "faint", 0.3)); p.stroke(C.ink); p.strokeWeight(9);
      p.beginShape();
      for (let i = 0; i < 180; i++) { const q = b.at((i / 180) * p.TWO_PI); p.vertex(q.x, q.y); }
      p.endShape(p.CLOSE);
    };

    // --- inner drawings ---------------------------------------------------------------------------
    // circuit complexity: 4 inputs → 2 gates (∧, ∨) → 1 threshold gate → output
    const circuit = (x, y) => {
      y += 4;
      const ins = [-72, -24, 24, 72].map((dx) => ({ x: x + dx, y: y + 56 }));
      const g1 = [-42, 42].map((dx) => ({ x: x + dx, y: y + 2 }));
      const out = { x, y: y - 52 };
      wire(5);
      ins.forEach((a) => g1.forEach((g) => p.line(a.x, a.y, g.x, g.y + 18)));
      g1.forEach((g) => p.line(g.x, g.y - 18, out.x, out.y + 18));
      p.line(out.x, out.y - 20, out.x, out.y - 34);
      p.noStroke(); p.fill(C.ink); ins.forEach((a) => p.circle(a.x, a.y, 16));
      const gate = (g, sym) => {
        p.fill(C.mix("bg", "faint", 0.3)); p.stroke(C.ink); p.strokeWeight(6);
        p.circle(g.x, g.y, sym === "geq" ? 48 : 42);
        p.noFill(); p.strokeWeight(5);
        if (sym === "and") { p.line(g.x - 8, g.y + 6, g.x, g.y - 7); p.line(g.x, g.y - 7, g.x + 8, g.y + 6); }
        else if (sym === "or") { p.line(g.x - 8, g.y - 6, g.x, g.y + 7); p.line(g.x, g.y + 7, g.x + 8, g.y - 6); }
        else {                                                      // threshold gate: "≥"
          p.line(g.x - 8, g.y - 11, g.x + 8, g.y - 4); p.line(g.x + 8, g.y - 4, g.x - 8, g.y + 3);
          p.line(g.x - 8, g.y + 10, g.x + 8, g.y + 10);
        }
      };
      gate(g1[0], "and"); gate(g1[1], "or"); gate(out, "geq");
    };
    // C-RASP: the count #[j ≤ i : P(j)] over tokens 1..i (square = position i; filled = P holds)
    const crasp = (x, y) => {
      const n = 6, sp = 38, x0 = x - ((n - 1) * sp) / 2, yy = y + 42;
      const truth = [1, 0, 1, 1, 0, 1];
      const xs = [...Array(n)].map((_, k) => x0 + k * sp);
      const by = yy - 30, bx0 = xs[0] - 15, bx1 = xs[n - 1] + 15;
      wire(5);
      p.line(bx0, by + 12, bx0, by); p.line(bx0, by, bx1, by); p.line(bx1, by, bx1, by + 12);
      p.line(x, by, x, by - 12);
      label("#[j ≤ i : P(j)]", x, by - 44, { size: 48, color: C.ink });
      xs.forEach((tx, k) => {
        const last = k === n - 1;
        if (truth[k]) { p.noStroke(); p.fill(C.ink); last ? p.rect(tx - 12, yy - 12, 24, 24, 4) : p.circle(tx, yy, 23); }
        else { inkLine(5); p.fill(C.mix("bg", "faint", 0.3)); last ? p.rect(tx - 10, yy - 10, 20, 20, 4) : p.circle(tx, yy, 19); }
      });
    };
    // MPC: a row of machines, one all-to-all communication round, the next row of machines
    const mpc = (x, y) => {
      const xs = [-75, -25, 25, 75].map((dx) => x + dx), y0 = y - 40, y1 = y + 40, bw = 34, bh = 24;
      wire(4);
      xs.forEach((a) => xs.forEach((b) => p.line(a, y0 + bh / 2, b, y1 - bh / 2)));
      p.stroke(C.ink); p.strokeWeight(6); p.fill(C.mix("bg", "faint", 0.3));
      xs.forEach((a) => { p.rect(a - bw / 2, y0 - bh / 2, bw, bh, 5); p.rect(a - bw / 2, y1 - bh / 2, bw, bh, 5); });
    };
    // sensitivity: a wireframe loss surface, gently rolling, with one sharp narrow well
    const sensitivity = (x, y) => {
      const N = 8, Wx = 63, Hy = 31, Z = 30;                        // cells per side, projection scales
      const z = (u, v) => 0.34 * Math.cos(1.7 * u + 0.6) * Math.cos(1.4 * v - 0.3) + 0.12 * Math.sin(2.2 * u - 1.3 * v)
        - 2.3 * Math.exp(-((u - 0.25) ** 2 + (v + 0.25) ** 2) / 0.02);
      const P3 = (i, j) => {                                        // grid vertex → screen (oblique view)
        const u = -1 + (2 * i) / N, v = -1 + (2 * j) / N;
        return { x: x + (u - v) * Wx, y: y - 16 + (u + v) * Hy - z(u, v) * Z };
      };
      const line = (pts, w, col) => { p.noFill(); p.stroke(col); p.strokeWeight(w); p.beginShape(); pts.forEach((c) => p.vertex(c.x, c.y)); p.endShape(); };
      const fine = 4;                                               // sub-samples per cell, so the lines curve
      for (let k = 0; k <= N; k++) {
        const a = [], b = [];
        for (let m = 0; m <= N * fine; m++) { a.push(P3(k, m / fine)); b.push(P3(m / fine, k)); }
        const edge = k === 0 || k === N;
        line(a, edge ? 6 : 4, C.ink2);
        line(b, edge ? 6 : 4, C.ink2);
      }
    };
    // formal logic: an FO[<] formula
    const fo = (x, y) => label("∀i (Q_{b}(i) → ∃j<i Q_{a}(j))", x, y - 4, { size: 50, color: C.ink });

    // --- place each blob on its ray so that its edge sits exactly `gap` beyond the globe rim -------
    const blobs = P.theories.map((T) => {
      const b = makeBlob(T.rx, T.ry);
      const a = (T.angle * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
      const d = G.r + P.gap + b.edge(-ux, -uy);
      b.cx = G.x + ux * d; b.cy = G.y + uy * d; b.ux = ux; b.uy = uy;
      return b;
    });

    // --- prediction arrows: radial, from the blob edge to the rim; the verdict sits on the shaft ---
    const marks = [];
    P.theories.forEach((T, k) => {
      const { ux, uy } = blobs[k];
      const r0 = G.r + P.gap - 20, r1 = G.r + 7;
      arrow(G.x + ux * r0, G.y + uy * r0, G.x + ux * r1, G.y + uy * r1, { color: C.ink2, weight: 7, size: 26 });
      const rm = (r0 + r1 + 26) / 2, off = 40;                      // verdict beside the shaft's midpoint
      marks.push({ x: G.x + ux * rm - uy * off, y: G.y + uy * rm + ux * off, ok: T.ok });
    });
    blobs.forEach(drawBlob);

    // --- Real World: a globe (two meridians, three parallels, rim) ------------------------------
    p.noFill(); p.stroke(C.ink2); p.strokeWeight(5);
    p.ellipse(G.x, G.y, G.r * 0.95, G.r * 2 - 8);
    p.line(G.x, G.y - G.r + 4, G.x, G.y + G.r - 4);
    [-0.52, 0, 0.52].forEach((f) => {
      const yy = G.y + f * G.r, hw = Math.sqrt(1 - f * f) * (G.r - 4);
      p.line(G.x - hw, yy, G.x + hw, yy);
    });
    p.stroke(C.ink); p.strokeWeight(10); p.circle(G.x, G.y, G.r * 2);

    marks.forEach(({ x, y, ok }) => {
      
      if (ok) check(x, y, 44, C.accent, 11);
      else cross(x, y, 34, C.accent2, 11);
    });

    P.theories.forEach((T, k) => {
      const b = blobs[k];
      ({ circuit, crasp, mpc, sensitivity, fo })[T.kind](b.cx, b.cy);
    });
  },
});
