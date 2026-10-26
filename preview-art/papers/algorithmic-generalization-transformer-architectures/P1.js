// Recursive latent space reasoning · option P1 · "Drift vs. snap, two lanes"
// The paper's anchoring/drift figure reduced to two lanes over recurrent
// iterations. Top: the continuous state h leaves the learned manifold band and
// drifts further every step once past the training range. Bottom: the discrete
// state z is re-embedded onto a hex lattice every step, so it hops cell to cell
// and never leaves the lattice. Open rings: the continuous state just before it snaps.
PreviewArt.register({
  slug: "algorithmic-generalization-transformer-architectures",
  option: "P1",
  round: 2,
  title: "Drift vs. snap",
  concept: "Past the training range a continuous latent state drifts off the learned manifold, while a discretized state snaps back to a symbol at every iteration.",
  legend: "grey dots → continuous state h drifting off the learned band; accent hexagons → discrete symbols z snapped to the lattice; open rings → h just before it snaps; shaded block → iterations seen in training; t → recurrent iterations",
  seed: 11,
  params: { steps: 8, x0: 232, dx: 119, topY: 296, botY: 566, band: 40, hexR: 38 },
  draw(p, C, { W, H, params: P, label }) {
    const n = P.steps;
    const X = (k) => P.x0 + k * P.dx;
    const half = P.dx / 2;           // lattice column spacing
    const a = half / 0.866;          // lattice row spacing (regular hex lattice, flat-top cells)
    const rectL = 176, rectR = X(2) + P.dx / 2, rectT = 128, rectB = 722;

    // ---- training-range block + divider -------------------------------------------------
    p.noStroke();
    p.fill(C.alpha("faint", 0.4));
    p.rect(rectL, rectT, rectR - rectL, rectB - rectT, 26);
    p.stroke(C.ink2); p.strokeWeight(6);
    p.line(rectR, rectT + 6, rectR, rectB - 6);

    // ---- top lane: learned manifold band + drifting continuous state --------------------
    p.noStroke(); p.fill(C.alpha("faint", 0.75));
    p.rect(196, P.topY - P.band, 1112 - 196 + 12, 2 * P.band, P.band);

    // small wobble inside the band, then growing drift (bias upward, with wander)
    const wob = [0, 0.5, -0.7, 0.4, -0.2, 0.9, -0.4, 0.6].map((v) => v + p.random(-0.15, 0.15));
    const away = [0, 4, -14, -34, -60, -92, -126, -160];       // drift off the band grows every step
    const pts = [];
    for (let k = 0; k < n; k++) {
      const g = Math.pow(k / (n - 1), 1.55);
      pts.push({ x: X(k), y: P.topY + wob[k] * 16 * (1 - 0.6 * g) + away[k] });
    }
    // smooth curve through the dots (Catmull-Rom)
    p.noFill(); p.stroke(C.ink2); p.strokeWeight(7);
    p.beginShape();
    p.curveVertex(pts[0].x, pts[0].y);
    pts.forEach((q) => p.curveVertex(q.x, q.y));
    p.curveVertex(pts[n - 1].x, pts[n - 1].y);
    p.endShape();
    p.noStroke();
    pts.forEach((q) => { p.fill(C.bg); p.circle(q.x, q.y, 58); p.fill(C.ink2); p.circle(q.x, q.y, 38); });

    // ---- bottom lane: hex lattice + snapped discrete states -----------------------------
    const rows = [0, -1, -1, 0, 1, 1, 0, -1];            // lattice row of each discrete state
    const hexes = rows.map((r, k) => ({ x: X(k), y: P.botY + r * a }));
    // rings: continuous state just before snapping, tucked beside each cell
    const sides = [-1, 1, 1, -1, -1, 1, 1, -1];
    const rings = hexes.map((h, k) => ({ x: h.x + (k % 2 ? 18 : -18), y: h.y + sides[k] * 66 }));

    // lattice dots (skip those a ring would sit on)
    p.noStroke(); p.fill(C.faint);
    for (let j = -2; j <= 17; j++) {
      const cx = P.x0 + j * half;
      if (cx < 186 || cx > 1118) continue;
      const odd = ((j % 2) + 2) % 2;
      for (let m = -3; m <= 3; m++) {
        const cy = P.botY + (m + odd * 0.5) * a;
        if (Math.abs(cy - P.botY) > 160) continue;
        if (Math.abs(cx - rectR) < 18) continue;
        if (rings.some((r) => Math.hypot(r.x - cx, r.y - cy) < 34)) continue;
        p.circle(cx, cy, 10);
      }
    }
    // ticks from each ring toward its cell
    p.stroke(C.ink2); p.strokeWeight(5);
    rings.forEach((r, k) => {
      const h = hexes[k], d = Math.hypot(h.x - r.x, h.y - r.y);
      const ux = (h.x - r.x) / d, uy = (h.y - r.y) / d;
      p.line(r.x + ux * 22, r.y + uy * 22, r.x + ux * 33, r.y + uy * 33);
    });
    // accent path
    p.noFill(); p.stroke(C.accent); p.strokeWeight(11);
    p.beginShape(); hexes.forEach((h) => p.vertex(h.x, h.y)); p.endShape();
    // hex cells
    p.noStroke(); p.fill(C.accent);
    const R = P.hexR;
    hexes.forEach((h) => {
      p.beginShape();
      for (let i = 0; i < 6; i++) p.vertex(h.x + R * Math.cos(i * p.PI / 3), h.y + R * Math.sin(i * p.PI / 3));
      p.endShape(p.CLOSE);
    });
    // open rings
    rings.forEach((r) => { p.fill(C.bg); p.stroke(C.ink2); p.strokeWeight(6); p.circle(r.x, r.y, 28); });

    // ---- time axis (right edge, bottom) -------------------------------------------------
    p.stroke(C.ink2); p.strokeWeight(6);
    p.line(X(3) - 30, 756, X(7) + 4, 756);
    for (let k = 3; k < n; k++) p.line(X(k), 742, X(k), 770);
    label("t", X(7) + 46, 756);

    // ---- labels ---------------------------------------------------------------------------
    label("h", 112, P.topY);
    label("z", 112, P.botY);
  },
});
