"""Flatten the post's published plotly figures (figure JSON) to tidy CSV.

The blog HTML wrappers fetch these JSON files, so the JSON is what readers see.

Run from the repo root:
  python3 scripts/figures/relational-convolutions/convert_plotly.py

Writes src/data/figures/relational-convolutions/{contains-set-acc,contains-set-conv-rep}.csv
"""
import csv
import json
from pathlib import Path

SRC = Path("public/blog/relational-convolutions/figs")
OUT = Path("src/data/figures/relational-convolutions")


def write(name, header, rows):
    with open(OUT / name, "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


# Bar chart: one trace per model, one bar each, error_y = plotted error bar,
# customdata[0] = number of trials.
fig = json.loads((SRC / "contains_set_acc.json").read_text())
rows = []
for t in fig["data"]:
    for x, y, e, c in zip(t["x"], t["y"], t["error_y"]["array"], t["customdata"]):
        rows.append([x, repr(y), repr(e), c[0]])
write("contains-set-acc.csv", ["model", "accuracy", "error", "trials"], rows)

# Scatter: one trace per class ("not set", "set"), PC1/PC2 of the relational
# convolution output.
fig = json.loads((SRC / "contains_set_conv_rep.json").read_text())
rows = []
for t in fig["data"]:
    for x, y in zip(t["x"], t["y"]):
        rows.append([t["name"], repr(x), repr(y)])
write("contains-set-conv-rep.csv", ["label", "pc1", "pc2"], rows)
