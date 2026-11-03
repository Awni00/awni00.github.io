import { defineDiagram } from "../../../lib/figures/diagram";
import { drawExpanded, stepStyle } from "./mech-2-reference";

// M2 (2a), expanded: each model state drawn as its row of output cells.
// Animation B, step by step: the figure builds bottom-up, one iteration at a
// time (reference step or target, supervision arrow, row of output cells).
// The static drawing is the final frame. Builders in mech-2-reference.ts.
const P = "agta-m2rb";

export default defineDiagram({
  size: "narrow",
  alt: "Depth-supervised schedule: a column of reference-algorithm steps, each supervising the matching iteration of the model, whose output is a row of five nodes; each iteration fills in the nodes one level deeper.",
  animate: {},
  draw: () => drawExpanded("2a", P).raw(stepStyle(P))
});
