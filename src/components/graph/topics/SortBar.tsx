import type { TopicsDensity, TopicsSort, TopicsSortField } from "../../../config/writing";
import DensityToggle from "../DensityToggle";
import { SORT_LABELS } from "./sort";

type SortBarProps = {
  sortOptions: readonly TopicsSortField[];
  activeSort: TopicsSort;
  onSort: (field: TopicsSortField) => void;
  showDensityToggle: boolean;
  density: TopicsDensity;
  onDensity: (d: TopicsDensity) => void;
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
          <DensityToggle density={density} onDensity={onDensity} />
        </>
      )}
    </div>
  );
}
