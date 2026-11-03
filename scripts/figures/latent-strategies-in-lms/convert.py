"""Convert the paper's figure data into the site's figure data files.

Paper: "Uncovering Latent Reasoning Strategies in Language Models".
Reads the paper repo (read-only) and writes CSV/JSON files plus
`provenance.yaml` into src/data/figures/latent-strategies-in-lms/.

    uv run --with numpy python scripts/figures/latent-strategies-in-lms/convert.py \
        /path/to/disentangling-latent-llm-modes

Each output reproduces what the paper's `make_figure.py` plots (same rows,
same transforms). The posterior latent frames are projected to 2D with the
paper's own procedure: one PCA fit on all 51 frames pooled, signs fixed so
each component's largest-magnitude loading is positive (see
experiments/synthetic_sequences/disentangled/continuous_diagnostics.py:
_project_animation_frames, _fit_fixed_pca_projection).
"""

from __future__ import annotations

import csv
import datetime as dt
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SITE_ROOT = Path(__file__).resolve().parents[3]
OUT = SITE_ROOT / "src/data/figures/latent-strategies-in-lms"
POST = "latent-strategies-in-lms"
SCRIPT = "scripts/figures/latent-strategies-in-lms/convert.py"
FP = "paper/figure-production"

TASK_ORDER = [  # latent_dynamics/specs.py
    "base_conversion",
    "grid_pathfinding",
    "linear_equation_solving",
    "list_summation",
    "multidigit_addition",
    "sorting_algorithms",
]
TASK_STRATEGY_ORDER = {
    "list_summation": ("left-to-right", "right-to-left", "pairwise"),
    "sorting_algorithms": ("bubble-sort", "selection-sort", "insertion-sort", "merge-sort", "heap-sort"),
    "grid_pathfinding": ("right-first", "down-first", "alternating"),
    "linear_equation_solving": ("subtract-then-divide", "divide-then-subtract", "inverse-ops"),
    "base_conversion": ("repeated-division", "via-binary", "decomposition"),
    "multidigit_addition": ("right-to-left-carry", "left-to-right-partials", "rounding-decomposition"),
}
CHECKPOINT_TARGETS = (0.02, 0.06, 0.10, 0.20, 0.50, 1.00)  # static/manifest.yaml style.checkpoint_targets


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(name: str, header: list[str], rows: list[list[object]]) -> None:
    with (OUT / name).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(header)
        writer.writerows(rows)
    print(f"wrote {name}: {len(rows)} rows")


def r(value: float, digits: int = 4) -> float:
    return round(float(value), digits)


def sig(value: float, digits: int = 5) -> float:
    return float(f"{float(value):.{digits}g}")


# ---------------------------------------------------------------- figures


def elbo_failure(repo: Path) -> dict:
    src = f"{FP}/elbo_failure_dynamics/data/elbo_failure_dynamics.csv"
    rows = read_csv(repo / src)
    out = []
    for row in sorted(rows, key=lambda d: (int(d["metric_order"]), float(d["eval_epoch_progress"]))):
        # make_figure.py _render_normalized_overlay: KL uses plot_value (relative to initial), others metric_value.
        kl = row["metric_key"] == "posterior_router_kl"
        out.append(
            [
                row["metric_key"],
                r(row["eval_epoch_progress"]),
                r(row["plot_value"] if kl else row["metric_value"]),
                sig(row["metric_value"]),
            ]
        )
    write_csv("elbo-failure-dynamics.csv", ["metric", "progress", "value", "raw_value"], out)
    return {
        "figure": "fig:elbo-fails (normalized overlay variant, the one the paper includes)",
        "used_by": f"src/site/figures/{POST}/elbo-failure.ts",
        "files": [src],
        "generator": f"{FP}/elbo_failure_dynamics/make_figure.py (_render_normalized_overlay); data from fetch_data.py",
        "method": "converted",
        "fidelity": "exact (values rounded to 4 decimals)",
        "notes": "value is what the overlay plots: metric_value for fidelity and alignment, plot_value (KL relative to its initial value) for KL. raw_value is the unnormalized metric_value.",
    }


