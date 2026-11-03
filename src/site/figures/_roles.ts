import { NEUTRAL, SERIES, SERIES_ALT } from "../../lib/figures";

/**
 * Colour by what a model computes with, the same across the relational
 * posts (abstractor, dual-attention) and their diagrams, as in the papers:
 * sensory (object-level) information is red, relational information blue,
 * and models that mix the two purple. A model's close variant takes the
 * companion shade of its colour (Transformer / Transformer+).
 *
 * Other relational baselines take the remaining hues, paired the same way,
 * and generic baselines (MLP, ablations) are neutral.
 */
export const ROLE = {
  sensory: SERIES[0],
  sensoryAlt: SERIES_ALT[0],
  relational: SERIES[1],
  relationalAlt: SERIES_ALT[1],
  sensoryRelational: SERIES[4],
  baseline: SERIES[2],
  baselineAlt: SERIES_ALT[2],
  otherBaseline: SERIES[3],
  generic: NEUTRAL
} as const;
