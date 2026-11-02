import * as Plot from "@observablehq/plot";
import { NEUTRAL, defineFigure } from "../../../lib/figures";
import { METRIC_COLORS } from "./_shared";

const MODELS = ["Qwen2.5 0.5B", "Qwen2.5 1.5B"];
const METRICS = [
  { key: "strategy_match_rate", label: "Distributional Fidelity", color: METRIC_COLORS.distributional_fidelity, offset: -0.12 },
  { key: "analogical_set_overlap", label: "Strategy Alignment", color: METRIC_COLORS.strategy_alignment, offset: 0.12 }
];
const BAR = 0.21; // method_metric_bars/style.py BAR_WIDTH, METRIC_OFFSET_STEP 0.24
const TASK_OFFSETS = [-0.055, -0.033, -0.011, 0.011, 0.033, 0.055]; // linspace(-0.055, 0.055, 6)
const offset = (metric: string) => METRICS.find((m) => m.key === metric)!.offset;

/** Hatch patterns for baselines (///) and ablations (xx), stroked in the page background. */
let sequence = 0;
function hatchPatterns(prefix: string) {
  return (_index: unknown, _scales: unknown, _values: unknown, _dimensions: unknown, context: { document: Document }) => {
    const ns = "http://www.w3.org/2000/svg";
    const doc = context.document;
    const defs = doc.createElementNS(ns, "defs");
    for (const [role, angles] of [
      ["baseline", [45]],
      ["ablation", [45, -45]]
    ] as const) {
      const pattern = doc.createElementNS(ns, "pattern");
      pattern.setAttribute("id", `${prefix}-${role}`);
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      pattern.setAttribute("width", "5");
      pattern.setAttribute("height", "5");
      pattern.setAttribute("patternTransform", `rotate(${angles[0]})`);
      for (const angle of angles) {
        const line = doc.createElementNS(ns, "line");
        const vertical = angle === angles[0];
        line.setAttribute("x1", vertical ? "0" : "-1");
        line.setAttribute("x2", vertical ? "0" : "6");
        line.setAttribute("y1", vertical ? "-1" : "0");
        line.setAttribute("y2", vertical ? "6" : "0");
        line.setAttribute("stroke", "var(--color-bg)");
        line.setAttribute("stroke-width", "1.4");
        line.setAttribute("stroke-opacity", "0.85");
        pattern.append(line);
      }
      defs.append(pattern);
    }
    return defs as unknown as SVGElement;
  };
}

export default defineFigure({
  data: "latent-strategies-in-lms/method-comparison.csv",
  size: "full",
  alt: "Bar chart over objective variants and two model sizes; bars show Distributional Fidelity and Strategy Alignment, with open points for per-task values and hatching marking baselines and ablations.",
  legend: [
    ...METRICS.map((m) => ({ label: m.label, color: m.color, key: "swatch" as const })),
    { label: "task", color: NEUTRAL, key: "dot" }
  ],
  plot: ({ data, width, compact }) => {
    const prefix = `lsl-hatch-${++sequence}`;
    const methods = [...new Map(data.map((d) => [d.method_order, d.method_label])).entries()].sort((a, b) => a[0] - b[0]);
    const label = new Map(methods);
    const bars = data.filter((d) => d.kind === "aggregate");
    const tasks = data.filter((d) => d.kind === "task");
    const facet = compact ? "fy" : "fx";
    const x1 = (d: any) => d.method_order + offset(d.metric) - BAR / 2;
    const x2 = (d: any) => d.method_order + offset(d.metric) + BAR / 2;
    const metricLabel = (key: string) => METRICS.find((m) => m.key === key)!.label;
    const lastModel = MODELS[MODELS.length - 1];
    const key = [
      { role: "baseline", text: "Baseline", x: compact ? 2.95 : 3.3 },
      { role: "ablation", text: "Ablation", x: compact ? 4.25 : 4.55 }
    ];
    return {
      width,
      height: compact ? 520 : 300,
      marginLeft: 50,
      marginRight: 8,
      marginTop: 28,
      marginBottom: 36,
      color: { domain: METRICS.map((m) => m.key), range: METRICS.map((m) => m.color) },
      fx: compact ? undefined : { domain: MODELS, axis: null, padding: 0.06 },
      fy: compact ? { domain: MODELS, axis: null, padding: 0.2 } : undefined,
      x: {
        domain: [-0.55, methods.length - 0.45],
        ticks: methods.map(([order]) => order),
        tickFormat: (v: number) => label.get(v) ?? "",
        tickSize: 0,
        label: null
      },
      y: { label: "Metric value", labelAnchor: "center", domain: [0, 1.02], ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], tickFormat: ".1f" },
      marks: [
        hatchPatterns(prefix),
        Plot.gridY({ ticks: [0.2, 0.4, 0.6, 0.8, 1] }),
        Plot.text(MODELS, { [facet]: (d: string) => d, text: (d: string) => d, frameAnchor: "top-left", textAnchor: "start", dy: -18, fontSize: 13 }),
        Plot.rectY(bars, {
          [facet]: "model",
          x1,
          x2,
          y1: 0,
          y2: "value",
          fill: "metric",
          title: (d) => `${d.model} · ${d.method_label.replace("\n", " ")}\n${metricLabel(d.metric)}: ${d.value.toFixed(3)}`
        }),
        ...(["baseline", "ablation"] as const).map((role) =>
          Plot.rectY(
            bars.filter((d) => d.role === role),
            { [facet]: "model", x1, x2, y1: 0, y2: "value", fill: `url(#${prefix}-${role})`, pointerEvents: "none" }
          )
        ),
        Plot.dot(tasks, {
          [facet]: "model",
          x: (d) => d.method_order + offset(d.metric) + TASK_OFFSETS[d.task_order],
          y: "value",
          r: 2.3,
          fill: "var(--color-bg)",
          fillOpacity: 0.65,
          stroke: "currentColor",
          strokeOpacity: 0.75,
          strokeWidth: 0.8,
          title: (d) => `${d.model} · ${d.method_label.replace("\n", " ")}\n${metricLabel(d.metric)}, ${d.task.replaceAll("_", " ")}: ${d.value.toFixed(3)}`
        }),
        Plot.ruleY([0], { className: "figure-baseline" }),
        // Hatch key, in the top margin of the last panel.
        Plot.rect(key, {
          [facet]: () => lastModel,
          x1: (d) => d.x,
          x2: (d) => d.x + 0.16,
          y1: 1.075,
          y2: 1.13,
          fill: NEUTRAL
        }),
        ...key.map((item) =>
          Plot.rect([item], {
            [facet]: () => lastModel,
            x1: item.x,
            x2: item.x + 0.16,
            y1: 1.075,
            y2: 1.13,
            fill: `url(#${prefix}-${item.role})`
          })
        ),
        Plot.text(key, {
          [facet]: () => lastModel,
          x: (d) => d.x + 0.16,
          y: 1.1,
          text: "text",
          textAnchor: "start",
          dx: 5
        })
      ]
    };
  }
});
