"""Write src/data/figures/abstractor/*.csv from the vector figures in the Abstractor PDFs.

Sources (see src/data/figures/abstractor/provenance.yaml):
  - public/publications/slides/abstractor-slides.pdf (this repo): SET, sorting,
    sorting generalization, math training curves.
  - the ICLR 2024 camera-ready PDF (not in this repo; pass its path): pairwise order.

Run:
  uv run --with pymupdf python scripts/figures/abstractor/build_data.py PAPER.pdf
"""
import csv
import io
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
EXTRACT = Path(__file__).resolve().parent.parent / "extract_curves.py"
SLIDES = ROOT / "public/publications/slides/abstractor-slides.pdf"
OUT = ROOT / "src/data/figures/abstractor"


def extract(pdf, page):
    out = subprocess.run([sys.executable, str(EXTRACT), str(pdf), str(page)], check=True, capture_output=True, text=True)
    return list(csv.DictReader(io.StringIO(out.stdout)))


def num(v, digits=4):
    v = round(float(v), digits)
    return 0.0 if v == 0 else v


def write(name, header, rows):
    with open(OUT / name, "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(header)
        w.writerows(rows)
    print(f"wrote {name}: {len(rows)} rows")


def curve(row):
    return [round(float(row["x"])), num(row["y"]), num(row["lo"]), num(row["hi"])]


paper = Path(sys.argv[1])
pairwise = [r for r in extract(paper, 6) if r["panel"] == "" and r["color"] != ""]
write("pairwise-order-learning-curves.csv", ["model", "train_size", "accuracy", "lo", "hi"], [[r["series"], *curve(r)] for r in pairwise])

slides13 = extract(SLIDES, 13)
write("set-classification.csv", ["model", "train_size", "accuracy", "lo", "hi"], [[r["series"], *curve(r)] for r in slides13])

slides14 = extract(SLIDES, 14)
write(
    "random-object-sorting.csv",
    ["model", "train_size", "accuracy", "lo", "hi"],
    [[r["series"], *curve(r)] for r in slides14 if r["panel"] == "Random Object Sorting"],
)
# The generalization legend reads Abstractor / Pre-trained / Transformer / Pre-trained;
# the colour says which model a "Pre-trained" line belongs to.
GEN = {"#aec7e8": ("Abstractor", "false"), "#1f77b4": ("Abstractor", "true"), "#98df8a": ("Transformer", "false"), "#2ca02c": ("Transformer", "true")}
write(
    "random-object-sorting-generalization.csv",
    ["model", "pretrained", "train_size", "accuracy", "lo", "hi"],
    [[*GEN[r["color"]], *curve(r)] for r in slides14 if r["panel"] == "Random Object Sorting Generalization"],
)

# Panel titles in the published PNG are the dataset's task names.
TASKS = {
    "calculus differentiate": "calculus__differentiate",
    "algebra sequence next term": "algebra__sequence_next_term",
    "algebra linear 1d": "algebra__linear_1d",
    "polynomials expand": "polynomials__expand",
    "polynomials add": "polynomials__add",
}
slides15 = extract(SLIDES, 15)
write(
    "math-training-curves.csv",
    ["task", "model", "epoch", "accuracy", "lo", "hi"],
    [[TASKS[r["panel"]], r["series"], *curve(r)] for r in slides15],
)
