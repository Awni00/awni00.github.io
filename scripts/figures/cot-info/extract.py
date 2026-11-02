"""Recover the cot-info simulation charts' data from the published vector PDFs.

Run from the repo root:
    uv run --with pymupdf python scripts/figures/cot-info/extract.py

Each PDF's axes are calibrated from its major tick marks (paired with their
tick labels), series are told apart by stroke colour and dash pattern, and
legend keys (short 2-point strokes inside the legend box) are dropped.
Writes CSVs to src/data/figures/cot-info/.
"""
import csv
import math
import pathlib
import re

import pymupdf

ROOT = pathlib.Path("public/blog/cot-info/figs/simulation_figs")
OUT = pathlib.Path("src/data/figures/cot-info")

BLUE = (0.047, 0.365, 0.647)  # CoT-Cons
GREEN = (0.0, 0.725, 0.271)  # E2E-Cons
SOLID = "[] 0"


def rgb(c):
    return tuple(round(v, 3) for v in c) if c else None


def points(d):
    pts = []
    for item in d["items"]:
        for q in item[1:]:
            if hasattr(q, "x"):
                if not pts or (abs(pts[-1][0] - q.x) > 1e-6 or abs(pts[-1][1] - q.y) > 1e-6):
                    pts.append((q.x, q.y))
    return pts


def label_value(text, log):
    text = text.replace("−", "-").strip()
    if log:  # 10^k with the superscript flattened
        return 10 ** int(text[2:])
    return float(text)


class Axes:
    """Pixel → data maps from the major ticks of one PDF page."""

    def __init__(self, page, xlog=False, ylog=False):
        drawings = page.get_drawings()
        frame = [d for d in drawings if rgb(d.get("color")) == (0, 0, 0) and d.get("width") == 0.5 and d.get("dashes") == SOLID and not d.get("fill")]
        xs = [d["rect"].x0 for d in frame if d["rect"].width < 0.01]
        ys = [d["rect"].y0 for d in frame if d["rect"].height < 0.01]
        self.left, self.right = min(xs), max(xs)
        self.top, self.bottom = min(ys), max(ys)
        ticks = [d for d in drawings if d.get("fill") and rgb(d.get("color")) == (0, 0, 0) and d.get("width") == 0.5]
        xt = sorted({round(d["rect"].x0, 2) for d in ticks if d["rect"].width < 0.01 and abs(d["rect"].height - 3) < 0.05 and abs(d["rect"].y1 - self.bottom) < 0.05})
        yt = sorted({round(d["rect"].y0, 2) for d in ticks if d["rect"].height < 0.01 and abs(d["rect"].width - 3) < 0.05 and abs(d["rect"].x0 - self.left) < 0.05})
        spans = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                t = "".join(s["text"] for s in line["spans"])
                if re.fullmatch(r"[−\-]?[0-9.]+|10[−\-]?[0-9]", t.strip()):
                    b = line["bbox"]
                    spans.append((t, (b[0] + b[2]) / 2, (b[1] + b[3]) / 2, b))
        xlab = [s for s in spans if s[3][1] > self.bottom]
        ylab = [s for s in spans if s[3][2] < self.left]
        self.xcal = self._fit(xt, [(s[1], label_value(s[0], xlog)) for s in xlab], xlog)
        self.ycal = self._fit(yt, [(s[2], label_value(s[0], ylog)) for s in ylab], ylog)
        self.xlog, self.ylog = xlog, ylog

    @staticmethod
    def _fit(ticks, labels, log):
        pairs = []
        for t in ticks:
            near = min(labels, key=lambda lab: abs(lab[0] - t))
            if abs(near[0] - t) < 6:
                pairs.append((t, math.log10(near[1]) if log else near[1]))
        (p0, v0), (p1, v1) = pairs[0], pairs[-1]
        scale = (v1 - v0) / (p1 - p0)
        for p, v in pairs:  # every labelled tick must sit on the same line
            assert abs(v0 + (p - p0) * scale - v) < 1e-3 * max(1, abs(v)), (pairs, log)
        return lambda p: v0 + (p - p0) * scale

    def x(self, px):
        return self.xcal(px)  # log10 for log axes

    def y(self, py):
        return self.ycal(py)


def strokes(page, color, dashes=SOLID):
    return [d for d in page.get_drawings() if rgb(d.get("color")) == color and d.get("dashes") == dashes and not d.get("fill") and len(d["items"]) > 2]


def fills(page, color):
    return [d for d in page.get_drawings() if rgb(d.get("fill")) == color and d.get("fill_opacity", 1) < 0.5]


