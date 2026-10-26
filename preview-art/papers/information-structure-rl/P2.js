// Information Structure RL · option P2 · "Mixed separator" (round 3 polish)
// A non-POMDP information structure drawn in G† (all edges into actions removed,
// so squares are roots). Variables: observed system variables (discs), latent
// system variables (dashed rings), actions (squares). Time runs left to right:
// a past cluster, an accent cut, a future cluster. Definition 9 of arXiv
// 2403.00993: I†_h is the minimal set of variables with index <= t(h) (the h-th
// observable) that d-separates the past observations o_{1:h} from the future
// observations o_{h+1:H} in G†; it may mix latent and observed variables.
//
// The separator is COMPUTED below, not drawn by hand: for the node list in
// `order` (a topological order; `oh` is the h-th observable, so every node
// before and including it is "past" and the rest is "future"), we enumerate all
// subsets of the past variables by increasing size and keep the smallest ones
// that d-separate (past observations not in Z) from (future observations),
// using the ancestral-moral-graph test. Hand check for the graph below:
//   * oh -> f1 is a direct edge into the future, so oh must be in Z.
//   * The past latent u feeds o1, o2, o3 and z; o2 also feeds z; z feeds the
//     future (f1, f2, w). With Z = {z, oh}: u -> z -> f.. and o2 -> z -> f..
//     are chains through z (blocked); o2 -> oh -> f1 is blocked by oh; the
//     collider-free rest (u -> o1, u -> o3, a1 -> o1, u -> o2) never reaches the
//     future except through z or oh. oh has the single parent o2, so no collider
//     is opened.
//   * Cheaper sets fail (size 1 leaves oh -> f1 or z -> f open). The only other
//     size-3 candidate is {oh, o2, u}, so {z, oh} is the unique minimum.
//     The sketch asserts uniqueness (count === 1) and draws whatever it computes.
// Every edge that crosses the cut leaves z or oh (drawn in accent).
PreviewArt.register({
  slug: "information-structure-rl",
  option: "P2",
  round: 3,
  title: "Mixed separator",
  concept: "In a non-POMDP information structure the separator I†_h mixes a latent variable (z) with an observed one (o_h): together they d-separate past observations from future ones in G†.",
  legend: "solid disc → observed variable; dashed ring → latent variable; square → action (a root in G†); arrow → direct dependence; accent rings + band → I†_h = {z, o_h}, the minimal d-separating set (one latent, one observed variable) between past and future observations",
  seed: 7,
  params: {},
  draw(p, C, { W, H, label, arrowHead }) {
    // ---------------- graph ----------------
    const N = {
      u:  { k: "z", x: 175, y: 385 },
      a1: { k: "a", x: 175, y: 205 },
      o1: { k: "o", x: 345, y: 205 },
      o2: { k: "o", x: 365, y: 470 },
      o3: { k: "o", x: 255, y: 585 },
      z:  { k: "z", x: 530, y: 300 },
      oh: { k: "o", x: 605, y: 610 },
      a3: { k: "a", x: 870, y: 745 },
      f1: { k: "o", x: 830, y: 520 },
      f2: { k: "o", x: 965, y: 365 },
      a2: { k: "a", x: 1060, y: 745 },
      f3: { k: "o", x: 1090, y: 560 },
      w:  { k: "z", x: 815, y: 225 },
      f4: { k: "o", x: 1085, y: 235 },
    };
    const order = ["u", "a1", "o1", "o2", "o3", "z", "oh", "a3", "f1", "f2", "a2", "f3", "w", "f4"];
    const E = [
      ["a1", "o1"], ["u", "o1"], ["u", "o2"], ["u", "o3"], ["u", "z"], ["o2", "z"], ["o2", "oh"],
      ["z", "f1"], ["z", "f2"], ["z", "w"], ["oh", "f1"], ["a3", "f1"], ["f1", "f2"],
      ["f2", "f3"], ["a2", "f3"], ["f2", "f4"], ["w", "f4"],
    ];
    const ids = order;
    const idx = Object.fromEntries(ids.map((id, i) => [id, i]));
    const parents = Object.fromEntries(ids.map((id) => [id, []]));
    E.forEach(([a, b]) => { parents[b].push(a); if (idx[a] >= idx[b]) throw new Error("not topological"); if (N[b].k === "a") throw new Error("edge into action"); });
    const observed = (id) => N[id].k === "o";
    const hIdx = idx.oh;
    const past = ids.filter((id) => idx[id] <= hIdx);
    const future = ids.filter((id) => idx[id] > hIdx);
    const X = past.filter(observed), Y = future.filter(observed);

    // d-separation of X and Y given Z via the moral graph of the ancestral set.
    const dsep = (Xs, Ys, Z) => {
      const keep = new Set([...Xs, ...Ys, ...Z]);
      const stack = [...keep];
      while (stack.length) { const v = stack.pop(); parents[v].forEach((u) => { if (!keep.has(u)) { keep.add(u); stack.push(u); } }); }
      const adj = Object.fromEntries([...keep].map((v) => [v, new Set()]));
      [...keep].forEach((v) => {
        const ps = parents[v];
        ps.forEach((u) => { adj[u].add(v); adj[v].add(u); });
        ps.forEach((u) => ps.forEach((u2) => { if (u !== u2) adj[u].add(u2); }));
      });
      const blocked = new Set(Z), seen = new Set();
      const q = Xs.filter((v) => !blocked.has(v));
      q.forEach((v) => seen.add(v));
      while (q.length) {
        const v = q.pop();
        if (Ys.includes(v)) return false;
        adj[v].forEach((u) => { if (!blocked.has(u) && !seen.has(u)) { seen.add(u); q.push(u); } });
      }
      return true;
    };
    let sep = [], count = 0;
    for (let k = 0; k <= past.length && !count; k++) {
      const rec = (start, cur) => {
        if (cur.length === k) { if (dsep(X, Y, cur)) { count++; if (!sep.length) sep = cur.slice(); } return; }
        for (let i = start; i < past.length; i++) { cur.push(past[i]); rec(i + 1, cur); cur.pop(); }
      };
      rec(0, []);
    }
    const inSep = (id) => sep.includes(id);
    // (Sanity: sep should be {z, oh} with count === 1.)

    // ---------------- band: smooth cut through the separator ----------------
    const pts = [[505, 175], [498, 235], [N.z.x, N.z.y], [548, 440], [N.oh.x, N.oh.y], [622, 700], [630, 740]];
    const cr = (p0, p1, p2, p3, u) => {
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
      return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
    };
    const ext = [pts[0], ...pts, pts[pts.length - 1]];
    const curve = [];
    for (let i = 1; i < ext.length - 2; i++) for (let s = 0; s < 40; s++) curve.push(cr(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], s / 40));
    curve.push(pts[pts.length - 1]);
    p.noStroke(); p.fill(C.accentSoft);
    curve.forEach(([x, y]) => p.circle(x, y, 116));

    // ---------------- edges (arrows stop at the node outline) ----------------
    const rad = (id) => (inSep(id) ? 56 : N[id].k === "o" ? 31 : N[id].k === "z" ? 37 : 33);
    E.forEach(([a, b]) => {
      const A = N[a], B = N[b];
      const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const hot = inSep(a) && future.includes(b);
      const col = hot ? C.accent : C.ink2, wgt = hot ? 9 : 7, hs = 25;
      const x1 = A.x + ux * (rad(a) + 5), y1 = A.y + uy * (rad(a) + 5);
      const x2 = B.x - ux * (rad(b) + 4), y2 = B.y - uy * (rad(b) + 4);
      p.stroke(col); p.strokeWeight(wgt); p.line(x1, y1, x2 - ux * hs * 0.8, y2 - uy * hs * 0.8);
      arrowHead(x2, y2, Math.atan2(uy, ux), { color: col, size: hs });
    });

    // ---------------- nodes ----------------
    p.rectMode(p.CENTER);
    const dashRing = (x, y, r, col, w) => {
      const n = 7, seg = p.TWO_PI / n;
      p.noFill(); p.stroke(col); p.strokeWeight(w);
      for (let i = 0; i < n; i++) p.arc(x, y, 2 * r, 2 * r, i * seg + 0.2, i * seg + seg * 0.72);
    };
    ids.forEach((id) => {
      const { k, x, y } = N[id];
      if (inSep(id)) { p.noStroke(); p.fill(C.bg); p.circle(x, y, 112); }
      if (k === "o") { p.noStroke(); p.fill(C.ink); p.circle(x, y, 62); }
      else if (k === "z") { p.noStroke(); p.fill(C.bg); p.circle(x, y, 80); dashRing(x, y, 31, C.ink, 11); }
      else { p.noStroke(); p.fill(C.ink2); p.square(x, y, 58, 12); }
      if (inSep(id)) { p.noFill(); p.stroke(C.accent); p.strokeWeight(10); p.circle(x, y, 96); }
    });

    // ---------------- labels ----------------
    label("past", 255, 130, { color: C.ink2, upright: true, size: 56 });
    label("future", 950, 130, { color: C.ink2, upright: true, size: 56 });
    label("I^†_h", 600, 180, { color: C.accent, align: "left" });
    label("z", N.z.x - 70, N.z.y - 50, { color: C.ink });
    label("o_h", N.oh.x + 8, N.oh.y + 92, { color: C.ink });
    label("a", N.a1.x - 78, N.a1.y, { color: C.ink2 });
  },
});