def entanglement(repo: Path) -> dict:
    src = f"{FP}/entanglement_heatmap/data/position_probe_accuracy.csv"
    rows = read_csv(repo / src)
    labels = {  # shared/labels.yaml tasks, in its order (make_figure.py _task_order)
        "list_summation": "Summation",
        "multidigit_addition": "Addition",
        "base_conversion": "Base conv.",
        "linear_equation_solving": "Linear eqs.",
        "sorting_algorithms": "Sorting",
        "grid_pathfinding": "Grid paths",
    }
    grid = np.linspace(0.0, 1.0, 65)
    n = len(grid)
    out = []
    for order, task in enumerate(labels):
        task_rows = sorted((d for d in rows if d["task_name"] == task), key=lambda d: float(d["normalized_position"]))
        x = np.array([float(d["normalized_position"]) for d in task_rows])
        y = np.array([float(d["accuracy"]) for d in task_rows])
        values = np.interp(grid, x, y)
        # imshow(extent=(0, 1, ...)) gives column i the span [i/65, (i+1)/65].
        for i, value in enumerate(values):
            out.append([task, labels[task], order, r(i / n, 5), r((i + 1) / n, 5), r(value)])
    write_csv("entanglement-heatmap.csv", ["task", "task_label", "row", "x1", "x2", "accuracy"], out)
    return {
        "figure": "fig:entanglement (blog figs/entanglement-heatmap.png)",
        "used_by": f"src/site/figures/{POST}/entanglement-heatmap.ts",
        "files": [src, f"{FP}/shared/labels.yaml"],
        "generator": f"{FP}/entanglement_heatmap/make_figure.py; data from fetch_data.py",
        "method": "converted",
        "fidelity": "exact (same 65-column interpolation as make_figure.py; rounded to 4 decimals)",
        "notes": "Each task's probe accuracy is linearly interpolated onto 65 evenly spaced positions (np.interp), as make_figure.py does before imshow. x1/x2 are the cell edges imshow draws with extent (0, 1).",
    }


def method_comparison(repo: Path) -> dict:
    src = f"{FP}/method_metric_bars/pretrained_faceted/task_scatter/data/method_metric_bars_task_scatter_pretrained.csv"
    rows = read_csv(repo / src)
    keep = {"strategy_match_rate", "analogical_set_overlap"}  # manifest selection.plot_metrics
    out = []
    for row in rows:
        if row["metric_key"] not in keep:
            continue
        label = row["method_label"].replace("$\\beta$", "β")
        out.append(
            [
                row["model_label"],
                int(row["method_order"]),
                row["method_role"],
                label,
                row["role_category"],
                row["metric_key"],
                row["value_kind"],
                row["task_name"],
                row["task_order"],
                r(row["metric_value"]),
            ]
        )
    out.sort(key=lambda d: (d[0], d[1], d[5], d[6], str(d[8])))
    write_csv(
        "method-comparison.csv",
        ["model", "method_order", "method", "method_label", "role", "metric", "kind", "task", "task_order", "value"],
        out,
    )
    return {
        "figure": "fig:reconstruction-decodability (blog figs/method-comparison.png)",
        "used_by": f"src/site/figures/{POST}/method-comparison.ts",
        "files": [src],
        "generator": f"{FP}/method_metric_bars/pretrained_faceted/task_scatter/make_figure.py (method_metric_bars/rendering.py render_metric_bars); data from fetch_data.py",
        "method": "converted",
        "fidelity": "exact (rounded to 4 decimals)",
        "notes": "Rows for the two plotted metrics only (strategy_match_rate = Distributional Fidelity, analogical_set_overlap = Strategy Alignment). kind aggregate = bar height, task = open per-task point. Method labels keep the paper's line breaks; $\\beta$ written as β.",
    }


