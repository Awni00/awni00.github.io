import { definePaperReview } from "../../dev/figure-review/types";

const FIGS = "/blog/abstractor/figs";

export default definePaperReview({
  post: "abstractor",
  paper: "Abstractors and Relational Cross-Attention",
  order: 10,
  entries: [
    {
      kind: "diagram",
      figure: "abstractor/self-attention",
      label: "Diagram: self-attention",
      alt: "depiction of self-attention",
      before: { kind: "image", src: `${FIGS}/self_attn_fig.png` },
      note: "Redrawn with <Diagram> from the vector picture on slide 6 of the ICLR slides (same boxes, token positions, 8x8 tensor, arrows); labels as in the PNG. Colours as published, from the site palette: input (sensory) red, relation tensor and attention blue, encoder states purple (series 5)."
    },
    {
      kind: "diagram",
      figure: "abstractor/relational-cross-attention",
      label: "Diagram: relational cross-attention",
      alt: "depiction of relational cross-attention",
      before: { kind: "image", src: `${FIGS}/rel_crossattn_fig.png` },
      note: "Redrawn from slide 6 of the ICLR slides, as the self-attention diagram. Colours as published: abstract states blue (relational), symbols green; input and tensor as in the self-attention diagram. Bottleneck rule is a muted dashed line (published dash-dot), its label sentence case, muted 13px, raised above the formula row."
    },
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
