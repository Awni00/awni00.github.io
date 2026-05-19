import type { TopicsDensity } from "../../config/writing";

const DENSITIES: TopicsDensity[] = ["comfortable", "minimal", "dense"];

const DENSITY_LABEL: Record<TopicsDensity, string> = {
  comfortable: "Comfortable",
  minimal: "Minimal",
  dense: "Dense"
};

type Props = {
  density: TopicsDensity;
  onDensity: (d: TopicsDensity) => void;
};

export default function DensityToggle({ density, onDensity }: Props) {
  return (
    <span className="density-toggle">
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
    </span>
  );
}
