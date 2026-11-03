import { defineDiagram } from "../../../lib/figures/diagram";
import { drawExpanded, expandStyle } from "./mech-2-reference";

// M2 (2b), expanded: each model state drawn as its row of output cells.
// Animation A, expand then decode: each iteration starts as one block-coloured
// square (the latent state), the squares spread sideways into rows of output
// cells, then the rows are decoded bottom-up with their supervision arrows.
// The static drawing is the final frame. Builders in mech-2-reference.ts.
const P = "agta-m2rba";

export default defineDiagram({
  size: "narrow",
  alt: "Self-discovered schedule: the final answer y supervises the model's output at every iteration; the output is a row of five nodes, empty (abstained) at first and filled in over the iterations in the model's own order.",
  animate: {},
  draw: () => drawExpanded("2b", P).raw(expandStyle(P))
});
