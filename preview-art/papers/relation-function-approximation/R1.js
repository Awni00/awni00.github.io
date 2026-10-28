// Relation Approximation · option R1 · "Two towers, explicit inner product"
// Two different MLPs, phi (from x) and psi (from y), each end in a vector of d components
// (cells with bars = component values). Component i of phi(x) is paired with component i
// of psi(y); each pair sends a ribbon, as thick as the product phi_i * psi_i, into one
// node, Σ, which sums them: <phi(x), psi(y)> ~ r(x, y).
PreviewArt.register({
  slug: "relation-function-approximation",
  option: "R1",
  round: 2,
  title: "Two towers, one sum",
  concept: "A relation r(x, y) is approximated by the inner product of two separately learned feature vectors: multiply matching components, then sum.",
  legend: "x, y → the two inputs; φ, ψ → the two MLP towers; bar columns → feature vectors φ(x), ψ(y); accent ribbons → component products φ_i·ψ_i; Σ node → their sum, the inner product ⟨φ(x), ψ(y)⟩ ≈ r(x, y)",
  seed: 3,
  params: {
    a: [0.95, 0.35, 0.8, 0.25, 0.9, 0.6],
    b: [0.9, 0.85, 0.3, 0.8, 0.4, 0.95],
    variant: 1,
  },
  draw(p, C, { W, H, params: P, label }) {
    const cx = W / 2, cy = 420;
    const d = P.a.length, pitch = 100;
    const rowY = (i) => cy + (i - (d - 1) / 2) * pitch;
    const CW = 92, CH = 68;                       // cell size
    const X = { in: 125, hid: 245, cell: 412 };     // left tower x positions
    const mir = (x, m) => (m ? W - x : x);
    const hid = Array.from({ length: 5 }, (_, j) => cy + (j - 2) * 88);
    const inp = Array.from({ length: 3 }, (_, j) => cy + (j - 1) * 110);

    const tower = (m) => {
      const x = (v) => mir(v, m);
      p.noFill();
      // sparse, mostly local wiring (about half of the dense edges), one backbone edge per node
      const wire = (ax, ays, bx, bys, reach, backbone) => ays.forEach((ay, i) => bys.forEach((by, j) => {
        const w = Math.abs(p.randomGaussian()), u = p.random();
        if (!backbone(i, j) && (Math.abs(ay - by) > reach || u > 0.7)) return;
        const strong = w > 0.9;
        p.stroke(strong ? C.ink2 : C.faint); p.strokeWeight(strong ? 6 : 4);
        p.line(x(ax), ay, x(bx), by);
      }));
      const cellsY = Array.from({ length: d }, (_, i) => rowY(i));
      wire(X.in, inp, X.hid, hid, 120, (i, j) => j === i + 1 || (i === 0 && j === 0) || (i === 2 && j === 4));
      wire(X.hid, hid, X.cell - CW / 2, cellsY, 125, (j, i) => i === Math.round((j * (d - 1)) / 4));
      // nodes
      p.noStroke();
      inp.forEach((y) => { p.fill(C.bg); p.circle(x(X.in), y, 96); p.fill(C.ink); p.circle(x(X.in), y, 70); });
      hid.forEach((y) => { p.fill(C.bg); p.circle(x(X.hid), y, 72); p.fill(C.ink2); p.circle(x(X.hid), y, 48); });
    };
    tower(false); tower(true);

    // vectors: cells with bars growing toward the centre
    const vec = (vals, m) => vals.forEach((v, i) => {
      const x0 = mir(X.cell - CW / 2, m), x1 = mir(X.cell + CW / 2, m);
      const y = rowY(i);
      p.noStroke(); p.fill(C.bg);
      p.rect(Math.min(x0, x1) - 10, y - CH / 2 - 10, CW + 20, CH + 20, 24);
      p.noFill(); p.stroke(C.ink2); p.strokeWeight(8);
      p.rect(Math.min(x0, x1), y - CH / 2, CW, CH, 16);
      const L = 12 + (CW - 24 - 10) * v;
      p.noStroke(); p.fill(C.ink);
      const bx = m ? x0 - 14 - L : x0 + 14;
      p.rect(bx, y - 14, L, 28, 8);
    });
    vec(P.a, false); vec(P.b, true);

    // ribbons into the sum node
    const R = 56;
    const sx = cx, sy = cy;
    for (let i = 0; i < d; i++) {
      const prod = P.a[i] * P.b[i];
      const k = (i - (d - 1) / 2) / ((d - 1) / 2);          // -1 (top) .. 1 (bottom)
      const al = (k * 62 * Math.PI) / 180;                  // arrival angle offset
      p.noFill(); p.stroke(C.accent); p.strokeWeight(5 + 15 * prod);
      [false, true].forEach((m) => {
        const x0 = mir(X.cell + CW / 2 + 12, m), y0 = rowY(i);
        const dir = m ? 1 : -1;                              // outward normal at the node
        const ex = sx + dir * Math.cos(al) * (R + 2), ey = sy + Math.sin(al) * (R + 2);
        const h = Math.abs(ex - x0);
        const c1x = x0 - dir * 0.5 * h, c1y = y0;            // leave horizontally toward centre
        const c2x = ex + dir * Math.cos(al) * 0.45 * h, c2y = ey + Math.sin(al) * 0.45 * h;
        p.bezier(x0, y0, c1x, c1y, c2x, c2y, ex, ey);
      });
    }
    p.noStroke(); p.fill(C.bg); p.circle(sx, sy, 2 * R + 30);
    p.fill(C.accent); p.circle(sx, sy, 2 * R);
    label("Σ", sx, sy + 2, { color: C.bg, size: 76 });

    label("x", mir(X.in, false), inp[0] - 90, {});
    label("y", mir(X.in, true), inp[0] - 90, {});
    label("φ", X.hid, hid[0] - 80, {});
    label("ψ", mir(X.hid, true), hid[0] - 80, {});
    label("⟨φ(x),ψ(y)⟩", cx, 762, { color: C.ink });
  },
});