def posterior(repo: Path) -> list[tuple[str, dict]]:
    base = f"{FP}/latent_dynamics/random_init_multitask/dist0p25_tokcc0p75_a0p25_b0p01_lin100/static"
    src = f"{base}/data/posterior_mu_frames.jsonl"
    frames = []
    with (repo / src).open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                frames.append(json.loads(line))
    # _valid_animation_frames
    frames = [
        f
        for f in frames
        if np.asarray(f.get("z_vectors", [])).ndim == 2
        and len(f["z_vectors"]) == len(f.get("labels", []))
        and len(f["z_vectors"]) > 0
    ]
    pooled = np.concatenate([np.asarray(f["z_vectors"], dtype=np.float64) for f in frames], axis=0)
    mean = pooled.mean(axis=0, keepdims=True)
    _u, _s, vt = np.linalg.svd(pooled - mean, full_matrices=False)
    basis = vt[:2, :].T.copy()
    for col in range(basis.shape[1]):  # _canonicalize_basis_signs
        pivot = int(np.argmax(np.abs(basis[:, col])))
        if basis[pivot, col] < 0:
            basis[:, col] = -basis[:, col]
    projected = [
        ((np.asarray(f["z_vectors"], dtype=np.float64) - mean) @ basis).astype(np.float32) for f in frames
    ]
    allp = np.concatenate(projected, axis=0)
    # rendering.py _axis_limits, margin_fraction 0.05
    x0, x1 = float(allp[:, 0].min()), float(allp[:, 0].max())
    y0, y1 = float(allp[:, 1].min()), float(allp[:, 1].max())
    mx, my = max((x1 - x0) * 0.05, 1e-3), max((y1 - y0) * 0.05, 1e-3)
    limits = [r(x0 - mx, 3), r(x1 + mx, 3), r(y0 - my, 3), r(y1 + my, 3)]
    progress = [float(f["eval_epoch_progress"]) for f in frames]

    def split(label: str) -> tuple[str, str]:
        task, strategy = label.split(":", 1) if ":" in label else ("", label)
        return task, strategy

    # Static strip: nearest frame to each target (rendering.py _select_nearest_index).
    static_rows = []
    for target in CHECKPOINT_TARGETS:
        index = int(np.nanargmin([abs(p - target) for p in progress]))
        for point, label in zip(projected[index], frames[index]["labels"]):
            task, strategy = split(str(label))
            static_rows.append([round(target * 100), r(progress[index]), r(point[0], 3), r(point[1], 3), task, strategy])
    write_csv("posterior-geometry.csv", ["checkpoint", "progress", "x", "y", "task", "strategy"], static_rows)

    final_rows = []
    for point, label in zip(projected[-1], frames[-1]["labels"]):
        task, strategy = split(str(label))
        final_rows.append([r(point[0], 3), r(point[1], 3), task, strategy])
    write_csv("posterior-final.csv", ["x", "y", "task", "strategy"], final_rows)

    # All 51 frames, coordinates quantized to 0..1000 across the axis limits.
    strategies = [f"{t}:{s}" for t in TASK_ORDER for s in TASK_STRATEGY_ORDER[t]]
    index_of = {s: i for i, s in enumerate(strategies)}
    labels0 = [str(v) for v in frames[0]["labels"]]
    same_labels = all([str(v) for v in f["labels"]] == labels0 for f in frames)
    if not same_labels:
        raise ValueError("Frames do not share one label order; the JSON format assumes they do.")
    unknown = sorted({l for l in labels0 if l not in index_of})
    if unknown:
        raise ValueError(f"Unexpected strategy labels: {unknown}")
    span_x, span_y = limits[1] - limits[0], limits[3] - limits[2]
    payload = {
        "tasks": TASK_ORDER,
        "strategies": strategies,
        "limits": limits,
        "scale": 1000,
        "progress": [r(p) for p in progress],
        "probe": [r(f.get("linear_probe_accuracy", float("nan"))) for f in frames],
        "labels": [index_of[l] for l in labels0],
        "frames": [
            [
                v
                for point in pts
                for v in (
                    int(round((float(point[0]) - limits[0]) / span_x * 1000)),
                    int(round((float(point[1]) - limits[2]) / span_y * 1000)),
                )
            ]
            for pts in projected
        ],
    }
    with (OUT / "posterior-frames.json").open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, separators=(",", ":"))
    print(f"wrote posterior-frames.json: {(OUT / 'posterior-frames.json').stat().st_size} bytes")

    common = {
        "files": [src],
        "generator": f"{base}/make_figure.py (latent_dynamics/rendering.py render_shared_static); frames copied by fetch_data.py",
        "method": "converted",
    }
    pca_note = (
        "Posterior mean latents (8-d) projected to 2D with the paper's procedure: one PCA (SVD of centred data) fitted on all "
        "800 points x 51 checkpoints pooled, each component's sign set so its largest-magnitude loading is positive, then "
        "applied to every frame. "
    )
    return [
        (
            "posterior-geometry.csv",
            {
                **common,
                "figure": "fig:disentanglement (blog figs/posterior-geometry.png)",
                "used_by": f"src/site/figures/{POST}/posterior-geometry.ts",
                "fidelity": "exact projection; coordinates rounded to 3 decimals",
                "notes": pca_note
                + "Rows are the six checkpoints the paper shows: the frame nearest to 2, 6, 10, 20, 50 and 100% of training. "
                f"Shared axis limits over all frames with 5% margin: {limits} (x0, x1, y0, y1).",
            },
        ),
        (
            "posterior-final.csv",
            {
                **common,
                "figure": "fig:disentanglement, final checkpoint (static state of the scrubbable latent view)",
                "used_by": f"src/site/figures/{POST}/posterior-explorer.ts",
                "fidelity": "exact projection; coordinates rounded to 3 decimals",
                "notes": pca_note + "Final checkpoint only (100% of training).",
            },
        ),
        (
            "posterior-frames.json",
            {
                **common,
                "figure": "fig:disentanglement, all 51 checkpoints (scrubbable latent view)",
                "used_by": f"src/site/figures/{POST}/posterior-explorer.client.ts",
                "fidelity": "projection exact; coordinates quantized to 1/1000 of the axis range (well under a pixel)",
                "notes": pca_note
                + "Format: limits [x0, x1, y0, y1]; frames[k] is a flat [qx, qy, ...] list per point with "
                "x = x0 + qx / scale * (x1 - x0); labels[i] indexes strategies ('task:strategy'), shared by every frame; "
                "progress and probe (the frame's linear_probe_accuracy) per checkpoint.",
            },
        ),
    ]


