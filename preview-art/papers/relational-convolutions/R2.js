// Relational Convolutions · option R2 · "Size-3 filter over bigger groups"
// Back to round-1 A's idea: a 3-object graphlet filter f (accent triangle, hero in the
// centre) and groups of MORE objects (5 each). In every group the 3-object sub-pattern
// that f lands on is drawn solid; its relation strengths (edge opacity: strong / medium /
// weak, all one stroke width) are what get compared with f's. Each group yields one new
// object, drawn as a square (so it reads as an output, not an input); the squares sit on
// one ring around the filter, all spokes are the same length and all squares the same
// size, so every group is treated alike.
PreviewArt.register({
  slug: "relational-convolutions",
  option: "R2",
  round: 6,
  title: "Size-3 filter, bigger groups",
  concept: "A size-3 graphlet filter f is convolved over groups of 5 objects: it lands on the best 3-object sub-pattern in each group, and each group yields one new output object.",
  legend: "accent triangle (centre) → 3-object graphlet filter f; 5-object groups → objects with relations; edge opacity → relation strength; solid triangle in a group → the 3 objects f lands on; square on each spoke → the new object z_g for group g (from ⟨R_g, f⟩)",
  seed: 3,
  params: { R: 62, SX: 1.45, filterScale: 1.0, disc: 104, cy: 450, D: 255 },
  draw(p, C, { W, H, params: P }) {
    const cx = W / 2, cy = P.cy;
    const ang = (d) => (d * Math.PI) / 180;
    // pentagon, apex up; nodes 0,2,3 form the inscribed triangle f lands on
    const pent = (R) => [-90, -18, 54, 126, 198].map((d) => [R * P.SX * Math.cos(ang(d)), R * Math.sin(ang(d))]);
    const TRI = [0, 2, 3];
    const TE = [[0, 2], [2, 3], [3, 0]];           // triangle edges
    const OUT = [[0, 1], [1, 2], [3, 4], [4, 0]];  // remaining pentagon edges (faint)
    const F = [2, 1, 0];                            // weight level per triangle edge: heavy, medium, faint

    // six groups on a flattened hexagon (vertices at 0°, ±40°, 180°, 180 ± 40°); each is
    // pushed out just far enough that every spoke has the same length D
    const slots = [
      { a: -40, w: [0, 1, 2] }, { a: 0, w: F }, { a: 40, w: [2, 1, 1] },
      { a: 140, w: [0, 2, 1] }, { a: 180, w: [1, 2, 0] }, { a: 220, w: [2, 0, 1] },
    ];
    const NODE = 36, SMALL = 26, HALO = 50;
    const o1 = pent(P.R);
    const groups = slots.map((sl) => {
      const ux = Math.cos(ang(sl.a)), uy = Math.sin(ang(sl.a));
      const reach = Math.max(...o1.map((o) => -(o[0] * ux + o[1] * uy))) + HALO / 2;
      const d0 = P.disc + 10, d1 = P.D, dist = d1 + reach + 8, dm = (d0 + d1) / 2;
      return { ...sl, gx: cx + ux * dist, gy: cy + uy * dist, ux, uy, d0, d1, ox: cx + ux * dm, oy: cy + uy * dm };
    });

    const EW = 9, OP = [0.22, 0.55, 1];
    const lineCol = (lv, best) => C.alpha(best ? "accent" : "ink", OP[lv]);
    const graphlet = (x, y, w, best, sc = 1, only3 = false) => {
      const o = pent(P.R * sc);
      if (only3) y += 0.0955 * P.R * sc;   // centre the bare triangle
      // outer pentagon edges: faint context
      p.stroke(C.alpha("ink", 0.12)); p.strokeWeight(EW);
      if (!only3) OUT.forEach(([i, j]) => p.line(x + o[i][0], y + o[i][1], x + o[j][0], y + o[j][1]));
      // the 3-object sub-pattern, edge weight = relation strength
      TE.map((e, k) => [e, w[k]]).sort((u, v) => u[1] - v[1]).forEach(([[i, j], lv]) => {
        p.stroke(lineCol(lv, best)); p.strokeWeight(EW * (sc > 1 ? 1.15 : 1));
        p.line(x + o[i][0], y + o[i][1], x + o[j][0], y + o[j][1]);
      });
      p.noStroke();
      o.forEach((q, k) => {
        if (only3 && !TRI.includes(k)) return;
        const on = TRI.includes(k), d = (on ? NODE : SMALL) * sc;
        p.fill(C.bg); p.circle(x + q[0], y + q[1], d + 14 * sc);
        p.fill(on ? (best ? C.accent : C.ink) : C.ink2); p.circle(x + q[0], y + q[1], d);
      });
    };

    // spokes: one width
    groups.forEach((g) => {
      p.stroke(C.ink2);
      p.strokeWeight(7);
      p.line(cx + g.ux * g.d0, cy + g.uy * g.d0, cx + g.ux * g.d1, cy + g.uy * g.d1);
    });
    groups.forEach((g) => graphlet(g.gx, g.gy, g.w, false));
    // outputs: one square per group, all the same size
    p.rectMode(p.CENTER);
    groups.forEach((g) => {
      const d = 40;
      p.noStroke(); p.fill(C.bg); p.rect(g.ox, g.oy, d + 16, d + 16, 10);
      p.fill(C.ink); p.rect(g.ox, g.oy, d, d, 6);
    });
    p.rectMode(p.CORNER);

    // the filter: a 3-object graphlet, larger than the groups
    p.noStroke(); p.fill(C.accentSoft); p.circle(cx, cy, P.disc * 2);
    graphlet(cx, cy, F, true, P.filterScale, true);
  },
});
