import { definePaperReview } from "./types";

export default definePaperReview({
  post: "relational-convolutions",
  paper: "Relational Convolutions",
  order: 40,
  entries: [
    {
      kind: "diagram",
      figure: "relational-convolutions/relational-convolution",
      label: "Diagram: the relational convolution",
      alt: "Relational Convolutional Networks architecture diagram",
      before: { kind: "image", src: "/blog/relational-convolutions/figs/relconv_diagram.png" },
      note: "Redrawn by eye from the PNG (no vector source found); positions are the PNG's, scaled. Colours as published: edges (relations) blue, nodes red or blue by kind; edge opacities kept. Row labels in sentence case; \"rel\" set upright. Phone layout moves the row labels beside and under the rows."
    },
    {
      kind: "diagram",
      figure: "relational-convolutions/architecture",
      label: "Diagram: relational convolutional network architecture",
      alt: "Relational Convolutional Networks architecture diagram",
      before: { kind: "image", src: "/blog/relational-convolutions/figs/relconv_architecture.png" },
      note: "Redrawn by eye from the PNG (no vector source found): same stack and shape annotations. Block colours as published: relational convolution red (series 1), inner product relation blue (series 2), initial embedder green (series 6). Block names in sentence case. In the post, WrapFigure only takes an image, so the diagram sits in the right column of a TwoColumns beside the same two paragraphs."
    },
    {
      figure: "relational-convolutions/relational-games-ood",
      label: "Relational games, out-of-distribution accuracy",
      alt: "Relational games out-of-distribution generalization",
      before: { kind: "plotly", src: "/blog/relational-convolutions/figs/relational_games_ood_gen.html", height: "520px" },
      note: "Layout changed from two side-by-side panels to two rows (Hexos, Stripes)."
    },
    {
      figure: "relational-convolutions/contains-set-acc",
      label: "Contains SET, accuracy by model",
      alt: "SET accuracy",
      before: { kind: "plotly", src: "/blog/relational-convolutions/figs/contains_set_acc.html", height: "520px" },
      note: "Colours match the relational games chart for the four shared models; the three graph baselines (GCN, GAT, GIN) are neutral. Model names horizontal instead of angled."
    },
    {
      figure: "relational-convolutions/contains-set-conv-rep",
      label: "Contains SET, relational convolution PCs",
      alt: "SET convolution representation",
      before: { kind: "plotly", src: "/blog/relational-convolutions/figs/contains_set_conv_rep.html", height: "520px" },
      note: "Axis titles rewritten from LaTeX to Unicode. \"not set\" is neutral, \"set\" the accent. No per-point hover (2,160 points)."
    }
  ]
});