def write(name, header, rows):
    with open(OUT / name, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


def r(v, n=4):
    return round(v, n) + 0.0  # + 0.0 turns -0.0 into 0.0


def band_at(band, px):
    """Upper and lower edge of a fill_between polygon at pixel x."""
    ys = [y for x, y in points(band) if abs(x - px) < 0.05]
    return min(ys), max(ys)


def sample_size(v):
    """Sample sizes are integers; the recovered values sit within 0.05 + 0.02% of one."""
    assert abs(v - round(v)) < 0.05 + 2e-4 * v, v
    return int(round(v))


# 1. Scatter: CoT information vs end-to-end disagreement (linear class).
page = pymupdf.open(ROOT / "LinearThresh_Wind8A2L8/20250505-191322/figs/CoTInfo_vs_E2EDiff.pdf")[0]
ax = Axes(page)
markers = [d for d in page.get_drawings() if rgb(d.get("fill")) == BLUE]
rows = sorted((r(ax.x((d["rect"].x0 + d["rect"].x1) / 2)), r(ax.y((d["rect"].y0 + d["rect"].y1) / 2))) for d in markers)
write("linear-thresh-cot-info-vs-e2e-diff.csv", ["e2e_disagreement", "cot_information"], rows)

# 2. CoT information function vs epsilon (linear class), plus the vertical dashed rule.
page = pymupdf.open(ROOT / "LinearThresh_Wind8A2L8/20250505-191322/figs/CoTInfo_vs_Epsilon_log.pdf")[0]
ax = Axes(page, xlog=True)
(curve,) = strokes(page, BLUE)
rows = [("cot_information", r(ax.x(x)), r(ax.y(y))) for x, y in points(curve)]
vline = [d for d in page.get_drawings() if rgb(d.get("color")) == (0, 0, 0) and d.get("dashes") == "[ 3.7 1.6 ] 0" and d["rect"].width < 0.01]
for d in vline:
    rows.append(("vertical_rule", r(ax.x(d["rect"].x0)), ""))
write("linear-thresh-cot-info-vs-epsilon.csv", ["series", "log10_epsilon", "value"], rows)


def learning_curves(path, name, dashed):
    page = pymupdf.open(ROOT / path)[0]
    ax = Axes(page, xlog=True)
    rows = []
    for rule, color in (("CoT-Cons", BLUE), ("E2E-Cons", GREEN)):
        series = [("E2E error", strokes(page, color))]
        if dashed:
            series.append(("CoT error", strokes(page, color, "[ 4 1.5 ] 0")))
        bands = fills(page, color)
        for error, (line,) in series:
            # each line has its own band; pick the one that contains the line
            def fits(band):
                return all(band_at(band, x)[0] - 0.05 <= y <= band_at(band, x)[1] + 0.05 for x, y in points(line))

            (band,) = [b for b in bands if fits(b)]
            for x, y in points(line):
                hi, lo = band_at(band, x)
                rows.append((rule, error, sample_size(10 ** ax.x(x)), r(ax.y(y)), r(ax.y(lo)), r(ax.y(hi))))
    header = ["learning_rule", "error_type", "m", "p_zero_error", "lower", "upper"]
    if not dashed:
        header.remove("error_type")
        rows = [(a, *rest) for a, _, *rest in rows]
    write(name, header, rows)


# 3. Probability of zero error, linear class (E2E error only; shaded bands).
learning_curves(
    "LinearThresh_Wind8A2L8/20250505-191322/figs/learning_curves_prob_success_eps0_log_legendin_e2eerr.pdf",
    "linear-thresh-learning-curves.csv",
    dashed=False,
)

# 4. Probability of zero error, DFA (E2E and CoT error).
learning_curves(
    "DFA_S4A2L10_learning/20250504-165732/figs/learning_curves_prob_success_eps0_log_legendin.pdf",
    "dfa-learning-curves.csv",
    dashed=True,
)

# 5. Empirical sample complexity, DFA.
page = pymupdf.open(ROOT / "DFA_S4A2L10_learning/20250504-165732/figs/empirical_sample_complexity_legendin.pdf")[0]
ax = Axes(page, xlog=True)
rows = []
for rule, color in (("CoT-Cons", BLUE), ("E2E-Cons", GREEN)):
    for error, dashes in (("E2E error", SOLID), ("CoT error", "[ 4 1.5 ] 0")):
        (line,) = strokes(page, color, dashes)
        rows += [(rule, error, r(ax.x(x)), sample_size(ax.y(y))) for x, y in points(line)]
write("dfa-empirical-sample-complexity.csv", ["learning_rule", "error_type", "log10_epsilon", "sample_complexity"], rows)

# 6. CoT information ratio vs epsilon by CoT detail level, DFA. Curves are drawn
# light to dark, matching colour-bar levels 1..10.
page = pymupdf.open(ROOT / "DFA_S4A2L10_varycotdetail/20250503-194523/figs/CoTInfoRatio_vs_Epsilon_by_detail_log.pdf")[0]
ax = Axes(page, xlog=True)
curves = [d for d in page.get_drawings() if d.get("color") and not d.get("fill") and d.get("dashes") == SOLID and d.get("width") == 1.0 and len(points(d)) > 2]
assert len(curves) == 10
curves.sort(key=lambda d: -sum(d["color"]))  # lightest first
rows = []
for level, d in enumerate(curves, start=1):
    rows += [(level, r(ax.x(x)), r(ax.y(y), 2)) for x, y in points(d)]
(baseline,) = [d for d in page.get_drawings() if rgb(d.get("color")) == (0, 0, 0) and d.get("dashes") == "[ 3.7 1.6 ] 0"]
print("ratio baseline y:", [r(ax.y(y), 2) for _, y in points(baseline)])
write("dfa-cot-info-ratio-by-detail.csv", ["detail_level", "log10_epsilon", "ratio"], rows)
