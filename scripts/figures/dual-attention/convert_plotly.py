"""Flatten the post's published plotly figures to tidy CSV.

The published HTML files inline the same traces as the sibling .json files
(checked: identical `data`), so the JSON is read.

Run from the repo root:
  python3 scripts/figures/dual-attention/convert_plotly.py

Writes src/data/figures/dual-attention/{relgames-learning-curves,
math-accuracy-scaling,language-modeling-scaling-laws}.csv
"""
import csv
import json
import re
from pathlib import Path

SRC = Path("public/blog/dual-attention/static/figs")
OUT = Path("src/data/figures/dual-attention")


def write(name, header, rows):
    with open(OUT / name, "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).strip()


def task_of(trace):
    return strip_tags(re.search(r"Task=(.*?)<br>", trace["hovertemplate"]).group(1))


def load(name):
    return json.loads((SRC / f"{name}.json").read_text())


# Relational games learning curves. Model names carry the head counts, e.g.
# "<i>DAT</i> (n<sub>h</sub><sup>sa</sup>=0, n<sub>h</sub><sup>ra</sup>=2)".
rows = []
for t in load("relgames_learning_curves")["data"]:
    name = strip_tags(t["name"])  # "DAT (nhsa=0, nhra=2)"
    model = name.split(" ")[0]
    n_sa, n_ra = (int(v) for v in re.findall(r"=(\d+)", name))
    for x, y, e in zip(t["x"], t["y"], t["error_y"]["array"]):
        if y is None:
            continue  # each task only has points in its own range of training set sizes
        rows.append([model, n_sa, n_ra, task_of(t), x, repr(y), repr(e)])
write("relgames-learning-curves.csv", ["model", "n_sa", "n_ra", "task", "train_size", "accuracy", "error"], rows)

# Mathematical problem solving: accuracy vs parameter count, per task.
# customdata[0] is the number of runs ("count").
rows = []
for t in load("math_accuracy_scaling")["data"]:
    model = strip_tags(t["name"])
    for x, y, e, c in zip(t["x"], t["y"], t["error_y"]["array"], t["customdata"]):
        rows.append([model, task_of(t), x, repr(y), repr(e), c[0]])
write("math-accuracy-scaling.csv", ["model", "task", "params", "accuracy", "error", "trials"], rows)

# Language modeling scaling laws: tokens needed to reach each perplexity.
# The last two traces are legend-only stand-ins with no data.
rows = []
for t in load("language_modeling_scaling_laws")["data"]:
    if "x" not in t:
        continue
    perplexity = float(re.search(r"Perplexity=([\d.]+)", t["hovertemplate"]).group(1))
    model = strip_tags(re.search(r"Model=(.*?)<br>", t["hovertemplate"]).group(1))
    for x, y in zip(t["x"], t["y"]):
        if y is None:
            continue  # the smallest model never reached perplexity 15
        rows.append([model, f"{perplexity:g}", int(x), int(y)])
write("language-modeling-scaling-laws.csv", ["model", "perplexity", "params", "tokens"], rows)
