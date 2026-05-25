import { getEntryType, type EntryType } from "../../../config";

type TypeChipProps = { type: EntryType };

export default function TypeChip({ type }: TypeChipProps) {
  const meta = getEntryType(type);
  return (
    <span className="topics-chip">
      <span className="topics-chip__dot" style={{ background: meta.graph.color }} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
