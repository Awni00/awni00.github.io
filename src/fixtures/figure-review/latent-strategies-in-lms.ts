import { definePaperReview } from "./types";

const FIGS = "/blog/latent-strategies-in-lms/figs";

export default definePaperReview({
  post: "latent-strategies-in-lms",
  paper: "Uncovering Latent Reasoning Strategies in Language Models",
  order: 60,
  entries: [
    {
      figure: "latent-strategies-in-lms/elbo-failure",
      label: "ELBO failure dynamics (fig:elbo-fails)",
      alt: "Standard ELBO training: distributional fidelity rises, posterior-router KL relative to initialization collapses, and strategy alignment stays low over training.",
      before: { kind: "embed", src: "/blog/latent-strategies-in-lms/interactive/elbo-failure.html", height: "400px" },
      note: "Paper's normalized-overlay variant. Line-end labels sit above the lines rather than on them."
    },
    {
      figure: "latent-strategies-in-lms/entanglement-heatmap",
      label: "Strategy decodability by position (fig:entanglement)",
      alt: "Heatmap with rows as benchmark tasks and columns as normalized token positions; color gives linear-probe accuracy for predicting the ground-truth strategy from the base model's hidden states.",
      before: { kind: "image", src: `${FIGS}/entanglement-heatmap.png`, invertInDarkMode: true },
      note: "Same 65-column interpolation as the paper. The flare colormap becomes a one-hue ramp from the background to series 1; the colour key is drawn inside the chart until the legend supports ramps."
    },
    {
      figure: "latent-strategies-in-lms/method-comparison",
      label: "Method comparison, Qwen2.5 0.5B and 1.5B (fig:reconstruction-decodability)",
      alt: "Bar chart over objective variants and two model sizes; bars show Distributional Fidelity and Strategy Alignment, with open points for per-task values and hatching marking baselines and ablations.",
      before: { kind: "image", src: `${FIGS}/method-comparison.png`, invertInDarkMode: true },
      note: "Phone layout stacks the two models. Hatching is drawn in the page background colour over the bar; its key sits above the second panel because the legend has no hatch key yet."
    },
    {
      figure: "latent-strategies-in-lms/posterior-geometry",
      label: "Posterior latent geometry over training (fig:disentanglement)",
      alt: "Six PCA panels of posterior mean latents at increasing fractions of training; an initially overlapping cloud separates into task- and strategy-specific regions, colored by task.",
      before: { kind: "image", src: `${FIGS}/posterior-geometry.png`, invertInDarkMode: true },
      note: "Same PCA as the paper (one fit over all 51 checkpoints, same sign convention, same axis limits). Colour is by task only: the paper's per-task shades for each strategy need more than six series; the scrubbable view below colours strategies within one task. Points are drawn as one path per colour to keep the SVG small, so they have no hover tips. Phone layout is a 3 x 2 grid."
    },
    {
      figure: "latent-strategies-in-lms/fidelity-alignment-phase-space",
      label: "Fidelity-alignment phase space, endpoints (fig:alignment-diagnostics, left)",
      alt: "Training trajectories in fidelity-alignment phase space, from first to last checkpoint, for each objective variant.",
      before: { kind: "image", src: `${FIGS}/fidelity-alignment-phase-space.png`, invertInDarkMode: true },
      note: "ELBO and β-ELBO are both neutral, β-ELBO dashed. Legend moved below the chart."
    },
    {
      figure: "latent-strategies-in-lms/token-recon-vs-alignment",
      label: "Token-weighted reconstruction vs alignment (fig:alignment-diagnostics, right)",
      alt: "Scatter of token-weighted reconstruction loss versus Strategy Alignment at training endpoints; outlined points show method centroids and translucent points show individual runs.",
      before: { kind: "image", src: `${FIGS}/token-recon-vs-alignment.png`, invertInDarkMode: true },
      note: "Five colours (four series plus neutral), one more than the scatter guideline, to keep the paper's families. Task markers as in the paper, except Plot has no filled X: sorting uses a 'wye'. Legend moved below the chart."
    },
    {
      figure: "latent-strategies-in-lms/exploration-coverage",
      label: "Strategy coverage at T = 4 (fig:exploration-decomposition)",
      alt: "Strategy coverage after four samples for each objective under latent IID sampling and latent exploration, against the base model.",
      before: { kind: "none", reason: "paper only: FP/additional_results/output/scratch_exploration_compact_with_base.pdf" },
      note: "Method labels set horizontally instead of rotated 30°."
    },
    {
      figure: "latent-strategies-in-lms/posterior-explorer",
      label: "Posterior latent geometry, all 51 checkpoints (web-native)",
      alt: "PCA projection of posterior mean latents, colored by task, with a slider over the 51 training checkpoints.",
      before: { kind: "none", reason: "new web-native figure" },
      note: "Slider and Play step through all 51 checkpoints (tweened between them unless reduced motion is set); it plays once on first view. 'Colour' switches from tasks to one task's strategies; their keys toggle focus on a single strategy. The readout gives each checkpoint's linear-probe accuracy from the frame file. Static SVG: final checkpoint. Data: posterior-frames.json (329 KB), loaded only with this figure."
    },
    {
      figure: "latent-strategies-in-lms/phase-space-explorer",
      label: "Phase-space training trajectories (web-native)",
      alt: "Training trajectories of each objective variant in fidelity-alignment phase space over 51 checkpoints, with a time slider, method toggles and a choice of x-axis metric.",
      before: { kind: "none", reason: "new web-native figure" },
      note: "Trajectories use the paper's rolling-variant smoothing (centred rolling mean over 6 checkpoints) by default; a select turns it off to show raw checkpoints. The x-axis select switches among the four phase-space families that share the alignment axis; reconstruction axes are log and reversed, as in the paper. Method keys toggle lines. Static SVG: full fidelity trajectories."
    },
    {
      figure: "latent-strategies-in-lms/exploration-race",
      label: "Exploration coverage race (web-native)",
      alt: "Strategy coverage against the number of decoded samples for each objective, under latent exploration or latent IID sampling, with the base model for reference.",
      before: { kind: "none", reason: "new web-native figure" },
      note: "Curves grow with the decoding budget T (slider in log2 T, so each doubling takes the same time). Sampling select switches between latent exploration and latent IID. Static SVG: exploration at T = 64; its legend draws the base model dashed, the interactive legend dotted as plotted."
    }
  ]
});
