import { definePaperReview } from "./types";

export default definePaperReview({
  post: "abstractor",
  paper: "Abstractors and Relational Cross-Attention",
  order: 10,
  entries: [
    {
      figure: "abstractor/pairwise-order",
      label: "Learning curves, pairwise order",
      alt: "learning curves of pairwise order discriminative task",
      before: { kind: "image", src: "/blog/abstractor/figs/pairwise_order_learning_curves.png" },
      note: "Rebuilt data was read off the PNG by eye; see provenance.yaml."
    }
  ]
});
