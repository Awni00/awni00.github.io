import { defineDiagram } from "../../../lib/figures/diagram";
import { ALT, drawGraph } from "./computation-graph";

// Alternative look for the computation graph (see computation-graph.ts):
// leaves are soft navy discs, computed nodes series 2 outlines, and values
// sit in small outlined tags under the nodes.
export default defineDiagram({
  size: "medium",
  alt: ALT,
  draw: (context) => drawGraph(context, { look: "tag", values: false })
});
