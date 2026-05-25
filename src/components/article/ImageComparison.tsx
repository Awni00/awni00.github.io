import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from "react-compare-slider";

type ImageComparisonProps = {
  leftSrc: string;
  rightSrc: string;
  leftAlt?: string;
  rightAlt?: string;
  leftLabel?: string;
  rightLabel?: string;
  position?: number;
};

export default function ImageComparison({
  leftSrc,
  rightSrc,
  leftAlt = "",
  rightAlt = "",
  leftLabel = "Before",
  rightLabel = "After",
  position = 50
}: ImageComparisonProps) {
  return (
    <div className="image-comparison" aria-label={`${leftLabel} and ${rightLabel} comparison`}>
      <ReactCompareSlider
        boundsPadding="0"
        itemOne={<ReactCompareSliderImage src={leftSrc} alt={leftAlt} />}
        itemTwo={<ReactCompareSliderImage src={rightSrc} alt={rightAlt} />}
        defaultPosition={position}
      />
      <div className="image-comparison__labels" aria-hidden="true">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
