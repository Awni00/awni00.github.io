import { FIGURE_SIZES, defineFigureClient } from "../../../lib/figures";
import { renderFigureInBrowser } from "../../../lib/figures/client";
import { METHODS, PHASE_ORDER } from "./_shared";
import { SMOOTH_WINDOW, X_METRICS, phaseOptions, type XMetric } from "./phase-space-explorer";
import { autoplayWhenVisible, controlBar, drawWidth, keyGlyph, onResize, selectControl, timeline } from "./_controls.client";

export default defineFigureClient((root, { data }) => {
  const last = Math.max(...data.map((d) => d.checkpoint)) - 1;
  const progress = [...new Map(data.map((d) => [d.checkpoint - 1, d.progress])).entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  const state = { t: last, metric: "fidelity" as XMetric, visible: new Set<string>(PHASE_ORDER), smooth: true };
  const progressAt = (t: number) => {
    const k = Math.min(last, Math.floor(t));
    return `${Math.round((progress[k] + ((progress[k + 1] ?? progress[k]) - progress[k]) * (t - k)) * 100)}%`;
  };

  const plot = root.querySelector<HTMLElement>(".figure-chart__plot")!;
  const draw = () => {
    const width = drawWidth(root, FIGURE_SIZES.medium);
    plot.replaceChildren(
      renderFigureInBrowser(
        phaseOptions(data, { width, metric: state.metric, t: state.t, visible: state.visible, smooth: state.smooth }),
        `Training trajectories, ${X_METRICS[state.metric].label} versus Strategy-Alignment, up to ${progressAt(state.t)} of training`
      )
    );
  };

  const bar = controlBar(root);
  const line = timeline({
    label: "Training",
    min: 0,
    max: last,
    value: last,
    format: progressAt,
    onInput: (t) => {
      state.t = t;
      draw();
    }
  });
  line.bindPlay(10);
  const metric = selectControl(
    "x axis",
    Object.entries(X_METRICS).map(([key, spec]) => [key, spec.label] as [string, string]),
    state.metric,
    (value) => {
      state.metric = value as XMetric;
      draw();
    }
  );
  const smoothing = selectControl(
    "Smoothing",
    [
      ["rolling", `rolling mean, ${SMOOTH_WINDOW} checkpoints`],
      ["none", "none"]
    ],
    "rolling",
    (value) => {
      state.smooth = value === "rolling";
      draw();
    }
  );
  bar.append(line.play, line.slider, metric.element, smoothing.element);

  // Method toggles replace the static legend.
  const legend = root.querySelector<HTMLElement>(".figure-legend");
  if (legend) legend.hidden = true;
  const keys = document.createElement("ul");
  keys.className = "lsl-keys";
  keys.setAttribute("aria-label", "Methods shown");
  for (const method of PHASE_ORDER) {
    const style = METHODS[method];
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "true");
    button.append(keyGlyph(style.color, "line", style.dashed), style.label);
    button.addEventListener("click", () => {
      const on = !state.visible.has(method);
      if (on) state.visible.add(method);
      else state.visible.delete(method);
      button.setAttribute("aria-pressed", String(on));
      draw();
    });
    li.append(button);
    keys.append(li);
  }
  plot.after(keys);

  draw();
  onResize(root, draw);
  autoplayWhenVisible(root, () => {
    line.setPosition(0);
    state.t = 0;
    line.start(10);
  });
});
