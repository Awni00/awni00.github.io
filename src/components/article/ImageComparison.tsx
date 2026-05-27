import type { ReactNode } from "react";
import { ReactCompareSlider } from "react-compare-slider";

type ImageComparisonProps = {
  leftSrc?: string;
  rightSrc?: string;
  leftAlt?: string;
  rightAlt?: string;
  leftLabel?: string;
  rightLabel?: string;
  position?: number;
  itemOne?: ReactNode;
  itemTwo?: ReactNode;
  showLabels?: boolean;
};

export default function ImageComparison({
  leftSrc,
  rightSrc,
  leftAlt = "",
  rightAlt = "",
  leftLabel = "Before",
  rightLabel = "After",
  position = 50,
  itemOne,
  itemTwo,
  showLabels = true
}: ImageComparisonProps) {
  const firstItem = itemOne ?? imageItem(leftSrc, leftAlt);
  const secondItem = itemTwo ?? imageItem(rightSrc, rightAlt);

  return (
    <div className="image-comparison" aria-label={`${leftLabel} and ${rightLabel} comparison`}>
      <ReactCompareSlider
        className="image-comparison__slider"
        suppressHydrationWarning
        boundsPadding="0"
        itemOne={firstItem}
        itemTwo={secondItem}
        defaultPosition={position}
      />
      {showLabels && (
        <div className="image-comparison__labels" aria-hidden="true">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

function imageItem(src: string | undefined, alt: string): ReactNode {
  return src ? <img className="image-comparison__image" src={src} alt={alt} loading="lazy" /> : null;
}
