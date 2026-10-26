// CoT Information · option P2 · "Two rates, named"
// Sample complexity m against target error ε. The end-to-end rate m ∝ 1/ε is
// the heavy ink curve; the CoT rate m ∝ 1/I(ε) (accent) lies strictly below it
// because I(ε) ≥ ε. Faint curves are the continuum of possible I. At one target
// ε₀ a bracket spans the two curves: that gap is the gain I(ε)/ε.
PreviewArt.register({
  slug: "cot-info",
  option: "P2",
  round: 2,
  title: "Two rates, named",
  concept: "Sample complexity drops from 1/ε to 1/I(ε); at a fixed target error ε₀ the bracket between the curves is the gain.",
  legend: "ink curve → end-to-end rate 1/ε; accent curve → CoT rate 1/I(ε); faint curves → other possible I; bracket at ε₀ → gain I(ε)/ε; axes → error ε, samples m",
  seed: 3,
  params: { family: 11, gain: 8, kE2E: 0.4, u0: 0.5 },
  draw(p, C, { params: P, label }) {
    const O = { x: 190, y: 722 }, XR = 1010, YT = 135;
    const spanX = XR - O.x, spanY = O.y - YT;
    // m = k / ε in normalised units; clipped to the plot box.
    const curve = (k, uMin = 0) => {
      const pts = [];
      const u0 = Math.max(uMin, k);
      for (let i = 0; i <= 160; i++) {
        const u = u0 + (1 - u0) * (i / 160) ** 1.7;
        pts.push({ x: O.x + u * spanX, y: O.y - Math.min(1, k / u) * spanY });
      }
      return pts;
    };
    const stroke = (pts) => { p.beginShape(); pts.forEach((q) => p.vertex(q.x, q.y)); p.endShape(); };
    const at = (k, u) => ({ x: O.x + u * spanX, y: O.y - (k / u) * spanY });

    const kE = P.kE2E, kC = kE / P.gain;

    // faint dot grid
    p.noStroke(); p.fill(C.faint);
    for (let gx = 1; gx <= 8; gx++) for (let gy = 1; gy <= 6; gy++) p.circle(O.x + (gx / 8.6) * spanX, O.y - (gy / 6.4) * spanY, 9);

    // axes
    p.noFill(); p.stroke(C.ink2); p.strokeWeight(8);
    p.line(O.x, O.y, XR + 30, O.y);
    p.line(O.x, O.y, O.x, YT - 30);

    // continuum of rates between the two (geometric spacing)
    p.stroke(C.faint); p.strokeWeight(5);
    for (let j = 1; j <= P.family; j++) {
      const k = kC * Math.pow(kE / kC, j / (P.family + 1));
      stroke(curve(k));
    }

    // vertical probe at ε₀
    const u0 = P.u0, xp = O.x + u0 * spanX;
    const pe = at(kE, u0), pc = at(kC, u0);
    p.stroke(C.ink2); p.strokeWeight(5);
    p.drawingContext.setLineDash([2, 22]);
    p.line(xp, O.y, xp, pe.y);
    p.drawingContext.setLineDash([]);

    // the two rates
    p.stroke(C.ink); p.strokeWeight(16); stroke(curve(kE));
    p.stroke(C.accent); p.strokeWeight(16); stroke(curve(kC));

    // gain bracket, just right of the probe: an I-beam spanning ink curve to accent curve
    const bx = xp + 60;
    const yTop = O.y - (kE / (u0 + 60 / spanX)) * spanY + 26;
    const yBot = O.y - (kC / (u0 + 60 / spanX)) * spanY - 24;
    p.stroke(C.ink2); p.strokeWeight(8); p.noFill();
    p.line(bx, yTop, bx, yBot);
    p.line(bx - 16, yTop, bx + 16, yTop);
    p.line(bx - 16, yBot, bx + 16, yBot);

    // dots on each curve
    p.noStroke();
    p.fill(C.bg); p.circle(pe.x, pe.y, 64); p.circle(pc.x, pc.y, 64);
    p.fill(C.ink); p.circle(pe.x, pe.y, 40);
    p.fill(C.accent); p.circle(pc.x, pc.y, 40);

    // labels
    label("ε", XR + 80, O.y, { size: 62 });
    label("m", O.x - 62, YT + 5, { size: 62 });
    label("ε_0", xp, O.y + 46, { size: 56 });
    const le = at(kE, 0.72);
    label("1/ε", le.x + 20, le.y - 62, { size: 66, color: C.ink, align: "left" });
    const lc = at(kC, 0.8);
    label("I(ε)/ε", bx + 28, (yTop + yBot) / 2 - 10, { size: 58, color: C.ink2, align: "left", halo: true });
    label("1/I(ε)", lc.x, lc.y - 88, { size: 66, color: C.accent, halo: true });
  },
});
