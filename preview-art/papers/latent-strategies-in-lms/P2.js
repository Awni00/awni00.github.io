// Latent Strategies · option P2 · "Router → strategies → responses"
// Two stacked views of the same x and the same five response clusters y.
// Top, p(y|x) without z: one entangled bundle. Every path keeps its hidden
// strategy colour but ends in an arbitrary cluster, so each cluster holds mixed
// colours. Bottom: the router r(z|x) fans x out to five strategy values z (all
// rings of one size), each z has its own colour, and its generator
// g(y|x,z) is a bundle of that colour with a distinct shape, ending in its own
// pure-colour cluster. The colours unmix between the two views.
PreviewArt.register({
  slug: "latent-strategies-in-lms",
  option: "P2",
  round: 4,
  title: "Router, strategies, responses",
  concept: "Without z, one entangled bundle carries x to clustered but colour-mixed responses; with z, a router splits x over strategies and each strategy's own colour and generator produce its own pure cluster of responses.",
  legend: "top → p(y|x) without z: one entangled bundle from x, each path keeps its hidden strategy colour but ends in any cluster, so every response cluster mixes colours; bottom → router r(z|x) fan, rings z (one colour per strategy), generator g(y|x,z) bundles (one shape and colour per strategy), response clusters y (the same five clusters in both views, now one colour each); square → input x",
  seed: 12,
  params: { K: 5, curves: 8 },
  draw(p, C, { W, H, params: P, label }) {
    const K = P.K;
    const XX = 215, zx = 560, ex = 1085;
    const tiles = C.mix("faint", "bg", 0.5);
    const col = (k, a) => { const h = C.cat[k], v = parseInt(h.slice(1), 16); return a == null ? h : `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };

    const poly = (pts) => { p.noFill(); p.beginShape(); pts.forEach(([a, b]) => p.vertex(a, b)); p.endShape(); };
    const curve = (x0, y0, x1, y1, bulge, ease = 0.5, wig = null) => {
      const pts = [];
      for (let i = 0; i <= 56; i++) {
        const t = i / 56, s = t * t * (3 - 2 * t), m = (1 - ease) * t + ease * s;
        let w = bulge * Math.sin(Math.PI * t);
        if (wig) w += wig.a * Math.sin(2 * Math.PI * wig.f * t + wig.ph) * Math.sin(Math.PI * t);
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * m + w]);
      }
      return pts;
    };

    // ---- response clusters: per-strategy end offsets (full scale) ----
    const N = P.curves, c = (i) => i - (N - 1) / 2;
    const shapes = [
      (i) => [c(i) * 3.6, p.random(-4, 4), 0.5],
      (i) => [c(i) * 13, p.random(-5, 5), 0.65],
      (i) => { const g = i < N / 2 ? -1 : 1; return [g * 34 + p.random(-8, 8), g * (26 + p.random(0, 8)), 0.75]; },
      (i) => [c(i) * 5, (i % 2 ? 1 : -1) * (30 + p.random(0, 10)), 0.5],
      (i) => [-2 + i * 6.2 + p.random(-3, 3), -22 + p.random(-5, 5), 0.85],
    ];
    const raw = Array.from({ length: K }, (_, k) => Array.from({ length: N }, (_, i) => { const [off, bul, ease] = shapes[k](i); return { off, bul, ease }; }));

    // ================= top: p(y|x) without z (entangled) =================
    const sy0 = 232, ssp = 25, ssc = 0.32;
    const sY = (k) => sy0 + (k - (K - 1) / 2) * ssp;
    {
      const ends = raw.flatMap((b, k) => b.map((q) => ({ k, y: sY(k) + q.off * ssc })));
      const top = Math.min(...ends.map((e) => e.y)) - 20, bot = Math.max(...ends.map((e) => e.y)) + 20;
      p.noStroke(); p.fill(tiles); p.rect(ex - 54, top, 108, bot - top, 28);
      // hidden strategy colour per path, independent of the cluster it lands in
      const order = ends.map((e, i) => ({ e, r: p.random() })).sort((a, b) => a.r - b.r).map((o) => o.e);
      const picks = order.map((e, m) => ({ e, z: m % K, a: p.random(12, 24) * (p.random() < 0.5 ? 1 : -1), f: p.random(1, 2), ph: p.random(6.28) }));
      picks.sort((a, b) => a.e.y - b.e.y);
      picks.forEach((q) => { p.stroke(col(q.z, 0.72)); p.strokeWeight(4.5); poly(curve(XX + 36, sy0, ex, q.e.y, 0, 0.5, q)); });
      picks.forEach((q) => { p.noStroke(); p.fill(col(q.z)); p.circle(ex, q.e.y, 8); });
      p.noStroke(); p.fill(C.bg); p.circle(XX, sy0, 96);
      p.fill(C.ink); p.rect(XX - 32, sy0 - 32, 64, 64, 16);
    }

    // ================= bottom: with z =================
    const my0 = 572, msp = 58, msc = 0.55;
    const ys = Array.from({ length: K }, (_, k) => my0 + (k - (K - 1) / 2) * msp);
    // each path keeps a little curvature of its own, damped to zero at both ends
    const bundles = raw.map((b, k) => b.map((q) => ({ y1: ys[k] + q.off * msc, bul: q.bul * msc, ease: q.ease, wig: { a: p.random(5, 13) * (p.random() < 0.5 ? 1 : -1), f: p.random(0.7, 1.5), ph: p.random(6.28) } })));
    {
      const all = bundles.flat().map((b) => b.y1);
      const top = Math.min(...all) - 24, bot = Math.max(...all) + 22;
      p.noStroke(); p.fill(tiles); p.rect(ex - 54, top, 108, bot - top, 28);
    }
    ys.forEach((y, k) => {
      bundles[k].forEach((b) => {
        p.stroke(col(k, 0.8)); p.strokeWeight(5.5);
        poly(curve(zx, y, ex, b.y1, b.bul, b.ease, b.wig));
      });
    });
    ys.forEach((y, k) => bundles[k].forEach((b) => { p.noStroke(); p.fill(col(k)); p.circle(ex, b.y1, 9); }));
    ys.forEach((y, k) => { p.stroke(col(k)); p.strokeWeight(9); poly(curve(XX, my0, zx, y, 0, 1)); });
    ys.forEach((y, k) => {
      const d = 50;
      p.noStroke(); p.fill(col(k)); p.circle(zx, y, d);
      p.fill(C.bg); p.circle(zx, y, d * 0.44);
    });
    p.noStroke(); p.fill(C.bg); p.circle(XX, my0, 96);
    p.fill(C.ink); p.rect(XX - 32, my0 - 32, 64, 64, 16);

    // ---- labels ----
    label("p(y|x)", (XX + ex) / 2, 125, { color: C.ink });
    label("r(z|x)", (XX + zx) / 2, 372);
    label("g(y|x,z)", (zx + ex) / 2, 372);
    label("x", XX, 774, { color: C.ink });
    label("z", zx, 774, { color: C.ink });
    label("y", ex, 774, { color: C.ink });
  },
});
