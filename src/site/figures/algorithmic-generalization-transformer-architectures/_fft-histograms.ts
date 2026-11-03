import * as Plot from "@observablehq/plot";
import { NEUTRAL, SERIES, defineFigure } from "../../../lib/figures";

/**
 * Overlaid histograms of log10 |DFT| by frequency class, on a log count
 * axis, for one stage of the layer-2 MLP. Each class has its own bins. The
 * diagonal (a, a, a) class, which encodes the sum, takes SERIES[0]; the
 * generic (a, b, c) class takes NEUTRAL.
 */
const CLASSES = [
  { id: "(0, 0, 0)", color: SERIES[1] },
  { id: "(0, 0, a)", color: SERIES[2] },
  { id: "(0, a, b) [a != b]", color: SERIES[3] },
  { id: "(0, a, a)", color: SERIES[4] },
  { id: "(a, b, c) [0 repeat]", color: NEUTRAL },
  { id: "(a, a, b) [1 repeat]", color: SERIES[5] },
  { id: "(a, a, a) [2 repeat]", color: SERIES[0] }
];
const FLOOR = 0.75;

export const fftHistogram = (stage: string) =>
  defineFigure({
    data: "algorithmic-generalization-transformer-architectures/fft-histograms.csv",
    size: "medium",
    legend: CLASSES.map((c) => ({ label: c.id, color: c.color, key: "swatch" })),
    plot: ({ data, width }) => ({
      width,
      height: 220,
      marginLeft: 44,
      marginRight: 12,
      marginBottom: 40,
      x: { label: "Log10(DFT value)", domain: [0, 8.5], ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      y: { type: "log", label: "Count", domain: [FLOOR, 160], ticks: [1, 2, 5, 10, 20, 50, 100], tickFormat: "d" },
      marks: [
        Plot.gridX({ ticks: [1, 2, 3, 4, 5, 6, 7, 8] }),
        Plot.gridY({ ticks: [2, 5, 10, 20, 50, 100] }),
        ...CLASSES.map((c) =>
          Plot.rect(
            data.filter((d) => d.stage === stage && d.frequency_class === c.id),
            {
              x1: (d) => Math.max(0, d.bin_start),
              x2: "bin_end",
              y1: FLOOR,
              y2: "count",
              fill: c.color,
              fillOpacity: 0.75,
              title: (d) => `${c.id}\nlog10 |DFT| ${d.bin_start.toFixed(2)}–${d.bin_end.toFixed(2)}: ${d.count}`
            }
          )
        )
      ]
    })
  });
