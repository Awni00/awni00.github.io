# Figures

Charts on the blog are drawn with [Observable Plot](https://observablehq.com/plot/)
when the site builds, and inlined as SVG. They use the page's fonts, recolour
with the theme toggle, swap to a phone layout on narrow screens, and show a
styled tip on hover. The style they follow is the F1 figure spec.

Data, chart code, and shared style are kept apart, so any one can change
without the others:

| What                  | Where                                                    | Owner    |
| --------------------- | -------------------------------------------------------- | -------- |
| Data + provenance     | `src/data/figures/<post>/` (`*.csv`, `provenance.yaml`)  | site     |
| Chart definition      | `src/site/figures/<post>/<figure>.ts`                    | site     |
| Interactive behaviour | `src/site/figures/<post>/<figure>.client.ts` (optional)  | site     |
| Review entries        | `src/fixtures/figure-review/<post>.ts`                   | site     |
| Shared style, render  | `src/lib/figures/`, `src/styles/figures.css`, `src/components/article/Chart.astro` | template |

`<post>` is the post's slug (`src/content/writing/<post>.mdx`).

## Using a chart in a post

```mdx
<Chart figure="cot-info/linear-thresh-empirical-sample-complexity" alt="…" caption="…" />
```

`figure` is the definition's path under `src/site/figures/`, without `.ts`.
A `<Fragment slot="caption">` works for captions with math. Inside a
`<FigureGrid>`, a `<Chart>` is one cell, like a `<Figure>`.

## Writing a definition

```ts
import * as Plot from "@observablehq/plot";
import { ERROR_BAR, NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

export default defineFigure({
  data: "post/figure.csv",
  size: "narrow", // narrow 360px · medium 560px · full 760px (also drawn at 360px for phones)
  title: "Optional panel title", // only when the published figure has one; keep its wording
  legend: [{ label: "Ours", color: SERIES[0], key: "line" }], // "line" | "swatch" | "dot", dashed?: true
  plot: ({ data, width, compact }) => ({
    width,
    height: 230,
    marks: [
      Plot.gridY(),
      Plot.lineY(data, { x: "step", y: "loss", stroke: SERIES[0], title: (d) => `step ${d.step}: ${d.loss}` })
    ]
  })
});
```

Conventions (the F1 spec):

- **Colour.** `SERIES[0..5]` in fixed order, never cycled. The post's own
  method takes `SERIES[0]`. Baselines, "others" and reference lines take
  `NEUTRAL`. Scatter plots, where any two colours can touch, use at most
  `SERIES[0..2]`. A seventh series means folding into `NEUTRAL` or small
  multiples. Sequential data (heatmaps) uses one hue: a Plot `color` scale
  with `scheme` is fine, but prefer a ramp toward `SERIES[0]`.
- **Ink, grid, axes, type** come from `figures.css`. Definitions don't set
  colours for text or axes, or font sizes.
- **Legend** comes from `legend`, drawn below the plot. Don't use Plot's own
  `legend: true`. With ≤ 4 series, direct labels (`Plot.text`) are fine
  instead, if they don't collide.
- **Secondary encoding** is line dash (`DASH`), never a second colour scale.
- **Hover.** Give data marks a `title` channel; it becomes the hover tip.
- **Error bars.** A rule mark with `className: ERROR_BAR`. Zero baseline:
  `Plot.ruleY([0], { className: BASELINE })`.
- **Labels** in sentence case, but keep the wording of the published figure
  (including titles); the post's author writes the words.
- **Math** in axis titles, legend labels and panel titles is TeX between
  `$…$` (`"$\\mathbb{P}(L(\\mathcal{A}(S_m))=0)$"`), rendered with KaTeX at build
  time, like the posts' math. Use the published figure's notation exactly.
  Tick labels and hover tips stay plain text. Charts drawn in the browser
  (`.client.ts`) don't render TeX yet.
- **Axis titles** are centred on their axis, the y title rotated (the
  default; margins widen to fit).
- **Size.** Pick the preset for the width the post shows the figure at: a
  2-up `FigureGrid` cell or `WrapFigure` is `narrow`; a single static chart is
  `medium`; `full` only when the chart needs the width (it gets a separate
  `compact` layout for phones, so branch on `compact`).
- **Log axes.** `tickFormat: powerOfTen`.
- **Identifiers** (code names, variable names): `mono: ["x" | "fx" | "legend"]`.

## Interactive figures

A sibling `<figure>.client.ts` makes a chart interactive. It mounts when the
chart scrolls near the viewport; the build-time SVG stays as the no-JS
fallback, so the definition must still draw a sensible static state.

```ts
import * as Plot from "@observablehq/plot";
import { defineFigureClient, SERIES } from "../../../lib/figures";
import { renderFigureInBrowser } from "../../../lib/figures/client";

export default defineFigureClient((root, { data }) => {
  const plot = root.querySelector(".figure-chart__plot")!;
  const draw = (step: number) => plot.replaceChildren(renderFigureInBrowser({ /* Plot options */ }, "alt"));
  // add controls (input[type=range], buttons) to `root`, call draw on change
});
```

- `data` is the definition's CSV, parsed. Larger data (JSON) can be imported
  by the client module itself (`import frames from "…/frames.json"`), so it
  only loads with that figure.
- `renderFigureInBrowser` applies the same defaults and theme colours as the
  build-time renderer.
- Controls use the site's UI font and tokens (`--font-ui`, `--color-*`),
  have labels, work with the keyboard, and respect `prefers-reduced-motion`
  (no autoplay when it is set).

## Provenance

Every data file in `src/data/figures/<post>/` has an entry in that folder's
`provenance.yaml`:

```yaml
paper: "<paper title>"
files:
  <file>.csv:
    figure: <which figure: paper label and/or published blog file>
    used_by: src/site/figures/<post>/<figure>.ts
    source:
      repo: <repo name>
      remote: <git remote URL>
      commit: <full hash of the source repo when read>
      commit_date: <ISO date of that commit>
      files:
        - path: <path within that repo>
          sha256: <hash of the file as read>
      generator: <script that produced the source data, or why there is none>
    extracted: <YYYY-MM-DD>
    method: copied | converted | vector-extracted | by-eye
    tool: <script or procedure used, for converted/vector-extracted>
    fidelity: <exact | exact to PDF precision | approximate …>
    notes: <anything a later reader needs>
```

A source outside any git repo (a PDF in a reference manager, a download)
sets `repo`, `remote` and `commit` to `none`, gives the file's absolute
`path` and `sha256`, and records what dates it in `created` (for a PDF, its
creation date from the metadata).

## Shared helpers

- `src/lib/figures/panels.ts`: small multiples whose panels each keep their
  own x and y range (Plot facets share one scale). Data are mapped to [0, 1]
  per panel and the panel's ticks, grid and labels are drawn as marks.
- Hand-drawn axes take `className`s so `figures.css` styles them like Plot's
  own: `figure-tick-label`, `figure-axis-label`, `figure-grid`,
  `figure-axis-line`.
- Ordinal or sequential keys: a legend item `{ key: "ramp", label, color,
  opacities, from, to }`.
- `scripts/figures/extract_curves.py`: line-and-band charts from a PDF page,
  with automatic tick calibration and legend matching
  (`scripts/figures/abstractor/build_data.py` shows its use).

## Review page

`src/fixtures/figure-review/<post>.ts` lists the post's charts for the
dev-only review page at `/fixtures/figures` (see `types.ts` there): each
entry names the `figure`, a `label`, the `alt`, and how the post shows it
today (`before`: image, pdf, plotly, embed, or none with a reason).

## Recovering data from a PDF figure

```bash
uv run --with pymupdf python scripts/figures/dump_pdf_paths.py FILE.pdf
```

Prints every path and text span. Find the axis frame and tick labels, map path
coordinates back to data units, and record the file as `vector-extracted`.
