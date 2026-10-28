// Recursive latent space reasoning · option P2 · "Hex-lattice arena"
// One 2D picture of drift vs. snap. The soft blob is the learned representation
// space; hex cells are symbols (those inside the blob are valid). The accent
// path hops between cell centres and stays inside. The grey path is the
// continuous state: it tracks the same trajectory at first, accumulates
// perturbations, and leaks out of the blob into empty space.
// Animation (loop 4.5 s): the continuous dot slides off the blob while the
// accent dot clicks cell to cell; the whole trajectories are always visible
// faintly, the lit trail grows with the dots and fades back before the loop closes.
PreviewArt.register({
  slug: "algorithmic-generalization-transformer-architectures",
  option: "P2",
  round: 2,
  title: "Hex-lattice arena",
  concept: "In one latent space, the discretized state hops between valid symbol cells inside the learned region while the continuous state drifts out of it.",
  legend: "blob → learned representation space; hex cells → symbols, darker where valid; accent discs → discrete state z snapped to a cell centre; grey path → continuous state h drifting out; open ring + tick → h just before it snaps to its nearest cell",
  seed: 5,
  anim: { duration: 4.5, fps: 20, stillPhase: 0, quality: 85 },
  params: { R: 70, cx: 520, cy: 450, rx: 400, ry: 300 },
  draw(p, C, { W, H, params: P, t, still, label }) {
    const ctx = p.drawingContext;
    const R = P.R, w = R * Math.sqrt(3), rh = R * 1.5;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const smooth = (v) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
    const outCubic = (v) => 1 - Math.pow(1 - clamp(v, 0, 1), 3);

    // ---- blob: smooth closed curve, ellipse with low-frequency wobble --------------------
    const ph2 = p.random(0, 6.28), ph3 = p.random(0, 6.28);
    const blob = [];
    for (let i = 0; i < 160; i++) {
      const th = (i / 160) * Math.PI * 2;
      const e = 1 + 0.035 * Math.cos(2 * th + ph2) + 0.03 * Math.cos(3 * th + ph3);
      blob.push({ x: P.cx + P.rx * e * Math.cos(th), y: P.cy + P.ry * e * Math.sin(th) });
    }
    const inside = (x, y, m = 0) => {
      let c = false;
      for (let i = 0, j = blob.length - 1; i < blob.length; j = i++) {
        const a = blob[i], b = blob[j];
        if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
      }
      if (!c) return false;
      if (m <= 0) return true;
      for (const q of blob) if (Math.hypot(q.x - x, q.y - y) < m) return false;
      return true;
    };

    // ---- hex lattice (pointy-top) ----------------------------------------------------------
    const ox = 120, oy = 135;
    const cells = [];
    for (let r = 0; r < 7; r++)
      for (let c = -1; c < 10; c++) {
        const x = ox + c * w + (r % 2) * w / 2, y = oy + r * rh;
        if (x < 70 || x > 1130) continue;
        cells.push({ x, y, valid: inside(x, y, 20) });
      }
    const hexPath = (x, y, rad) => {
      p.beginShape();
      for (let i = 0; i < 6; i++) p.vertex(x + rad * Math.cos(Math.PI / 6 + i * Math.PI / 3), y + rad * Math.sin(Math.PI / 6 + i * Math.PI / 3));
      p.endShape(p.CLOSE);
    };

    // ---- trajectories ----------------------------------------------------------------------
    // discrete: hop chain on cell centres (E, NE, NE, E, SE, SE, NE from the start cell)
    const step = { E: [w, 0], NE: [w / 2, -rh], SE: [w / 2, rh] };
    const z = [{ x: ox + w / 2, y: oy + 3 * rh }];
    ["E", "NE", "E", "SE", "E", "NE", "E"].forEach((m) => {
      const l = z[z.length - 1];
      z.push({ x: l.x + step[m][0], y: l.y + step[m][1] });
    });
    const n = z.length; // 8 states
    // continuous: the same trajectory plus accumulated drift (absolute positions)
    const h = [[0, 0], [-12, -64], [-12, -92], [30, -95], [156, -150], [285, -215], [304, -45], [213, 55]].map((d, k) => ({ x: z[k].x + d[0], y: z[k].y + d[1] }));
    // smooth sampled curve through h (Catmull-Rom)
    const NS = 20;
    const cr = (a, b, c, d, s) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
    const poly = [];
    for (let k = 0; k < n - 1; k++) {
      const a = h[Math.max(0, k - 1)], b = h[k], c = h[k + 1], d = h[Math.min(n - 1, k + 2)];
      for (let i = 0; i < NS; i++) {
        const s = i / NS;
        poly.push({ x: cr(a.x, b.x, c.x, d.x, s), y: cr(a.y, b.y, c.y, d.y, s) });
      }
    }
    poly.push({ ...h[n - 1] });
    const polyAt = (u) => {
      const f = clamp(u, 0, n - 1) * NS, i = Math.min(Math.floor(f), poly.length - 2), s = f - i;
      return { x: poly[i].x + (poly[i + 1].x - poly[i].x) * s, y: poly[i].y + (poly[i + 1].y - poly[i].y) * s };
    };
    const SNAP = 1; // the state shown mid-snap: open ring + tick

    // ---- animation state ---------------------------------------------------------------------
    // u: continuous progress (0..7); zp: discrete progress (hops click late in each step); f: lit-trail strength
    let u = n - 1, zp = n - 1, f = 1, headStrength = 0;
    if (!still) {
      const s = clamp((t - 0.08) / 0.76, 0, 1);
      u = (n - 1) * (0.7 * s + 0.3 * smooth(s));
      const k = Math.min(Math.floor(u), n - 2), pp = u - k;
      zp = u >= n - 1 ? n - 1 : k + outCubic((pp - 0.55) / 0.25);
      f = t < 0.93 ? 1 : 1 - smooth((t - 0.93) / 0.07);
      headStrength = Math.min(1, u / 0.4);
    }

    const near = (c) => Math.hypot((c.x - P.cx) / P.rx, (c.y - P.cy) / P.ry) < 1.5 || poly.some((q, i) => i % 5 === 0 && Math.hypot(q.x - c.x, q.y - c.y) < 135);

    // ---- 1. lattice texture and blob ---------------------------------------------------------
    p.noFill(); p.stroke(C.faint); p.strokeWeight(3.5);
    cells.filter((c) => !c.valid && near(c)).forEach((c) => hexPath(c.x, c.y, R));
    const regionFill = C.mix("faint", "bg", 0.5), cellFill = C.mix("faint", "bg", 0.12);
    p.noStroke(); p.fill(regionFill);
    p.beginShape(); blob.forEach((q) => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
    // valid cells, clipped to the region
    ctx.save();
    ctx.beginPath(); blob.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); ctx.clip();
    p.fill(cellFill);
    cells.filter((c) => c.valid).forEach((c) => hexPath(c.x, c.y, R - 4));
    ctx.restore();
    // region boundary
    p.noFill(); p.stroke(C.ink2); p.strokeWeight(7);
    p.beginShape(); blob.forEach((q) => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);

    // ---- 2. static, faint trajectories (always visible) --------------------------------------
    const polyline = (pts) => { p.beginShape(); pts.forEach((q) => p.vertex(q.x, q.y)); p.endShape(); };
    p.noFill();
    p.stroke(C.alpha("ink2", 0.32)); p.strokeWeight(10); polyline(poly);
    p.stroke(C.alpha("accent", 0.3)); p.strokeWeight(12); polyline(z);
    p.noStroke();
    for (let k = 1; k < n; k++) {
      p.fill(C.alpha("accent", 0.3)); p.circle(z[k].x, z[k].y, 46);
      if (k > 1) { p.fill(C.alpha("ink2", 0.32)); p.circle(h[k].x, h[k].y, 30); }
    }

    // ---- 3. lit trails (grow with progress, fade out before the loop closes) -----------------
    ctx.globalAlpha = f;
    // continuous path up to u
    const nPoly = Math.floor(clamp(u, 0, n - 1) * NS);
    const litPoly = poly.slice(0, nPoly + 1).concat([polyAt(u)]);
    p.noFill(); p.stroke(C.ink2); p.strokeWeight(10); polyline(litPoly);
    // discrete path up to zp
    const kz = Math.min(Math.floor(zp), n - 2), fz = zp - kz;
    const zPos = zp >= n - 1 ? z[n - 1] : { x: z[kz].x + (z[kz + 1].x - z[kz].x) * fz, y: z[kz].y + (z[kz + 1].y - z[kz].y) * fz };
    const litZ = z.slice(0, kz + 1).concat([zPos]);
    p.stroke(C.accent); p.strokeWeight(12); polyline(litZ);
    // continuous dots passed so far (k >= 2), the snap ring
    p.noStroke();
    for (let k = 2; k < n; k++) if (u >= k - 0.02) { p.fill(C.ink2); p.circle(h[k].x, h[k].y, 30); }
    // discrete discs reached so far
    for (let k = 1; k < n; k++) if (zp >= k - 0.001) { p.fill(C.bg); p.circle(z[k].x, z[k].y, 72); p.fill(C.accent); p.circle(z[k].x, z[k].y, 52); }
    if (!still && zp < n - 1 && fz > 0.001) { p.fill(C.bg); p.circle(zPos.x, zPos.y, 72); p.fill(C.accent); p.circle(zPos.x, zPos.y, 52); }
    ctx.globalAlpha = 1;

    // ---- 4. start cell: both states begin here ------------------------------------------------
    p.noStroke(); p.fill(C.bg); p.circle(z[0].x, z[0].y, 72); p.fill(C.accent); p.circle(z[0].x, z[0].y, 52);

    // ---- 5. continuous head ----------------------------------------------------------------------
    if (!still) {
      const hd = polyAt(u);
      ctx.globalAlpha = headStrength * f;
      p.noStroke(); p.fill(C.bg); p.circle(hd.x, hd.y, 50); p.fill(C.ink2); p.circle(hd.x, hd.y, 36);
      ctx.globalAlpha = 1;
    }

    // ---- 6. snap marker: open ring + tick toward the nearest cell centre --------------------------
    {
      const r = h[SNAP], c = z[SNAP], d = Math.hypot(c.x - r.x, c.y - r.y);
      const ux = (c.x - r.x) / d, uy = (c.y - r.y) / d;
      p.stroke(C.ink2); p.strokeWeight(5);
      p.line(r.x + ux * 21, r.y + uy * 21, r.x + ux * 33, r.y + uy * 33);
      p.fill(C.bg); p.stroke(C.ink2); p.strokeWeight(6); p.circle(r.x, r.y, 30);
    }

    // ---- 7. labels -----------------------------------------------------------------------------------
    p.noStroke(); p.fill(cellFill);
    p.rect(z[4].x - 24, z[4].y + 36, 48, 50, 14);
    label("z", z[4].x, z[4].y + 62);
    label("h", h[n - 1].x + 50, h[n - 1].y + 10);
  },
});
