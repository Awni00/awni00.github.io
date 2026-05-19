import { useMemo, useState } from "react";

import { graphConfig } from "../../../config/graph";
import {
  writingConfig,
  type EntryType,
  type TopicsDensity,
  type TopicsSort,
  type TopicsSortField
} from "../../../config/writing";
import type { EntryNode } from "../../../lib/graph/types";
import DensityToggle from "../DensityToggle";
import { DEFAULT_DIR, sortEntries } from "../topics/sort";

type ListViewProps = {
  entries: EntryNode[];
  activeTypes: EntryType[];
  onToggleType: (t: EntryType) => void;
  typeCounts: Record<string, number>;
};

export default function ListView({
  entries,
  activeTypes,
  onToggleType,
  typeCounts
}: ListViewProps) {
  const config = writingConfig.browser.list;
  const [sort, setSort] = useState<TopicsSort>(config.defaultSort);
  const [density, setDensity] = useState<TopicsDensity>(config.density);

  const sorted = useMemo(() => sortEntries(entries, sort), [entries, sort]);

  const onSort = (field: TopicsSortField) => {
    setSort((current) =>
      current.field === field
        ? { field, dir: current.dir === "desc" ? "asc" : "desc" }
        : { field, dir: DEFAULT_DIR[field] }
    );
  };

  return (
    <div className={`listpage listpage--${density}`}>
      <ListToolbar
        activeTypes={activeTypes}
        onToggleType={onToggleType}
        typeCounts={typeCounts}
        showTypeFilter={config.showTypeFilter}
        showDensityToggle={config.showDensityToggle}
        density={density}
        onDensity={setDensity}
      />
      <div className="listpage-table">
        <div className="listrow listrow--head">
          <SortHeader
            className="lc lc-type"
            field="type"
            label="Type"
            sort={sort}
            sortable={config.sortOptions.includes("type")}
            onSort={onSort}
          />
          <SortHeader
            className="lc lc-title"
            field="title"
            label="Title"
            sort={sort}
            sortable={config.sortOptions.includes("title")}
            onSort={onSort}
          />
          <span className="lc lc-tags">Tags</span>
          <SortHeader
            className="lc lc-date"
            field="date"
            label="Date"
            sort={sort}
            sortable={config.sortOptions.includes("date")}
            onSort={onSort}
          />
        </div>
        {sorted.map((entry) => (
          <a key={entry.id} className="listrow" href={entry.url}>
            <span className="lc lc-type">
              <span
                className="swatch"
                style={{
                  background: (graphConfig.nodeTypes[entry.type as keyof typeof graphConfig.nodeTypes]
                    ?.color ?? "var(--color-muted)") as string
                }}
              />
              <span className="lc-typelabel">{entry.type}</span>
            </span>
            <span className="lc lc-title">
              <span className="lc-titletext">{entry.title}</span>
              {entry.summary && <span className="lc-summary">{entry.summary}</span>}
            </span>
            <span className="lc lc-tags">
              {entry.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
            <span className="lc lc-date">{entry.date ?? ""}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

type SortHeaderProps = {
  className: string;
  field: TopicsSortField;
  label: string;
  sort: TopicsSort;
  sortable: boolean;
  onSort: (field: TopicsSortField) => void;
};

function SortHeader({ className, field, label, sort, sortable, onSort }: SortHeaderProps) {
  if (!sortable) return <span className={className}>{label}</span>;
  const isActive = sort.field === field;
  const cls = isActive ? `${className} lc--sort is-active` : `${className} lc--sort`;
  return (
    <button type="button" className={cls} aria-pressed={isActive} onClick={() => onSort(field)}>
      {label}
      {isActive && (
        <span className="topics-sortbar__arrow" aria-hidden="true">
          {sort.dir === "desc" ? " ↓" : " ↑"}
        </span>
      )}
    </button>
  );
}

type ListToolbarProps = {
  activeTypes: EntryType[];
  onToggleType: (t: EntryType) => void;
  typeCounts: Record<string, number>;
  showTypeFilter: boolean;
  showDensityToggle: boolean;
  density: TopicsDensity;
  onDensity: (d: TopicsDensity) => void;
};

function ListToolbar({
  activeTypes,
  onToggleType,
  typeCounts,
  showTypeFilter,
  showDensityToggle,
  density,
  onDensity
}: ListToolbarProps) {
  if (!showTypeFilter && !showDensityToggle) return null;
  return (
    <div className="list-toolbar">
      {showTypeFilter ? (
        <div className="list-toolbar__chips">
          {writingConfig.entryTypes
            .filter((t) => (typeCounts[t] ?? 0) > 0)
            .map((type) => {
              const cfg = graphConfig.nodeTypes[type as keyof typeof graphConfig.nodeTypes];
              const active = activeTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className="graph-button graph-button--type"
                  style={{ ["--swatch" as any]: cfg?.color }}
                  aria-pressed={active}
                  onClick={() => onToggleType(type)}
                >
                  {type}
                  <span style={{ color: "var(--color-muted-2)" }}>{typeCounts[type]}</span>
                </button>
              );
            })}
        </div>
      ) : (
        <span />
      )}
      {showDensityToggle && <DensityToggle density={density} onDensity={onDensity} />}
    </div>
  );
}
