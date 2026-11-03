import { defineDiagram } from "../../../lib/figures/diagram";
import { drawReference } from "./mech-2-reference";

// M2b in the style of the published mech2.pdf: no reference algorithm. The
// final answer y (series 1) supervises the model's output at every
// iteration; the output is read from the model's state (solid series 2), and
// in early iterations the model abstains (∅, dashed) instead of guessing.
// Builders in mech-2-reference.ts.
export default defineDiagram({
  size: "narrow",
  alt: "Self-discovered schedule: at every iteration the model's output is supervised by the final answer y. In early iterations the model abstains, outputting empty, and it commits to an answer later.",
  draw: () => drawReference("2b")
});
