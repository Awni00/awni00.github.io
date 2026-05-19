import type { TopicsDensity } from "../../../config/writing";
import type { EntryNode } from "../../../lib/graph/types";
import TypeChip from "./TypeChip";

type EntryRowProps = {
  entry: EntryNode;
  density: TopicsDensity;
};

export default function EntryRow({ entry, density }: EntryRowProps) {
  const showSummary = density === "comfortable" && Boolean(entry.summary);
  const className = density === "dense" ? "topics-row topics-row--dense" : "topics-row";
  return (
    <li className={className}>
      <TypeChip type={entry.type} />
      <span className="topics-row__body">
        <a className="topics-row__title" href={entry.url}>
          {entry.title}
        </a>
        {showSummary && <span className="topics-row__sum">{entry.summary}</span>}
      </span>
      <span className="topics-row__date">{entry.date ?? ""}</span>
    </li>
  );
}
