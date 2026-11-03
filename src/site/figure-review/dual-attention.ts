import { definePaperReview } from "../../fixtures/figure-review/types";

export default definePaperReview({
  post: "dual-attention",
  paper: "Dual Attention",
  order: 50,
  entries: [
    {
      kind: "diagram",
      figure: "dual-attention/attention-mechanisms",
      label: "Diagram: sensory and relational attention",
      alt: "Sensory and Relational Attention",
      before: { kind: "image", src: "/blog/dual-attention/static/figs/paper_main_figure.png" },
      note: "Redrawn with <Diagram> by eye from the PNG (no TikZ or slide source found): same two panels, rows, converging edges and labels. Colours as published, from the site palette: sensory red (series 1) for the objects x, y_i and values v_i; relational blue (series 2) for r(x, y_i); symbols green (series 6). Panels stack on phones."
    },
    {
      figure: "dual-attention/relgames-learning-curves",
      label: "Relational games, learning curves",
      alt: "Relational games learning curves",
      before: { kind: "plotly", src: "/blog/dual-attention/static/figs/relgames_learning_curves.html", height: "560px" },
      note: "Panels keep their own x range as in the plotly subplots (match pattern runs 2,500–25,000, the rest 250–2,500); the y range is shared. Colours follow the paper: relational-only DAT blue, mixed DAT purple, Transformer red."
    },
    {
      figure: "dual-attention/math-accuracy-scaling",
      label: "Mathematical problem solving, accuracy vs size",
      alt: "Mathematical problem solving",
      before: { kind: "plotly", src: "/blog/dual-attention/static/figs/math_accuracy_scaling.html", height: "560px" },
      note: "Each panel keeps its own accuracy range, as in the plotly subplots. Points added at each model size for hover. Two columns on phones."
    },
    {
      figure: "dual-attention/language-modeling-scaling-laws",
      label: "Language modeling scaling laws",
      alt: "Language modeling scaling laws",
      before: { kind: "plotly", src: "/blog/dual-attention/static/figs/language_modeling_scaling_laws.html", height: "560px" },
      note: "Colour now encodes the model (DAT vs Transformer, which is also dashed) and each perplexity level is labelled at the line ends, replacing the six-step green-blue ramp and its legend."
    }
  ]
});
