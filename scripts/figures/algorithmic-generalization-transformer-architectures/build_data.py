"""Chart data for the Unlocking OOD post, read from the paper's results package.

Reads the paper repo's `paper-results-package/figure-data/` tables (never
writes there) and writes the CSVs the post's <Chart> definitions draw, under
`src/data/figures/algorithmic-generalization-transformer-architectures/`.
Each output reproduces the selection/aggregation of the paper's own
generator (named per file below), so the charts match the published figures.

    uv run --with pandas --with numpy python \
        scripts/figures/algorithmic-generalization-transformer-architectures/build_data.py \
        /path/to/overleaf-icml-unlocking-ood--generalization

Prints the sha256 of every input and output, for provenance.yaml.
"""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path

import numpy as np
import pandas as pd

POST = "algorithmic-generalization-transformer-architectures"
OUT = Path(__file__).resolve().parents[3] / "src" / "data" / "figures" / POST

# Seeds and selections, as fixed in the paper's generator code
# (paper_figures/schemas.py and the per-figure provenance JSON).
EC_METHOD = "discrete-latent-space-supervision-on-policy-error-correction"
EC_BEST_SEED = 2208528648
SELF_SCHEDULED_SEEDS = (2208528648, 2868521940, 620824225, 3474191493, 1418828153)
SELF_SCHEDULED_ARM = "nodepthloss_alpha_0p5"
MIN_COVERAGE = 0.5
STRONGER_SELECTED = {
    "chain-of-thought-supervision": 2208528648,
    "continuous-latent-space-supervision": 1418828153,
    "discrete-latent-space-supervision": 2868521940,
    EC_METHOD: 2868521940,
    "end-to-end-feedforward": 3474191493,
    "end-to-end-recurrent": 2208528648,
    "self-scheduled-lss": 2868521940,
}

inputs: dict[str, Path] = {}


def read(package: Path, rel: str) -> pd.DataFrame:
    path = package / rel
    inputs[rel] = path
    return pd.read_csv(path)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(frame: pd.DataFrame, name: str) -> None:
    path = OUT / name
    frame.to_csv(path, index=False, float_format="%.6g")
    print(f"wrote {name}  sha256={sha256(path)}  rows={len(frame)}")


def method_ood_comparison(package: Path) -> None:
    """fig:method_ood_comparison (generator `method-ood-comparison`, 1sem view)."""
    summary = read(package, "figure-data/method_ood_comparison/summary.csv")
    frame = summary[["method", "display_name", "graph_size", "mean", "sem", "n_seeds"]]
    write(frame.sort_values(["method", "graph_size"]), "method-ood-comparison.csv")


def stepwise_best_seed(package: Path) -> None:
    """fig:ourmethod_stepwise_results (generator `stepwise-results-discrete-error-correction-best-seed`)."""
    seeds = read(package, "figure-data/stepwise_results/discrete_error_correction/seed_data.csv")
    frame = seeds[(seeds.method == EC_METHOD) & (seeds.seed == EC_BEST_SEED) & (seeds.step <= 20)]
    frame = frame[["graph_size", "step", "accuracy"]].sort_values(["graph_size", "step"])
    assert len(frame) == 16 * 21, len(frame)
    write(frame, "ec-stepwise-best-seed.csv")


def self_scheduled_schedule(package: Path) -> None:
    """fig:self_scheduled_schedule (generator `self-scheduled-first-all-seeds`)."""
    timing = read(package, "figure-data/self_scheduled_lss/first_nonempty_by_depth_seed.csv")
    stopping = read(package, "figure-data/self_scheduled_lss/stopping_metrics_seed.csv")
    timing = timing[timing.size_group == "all"]
    rows = []
    for seed in SELF_SCHEDULED_SEEDS:
        part = timing[timing.seed == seed].sort_values("node_depth")
        # Schedule rate: reciprocal of the equal-weight OLS slope over all depths.
        slope = np.polyfit(part.node_depth.to_numpy(float), part["median"].to_numpy(float), 1)[0]
        solved = stopping[(stopping.method == SELF_SCHEDULED_ARM) & (stopping.seed == seed)]
        n128 = float(solved[solved.graph_size == 128].a_emptyfree.iloc[0])
        shown = part[part.coverage >= MIN_COVERAGE]
        for _, r in shown.iterrows():
            rows.append(
                {
                    "seed": seed,
                    "node_depth": int(r.node_depth),
                    "median_first_fill": r["median"],
                    "coverage": r.coverage,
                    "levels_per_iteration": round(1 / slope, 4),
                    "solve_rate_n128": n128,
                }
            )
    frame = pd.DataFrame(rows)
    # Seed rank by N = 128 solve rate, as the paper orders its legend.
    order = frame.drop_duplicates("seed").sort_values("solve_rate_n128", ascending=False).seed.tolist()
    frame.insert(1, "rank", frame.seed.map({s: i + 1 for i, s in enumerate(order)}))
    write(frame.sort_values(["rank", "node_depth"]), "self-scheduled-first-fill.csv")


def stronger_ood_best_seed(package: Path) -> None:
    """fig:stronger_ood_best_seed (generator `stronger-ood-method-best-seed`)."""
    seeds = read(package, "figure-data/stronger_ood_n32_n256/method_ood_comparison/seed_data.csv")
    # Re-derive the selection (unweighted mean OOD solve rate; CoT over its
    # common five-seed interval N = 40..72) and check it against the paper's.
    for method, part in seeds.groupby("method"):
        hi = 72 if method == "chain-of-thought-supervision" else 256
        ood = part[(part.graph_size >= 40) & (part.graph_size <= hi)]
        best = ood.groupby("seed").accuracy.mean().idxmax()
        assert best == STRONGER_SELECTED[method], (method, best)
    keep = seeds.apply(lambda r: STRONGER_SELECTED[r.method] == r.seed, axis=1)
    frame = seeds[keep][["method", "display_name", "seed", "graph_size", "accuracy", "correct_count", "examples"]]
    write(frame.sort_values(["method", "graph_size"]), "stronger-ood-best-seed.csv")


def main() -> None:
    repo = Path(sys.argv[1]).resolve()
    package = repo / "paper-results-package"
    OUT.mkdir(parents=True, exist_ok=True)
    method_ood_comparison(package)
    stepwise_best_seed(package)
    self_scheduled_schedule(package)
    stronger_ood_best_seed(package)
    for rel, path in inputs.items():
        print(f"input paper-results-package/{rel}  sha256={sha256(path)}")


if __name__ == "__main__":
    main()
