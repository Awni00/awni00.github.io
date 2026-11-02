import { definePaperReview } from "./types";

const FIGS = "/blog/abstractor/figs";

export default definePaperReview({
  post: "abstractor",
  paper: "Abstractors and Relational Cross-Attention",
  order: 10,
  entries: [
    {
      figure: "abstractor/pairwise-order",
      label: "Learning curves, pairwise order",
      alt: "learning curves of pairwise order discriminative task",
      before: { kind: "image", src: `${FIGS}/pairwise_order_learning_curves.png` },
      note: "Vector-extracted from the ICLR 2024 paper PDF (same curves as the PNG). Legend in the published order."
    },
    {
      figure: "abstractor/set-classification",
      label: "Learning curves, SET",
      alt: "learning curves on SET game classification task",
      before: { kind: "image", src: `${FIGS}/set_classification.png` },
      note: "Vector-extracted from the ICLR 2024 slides in this repo. Colours match the pairwise-order chart."
    },
    {
      figure: "abstractor/random-object-sorting",
      label: "Learning curves, object sorting",
      alt: "learning curves for object-sorting experiments",
      before: { kind: "image", src: `${FIGS}/random_object_sorting.png` },
      note: "Vector-extracted from the slides. Ablation model is neutral; Transformer keeps its colour in the next chart."
    },
    {
      figure: "abstractor/random-object-sorting-generalization",
      label: "Learning curves, object sorting after pre-training",
      alt: "learning curves for object-sorting experiments after pre-training on related task",
      before: { kind: "image", src: `${FIGS}/random_object_sorting_generalization.png` },
      note: "Vector-extracted from the slides. Light/dark pairs became colour = model, dashed = from scratch, solid = pre-trained; legend wording kept."
    },
    {
      figure: "abstractor/math-training-curves",
      label: "Training curves, math problem-solving",
      alt: "Learning Curves of Mathematical Problem-Solving Tasks",
      before: { kind: "image", src: `${FIGS}/math_training_curves.png` },
      note: "Vector-extracted from the slides. Panels keep their own y ranges (drawn normalised per panel); phone layout is 2 columns."
    }
  ]
});
