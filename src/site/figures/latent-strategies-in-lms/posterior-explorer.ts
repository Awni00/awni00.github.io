import * as Plot from "@observablehq/plot";
import { defineFigure, type FigureRow } from "../../../lib/figures";
import { POSTERIOR_LIMITS, TASKS, TASK_COLOR, compactDots } from "./_shared";

/**
 * Posterior latent geometry, one checkpoint at a time. The build-time SVG is
 * the final checkpoint coloured by task; the client module adds a training
 * slider over all 51 checkpoints and a task/strategy highlight.
 */
export const explorerOptions = (
  points: FigureRow[],
  opts: { width: number; color: (d: FigureRow) => string; dim?: (d: FigureRow) => boolean; label: string }
): Plot.PlotOptions => {
  const height = Math.round(Math.min(opts.width, 560) * 0.82);
  const front = opts.dim ? points.filter((d) => !opts.dim!(d)) : points;
  const back = opts.dim ? points.filter((d) => opts.dim!(d)) : [];
  return {
    width: opts.width,
    height,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
    marginBottom: 8,
    color: { type: "identity" },
    x: { domain: POSTERIOR_LIMITS.x, axis: null },
    y: { domain: POSTERIOR_LIMITS.y, axis: null },
    marks: [
      Plot.frame({ className: "figure-baseline", strokeOpacity: 0.6 }),
      Plot.ruleX([0], { className: "figure-baseline", strokeOpacity: 0.35 }),
      Plot.ruleY([0], { className: "figure-baseline", strokeOpacity: 0.35 }),
      Plot.dot(back, { x: "x", y: "y", fill: opts.color, render: compactDots(1.8, 0.22) }),
      Plot.dot(front, { x: "x", y: "y", fill: opts.color, render: compactDots(2, 0.6) }),
      Plot.text([opts.label], { frameAnchor: "top-left", dx: 8, dy: 8, text: (d: string) => d, textAnchor: "start" })
    ]
  };
};

export default defineFigure({
  data: "latent-strategies-in-lms/posterior-final.csv",
  size: "medium",
  alt: "PCA projection of posterior mean latents, colored by task, with a slider over the 51 training checkpoints.",
  legend: TASKS.map(([task, label]) => ({ label, color: TASK_COLOR[task], key: "dot" as const })),
  plot: ({ data, width }) => explorerOptions(data, { width, color: (d) => TASK_COLOR[d.task], label: "100%" })
});
