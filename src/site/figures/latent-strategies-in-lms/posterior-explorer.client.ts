import { FIGURE_SIZES, NEUTRAL, SERIES, defineFigureClient, type FigureRow } from "../../../lib/figures";
import { renderFigureInBrowser } from "../../../lib/figures/client";
import frames from "../../../data/figures/latent-strategies-in-lms/posterior-frames.json";
import { TASKS, TASK_COLOR } from "./_shared";
import { explorerOptions } from "./posterior-explorer";
import { autoplayWhenVisible, controlBar, drawWidth, keyGlyph, onResize, selectControl, timeline } from "./_controls.client";

type Frames = {
  tasks: string[];
  strategies: string[];
  limits: [number, number, number, number];
  scale: number;
  progress: number[];
  probe: number[];
  labels: number[];
  frames: number[][];
};

export default defineFigureClient((root) => {
  const data = frames as Frames;
  const [x0, x1, y0, y1] = data.limits;
  const sx = (x1 - x0) / data.scale;
  const sy = (y1 - y0) / data.scale;
  const last = data.frames.length - 1;
  const meta = data.labels.map((i) => {
    const [task, strategy] = data.strategies[i].split(":");
    return { task, strategy };
  });
  const strategiesOf = (task: string) => data.strategies.filter((s) => s.startsWith(`${task}:`)).map((s) => s.split(":")[1]);

  const state = { t: last, highlight: "all", focus: null as string | null };

  /** Points at fractional checkpoint t, interpolated linearly between neighbours. */
  const pointsAt = (t: number): FigureRow[] => {
    const k = Math.min(last, Math.floor(t));
    const f = t - k;
    const a = data.frames[k];
    const b = data.frames[Math.min(last, k + 1)];
    return meta.map((m, i) => {
      const qx = f ? a[2 * i] + (b[2 * i] - a[2 * i]) * f : a[2 * i];
      const qy = f ? a[2 * i + 1] + (b[2 * i + 1] - a[2 * i + 1]) * f : a[2 * i + 1];
      return { x: x0 + qx * sx, y: y0 + qy * sy, task: m.task, strategy: m.strategy };
    });
  };
  const progressAt = (t: number) => {
    const k = Math.min(last, Math.floor(t));
    const p = data.progress[k] + (data.progress[Math.min(last, k + 1)] - data.progress[k]) * (t - k);
    return `${Math.round(p * 100)}%`;
  };

  const colorFor = (d: FigureRow) => {
    if (state.highlight === "all") return TASK_COLOR[d.task];
    if (dimmed(d)) return NEUTRAL;
    return SERIES[strategiesOf(d.task).indexOf(d.strategy)] ?? NEUTRAL;
  };
  function dimmed(d: FigureRow) {
    return state.highlight !== "all" && (d.task !== state.highlight || (state.focus !== null && d.strategy !== state.focus));
  }

  const plot = root.querySelector<HTMLElement>(".figure-chart__plot")!;
  const draw = () => {
    const width = drawWidth(root, FIGURE_SIZES.medium);
    const label = progressAt(state.t);
    plot.replaceChildren(
      renderFigureInBrowser(
        explorerOptions(pointsAt(state.t), { width, color: colorFor, dim: dimmed, label }),
        `Posterior mean latents at ${label} of training`
      )
    );
  };

  // Controls.
  const bar = controlBar(root);
  const line = timeline({
    label: "Training",
    min: 0,
    max: last,
    value: last,
    format: (t) => `${progressAt(t)} · probe ${data.probe[Math.round(t)].toFixed(2)}`,
    onInput: (t) => {
      state.t = t;
      draw();
    }
  });
  line.bindPlay(8);
  const highlight = selectControl(
    "Colour",
    [["all", "by task"], ...TASKS.map(([task, label]) => [task, `strategies: ${label}`] as [string, string])],
    "all",
    (value) => {
      state.highlight = value;
      state.focus = null;
      renderKeys();
      draw();
    }
  );
  bar.append(line.play, line.slider, highlight.element);

  // Legend: tasks, or the highlighted task's strategies as toggles to focus one.
  const legend = root.querySelector<HTMLElement>(".figure-legend");
  if (legend) legend.hidden = true;
  const keys = document.createElement("ul");
  keys.className = "lsl-keys";
  plot.after(keys);
  const renderKeys = () => {
    keys.replaceChildren();
    if (state.highlight === "all") {
      for (const [task, label] of TASKS) {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.className = "lsl-key";
        span.append(keyGlyph(TASK_COLOR[task], "dot"), label);
        li.append(span);
        keys.append(li);
      }
      return;
    }
    const task = state.highlight;
    strategiesOf(task).forEach((strategy, i) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", String(state.focus === null || state.focus === strategy));
      button.title = `Show only ${strategy}`;
      button.append(keyGlyph(SERIES[i], "dot"), strategy);
      button.addEventListener("click", () => {
        state.focus = state.focus === strategy ? null : strategy;
        renderKeys();
        draw();
        (keys.querySelectorAll("button")[i] as HTMLButtonElement | undefined)?.focus();
      });
      li.append(button);
      keys.append(li);
    });
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "lsl-key";
    span.append(keyGlyph(NEUTRAL, "dot"), "other tasks");
    li.append(span);
    keys.append(li);
  };

  renderKeys();
  draw();
  onResize(root, draw);
  autoplayWhenVisible(root, () => {
    line.setPosition(0);
    state.t = 0;
    line.start(8);
  });
});
