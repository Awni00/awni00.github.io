import { definePaperReview } from "./types";

export default definePaperReview({
  post: "cot-info",
  paper: "CoT Information",
  order: 30,
  entries: [
    {
      figure: "cot-info/linear-thresh-empirical-sample-complexity",
      label: "Empirical sample complexity, linear class",
      alt: "Empirical sample complexity for end-to-end vs CoT consistency in the linear autoregressive class.",
      before: {
        kind: "pdf",
        src: "/blog/cot-info/figs/simulation_figs/LinearThresh_Wind8A2L8/20250505-191322/figs/empirical_sample_complexity_legendin.pdf",
        invertInDarkMode: true
      }
    }
  ]
});
