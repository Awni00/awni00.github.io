import { writingConfig, type EntryType, type TopicsSortKey } from "../../../config/writing";
import type { EntryNode } from "../../../lib/graph/types";

const ARTICLE_RX = /^(a|an|the)\s+/i;

function titleKey(entry: EntryNode): string {
  return entry.title.replace(ARTICLE_RX, "").toLocaleLowerCase();
}

function dateKey(entry: EntryNode): string {
  return entry.date ?? "";
}

function typeRank(type: EntryType): number {
  const idx = writingConfig.entryTypes.indexOf(type);
  return idx === -1 ? writingConfig.entryTypes.length : idx;
}

export function sortEntries(entries: EntryNode[], by: TopicsSortKey): EntryNode[] {
  const copy = [...entries];
  switch (by) {
    case "date-desc":
      return copy.sort((a, b) => dateKey(b).localeCompare(dateKey(a)));
    case "date-asc":
      return copy.sort((a, b) => dateKey(a).localeCompare(dateKey(b)));
    case "title":
      return copy.sort((a, b) => titleKey(a).localeCompare(titleKey(b)));
    case "type":
      return copy.sort((a, b) => {
        const r = typeRank(a.type) - typeRank(b.type);
        return r !== 0 ? r : dateKey(b).localeCompare(dateKey(a));
      });
  }
}

export const SORT_LABELS: Record<TopicsSortKey, string> = {
  "date-desc": "Date ↓",
  "date-asc": "Date ↑",
  title: "Title",
  type: "Type"
};
