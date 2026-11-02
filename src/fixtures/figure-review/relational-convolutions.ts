import { definePaperReview } from "./types";

export default definePaperReview({
  post: "relational-convolutions",
  paper: "Relational Convolutions",
  order: 40,
  entries: [
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