METHOD_ROWS = [  # phase_space_dynamics/specs.py RANDOM_INIT_METHOD_ROWS (labels without line breaks)
    ("standard_cvae", "ELBO"),
    ("beta_elbo", "β-ELBO"),
    ("global_norm", "global scale"),
    ("token_pressure", "token weighting"),
    ("global_plus_token", "global + token"),
    ("token_inverse", "token inverse"),
]


def phase_space(repo: Path) -> dict:
    base = f"{FP}/phase_space_dynamics"
    srcs = {
        "fidelity": f"{base}/fidelity_vs_alignment/random_init_multitask/endpoint_lollipop/static/data/fidelity_alignment_phase_space_random_init_multitask_endpoint_lollipop.csv",
        "kl": f"{base}/kl_vs_alignment/random_init_multitask/rolling/static/data/kl_alignment_phase_space_random_init_multitask.csv",
        "token_recon": f"{base}/token_weighted_reconstruction_vs_alignment/random_init_multitask/rolling/static/data/token_weighted_reconstruction_alignment_phase_space_random_init_multitask.csv",
        "base_recon": f"{base}/baseline_reconstruction_vs_alignment/random_init_multitask/rolling/static/data/reconstruction_alignment_phase_space_random_init_multitask.csv",
    }
    tables = {key: read_csv(repo / path) for key, path in srcs.items()}
    ref = tables["fidelity"]
    for key, table in tables.items():
        for a, b in zip(ref, table):
            if (a["method_role"], a["checkpoint_index"], a["y_value"]) != (b["method_role"], b["checkpoint_index"], b["y_value"]):
                raise ValueError(f"{key} rows do not line up with the fidelity table")
    labels = dict(METHOD_ROWS)
    out = []
    for i, row in enumerate(ref):
        out.append(
            [
                int(row["method_order"]),
                row["method_role"],
                labels[row["method_role"]],
                row["role_category"],
                int(row["checkpoint_index"]),
                r(row["epoch_progress"]),
                r(row["y_value"]),
                r(tables["fidelity"][i]["x_value"]),
                sig(tables["kl"][i]["x_value"]),
                sig(tables["token_recon"][i]["x_value"]),
                sig(tables["base_recon"][i]["x_value"]),
            ]
        )
    out.sort(key=lambda d: (d[0], d[4]))
    write_csv(
        "phase-space.csv",
        ["method_order", "method", "method_label", "role", "checkpoint", "progress", "alignment", "fidelity", "kl", "token_recon", "base_recon"],
        out,
    )
    return {
        "figure": "fig:alignment-diagnostics left / fig:fidelity-alignment-phase-space (blog figs/fidelity-alignment-phase-space.png); also the trajectory explorer",
        "used_by": f"src/site/figures/{POST}/fidelity-alignment-phase-space.ts, src/site/figures/{POST}/phase-space-explorer.ts",
        "files": list(srcs.values()),
        "generator": f"{base}/fidelity_vs_alignment/random_init_multitask/endpoint_lollipop/static/make_figure.py (phase_space_dynamics/rendering.py render_phase_space_endpoint_lollipop); sibling families' fetch_data.py",
        "method": "converted",
        "fidelity": "exact (alignment and fidelity rounded to 4 decimals; kl, token_recon, base_recon to 5 significant figures)",
        "notes": "One row per method and checkpoint (6 x 51). alignment is y_value (analysis/within_task_router_strategy_probe_mean), identical across the four families; fidelity, kl, token_recon and base_recon are the x_value of the fidelity_vs_, kl_vs_, token_weighted_reconstruction_vs_ and baseline_reconstruction_vs_alignment random_init_multitask CSVs. The paper's endpoint lollipop uses the first and last checkpoint of each method, unsmoothed.",
    }


