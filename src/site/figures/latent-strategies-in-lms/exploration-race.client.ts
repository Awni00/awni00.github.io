import { FIGURE_SIZES, NEUTRAL, defineFigureClient } from "../../../lib/figures";
import { renderFigureInBrowser } from "../../../lib/figures/client";
import { METHODS } from "./_shared";
import { BASE_DASH, RACE_ORDER, SAMPLING, raceOptions, type Sampling } from "./exploration-race";
import { autoplayWhenVisible, controlBar, drawWidth, keyGlyph, onResize, selectControl, timeline } from "./_controls.client";

/** The slider runs over log2(T) so the animation spends equal time per doubling. */
const STEPS = 60;
const budget = (s: number) => Math.min(64, 2 ** ((s / STEPS) * 6));

export default defineFigureClient((root, { data }) => {
  const state = { s: STEPS, sampling: "explore" as Sampling };
  const plot = root.querySelector<HTMLElement>(".figure-chart__plot")!;
  const draw = () => {
    const width = drawWidth(root, FIGURE_SIZES.medium);
    const T = budget(state.s);
    plot.replaceChildren(
      renderFigureInBrowser(
        raceOptions(data, { width, T, sampling: state.sampling }),
        `Strategy coverage by decoded samples up to ${Math.floor(T)}, ${SAMPLING[state.sampling]}`
      )
    );
  };

  const bar = controlBar(root);
  const line = timeline({
    label: "Samples",
    min: 0,
    max: STEPS,
    value: STEPS,
    format: (s) => `T = ${Math.floor(budget(s))}`,
    onInput: (s) => {
      state.s = s;
      draw();
    }
  });
  line.bindPlay(12);
  const sampling = selectControl("Sampling", Object.entries(SAMPLING) as [string, string][], state.sampling, (value) => {
    state.sampling = value as Sampling;
    draw();
  });
  bar.append(line.play, line.slider, sampling.element);

  // Legend with the base model's dotted key (the static legend has one dash pattern).
  const legend = root.querySelector<HTMLElement>(".figure-legend");
  if (legend) legend.hidden = true;
  const keys = document.createElement("ul");
  keys.className = "lsl-keys";
  keys.setAttribute("aria-hidden", "true");
  const entries: [string, string, boolean | string][] = [
    ...RACE_ORDER.map((m) => [METHODS[m].label, METHODS[m].color, Boolean(METHODS[m].dashed)] as [string, string, boolean]),
    ["Base model", NEUTRAL, BASE_DASH]
  ];
  for (const [label, color, dash] of entries) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "lsl-key";
    span.append(keyGlyph(color, "line", dash), label);
    li.append(span);
    keys.append(li);
  }
  plot.after(keys);

  draw();
  onResize(root, draw);
  autoplayWhenVisible(root, () => {
    line.setPosition(0);
    state.s = 0;
    line.start(12);
  });
});
