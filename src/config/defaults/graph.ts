import type { GraphConfigBase } from "../types";

export const defaultGraphConfig = {
  colorBy: "type",
  links: {
    color: "var(--graph-edge)",
    width: 1,
    opacity: 0.4,
    directed: true,
    arrow: {
      length: 4,
      width: 2,
      relPos: 1.0,
      color: "edge"
    }
  },
  layout: {
    hubs: "circle",
    labels: "config",
    labelSide: "auto"
  }
} as const satisfies GraphConfigBase;