def token_scatter(repo: Path) -> dict:
    base = f"{FP}/metric_association_scatter/token_reconstruction_vs_strategy_alignment/random_init_single_task"
    src = f"{base}/data/random_init_single_task_token_reconstruction_vs_strategy_alignment_metric_association_scatter.csv"
    rows = read_csv(repo / src)
    out = [
        [
            row["point_type"],
            row["semantic_loss_family"],
            row["semantic_loss_family_label"],
            row["task_name"],
            row["loss_setting"],
            sig(row["x_value"]),
            r(row["y_value"]),
        ]
        for row in rows
    ]
    write_csv("token-recon-vs-alignment.csv", ["point_type", "family", "family_label", "task", "loss_setting", "x", "y"], out)
    return {
        "figure": "fig:alignment-diagnostics right / fig:token-reconstruction-strategy-alignment-scatter (blog figs/token-recon-vs-alignment.png)",
        "used_by": f"src/site/figures/{POST}/token-recon-vs-alignment.ts",
        "files": [src],
        "generator": f"{base}/make_figure.py (metric_association_scatter/rendering.py render_metric_association); data from fetch_data.py",
        "method": "converted",
        "fidelity": "exact (x to 5 significant figures, y to 4 decimals)",
        "notes": "point_type task_point = one single-task run (translucent, marker by task); centroid = task average per loss setting (outlined).",
    }


EXPLORE_ROLES = [  # additional_results/make_figures.py ROLES / EXPLORE_ROLES / SHORT_LABELS
    ("global_plus_token", "global-token", "Global + token"),
    ("token_pressure", "token-weighting", "Token weighting"),
    ("global_norm", "global-scale", "Global scale"),
    ("token_inverse", "token-inverse", "Token inverse"),
    ("standard_cvae", "elbo", "ELBO"),
    ("beta_elbo", "beta-elbo", "β-ELBO"),
]


