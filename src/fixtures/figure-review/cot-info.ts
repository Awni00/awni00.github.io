import { definePaperReview } from "./types";

const RUNS = "/blog/cot-info/figs/simulation_figs";
const pdf = (src: string) => ({ kind: "pdf" as const, src: `${RUNS}/${src}`, invertInDarkMode: true });

export default definePaperReview({
  post: "cot-info",
  paper: "CoT Information",
  order: 30,
  entries: [
    {
      kind: "diagram",
      figure: "cot-info/consistency-sets",
      label: "Diagram: geometry of CoT information",
      alt: "Multi-panel illustration comparing end-to-end and CoT consistency sets as sample size increases.",
      before: { kind: "pdf", src: "/blog/cot-info/figs/diagrams/cotcons_dynamic_diagram.pdf" },
      note: "Redrawn with <Diagram> from the PDF's geometry: disc radii and arrow angles as published. CoT takes series 1 and E2E series 2, matching the post's charts (the published diagram had them the other way round). Legend moves below; the axis arrow's label is sentence case."
    },
    {
      kind: "diagram",
      figure: "cot-info/dfa",
      label: "Diagram: DFA transition diagram",
      alt: "Deterministic finite automaton with four states used in the simulation.",
      before: pdf("DFA_transition_diagram.pdf"),
      note: "Redrawn with <Diagram>: same states, layout and transitions. Start state tinted series 2 (blue, as published), accepting state series 4 (teal, for the published green), others neutral."
    },
    {
      figure: "cot-info/linear-thresh-cot-info-vs-e2e-diff",
      label: "CoT information vs end-to-end disagreement, linear class",
      alt: "Scatter plot comparing CoT information and end-to-end disagreement for the linear autoregressive class.",
      before: pdf("LinearThresh_Wind8A2L8/20250505-191322/figs/CoTInfo_vs_E2EDiff.pdf"),
      note: "Vector-extracted (marker centres). Dashed y = x line drawn from its formula. Axis labels are the published TeX, rendered with KaTeX."
    },
    {
      figure: "cot-info/linear-thresh-cot-info-vs-epsilon",
      label: "CoT information function, linear class",
      alt: "Plot of CoT information as a function of epsilon for the linear autoregressive class.",
      before: pdf("LinearThresh_Wind8A2L8/20250505-191322/figs/CoTInfo_vs_Epsilon_log.pdf"),
      note: "Vector-extracted. Dashed y = ε curve drawn from its formula; the unlabelled vertical dashed rule (ε ≈ 0.055) is kept from the published figure."
    },
    {
      figure: "cot-info/linear-thresh-empirical-sample-complexity",
      label: "Empirical sample complexity, linear class",
      alt: "Empirical sample complexity for end-to-end vs CoT consistency in the linear autoregressive class.",
      before: pdf("LinearThresh_Wind8A2L8/20250505-191322/figs/empirical_sample_complexity_legendin.pdf")
    },
    {
      figure: "cot-info/linear-thresh-learning-curves",
      label: "Probability of zero error, linear class",
      alt: "Empirical probability of zero error for end-to-end vs CoT learners in the linear autoregressive class.",
      before: pdf("LinearThresh_Wind8A2L8/20250505-191322/figs/learning_curves_prob_success_eps0_log_legendin_e2eerr.pdf"),
      note: "Vector-extracted, including the shaded bands."
    },
    {
      figure: "cot-info/dfa-cot-info-ratio-by-detail",
      label: "CoT information ratio by CoT detail level, DFA",
      alt: "CoT information ratio as a function of epsilon under varying detail levels of the DFA trace.",
      before: pdf("DFA_S4A2L10_varycotdetail/20250503-194523/figs/CoTInfoRatio_vs_Epsilon_by_detail_log.pdf"),
      note: "Vector-extracted. Detail level 1–10 is an opacity ramp toward series 1; the colour bar becomes a ramp key in the legend. Dashed y = ε curve drawn from its formula; the near-invisible grey band at y ≈ 0 is dropped."
    },
    {
      figure: "cot-info/dfa-empirical-sample-complexity",
      label: "Empirical sample complexity, DFA",
      alt: "Empirical sample complexity for DFA learning under end-to-end vs CoT supervision.",
      before: pdf("DFA_S4A2L10_learning/20250504-165732/figs/empirical_sample_complexity_legendin.pdf"),
      note: "Vector-extracted step vertices; sample sizes rounded to integers."
    },
    {
      figure: "cot-info/dfa-learning-curves",
      label: "Probability of zero error, DFA",
      alt: "Probability of zero error for DFA learning with and without CoT supervision.",
      before: pdf("DFA_S4A2L10_learning/20250504-165732/figs/learning_curves_prob_success_eps0_log_legendin.pdf"),
      note: "Vector-extracted, including the shaded bands."
    }
  ]
});
