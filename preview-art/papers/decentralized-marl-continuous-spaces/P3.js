// Decentralized MARL · option P3 · "Same world, no wires" (round 4)
// Every agent observes the same environment state but not the others' actions, and the
// agents never message each other: spokes from the environment, cut gaps between agents.
// Each agent is a small robot glyph with its own private policy update: a loop that
// leaves the agent and returns to it, around π.
PreviewArt.register({
  slug: "decentralized-marl-continuous-spaces",
  option: "P3",
  round: 5,
  title: "Same world, no wires",
  concept: "Decentralization: agents all observe one shared environment but see no one's actions and send no messages, so each updates only its own private policy.",
  legend: "globe tile → the shared environment every agent observes; arrow from it to an agent → state observation, arrow back → that agent's action (each agent only ever sees the environment); robot glyphs → separate learning agents; loop around π that leaves and re-enters the agent → each agent's own private policy update; dashed gap with ✗ → no action observation, no messages between agents",
  seed: 3,
  params: { agents: 5, rx: 380, ry: 296, cx: 600, cy: 424, hubR: 89 },
  draw(p, C, { W, H, params: P, label, cross, arrow, arrowHead }) {
    const { cx, cy, rx, ry, hubR } = P;
    const n = P.agents;
    const hw = 56, hh = 72;                                            // half-size of a robot glyph's bounding box
    // five agents around the environment (top two splayed wide so the word fits between them)
    const A = [[865, 196], [975, 514], [600, 716], [225, 514], [335, 196]].map(([x, y]) => ({ x, y }));
    const exit = (ux, uy) => Math.min(hw / (Math.abs(ux) + 1e-9), hh / (Math.abs(uy) + 1e-9));   // distance from centre to bbox edge

    // --- gaps between neighbours: faint dashes cut in the middle, marked with ✗
    p.noFill();
    for (let k = 0; k < n; k++) {
      const a = A[k], b = A[(k + 1) % n];
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const m0 = exit(ux, uy) + 20;
      const seg = (s0, s1) => p.line(a.x + ux * s0, a.y + uy * s0, a.x + ux * s1, a.y + uy * s1);
      p.stroke(C.faint); p.strokeWeight(6);
      [[0, 26], [44, 70]].forEach(([d0, d1]) => { seg(m0 + d0, m0 + d1); seg(L - m0 - d1, L - m0 - d0); });
    }

    // --- two edges per agent: observation (environment → agent) and action (agent → environment)
    const sep = 17;                                                     // half the distance between the pair (34 px apart)
    A.forEach((q, k) => {
      const dx = q.x - cx, dy = q.y - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const s0 = hubR + 18, s1 = L - exit(ux, uy) - 14;
      const o = { color: C.ink2, weight: 6, size: 22 };
      arrow(cx + ux * s0 + nx * sep, cy + uy * s0 + ny * sep, cx + ux * s1 + nx * sep, cy + uy * s1 + ny * sep, o);   // state to agent
      arrow(cx + ux * s1 - nx * sep, cy + uy * s1 - ny * sep, cx + ux * s0 - nx * sep, cy + uy * s0 - ny * sep, o);   // action back
    });

    // --- environment: a small globe tile (latitude lines + a meridian), with the word above it
    p.noStroke(); p.fill(C.bg); p.circle(cx, cy, hubR * 2 + 30);
    p.fill(C.accentSoft); p.circle(cx, cy, hubR * 2 + 18);
    p.fill(C.accent); p.circle(cx, cy, hubR * 2);
    p.noFill(); p.stroke(C.alpha("bg", 0.6)); p.strokeWeight(5);
    p.ellipse(cx, cy, hubR * 0.86, hubR * 2 - 4);                       // meridian
    [0, -0.52, 0.52].forEach((f) => {                                   // equator and two latitudes (front half)
      const yy = cy + f * hubR, hw2 = Math.sqrt(1 - f * f) * (hubR - 2);
      p.arc(cx, yy, hw2 * 2, 30, 0, Math.PI);
    });
    label("Environment", cx, cy - hubR - 86, { size: 48, color: C.ink, upright: true });

    // --- agents: one robot glyph, identical for every agent
    const robot = (x, y) => {
      p.noStroke(); p.fill(C.bg); p.rect(x - hw - 8, y - hh - 6, 2 * hw + 16, 2 * hh + 12, 30);   // knockout plate
      p.stroke(C.ink); p.strokeWeight(11); p.fill(C.bg);
      p.line(x, y - 56, x, y - 36);                                   // antenna
      p.rect(x - 50, y - 36, 100, 70, 22);                             // head
      p.rect(x - 28, y + 44, 56, 24, 11);                              // body
      p.noStroke(); p.fill(C.ink);
      p.circle(x, y - 62, 18);                                         // antenna dot
      p.circle(x - 22, y - 2, 17); p.circle(x + 22, y - 2, 17);        // eyes
      p.rect(x - 62, y - 14, 10, 26, 5); p.rect(x + 52, y - 14, 10, 26, 5);   // ear nubs
    };
    const cycle = (x, y, sgn) => {
      // self-loop on the agent's outer side: it leaves the agent above the ear and
      // re-enters below it, around π (the policy being updated)
      const r = 44, d = 22, xe = x + sgn * 70, lx = xe + sgn * d;
      const a0 = Math.acos(-d / r);                                     // attach angle on the agent side
      const at = (th) => { const ph = sgn > 0 ? th : Math.PI - th; return [lx + r * Math.cos(ph), y + r * Math.sin(ph)]; };
      const head = 24 / r;                                              // arc length taken by the head
      p.noFill(); p.stroke(C.ink2); p.strokeWeight(8);
      p.beginShape();
      for (let i = 0; i <= 40; i++) { const [px, py] = at(-a0 + (2 * a0 - head) * (i / 40)); p.vertex(px, py); }
      p.endShape();
      const [hx, hy] = at(a0), [bx, by] = at(a0 - head);
      arrowHead(hx, hy, Math.atan2(hy - by, hx - bx), { color: C.ink2, size: 24 });
      label("π", lx + sgn * 4, y + 3, { size: 52, color: C.ink2 });
    };
    A.forEach((q, k) => {
      robot(q.x, q.y);
      const sgn = q.x >= cx ? 1 : -1;
      cycle(q.x, q.y - 2, sgn);
    });

    // --- ✗ on the gaps
    for (let k = 0; k < n; k++) {
      const a = A[k], b = A[(k + 1) % n];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      p.noStroke(); p.fill(C.bg); p.circle(mx, my, 44);
      cross(mx, my, 28, C.ink2, 8);
    }
  },
});
