import * as Plot from "@observablehq/plot";
import { defineFigure } from "../../../lib/figures";
import { POSTERIOR_LIMITS, TASKS, TASK_COLOR, compactDots } from "./_shared";

const CHECKPOINTS = [2, 6, 10, 20, 50, 100];

export default defineFigure({
  data: "latent-strategies-in-lms/posterior-geometry.csv",
  size: "full",
  alt: "Six PCA panels of posterior mean latents at increasing fractions of training; an initially overlapping cloud separates into task- and strategy-specific regions, colored by task.",
  legend: TASKS.map(([task, label]) => ({ label, color: TASK_COLOR[task], key: "dot" as const })),
  plot: ({ data, width, compact }) => {
    // Phone: 3 x 2 grid of panels; wide: one row of six.
    const cols = compact ? 3 : 6;
    const col = (c: number) => CHECKPOINTS.indexOf(c) % cols;
    const row = (c: number) => Math.floor(CHECKPOINTS.indexOf(c) / cols);
    const panels = CHECKPOINTS.map((checkpoint) => ({ checkpoint }));
    const facet = { fx: (d: any) => col(d.checkpoint), fy: (d: any) => row(d.checkpoint) };
    const cell = (width - 8) / cols;
    return {
      width,
      height: compact ? 2 * cell + 34 : cell + 22,
      marginLeft: 4,
      marginRight: 4,
      marginTop: 18,
      marginBottom: 4,
      color: { domain: TASKS.map(([task]) => task), range: TASKS.map(([task]) => TASK_COLOR[task]) },
      fx: { axis: null, padding: 0.06 },
      fy: { axis: null, padding: compact ? 0.14 : 0 },
      x: { domain: POSTERIOR_LIMITS.x, axis: null },
      y: { domain: POSTERIOR_LIMITS.y, axis: null },
      marks: [
        Plot.frame({ className: "figure-baseline", strokeOpacity: 0.6 }),
        Plot.ruleX([0], { className: "figure-baseline", strokeOpacity: 0.35 }),
        Plot.ruleY([0], { className: "figure-baseline", strokeOpacity: 0.35 }),
        Plot.dot(data, {
          ...facet,
          x: "x",
          y: "y",
          fill: "task",
          render: compactDots(1.5, 0.55)
        }),
        Plot.text(panels, {
          ...facet,
          text: (d) => `${d.checkpoint}%`,
          frameAnchor: "top",
          dy: -11
        })
      ]
    };
  }
});
