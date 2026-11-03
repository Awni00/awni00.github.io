import { definePaperReview } from "../../fixtures/figure-review/types";

export default definePaperReview({
  post: "agta-diagrams-mechinterp",
  paper: "Unlocking OOD — mechanistic-interpretability diagrams",
  order: 24,
  entries: [
    {
      kind: "diagram",
      figure: "algorithmic-generalization-transformer-architectures/two-layer-circuit",
      label: "Two-layer circuit",
      alt: "Layer-1 head groups copy variable names to rhs, layer-2 head groups fetch their values from earlier equations, and the final MLP adds them mod 23.",
      before: {
        kind: "pdf",
        src: "/blog/algorithmic-generalization-transformer-architectures/figures/2-layer-illustrated.pdf",
        invertInDarkMode: true
      },
      note: "Head groups drawn with their head indices (paper's groups). Heads outside the groups are omitted. Fixes the published history typo (third entry was var1)."
    },
    {
      kind: "diagram",
      figure: "algorithmic-generalization-transformer-architectures/l0-head-allocation",
      label: "Layer-1 head allocation",
      alt: "16 first-layer heads with schematic attention thumbnails, coloured by the variable they read from rhs, and zoomed views of heads 4, 7 and 12.",
      before: {
        kind: "pdf",
        src: "/blog/algorithmic-generalization-transformer-architectures/figures/L0_head_allocation.pdf",
        invertInDarkMode: true
      },
      note: "Attention lines are schematic, not measured weights. Zoomed example uses token roles instead of the published x_13 / x_0 / x_0 / x_127 names."
    }
  ]
});
