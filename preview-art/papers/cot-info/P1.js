// CoT Information · option P1 · "Endpoint only vs every step"
// The same discrete reasoning route (x → z_1 … z_6 → y) drawn in two lanes.
// Top lane: end-to-end supervision checks only the answer y; the middle is a
// fog of candidate routes. Bottom lane: CoT supervision checks every step, so
// one node per column survives (accent staircase) and the rest are ruled out.
PreviewArt.register({
  slug: "cot-info",
  option: "P1",
  round: 2,
  title: "Endpoint vs every step",
  concept: "End-to-end supervision checks only the final answer y; CoT supervision also checks every intermediate step z_t, ruling out all but one route.",
  legend: "top lane: only y is checked (✓), steps unobserved; bottom lane: every step z is checked (✓), one route survives (accent), other nodes ruled out",
  seed: 7,
  params: { cols: 6, laneY: [270, 580], rowGap: 100, route: [1, 0, 1, 2, 1, 0] },
  draw(p, C, { params: P, label, check }) {
    const X0 = 205, X1 = 1045, N = P.cols;
    const C0 = 385, C1 = 875;
    const colX = (i) => C0 + (i * (C1 - C0)) / (N - 1);
    const rowY = (lane, r) => P.laneY[lane] + (r - 1) * P.rowGap;
    const line = (x1, y1, x2, y2) => p.line(x1, y1, x2, y2);

    const endNode = (x, y, str) => {
      p.noStroke();
      p.fill(C.bg); p.circle(x, y, 116);
      p.fill(C.ink); p.circle(x, y, 92);
      label(str, x, y - 3, { size: 60, color: C.bg });
    };

    // ---- Top lane: end-to-end. Fog of candidate edges, nodes unobserved. ----
    {
      const L = 0;
      p.stroke(C.mix("faint", "ink2", 0.3)); p.strokeWeight(5);
      for (let r = 0; r < 3; r++) {
        line(X0, rowY(L, 1), colX(0), rowY(L, r));
        line(colX(N - 1), rowY(L, r), X1, rowY(L, 1));
      }
      for (let i = 0; i < N - 1; i++)
        for (let a = 0; a < 3; a++)
          for (let b = 0; b < 3; b++) line(colX(i), rowY(L, a), colX(i + 1), rowY(L, b));
      p.noStroke();
      for (let i = 0; i < N; i++)
        for (let r = 0; r < 3; r++) {
          p.fill(C.bg); p.circle(colX(i), rowY(L, r), 58);
          p.fill(C.faint); p.circle(colX(i), rowY(L, r), 36);
        }
      endNode(X0, rowY(L, 1), "x");
      endNode(X1, rowY(L, 1), "y");
      check(X1, rowY(L, 1) - 92, 50, C.ink, 11);
    }

    // ---- Bottom lane: CoT. One surviving node per column, every step checked. ----
    {
      const L = 1;
      // ruled-out alternatives: small rings, no edges
      p.stroke(C.faint); p.strokeWeight(5); p.fill(C.bg);
      for (let i = 0; i < N; i++)
        for (let r = 0; r < 3; r++) if (r !== P.route[i]) p.circle(colX(i), rowY(L, r), 34);
      // staircase of straight hops
      const pts = [{ x: X0, y: rowY(L, 1) }, ...P.route.map((r, i) => ({ x: colX(i), y: rowY(L, r) })), { x: X1, y: rowY(L, 1) }];
      p.stroke(C.accent); p.strokeWeight(16); p.noFill();
      for (let k = 0; k < pts.length - 1; k++) line(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y);
      endNode(X0, rowY(L, 1), "x");
      endNode(X1, rowY(L, 1), "y");
      check(X1, rowY(L, 1) - 92, 50, C.ink, 11);
      P.route.forEach((r, i) => {
        const x = colX(i), y = rowY(L, r);
        p.noStroke();
        p.fill(C.bg); p.circle(x, y, 92);
        p.fill(C.accent); p.circle(x, y, 68);
        check(x, y, 34, C.bg, 9);
      });
      // every step named, in one row under the lane
      for (let i = 0; i < N; i++) label("z_" + (i + 1), colX(i), rowY(L, 2) + 76, { size: 52, color: C.ink2 });
    }

    // short divider between the two lanes
    p.stroke(C.faint); p.strokeWeight(8);
    line(565, 425, 685, 425);
  },
});
