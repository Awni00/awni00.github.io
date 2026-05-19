import { useMemo, useState } from "react";

import { writingConfig, type TopicsDensity } from "../../../config/writing";
import type { EntryNode, GraphIndex } from "../../../lib/graph/types";
import HubSection from "./HubSection";

type TopicsViewProps = {
  graph: GraphIndex;
  entries: EntryNode[];
};

export default function TopicsView({ graph, entries }: TopicsViewProps) {
  const config = writingConfig.browser.topics;
  const [density, setDensity] = useState<TopicsDensity>(config.density);
  const visibleEntries = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);
  const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  return (
    <div className="topicspage">
      <div className="topicspage-body">
        {graph.hubs.map((hub) => (
          <HubSection
            key={hub.id}
            hub={hub}
            graph={graph}
            visibleEntries={visibleEntries}
            nodeById={nodeById}
            config={config}
            density={density}
            showDensityToggle={config.showDensityToggle}
            onDensity={setDensity}
          />
        ))}
      </div>
    </div>
  );
}
