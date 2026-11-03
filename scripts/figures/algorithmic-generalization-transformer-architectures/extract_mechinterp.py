"""Recover the mech-interp chart data from the post's published PDFs.

No source data exists for these figures (they were made in a notebook from
model weights), and the post's PDFs are byte-identical to the paper repo's
copies. Values are read back from the PDF vector paths, calibrated against
each figure's own gridlines and tick labels, and written as CSVs under
`src/data/figures/algorithmic-generalization-transformer-architectures/`.

    uv run --with pymupdf --with matplotlib python \
        scripts/figures/algorithmic-generalization-transformer-architectures/extract_mechinterp.py

Prints the sha256 of every input PDF and output CSV, for provenance.yaml.
"""

from __future__ import annotations

import csv
import hashlib
import math
from pathlib import Path

import numpy as np
import pymupdf
from matplotlib import colormaps

POST = "algorithmic-generalization-transformer-architectures"
ROOT = Path(__file__).resolve().parents[3]
PDFS = ROOT / "public" / "blog" / POST / "figures"
OUT = ROOT / "src" / "data" / "figures" / POST

GRID = (0.8275, 0.8275, 0.8275)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def page(name: str):
    path = PDFS / name
    print(f"input {path.relative_to(ROOT)}  sha256={sha256(path)}")
    return pymupdf.open(path)[0]


def write(name: str, header: list[str], rows: list[list]) -> None:
    path = OUT / name
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"wrote {name}  sha256={sha256(path)}  rows={len(rows)}")


def close(a, b, tol=0.01) -> bool:
    return a is not None and b is not None and all(abs(x - y) < tol for x, y in zip(a, b))


def rects(pg, fill=None):
    """Filled rectangles: (fill, x0, y0, x1, y1)."""
    out = []
    for d in pg.get_drawings():
        if d.get("fill") is None or len(d["items"]) != 1 or d["items"][0][0] != "re":
            continue
        if fill is not None and not close(d["fill"], fill):
            continue
        r = d["items"][0][1]
        out.append((tuple(d["fill"]), r.x0, r.y0, r.x1, r.y1))
    return out


def lines(pg, color):
    """Straight two-point strokes of one colour: (x0, y0, x1, y1)."""
    out = []
    for d in pg.get_drawings():
        if not close(d.get("color"), color):
            continue
        if len(d["items"]) == 1 and d["items"][0][0] == "l":
            p, q = d["items"][0][1:3]
            out.append((p.x, p.y, q.x, q.y))
    return out


def spans(pg):
    out = []
    for block in pg.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for s in line["spans"]:
                x0, y0, x1, y1 = s["bbox"]
                out.append((s["text"].strip(), (x0 + x1) / 2, (y0 + y1) / 2))
    return out


def number(text: str) -> float | None:
    try:
        return float(text)
    except ValueError:
        return None


def linear(pairs):
    """Least-squares map from pixel to data, from (pixel, value) pairs."""
    px, v = np.array(pairs, float).T
    slope, intercept = np.polyfit(px, v, 1)
    return lambda p: slope * p + intercept


# --- plotly bar panels -------------------------------------------------------


def plotly_panels(pg, grid_color=GRID):
    """Each white plot area with its own x (numeric ticks, if any) and y calibration."""
    areas = [r for r in rects(pg, (1.0, 1.0, 1.0)) if r[1] > 10 and r[4] - r[2] > 150]
    texts = spans(pg)
    grid = lines(pg, grid_color)
    panels = []
    for _, x0, y0, x1, y1 in sorted(areas, key=lambda r: r[1]):
        vgrid = sorted(g[0] for g in grid if g[0] == g[2] and x0 - 1 <= g[0] <= x1 + 1)
        hgrid = sorted((g[1] for g in grid if g[1] == g[3] and x0 - 1 <= g[0] <= x1 and g[1] < y1 - 1), reverse=True)
        xticks = sorted((t[1], number(t[0])) for t in texts if y1 < t[2] < y1 + 20 and x0 - 2 < t[1] < x1 + 10 and number(t[0]) is not None)
        yticks = sorted(((t[2], number(t[0])) for t in texts if x0 - 40 < t[1] < x0 and y0 - 10 < t[2] < y1 + 10 and number(t[0]) is not None), reverse=True)
        # Gridlines sit at the ticks; the zero tick is the white baseline at y1.
        x_of = linear([(g, t[1]) for g, t in zip(vgrid, xticks)]) if vgrid else None
        y_pairs = [(y1, 0.0)] + [(g, t[1]) for g, t in zip(hgrid, [t for t in yticks if t[1] != 0])]
        panels.append(((x0, y0, x1, y1), x_of, linear(y_pairs)))
    return panels


