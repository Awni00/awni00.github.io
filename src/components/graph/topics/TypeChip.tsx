import { graphConfig } from "../../../config/graph";
import type { EntryType } from "../../../config/writing";

type TypeChipProps = { type: EntryType };

export default function TypeChip({ type }: TypeChipProps) {
  const meta = graphConfig.nodeTypes[type];
  return (
    <span className="topics-chip">
      <span className="topics-chip__dot" style={{ background: meta.color }} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
