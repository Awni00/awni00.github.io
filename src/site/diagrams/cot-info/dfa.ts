import { canvas, defineDiagram } from "../../../lib/figures/diagram";

// Redrawn from figs/simulation_figs/DFA_transition_diagram.pdf: the same four
// states, layout and transitions. The start state (0) keeps a blue-family
// tint and the accepting state (3) a green-family one, as published; the
// others are neutral.
export default defineDiagram({
  size: "narrow",
  alt: "Deterministic finite automaton with four states, 0 to 3. State 0 is the start state and state 3 is accepting.",
  draw: ({ width }) => {
    const d = canvas(width, 284);
    const r = 20;
    const left = width / 2 - 92;
    const right = width / 2 + 92;
    const top = 74;
    const bottom = 214;
    const s0 = { x: left, y: bottom, r };
    const s1 = { x: right, y: bottom, r };
    const s2 = { x: right, y: top, r };
    const s3 = { x: left, y: top, r };

    const edge = (from: typeof s0, to: typeof s0, symbol: string, bend = 0) =>
      d.label(d.edge(from, to, { bend, gap: 2 }), symbol, { halo: true });

    // Paired transitions bow apart; single ones run straight.
    edge(s0, s1, "0", 22);
    edge(s1, s0, "0", 22);
    edge(s3, s2, "1", 22);
    edge(s2, s3, "0", 22);
    edge(s0, s3, "1");
    edge(s2, s1, "1");
    edge(s1, s3, "1");
    d.label(d.loop(s3, -135), "0");

    d.arrow({ x: s0.x, y: s0.y + r + 26 }, { x: s0.x, y: s0.y + r + 2 });
    d.label({ x: s0.x, y: s0.y + r + 30 }, "start", { size: "sm", tone: "muted", baseline: "top" });

    d.circle(s0, r, { tone: 2 });
    d.circle(s1, r, { tone: "neutral" });
    d.circle(s2, r, { tone: "neutral" });
    d.circle(s3, r, { tone: 4, double: true });
    for (const [state, name] of [[s0, "0"], [s1, "1"], [s2, "2"], [s3, "3"]] as const) {
      d.label(state, name, { size: "lg" });
    }
    return d;
  }
});