def exploration(repo: Path) -> list[tuple[str, dict]]:
    base = f"{FP}/additional_results"
    summary_src = f"{base}/data/scratch_summary.csv"
    base_src = f"{base}/data/base_exploration_curve.csv"
    curves_src = f"{base}/data/scratch_curves.csv"
    summary = read_csv(repo / summary_src)
    base_curve = read_csv(repo / base_src)
    curves = read_csv(repo / curves_src)
    base4 = next(float(d["coverage_mean"]) for d in base_curve if int(d["step"]) == 4) * 100
    out = []
    for order, (role, source, label) in enumerate(EXPLORE_ROLES):
        by_method = {d["method"]: float(d["coverage_4"]) * 100 for d in summary if d["role"] == source}
        out.append([order, role, label, r(by_method["iid"], 3), r(by_method["angular_maximin_whitened"], 3), r(base4, 3)])
    write_csv("exploration-coverage.csv", ["order", "method", "method_label", "iid", "explore", "base"], out)

    labels = {source: (role, label) for role, source, label in EXPLORE_ROLES}
    method_names = {"iid": "iid", "angular_maximin_whitened": "explore"}
    curve_rows = [["base", "Base model", "base", int(d["step"]), r(float(d["coverage_mean"]) * 100, 3)] for d in base_curve]
    for d in curves:
        role, label = labels[d["role"]]
        curve_rows.append([role, label, method_names[d["method"]], int(d["step"]), r(float(d["coverage_mean"]) * 100, 3)])
    write_csv("exploration-curves.csv", ["method", "method_label", "sampling", "step", "coverage"], curve_rows)
    return [
        (
            "exploration-coverage.csv",
            {
                "figure": "fig:exploration-decomposition (paper only: additional_results/output/scratch_exploration_compact_with_base.pdf)",
                "used_by": f"src/site/figures/{POST}/exploration-coverage.ts",
                "files": [summary_src, base_src],
                "generator": f"{base}/make_figures.py (_scratch_compact_with_base); data from fetch_data.py",
                "method": "converted",
                "fidelity": "exact (percent, rounded to 3 decimals)",
                "notes": "Strategy coverage (%) after T = 4 decoded samples: iid = latent IID sampling, explore = angular_maximin_whitened latent exploration, base = base model (one value, the dashed reference line).",
            },
        ),
        (
            "exploration-curves.csv",
            {
                "figure": "Coverage curves behind fig:exploration-decomposition (paper appendix fig:appendix-exploration-coverage-curves); used by the coverage race",
                "used_by": f"src/site/figures/{POST}/exploration-race.ts",
                "files": [curves_src, base_src],
                "generator": f"{base}/make_figures.py (_scratch_curves_with_base); data from fetch_data.py",
                "method": "converted",
                "fidelity": "exact (percent, rounded to 3 decimals)",
                "notes": "Task-local strategy coverage (%) by number of decoded samples (1..64) for each objective under latent IID and latent exploration, plus the base model curve (method base).",
            },
        ),
    ]


# ---------------------------------------------------------------- provenance


def yaml_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    repo = Path(sys.argv[1]).resolve()
    OUT.mkdir(parents=True, exist_ok=True)
    git = lambda *args: subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=True).stdout.strip()
    commit = git("rev-parse", "HEAD")
    commit_date = git("log", "-1", "--format=%cI")
    remote = git("remote", "get-url", "origin")

    entries: list[tuple[str, dict]] = [
        ("elbo-failure-dynamics.csv", elbo_failure(repo)),
        ("entanglement-heatmap.csv", entanglement(repo)),
        ("method-comparison.csv", method_comparison(repo)),
        *posterior(repo),
        ("phase-space.csv", phase_space(repo)),
        ("token-recon-vs-alignment.csv", token_scatter(repo)),
        *exploration(repo),
    ]

    lines = [
        "# Where this paper's figure data came from. Schema: scripts/figures/README.md#provenance",
        f"# Generated by {SCRIPT}; edit that script, not this file.",
        "paper: Uncovering Latent Reasoning Strategies in Language Models",
        "files:",
    ]
    today = dt.date.today().isoformat()
    for name, entry in entries:
        lines += [
            f"  {name}:",
            f"    figure: {yaml_str(entry['figure'])}",
            f"    used_by: {yaml_str(entry['used_by'])}",
            "    source:",
            "      repo: disentangling-latent-llm-modes",
            f"      remote: {remote}",
            f"      commit: {commit}",
            f"      commit_date: {commit_date}",
            "      files:",
        ]
        for path in entry["files"]:
            lines += [f"        - path: {path}", f"          sha256: {sha256(repo / path)}"]
        lines += [
            f"      generator: {yaml_str(entry['generator'])}",
            f"    extracted: {today}",
            f"    method: {entry['method']}",
            f"    tool: {SCRIPT}",
            f"    fidelity: {yaml_str(entry['fidelity'])}",
            f"    notes: {yaml_str(entry['notes'])}",
        ]
    (OUT / "provenance.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote provenance.yaml")


if __name__ == "__main__":
    main()
