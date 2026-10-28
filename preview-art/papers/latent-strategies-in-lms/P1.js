// Latent Strategies · option P1 · "Unmixing field"
// Two panels share ONE fixed density landscape (dot size = p_θ(y|x), three modes,
// identical lattice and sizes). Only the colouring changes. Left: a misaligned
// latent paints broad near-pure patches that cut across the modes, so each mode
// holds several tones (blends only along patch edges). Right: aligned latent,
// colour = mode, one pure tone per mode, blends only in the valleys.
PreviewArt.register({
  slug: "latent-strategies-in-lms",
  option: "P1",
  round: 2,
  title: "Unmixing field",
  concept: "The same output-space density painted twice: by a misaligned latent whose colour patches cut across the modes, and by a strategy-aligned latent where colour equals mode.",
  legend: "dot size → density p_θ(y|x), identical in both panels; dot colour → strategy tone; left (✗) → misaligned latent, colour patches cut across the peaks; right (✓) → aligned latent, one pure colour per peak; accent → one strategy",
  seed: 7,
  params: { pitch: 30, edge: 22, beta: 3 },
  draw(p, C, { W, H, params: P, label, check, cross }) {
    const S = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const PW = 480, PH = 600, PY = 165;
    const panels = [{ x0: 100 }, { x0: 620 }];
    // three modes in panel-local coordinates: [x, y, sx, sy, amp, rot]
    const peaks = [
      [145, 165, 88, 76, 1.0, 0.25],   // A, largest
      [355, 300, 76, 92, 0.92, -0.1],  // B
      [285, 495, 68, 56, 0.88, 0.0],   // C, smallest: the accent strategy
    ];
    const tones = [C.ink, C.ink2, C.accent]; // aligned: one pure tone per mode
    const g = (k, x, y) => {
      const [cx, cy, sx, sy, a, r] = peaks[k];
      const dx = x - cx, dy = y - cy, c = Math.cos(r), s = Math.sin(r);
      const u = (dx * c + dy * s) / sx, v = (-dx * s + dy * c) / sy;
      return a * Math.exp(-0.5 * (u * u + v * v));
    };
    const dens = (x, y) => Math.min(1, peaks.reduce((a, _, k) => a + g(k, x, y), 0) + 0.03);
    // misaligned latent: many small patch seeds on a jittered lattice, tones dealt
    // cyclically so every neighbourhood (and so every mode core) holds all 3 tones.
    const seeds = [];
    {
      const sp = 92;
      for (let r = -1; r * sp * 0.866 < PH + sp; r++) {
        for (let c = -1; c * sp < PW + sp; c++) {
          const x = c * sp + (r % 2 ? sp / 2 : 0) + p.random(-22, 22), y = r * sp * 0.866 + p.random(-22, 22);
          seeds.push([x, y, ((c + 2 * r) % 3 + 3) % 3]);
        }
      }
    }
    const blendTones = (w, ts) => {
      let col = ts[0], acc = w[0];
      for (let k = 1; k < ts.length; k++) { acc += w[k]; col = acc > 0 ? C.mix(col, ts[k], w[k] / acc) : ts[k]; }
      return col;
    };
    const misW = (x, y) => {
      const wx = x + (p.noise(x / 120, y / 120) - 0.5) * 70, wy = y + (p.noise(x / 120 + 40, y / 120 + 40) - 0.5) * 70;
      const d = seeds.map(([sx, sy]) => Math.hypot(wx - sx, wy - sy));
      const m = Math.min(...d);
      const e = d.map((v) => Math.exp(-(v - m) / 15));
      const s = e.reduce((a, b) => a + b);
      const w = [0, 0, 0];
      seeds.forEach(([, , t], i) => { w[t] += e[i] / s; });
      return w;
    };
    const aligW = (x, y) => {
      const e = peaks.map((_, k) => Math.pow(g(k, x, y) + 1e-4, P.beta));
      const s = e.reduce((a, b) => a + b);
      return e.map((v) => v / s);
    };
    // edge mask: dots live inside the tile, rounded corners
    const inside = (x, y) => {
      const e = P.edge, r = 60;
      const cx = Math.min(Math.max(x, e + r), PW - e - r), cy = Math.min(Math.max(y, e + r), PH - e - r);
      return Math.hypot(x - cx, y - cy) < r;
    };

    // tiles (faint plates) behind each landscape
    p.noStroke(); p.fill(C.mix("faint", "bg", 0.62));
    panels.forEach(({ x0 }) => p.rect(x0, PY, PW, PH, 36));

    // dots: the same lattice and sizes in both panels
    const pitch = P.pitch, rowH = pitch * 0.866;
    panels.forEach(({ x0 }, pi) => {
      for (let j = 0, y = P.edge + 6; y < PH - P.edge; j++, y += rowH) {
        for (let x = P.edge + 6 + (j % 2) * pitch / 2; x < PW - P.edge; x += pitch) {
          if (!inside(x, y)) continue;
          const d = 3 + 28 * Math.pow(dens(x, y), 1.5);
          if (d < 6) continue;
          p.fill(blendTones(pi === 0 ? misW(x, y) : aligW(x, y), tones));
          p.noStroke();
          p.circle(x0 + x, PY + y, d);
        }
      }
    });

    // marks above each panel
    cross(panels[0].x0 + PW / 2, 135, 44, C.ink2, 9);
    check(panels[1].x0 + PW / 2, 135, 56, C.ink2, 9);
  },
});
