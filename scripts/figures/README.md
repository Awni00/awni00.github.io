# Figure styles (draft)

Status: **draft for F1, not wired in.** Nothing in the build reads these files.
The spec they implement, with before/after mocks, is the
[Blog Figure Spec](https://claude.ai/artifact/1oXx17LyhAAiCRAUgY2XKq) board.
Re-exports (F2–F7) wait on approval of that board.

| File                      | What                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `site.mplstyle`           | matplotlib base style, light page                             |
| `site-dark.mplstyle`      | overlay for the dark page; swaps colours only                 |
| `plotly-site-light.json`  | plotly template (`layout` + `data` defaults), light page      |
| `plotly-site-dark.json`   | same, dark page                                               |
| `dump_pdf_paths.py`       | prints a PDF figure's paths and text, for recovering its data |

Figure data lives in `src/data/figures/<post>/<figure>.csv`, separate from
chart code and exports. `src/data/figures/sources.yaml` records where each
file came from and how exact it is.

## matplotlib

```python
import matplotlib.pyplot as plt

for mode in ("light", "dark"):
    styles = ["scripts/figures/site.mplstyle"]
    if mode == "dark":
        styles.append("scripts/figures/site-dark.mplstyle")
    with plt.style.context(styles):
        fig, ax = plt.subplots(figsize=(3.75, 2.6))   # narrow preset
        ...
        ax.legend(loc="lower left", bbox_to_anchor=(0, 1.0), ncol=3)
        fig.savefig(f"name-{mode}.svg")
```

Then in MDX: `<Picture lightSrc="…/name-light.svg" darkSrc="…/name-dark.svg" />`.
Don't use `invertInDarkMode` on charts.

Install Inter on the exporting machine; `svg.fonttype: path` bakes the glyphs
into the SVG, because an `<img>` can't load the page's web fonts.

## plotly

```python
import json, plotly.io as pio
pio.templates["site-light"] = json.load(open("scripts/figures/plotly-site-light.json"))
pio.templates["site-dark"]  = json.load(open("scripts/figures/plotly-site-dark.json"))
fig.update_layout(template="site-light")
```

Switching template with the page theme needs a change to `PlotlyFigure`
(template-owned, so upstream).

## Size presets

Sizes are the width the figure is *shown* at; type sizes assume 1:1 display.

| Preset | px          | inches (figsize) | Use                                        |
| ------ | ----------- | ---------------- | ------------------------------------------ |
| full   | 760 × 400   | 7.92 × 4.17      | plotly only (re-lays out on phones)        |
| medium | 560 × 340   | 5.83 × 3.54      | single static chart (the style's default)  |
| narrow | 360 × 240–280 | 3.75 × 2.5–2.9 | `FigureGrid` 2-up cell, `WrapFigure`       |

## Palette

Six slots, fixed order. Hues come from the theme tokens (slot 1 = accent hue,
slot 2 = link hue); lightness and chroma are set per mode and validated
(OKLCH band, chroma ≥ 0.10, CVD ΔE ≥ 8 for adjacent slots, 3:1 contrast).

| Slot | Name   | Light     | Dark      |
| ---- | ------ | --------- | --------- |
| 1    | claret | `#902343` | `#d36d86` |
| 2    | navy   | `#2e64a6` | `#5290d3` |
| 3    | ochre  | `#c0851f` | `#b68f1b` |
| 4    | teal   | `#109488` | `#20a89b` |
| 5    | violet | `#7b52a4` | `#9468c2` |
| 6    | olive  | `#6c9539` | `#77a246` |
| —    | grey   | `#8e9095` | `#74757a` |

Grey is for baselines and catch-all groups. Scatter plots use slots 1–3 only.
If the theme pair changes (ROADMAP §7), re-derive slots 1–2 from the new
accent and link hues at the same lightness, and re-validate.

Ink maps to tokens: labels `--color-fg-soft`, ticks `--color-muted`, axis
`--color-rule`, grid `--color-border`. Values are claret-light / claret-dark.
