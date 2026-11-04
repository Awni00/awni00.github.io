import { definePaperReview } from "../../dev/figure-review/types";

const FIGS = "/blog/algorithmic-generalization-transformer-architectures/figures";
const pdf = (src: string) => ({ kind: "pdf" as const, src: `${FIGS}/${src}`, invertInDarkMode: true });
const POST = "algorithmic-generalization-transformer-architectures";

export default definePaperReview({
  post: POST,
  paper: "Unlocking Out-of-Distribution Generalization in Transformers",
  order: 20,
  entries: [
    {
      figure: `${POST}/method-ood-comparison`,
      label: "Method OOD comparison (fig:method_ood_comparison)",
      alt: "Method OOD Comparison",
      before: pdf("method_ood_comparison_legendtop.pdf"),
      note: "Rebuilt from the paper's figure data (figure-data/method_ood_comparison/summary.csv): seven methods, five-seed mean ± 1 SEM, as in the current paper. The 'before' is the post's older single-seed, six-method figure. Every line is labelled directly; no legend. Colours by family, as in the paper: discrete methods navy (Discrete LSS lighter), continuous-latent methods teal and olive, E2E greys (recurrent lighter), CoT claret."
    },
    {
      figure: `${POST}/ec-stepwise-best-seed`,
      label: "Test-time scaling, Discrete LSS + EC (fig:ourmethod_stepwise_results)",
      alt: "Stepwise Results",
      before: pdf("ourmethod_stepwise_results_Blues.pdf"),
      note: "Copied from figure-data/stepwise_results/discrete_error_correction/seed_data.csv, best seed 2208528648 (the paper's selection). All 16 graph sizes, as an opacity ramp toward navy (the Discrete LSS + EC colour); the paper's diamond marking N = 32 moves into the hover tip. Shaded region: maximum training depth (6)."
    },
    {
      figure: `${POST}/self-scheduled-first-fill`,
      label: "Self-Scheduled LSS: discovered schedule (fig:self_scheduled_schedule)",
      alt: "Median first-fill time against node depth for the five Self-Scheduled LSS training seeds, with the layer-by-layer schedule as a dotted reference line.",
      before: { kind: "none", reason: "New in the current paper; the post has no figure for Mechanism 2b yet." },
      note: "Medians copied from figure-data/self_scheduled_lss/first_nonempty_by_depth_seed.csv (depths with < 50% coverage dropped, as in the paper). Schedule rates and N = 128 solve rates recomputed with the paper generator's rule and checked against its legend. Lines are labelled at their ends with the paper's legend values (schedule rate · N = 128 solve rate); medium width to make room. The layer-by-layer reference is labelled directly."
    },
    {
      figure: `${POST}/stronger-ood-best-seed`,
      label: "Generalization to N = 256, best of five seeds (fig:stronger_ood_best_seed)",
      alt: "Solve rate against graph size up to N = 256 for the best of five seeds of each method; models trained on N ≤ 32.",
      before: { kind: "none", reason: "New in the current paper (follow-up experiment); the post has no section for it yet." },
      note: "Copied from figure-data/stronger_ood_n32_n256/method_ood_comparison/seed_data.csv; the best-of-five selection was re-derived and matches the paper's provenance. CoT stops at N = 88 where its evaluation was censored, as in the paper. Lines labelled directly, as in the method comparison."
    },
    {
      figure: `${POST}/l0-relative-variance-var-0`,
      label: "Relative variance heatmap, layer 1, perturbing var_0",
      alt: "VAR_0",
      before: pdf("L0_var_0_relative_variance_heatmap.pdf"),
      note: "Vector-extracted: cell colours inverted through matplotlib's Blues colormap (256 steps), scaled by the colour bar's range (vmax ≈ 0.97); precision about 0.004. Drawn on a fixed 0–1 ramp toward series 1. The post shows these 2 × 2 instead of 4 across."
    },
    {
      figure: `${POST}/l0-relative-variance-var-1`,
      label: "Relative variance heatmap, layer 1, perturbing var_1",
      alt: "VAR_1",
      before: pdf("L0_var_1_relative_variance_heatmap.pdf"),
      note: "Vector-extracted: cell colours inverted through matplotlib's Blues colormap (256 steps), scaled by the colour bar's range (vmax ≈ 0.97); precision about 0.004. Drawn on a fixed 0–1 ramp toward series 1. The post shows these 2 × 2 instead of 4 across."
    },
    {
      figure: `${POST}/l0-relative-variance-var-2`,
      label: "Relative variance heatmap, layer 1, perturbing var_2",
      alt: "VAR_2",
      before: pdf("L0_var_2_relative_variance_heatmap.pdf"),
      note: "Vector-extracted: cell colours inverted through matplotlib's Blues colormap (256 steps), scaled by the colour bar's range (vmax ≈ 0.97); precision about 0.004. Drawn on a fixed 0–1 ramp toward series 1. The post shows these 2 × 2 instead of 4 across."
    },
    {
      figure: `${POST}/l0-relative-variance-rhs`,
      label: "Relative variance heatmap, layer 1, perturbing rhs",
      alt: "RHS",
      before: pdf("L0_rhs_relative_variance_heatmap.pdf"),
      note: "Vector-extracted: cell colours inverted through matplotlib's Blues colormap (256 steps), scaled by the colour bar's range (vmax ≈ 0.97); precision about 0.004. Drawn on a fixed 0–1 ramp toward series 1. The post shows these 2 × 2 instead of 4 across."
    },
    {
      figure: `${POST}/l0-ov-operator-norm`,
      label: "Norm amplification, layer 1 heads",
      alt: "L0 OV Norm",
      before: pdf("L0_ov_operator_norm_mpl.pdf")
    },
    {
      figure: `${POST}/l2-relative-error`,
      label: "Layer-1 MLP relative L2 change",
      alt: "L2 Relative Error",
      before: pdf("l2_relative_error.pdf"),
      note: "Vector-extracted bar edges and integer counts (exact). The published panel title is kept."
    },
    {
      figure: `${POST}/l1-attention-head-statistics-var0`,
      label: "Attention-head statistics, layer 2, var 0",
      alt: "VAR_0_stats",
      before: pdf("l1_attention_head_statistics_var0.pdf"),
      note: "Vector-extracted from the plotly PDF; heads drawn with zero-height bars are 0. One colour for all three panels (the published figure used one per panel). Each chart is full width; the post stacks the three instead of a 3-across grid."
    },
    {
      figure: `${POST}/l1-attention-head-statistics-var1`,
      label: "Attention-head statistics, layer 2, var 1",
      alt: "VAR_1_stats",
      before: pdf("l1_attention_head_statistics_var1.pdf"),
      note: "Vector-extracted from the plotly PDF; heads drawn with zero-height bars are 0. One colour for all three panels (the published figure used one per panel). Each chart is full width; the post stacks the three instead of a 3-across grid."
    },
    {
      figure: `${POST}/l1-attention-head-statistics-var2`,
      label: "Attention-head statistics, layer 2, var 2",
      alt: "VAR_2_stats",
      before: pdf("l1_attention_head_statistics_var2.pdf"),
      note: "Vector-extracted from the plotly PDF; heads drawn with zero-height bars are 0. One colour for all three panels (the published figure used one per panel). Each chart is full width; the post stacks the three instead of a 3-across grid."
    },
    {
      figure: `${POST}/l1-ov-operator-norm`,
      label: "Norm amplification, layer 2 heads",
      alt: "L1 OV Operator Norm",
      before: pdf("L1_ov_operator_norm.pdf"),
      note: "Vector-extracted. The published plotly chart overlays the three groups' bars, which hides var_2 behind the others; here they are grouped side by side, like the layer-1 chart."
    },
    {
      figure: `${POST}/fft-histograms-l1-mlp-preact`,
      label: "Frequency histogram, L1-mlp-preact",
      alt: "FFT MLP Preact",
      before: pdf("fft_histograms_L1-mlp-preact.pdf"),
      note: "Vector-extracted bins and counts (log count axis; counts round to integers and per-class totals match across stages). (a, a, a) takes series 1 and the generic (a, b, c) class the neutral colour. Values below log10 = 0 lie off the published axis and are not in the PDF (pre-activation only: 4 of 11 diagonal, 132 of 330 one-repeat and 457 of 990 generic frequencies)."
    },
    {
      figure: `${POST}/fft-histograms-l1-mlp-postact`,
      label: "Frequency histogram, L1-mlp-postact",
      alt: "FFT MLP Postact",
      before: pdf("fft_histograms_L1-mlp-postact.pdf"),
      note: "Vector-extracted bins and counts (log count axis; counts round to integers and per-class totals match across stages). (a, a, a) takes series 1 and the generic (a, b, c) class the neutral colour."
    },
    {
      figure: `${POST}/fft-histograms-l1-mlp-output`,
      label: "Frequency histogram, L1-mlp-output",
      alt: "FFT MLP Output",
      before: pdf("fft_histograms_L1-mlp-output.pdf"),
      note: "Vector-extracted bins and counts (log count axis; counts round to integers and per-class totals match across stages). (a, a, a) takes series 1 and the generic (a, b, c) class the neutral colour."
    },
    {
      figure: `${POST}/fft-histograms-decoder-output`,
      label: "Frequency histogram, decoder-output",
      alt: "FFT Decoder Output",
      before: pdf("fft_histograms_decoder-output.pdf"),
      note: "Vector-extracted bins and counts (log count axis; counts round to integers and per-class totals match across stages). (a, a, a) takes series 1 and the generic (a, b, c) class the neutral colour."
    }
  ]
});
