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
    }
  ]
});
