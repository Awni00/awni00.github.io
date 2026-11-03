import { defineDiagram } from "../../../lib/figures/diagram";
import { drawExpanded, expandStyle } from "./mech-2-reference";

// M2 (2a), expanded: each model state drawn as its row of output cells.
// Animation A, expand then decode: each iteration starts as one block-coloured
// square (the latent state), the squares spread sideways into rows of output
// cells, then the rows are decoded bottom-up with their supervision arrows.
// The static drawing is the final frame. Builders in mech-2-reference.ts.
const P = "agta-m2ra";

export default defineDiagram({
  size: "narrow",
  alt: "Depth-supervised schedule: a column of reference-algorithm steps, each supervising the matching iteration of the model, whose output is a row of five nodes; each iteration fills in the nodes one level deeper.",
  animate: {},
  draw: () => drawExpanded("2a", P).raw(expandStyle(P))
});
