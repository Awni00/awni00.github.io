import { definePaperReview } from "../../fixtures/figure-review/types";

const FIG = "algorithmic-generalization-transformer-architectures";

export default definePaperReview({
  post: "agta-diagrams-anchoring",
  paper: "Unlocking OOD — anchoring diagrams",
  order: 23,
  entries: [
    {
      kind: "diagram",
      figure: `${FIG}/anchoring-drift`,
      label: "Diagram: anchoring vs drift",
      alt: "Continuous, discrete and discrete + self-correction latent trajectories across recurrent iterations.",
      before: { kind: "pdf", src: `/blog/${FIG}/figures/anchoring_drift.pdf`, invertInDarkMode: true },
      note: "Paper geometry (gen_anchoring_figure.py) scaled to the column. Continuous = series 4 (teal), Discrete = cerulean (between teal and navy), Discrete + self-correction = series 2 (navy), as in the post's charts; errors series 3 (ochre), correction series 6 (olive). Phone: ten iterations, row names above rows."
    },
    {
      kind: "diagram",
      figure: `${FIG}/anchoring-drift-animated`,
      label: "Diagram: anchoring vs drift (animated)",
      alt: "Animated: the three trajectories draw left to right; the error appears and the bottom row corrects.",
      before: { kind: "none", reason: "Animated variant of the diagram above." },
      note: "Plays once when in view, in phases (~8.5 s; ~7 s on a phone): steady through the trained range, slower for the extrapolation, a slow step and hold at the error, a slower step and hold for the correction, then a quick finish."
    }
  ]
});
