import type { TopicsDensity, TopicsSort, TopicsSortField } from "../../../config/writing";
import { SORT_LABELS } from "./sort";

type SortBarProps = {
  sortOptions: readonly TopicsSortField[];
  activeSort: TopicsSort;
  onSort: (field: TopicsSortField) => void;
  showDensityToggle: boolean;
  density: TopicsDensity;
  onDensity: (d: TopicsDensity) => void;
};

const DENSITIES: TopicsDensity[] = ["comfortable", "minimal", "dense"];

const DENSITY_LABEL: Record<TopicsDensity, string> = {
  comfortable: "Comfortable",
  minimal: "Minimal",
  dense: "Dense"
};

export default function SortBar({
  sortOptions,
  activeSort,
  onSort,
  showDensityToggle,
  density,
  onDensity
}: SortBarProps) {
  if (sortOptions.length === 0 && !showDensityToggle) return null;
  return (
    <div className="topics-sortbar">
      {sortOptions.length > 0 && (
        <>
          <span className="topics-sortbar__label">Sort</span>
          <span className="topics-sortbar__group">
            {sortOptions.map((field) => {
              const isActive = field === activeSort.field;
              return (
                <button
                  key={field}
                  type="button"
                  className={isActive ? "topics-sortbar__btn is-active" : "topics-sortbar__btn"}
                  aria-pressed={isActive}
                  onClick={() => onSort(field)}
                >
                  {SORT_LABELS[field]}
                  {isActive && (
                    <span className="topics-sortbar__arrow" aria-hidden="true">
                      {activeSort.dir === "desc" ? " ↓" : " ↑"}
                    </span>
                  )}
                </button>
              );
            })}
          </span>
        </>
      )}
      {showDensityToggle && (
        <>
          <span className="topics-sortbar__spacer" />
          <span className="topics-sortbar__label">View</span>
          <span className="topics-sortbar__group">
            {DENSITIES.map((d) => (
              <button
                key={d}
                type="button"
                className={d === density ? "topics-sortbar__btn is-active" : "topics-sortbar__btn"}
                aria-pressed={d === density}
                onClick={() => onDensity(d)}
              >
                {DENSITY_LABEL[d]}
              </button>
            ))}
          </span>
        </>
      )}
    </div>
  );
}
