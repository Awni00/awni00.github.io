/**
 * Small control kit shared by this post's interactive figures (not a figure
 * itself). Controls use the site's UI font and colour tokens, are native
 * elements (so keyboard-operable), and carry visible labels.
 *
 * The styles are injected once from here because the shared figure
 * stylesheet has no control styles yet.
 */
import { COLOR_TOKENS } from "../../../lib/figures";

const STYLE_ID = "lsl-figure-controls";
const CSS = `
.lsl-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin: 0 0 8px; font-family: var(--font-ui); font-size: 12px; color: var(--color-fg-soft); }
.lsl-controls label { display: inline-flex; align-items: center; gap: 6px; }
.lsl-controls select, .lsl-controls button { font: inherit; color: var(--color-fg); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm, 4px); padding: 3px 8px; line-height: 1.4; cursor: pointer; }
.lsl-controls button:hover, .lsl-controls select:hover { border-color: var(--color-rule); }
.lsl-controls :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 1px; }
.lsl-controls input[type="range"] { accent-color: var(--color-accent); width: 100%; min-width: 120px; margin: 0; }
.lsl-controls .lsl-slider { flex: 1 1 180px; display: flex; align-items: center; gap: 8px; }
.lsl-controls output { font-variant-numeric: tabular-nums; min-width: 9.5em; color: var(--color-fg-soft); }
.lsl-play { min-width: 4.6em; }
.lsl-keys { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 8px 0 0; padding: 0; list-style: none; font-family: var(--font-ui); font-size: 12px; }
.lsl-keys li { margin: 0; }
.lsl-keys button, .lsl-keys span.lsl-key { display: inline-flex; align-items: center; gap: 6px; font: inherit; color: var(--color-fg-soft); background: none; border: 1px solid transparent; border-radius: var(--radius-sm, 4px); padding: 1px 6px; cursor: pointer; }
.lsl-keys span.lsl-key { cursor: default; }
.lsl-keys button:hover { border-color: var(--color-border); }
.lsl-keys button[aria-pressed="false"] { opacity: 0.45; }
.lsl-keys button[aria-pressed="false"] svg { filter: grayscale(1); }
.lsl-keys button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 1px; }
.lsl-keys svg { flex: none; overflow: visible; }
`;

export function injectControlStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const token = (color: string) => COLOR_TOKENS[color] ?? color;

/** A legend key glyph (line, dashed line or dot) in a series colour. */
export function keyGlyph(color: string, kind: "line" | "dot", dashed: boolean | string = false): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "10");
  svg.setAttribute("viewBox", "0 0 16 10");
  svg.setAttribute("aria-hidden", "true");
  if (kind === "line") {
    const line = document.createElementNS(ns, "line");
    for (const [k, v] of Object.entries({ x1: "0", x2: "16", y1: "5", y2: "5", "stroke-width": "2", stroke: token(color) })) line.setAttribute(k, v);
    if (dashed) line.setAttribute("stroke-dasharray", dashed === true ? "5,2.5" : dashed);
    svg.append(line);
  } else {
    const dot = document.createElementNS(ns, "circle");
    for (const [k, v] of Object.entries({ cx: "8", cy: "5", r: "4", fill: token(color) })) dot.setAttribute(k, v);
    svg.append(dot);
  }
  return svg;
}

export function controlBar(root: HTMLElement): HTMLDivElement {
  injectControlStyles();
  const bar = document.createElement("div");
  bar.className = "lsl-controls";
  const plot = root.querySelector(".figure-chart__plot")!;
  plot.before(bar);
  return bar;
}

export function selectControl(label: string, options: [string, string][], value: string, onChange: (v: string) => void) {
  const wrap = document.createElement("label");
  const select = document.createElement("select");
  for (const [v, text] of options) select.append(new Option(text, v, false, v === value));
  select.addEventListener("change", () => onChange(select.value));
  wrap.append(label, select);
  return { element: wrap, select };
}

/** Play/pause button + range slider + live readout. */
export function timeline(opts: {
  label: string;
  min: number;
  max: number;
  value: number;
  format: (v: number) => string;
  onInput: (v: number) => void;
}) {
  const slider = document.createElement("label");
  slider.className = "lsl-slider";
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(opts.min);
  input.max = String(opts.max);
  input.step = "1";
  input.value = String(opts.value);
  const output = document.createElement("output");
  output.setAttribute("aria-live", "off");
  output.textContent = opts.format(opts.value);
  input.setAttribute("aria-valuetext", opts.format(opts.value));
  const caption = document.createElement("span");
  caption.textContent = opts.label;
  slider.append(caption, input, output);
  const play = document.createElement("button");
  play.type = "button";
  play.className = "lsl-play";
  play.textContent = "Play";
  play.setAttribute("aria-label", "Play animation");
  const set = (v: number) => {
    input.value = String(Math.round(v));
    output.textContent = opts.format(v);
    input.setAttribute("aria-valuetext", opts.format(v));
  };
  input.addEventListener("input", () => {
    stop();
    set(Number(input.value));
    opts.onInput(Number(input.value));
  });

  let frame = 0;
  let playing = false;
  let position = opts.value;
  const stop = () => {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(frame);
    play.textContent = "Play";
    play.setAttribute("aria-label", "Play animation");
  };
  /** Advance at `rate` steps per second, tweening between steps unless reduced motion is set. */
  const start = (rate: number) => {
    if (playing) return;
    if (position >= opts.max) position = opts.min;
    playing = true;
    play.textContent = "Pause";
    play.setAttribute("aria-label", "Pause animation");
    const reduced = prefersReducedMotion();
    let last = performance.now();
    const tick = (now: number) => {
      if (!playing) return;
      // rAF timestamps can precede the performance.now() taken at start.
      const dt = Math.max(0, (now - last) / 1000);
      if (reduced) {
        if (dt < 1 / Math.min(rate, 4)) return void (frame = requestAnimationFrame(tick));
        position = Math.min(opts.max, Math.floor(position) + 1);
      } else {
        position = Math.min(opts.max, position + dt * rate);
      }
      position = Math.max(opts.min, position);
      last = now;
      set(position);
      opts.onInput(position);
      if (position >= opts.max) return stop();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  return {
    slider,
    play,
    input,
    start,
    stop,
    get playing() {
      return playing;
    },
    setPosition(v: number) {
      position = v;
      set(v);
    },
    get position() {
      return Number.isFinite(position) ? position : Number(input.value);
    },
    bindPlay(rate: number) {
      play.addEventListener("click", () => (playing ? stop() : start(rate)));
      input.addEventListener("input", () => (position = Number(input.value)));
    }
  };
}

/** Starts `start` once, when at least `threshold` of `root` is visible, unless reduced motion is set. */
export function autoplayWhenVisible(root: HTMLElement, start: () => void, threshold = 0.6) {
  if (prefersReducedMotion()) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        start();
      }
    },
    { threshold }
  );
  observer.observe(root);
}

/** Width to draw at: the chart's own width, capped at its preset. */
export function drawWidth(root: HTMLElement, preset: number) {
  const plot = root.querySelector<HTMLElement>(".figure-chart__plot")!;
  return Math.round(Math.max(300, Math.min(preset, plot.clientWidth || preset)));
}

/** Calls `redraw` when the chart's width changes. */
export function onResize(root: HTMLElement, redraw: () => void) {
  let width = root.clientWidth;
  const observer = new ResizeObserver(() => {
    if (root.clientWidth === width) return;
    width = root.clientWidth;
    redraw();
  });
  observer.observe(root);
}