def attention_head_statistics() -> None:
    """l1_attention_head_statistics_var{0,1,2}.pdf: three bar panels of 16 heads."""
    stats = ["variance", "average_norm", "relative_variance"]
    rows = []
    for var in (0, 1, 2):
        pg = page(f"l1_attention_head_statistics_var{var}.pdf")
        for stat, (box, x_of, y_of) in zip(stats, plotly_panels(pg)):
            x0, _, x1, y1 = box
            values = {h: 0.0 for h in range(16)}  # zero-height bars are drawn only as outlines
            for fill, bx0, by0, bx1, by1 in rects(pg):
                if fill != (1.0, 1.0, 1.0) and x0 <= bx0 and bx1 <= x1 and abs(by1 - y1) < 0.05 and by0 < by1 - 0.01:
                    values[round(x_of((bx0 + bx1) / 2))] = y_of(by0)
            rows += [[f"var {var}", stat, h, round(values[h], 4)] for h in range(16)]
    write("l1-attention-head-statistics.csv", ["variable", "statistic", "head", "value"], rows)


def l1_ov_operator_norm() -> None:
    """L1_ov_operator_norm.pdf: overlaid (not stacked) bars per head group."""
    pg = page("L1_ov_operator_norm.pdf")
    groups = {(0.3882, 0.4314, 0.9804): "var 2", (0.9373, 0.3333, 0.2314): "var 1", (0.0, 0.8, 0.5882): "var 0"}
    factors = ["syntax", "variable", "operation", "value"]
    (box, _, y_of), = plotly_panels(pg, grid_color=(0.9216, 0.9412, 0.9725))
    bars = []
    for fill, x0, y0, x1, y1 in rects(pg):
        group = next((g for c, g in groups.items() if close(fill, c)), None)
        if group is not None and abs(y1 - box[3]) < 0.05:  # not a legend swatch
            bars.append((group, x0, y0, x1))
    centers = sorted({round((b[1] + b[3]) / 2, 1) for b in bars})
    rows = []
    for group, x0, y0, x1 in bars:
        factor = factors[centers.index(round((x0 + x1) / 2, 1))]
        rows.append([group, factor, round(y_of(y0), 3)])
    rows.sort(key=lambda r: (r[0], factors.index(r[1])))
    write("l1-ov-operator-norm.csv", ["head_group", "factor", "norm_amplification"], rows)


def l2_relative_error() -> None:
    """l2_relative_error.pdf: histogram of the layer-1 MLP's relative L2 change."""
    pg = page("l2_relative_error.pdf")
    (box, x_of, y_of), = plotly_panels(pg)
    rows = []
    for _, x0, y0, x1, y1 in sorted(rects(pg, (0.0, 0.0, 1.0)), key=lambda r: r[1]):
        rows.append([round(x_of(x0), 4), round(x_of(x1), 4), round(y_of(y0))])
    write("l2-relative-error.csv", ["bin_start", "bin_end", "count"], rows)


# --- seaborn heatmaps ----------------------------------------------------------


