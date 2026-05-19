import {
  writingConfig,
  type EntryType,
  type TopicsSort,
  type TopicsSortDir,
  type TopicsSortField
} from "../../../config/writing";
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

export const DEFAULT_DIR: Record<TopicsSortField, TopicsSortDir> = {
  date: "desc",
  title: "asc",
  type: "asc"
};

export function sortEntries(entries: EntryNode[], sort: TopicsSort): EntryNode[] {
  const copy = [...entries];
  const mul = sort.dir === "asc" ? 1 : -1;
  switch (sort.field) {
    case "date":
      return copy.sort((a, b) => mul * dateKey(a).localeCompare(dateKey(b)));
    case "title":
      return copy.sort((a, b) => mul * titleKey(a).localeCompare(titleKey(b)));
    case "type":
      return copy.sort((a, b) => {
        const r = mul * (typeRank(a.type) - typeRank(b.type));
        return r !== 0 ? r : dateKey(b).localeCompare(dateKey(a));
      });
  }
}

export const SORT_LABELS: Record<TopicsSortField, string> = {
  date: "Date",
  title: "Title",
  type: "Type"
};
