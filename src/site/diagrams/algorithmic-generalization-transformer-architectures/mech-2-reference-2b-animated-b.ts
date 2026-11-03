import { defineDiagram } from "../../../lib/figures/diagram";
import { drawExpanded, stepStyle } from "./mech-2-reference";

// M2 (2b), expanded: each model state drawn as its row of output cells.
// Animation B, step by step: the figure builds bottom-up, one iteration at a
// time (reference step or target, supervision arrow, row of output cells).
// The static drawing is the final frame. Builders in mech-2-reference.ts.
const P = "agta-m2rbb";

export default defineDiagram({
  size: "narrow",
  alt: "Self-discovered schedule: the final answer y supervises the model's output at every iteration; the output is a row of five nodes, empty (abstained) at first and filled in over the iterations in the model's own order.",
  animate: {},
  draw: () => drawExpanded("2b", P).raw(stepStyle(P))
});