def relative_variance_heatmaps() -> None:
    """L0_{var_0,var_1,var_2,rhs}_relative_variance_heatmap.pdf (seaborn, Blues).

    Cell colours are inverted through matplotlib's 256-step Blues colormap;
    the colour bar's range comes from its image extent and tick marks.
    """
    lut = colormaps["Blues"](np.linspace(0, 1, 256))[:, :3]
    queries = ["<SEP>", "var_0", "ADD_0", "var_1", "ADD_1", "var_2", "=", "rhs"]
    rows = []
    for perturbed in ("var_0", "var_1", "var_2", "rhs"):
        pg = page(f"L0_{perturbed}_relative_variance_heatmap.pdf")
        (bar,) = pg.get_image_info()
        top, bottom = bar["bbox"][1], bar["bbox"][3]
        # Colour-bar ticks: short black strokes right of the bar, labelled 0.0, 0.2, ...
        ticks = sorted(l[1] for l in lines(pg, (0.0, 0.0, 0.0)) if l[0] > bar["bbox"][2] - 1)
        labels = sorted((t[2], number(t[0])) for t in spans(pg) if t[1] > bar["bbox"][2] and number(t[0]) is not None)
        value_of = linear([(y, v) for y, (_, v) in zip(ticks, labels)])
        vmin, vmax = value_of(bottom), value_of(top)
        cells = []
        for d in pg.get_drawings():
            fill = d.get("fill")
            if fill is None or d.get("color") is not None or len(d["items"]) != 4:
                continue
            xs = [p.x for item in d["items"] for p in item[1:3]]
            ys = [p.y for item in d["items"] for p in item[1:3]]
            cells.append(((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, fill))
        cols = sorted({round(c[0], 1) for c in cells})
        rws = sorted({round(c[1], 1) for c in cells})
        assert len(cols) == 16 and len(rws) == len(queries), (perturbed, len(cols), len(rws))
        for cx, cy, fill in cells:
            index = int(np.argmin(((lut - np.array(fill)) ** 2).sum(axis=1)))
            value = vmin + (vmax - vmin) * index / 255
            rows.append([perturbed, queries[rws.index(round(cy, 1))], cols.index(round(cx, 1)), round(value, 4)])
    rows.sort(key=lambda r: (r[0], queries.index(r[1]), r[2]))
    write("l0-relative-variance.csv", ["perturbed", "query_token", "head", "relative_variance"], rows)


# --- plotly log-count histograms -----------------------------------------------


def fft_histograms() -> None:
    """fft_histograms_*.pdf: overlaid histograms of log10 |DFT| by frequency class.

    The count axis is logarithmic and each class has its own bins. Zero-count
    bins are not drawn; bars run from their count down past the axis.
    """
    classes = {
        (0.8392, 0.1529, 0.1569): "(0, 0, 0)",
        (1.0, 0.498, 0.0549): "(0, 0, a)",
        (0.8902, 0.4667, 0.7608): "(0, a, b) [a != b]",
        (0.5804, 0.4039, 0.7412): "(0, a, a)",
        (0.1216, 0.4667, 0.7059): "(a, b, c) [0 repeat]",
        (0.549, 0.3373, 0.2941): "(a, a, b) [1 repeat]",
        (0.1725, 0.6275, 0.1725): "(a, a, a) [2 repeat]",
    }
    rows = []
    for stage in ("L1-mlp-preact", "L1-mlp-postact", "L1-mlp-output", "decoder-output"):
        pg = page(f"fft_histograms_{stage}.pdf")
        grid = lines(pg, GRID)
        texts = spans(pg)
        vgrid = sorted(g[0] for g in grid if g[0] == g[2])
        hgrid = sorted((g[1] for g in grid if g[1] == g[3]), reverse=True)
        xticks = sorted((t[1], number(t[0])) for t in texts if t[2] > hgrid[0] + 5 and number(t[0]) is not None)
        left = min(g[0] for g in grid if g[1] == g[3])
        yticks = sorted(((t[2], number(t[0])) for t in texts if t[1] < left - 3 and number(t[0]) is not None), reverse=True)
        # x gridlines start at tick 1 (tick 0 is the axis); y gridlines at every count tick.
        x_of = linear([(g, v) for g, (_, v) in zip(vgrid, [t for t in xticks if t[1] != 0])])
        log_count_of = linear([(g, math.log10(v)) for g, (_, v) in zip(hgrid, yticks)])
        for fill, x0, y0, x1, y1 in rects(pg):
            label = next((c for k, c in classes.items() if close(fill, k)), None)
            if label is None or y1 < hgrid[0] + 5:
                continue  # legend swatches
            rows.append([stage, label, round(x_of(x0), 4), round(x_of(x1), 4), round(10 ** log_count_of(y0))])
    rows.sort(key=lambda r: (r[0], r[1], r[2]))
    write("fft-histograms.csv", ["stage", "frequency_class", "bin_start", "bin_end", "count"], rows)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    l1_ov_operator_norm()
    l2_relative_error()
    attention_head_statistics()
    relative_variance_heatmaps()
    fft_histograms()


if __name__ == "__main__":
    main()
