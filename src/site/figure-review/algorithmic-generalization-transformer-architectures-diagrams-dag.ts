import { definePaperReview } from "../../dev/figure-review/types";

export default definePaperReview({
  post: "agta-diagrams-dag",
  paper: "Unlocking OOD — DAG diagrams",
  order: 22,
  entries: [
    {
      kind: "diagram",
      figure: "algorithmic-generalization-transformer-architectures/computation-graph",
      label: "Diagram: example computation graph",
      alt: "Computation graph with four leaves, three depth-1 nodes and two depth-2 nodes.",
      before: {
        kind: "pdf",
        src: "/blog/algorithmic-generalization-transformer-architectures/figures/formula_graph.pdf",
        invertInDarkMode: true
      },
      note: "Same topology as formula_graph.pdf / dag_example_ops_colored.tex. Look A (outline): leaves neutral outlines with ink names (given), computed nodes series 2 outlines, no fills; operations hairline squares; values in the code face under the node (= 20). x91 sits higher and x55 lower so x88's edge to − runs through a clear corridor. Column headers Leaves / Depth 1 / Depth 2 tie it to the natural-algorithm section. The caption's colour words (green/pink/blue) need a separate text change."
    },
    {
      kind: "diagram",
      figure: "algorithmic-generalization-transformer-architectures/computation-graph-alt",
      label: "Diagram: example computation graph (alt look)",
      alt: "Computation graph with four leaves, three depth-1 nodes and two depth-2 nodes.",
      before: {
        kind: "pdf",
        src: "/blog/algorithmic-generalization-transformer-architectures/figures/formula_graph.pdf",
        invertInDarkMode: true
      },
      note: "Look B (tag): same geometry; leaves soft neutral discs, computed nodes series 2 outlines, values in small outlined mono tags under the nodes."
    },
    {
      kind: "diagram",
      figure: "algorithmic-generalization-transformer-architectures/computation-graph-animated",
      label: "Diagram: computation graph, animated",
      alt: "Computation graph evaluated layer by layer: depth-1 nodes and their values appear, then depth-2.",
      before: { kind: "none", reason: "New animated variant of the computation graph." },
      note: "Plays once (~3.8 s): leaves shown; a faint band marks iteration 1 as the depth-1 ops, nodes and values (mod 23: 22, 8, 15) appear; then iteration 2 (x101 = 15, x30 = 17). Final frame shows all values."
    }
  ]
});
