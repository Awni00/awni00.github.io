import { definePaperReview } from "../../fixtures/figure-review/types";

// review of the redrawn mechanism icons.
const FIGS = "/blog/algorithmic-generalization-transformer-architectures/figures";
const DIR = "algorithmic-generalization-transformer-architectures";
const img = (n: number) => ({ kind: "image" as const, src: `${FIGS}/mech${n}.SVG`, invertInDarkMode: true });
const none = { kind: "none" as const, reason: "animated variant of the icon above; set data-play (or scroll into view) to play" };

export default definePaperReview({
  post: "agta-diagrams-mech",
  paper: "Unlocking OOD — mechanism icons",
  order: 21,
  entries: [
    {
      kind: "diagram",
      figure: `${DIR}/mech-1-recurrence`,
      label: "M1: recurrence and adaptive computation",
      alt: "Recurrent block with a loop repeated T(x) times.",
      before: img(1),
      note: "192px icon (drawn at display size for the 4-column grid). Neutral block, ink input/output, series 1 loop at 2px labelled T(x)."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-1-recurrence-animated`,
      label: "M1 animated: loop traces once",
      alt: "Recurrent block with a loop repeated T(x) times.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-schedule`,
      label: "M2: incremental schedule, per-iteration latent supervision",
      alt: "Rows of node states over iterations, filling in by depth, each with its own loss.",
      before: img(2),
      note: "Rows = state after iterations 1–4 (upwards). Solid = computed this iteration, tint = carried, dashed = not yet computed (⟨empty⟩). ℓ arrows = loss on every iteration."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-schedule-animated`,
      label: "M2 animated: iterations fill in one by one",
      alt: "Rows of node states over iterations, filling in by depth, each with its own loss.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-schedule-2a2b`,
      label: "M2 alternative: 2a depth-supervised vs 2b abstention",
      alt: "Two panels of node states over iterations: 2a fills by depth with a loss per iteration; 2b abstains with empty until it commits.",
      before: img(2),
      note: "Choose between this and the single-schedule M2. 2a: depth order + per-iteration loss arrows; 2b: ∅ marks abstention, the model picks its own order."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-schedule-2a2b-animated`,
      label: "M2 alternative animated",
      alt: "Two panels of node states over iterations: 2a fills by depth with a loss per iteration; 2b abstains with empty until it commits.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-consolidated`,
      label: "M2 recommended: supervision → model output rows, 2a/2b switch",
      alt: "Rows of model output per iteration, supervised by reference steps (2a) or the final answer with abstention (2b), switchable.",
      before: img(2),
      note: "In the post. Rows = model output (5 nodes) per iteration, time upwards; y arrow = supervision every iteration. Solid navy = computed this iteration, tint = carried, dashed ∅ = ⟨empty⟩, olive ring (2a only) = depth schedule asks for a value here (Depth < t). 2b: no rings, own order. CSS-only 2a/2b switch."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-consolidated-animated`,
      label: "M2 recommended, animated: states expand into rows, then decode",
      alt: "Rows of model output per iteration, supervised by reference steps (2a) or the final answer with abstention (2b), switchable.",
      before: none,
      note: "States expand into rows, then decode bottom-up; in 2a each row's olive rings appear just before it decodes. Switching to 2b after it has played replays the 2b decode."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference`,
      label: "M2 (original style, 2a): reference algorithm supervises each model iteration",
      alt: "Reference-algorithm steps beside model states, with a supervision arrow per iteration.",
      before: img(2),
      note: "Matches the published layout. Reference steps series 6 (olive, for the published green); model states solid series 2 (the family block colour); supervision series 1."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference-2b`,
      label: "M2 (original style, 2b): final answer at every iteration, abstention",
      alt: "Target y supervises the model's output at every iteration; early outputs abstain (empty).",
      before: img(2),
      note: "No reference algorithm: y → output ← model state on each row. Output is ∅ (abstained, dashed) for the first two iterations, then ŷ."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-toggle`,
      label: "M2 toggle: 2a / 2b switch in one figure",
      alt: "Switchable figure: 2a reference-algorithm supervision, 2b final-answer supervision with abstention.",
      before: img(2),
      note: "CSS-only switch (hidden radios in a foreignObject + :has()). Click 2b to switch. 26px taller than the other icons for the switch."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference-animated-a`,
      label: "M2 2a animated A: states expand into output rows, then decode by iteration",
      alt: "Reference-algorithm steps supervise the model's output rows, filled in by depth.",
      before: none,
      note: "Final frame is the expanded layout: each model state is a row of five output cells (series 2)."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference-animated-b`,
      label: "M2 2a animated B: builds step by step",
      alt: "Reference-algorithm steps supervise the model's output rows, filled in by depth.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference-2b-animated-a`,
      label: "M2 2b animated A: states expand into output rows, then decode (∅ fills in)",
      alt: "The final answer supervises every output row; nodes start empty and fill in over iterations.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-2-reference-2b-animated-b`,
      label: "M2 2b animated B: builds step by step",
      alt: "The final answer supervises every output row; nodes start empty and fill in over iterations.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-3-discrete`,
      label: "M3: anchored discrete latent space",
      alt: "Latent states on a lattice; a continuous output is snapped to the nearest lattice point.",
      before: img(3),
      note: "Lattice of discrete states (neutral); past states on the lattice (series 1); continuous output h̃ (hollow) snapped to z (dashed)."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-3-discrete-animated`,
      label: "M3 animated: state snaps to the lattice",
      alt: "Latent states on a lattice; a continuous output is snapped to the nearest lattice point.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-3-original`,
      label: "M3 (original style): discretize / re-embed bottleneck",
      alt: "Recurrent block output discretized to a discrete state z and re-embedded as the next input.",
      before: img(3),
      note: "Published composition in site style: navy block, bottleneck series 1 tint (for the published green), z as model cells."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-3-original-animated`,
      label: "M3 (original style), animated: continuous state snaps to discrete",
      alt: "Recurrent block output discretized to a discrete state z and re-embedded as the next input.",
      before: none
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-4-correction`,
      label: "M4: error correction",
      alt: "A state with one wrong node passes through the block and comes out repaired.",
      before: img(4),
      note: "Error in series 3 (ochre); repaired node returns to series 1. Paper now trains on the model's own predicted states, not random noise, so the noise glyph is gone."
    },
    {
      kind: "diagram",
      figure: `${DIR}/mech-4-correction-animated`,
      label: "M4 animated: error flashes, then is repaired",
      alt: "A state with one wrong node passes through the block and comes out repaired.",
      before: none
    }
  ]
});
