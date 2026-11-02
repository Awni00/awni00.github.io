# Figures

Charts on the blog are drawn with [Observable Plot](https://observablehq.com/plot/)
when the site builds, and inlined as SVG. They ship no JavaScript, use the
page's fonts, recolour with the theme toggle, and swap to a phone layout on
narrow screens. The style they follow is the F1 figure spec.

Three things are kept apart, so any one can change without the others:

| What                 | Where                                   | Owner    |
| -------------------- | --------------------------------------- | -------- |
| Data                 | `src/data/figures/<post>/<figure>.csv`  | site     |
| Chart definition     | `src/site/figures/<post>/<figure>.ts`   | site     |
| Shared style, render | `src/lib/figures/`, `src/styles/figures.css`, `src/components/article/Chart.astro` | template |

`src/data/figures/sources.yaml` records where each data file came from and
how exact it is (`source`, `vector`, or `by-eye`).

## Using a chart in a post

```mdx
<Chart figure="cot-info/linear-thresh-empirical-sample-complexity" alt="…" caption="…" />
```

`figure` is the definition's path under `src/site/figures/`, without `.ts`.
A `<Fragment slot="caption">` works too, for captions with math.

## Writing a definition

```ts
import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures/render";

export default defineFigure({
  data: "post/figure.csv",
  size: "narrow", // narrow 360px · medium 560px · full 760px (also drawn at 360px for phones)
  legend: [{ label: "Ours", color: SERIES[0], key: "line" }],
  plot: ({ data, width }) => ({
    width,
    height: 230,
    marks: [Plot.gridY(), Plot.lineY(data, { x: "step", y: "loss", stroke: SERIES[0] })]
  })
});
```

- Colours: `SERIES[0..5]` in fixed order (the paper's own method first), and
  `NEUTRAL` for baselines and catch-all groups. They become theme variables
  (`--figure-1` … `--figure-6`, `--figure-neutral`) in the output.
- Legends come from `legend`, not Plot, so every chart's legend looks the same.
- Ink, grid, axes and type come from `figures.css`; definitions don't set them.
- Add a `title` channel to marks for hover values (native tooltips, no JS).
- Error bars: a mark with `className: "figure-error"`.

## Recovering data from a PDF figure

```bash
uv run --with pymupdf python scripts/figures/dump_pdf_paths.py FILE.pdf
```

Prints every path and text span. Find the axis frame and tick labels, map path
coordinates back to data units, and note the file in `sources.yaml` as `vector`.
