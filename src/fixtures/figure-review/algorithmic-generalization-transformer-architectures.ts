import { definePaperReview } from "./types";

export default definePaperReview({
  post: "algorithmic-generalization-transformer-architectures",
  paper: "Unlocking Out-of-Distribution Generalization in Transformers",
  order: 20,
  entries: [
    {
      figure: "algorithmic-generalization-transformer-architectures/l0-ov-operator-norm",
      label: "Norm amplification, layer 1 heads",
      alt: "L0 OV Norm",
      before: {
        kind: "pdf",
        src: "/blog/algorithmic-generalization-transformer-architectures/figures/L0_ov_operator_norm_mpl.pdf",
        invertInDarkMode: true
      }
    }
  ]
});
