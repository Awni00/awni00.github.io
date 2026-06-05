import type { CSSProperties, ReactNode } from "react";
import { ReactCompareSlider } from "react-compare-slider";

import {
  buildMediaLayoutStyleObject,
  type MediaFit,
  type MediaAlign
} from "./mediaLayout";

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
  class?: string;
  className?: string;
  style?: CSSProperties;
  width?: string;
  maxWidth?: string;
  mediaWidth?: string;
  mediaMaxWidth?: string;
  mediaHeight?: string;
  mediaMaxHeight?: string;
  mediaAspectRatio?: string;
  mediaFit?: MediaFit;
  mediaInset?: string;
  mediaAlign?: MediaAlign;
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
  showLabels = true,
  class: classProp,
  className,
  style,
  width,
  maxWidth,
  mediaWidth,
  mediaMaxWidth,
  mediaHeight,
  mediaMaxHeight,
  mediaAspectRatio,
  mediaFit,
  mediaInset,
  mediaAlign
}: ImageComparisonProps) {
  const firstItem = itemOne ?? imageItem(leftSrc, leftAlt);
  const secondItem = itemTwo ?? imageItem(rightSrc, rightAlt);
  const layoutStyle = buildMediaLayoutStyleObject(
    {
      width,
      maxWidth,
      mediaWidth,
      mediaMaxWidth,
      mediaHeight,
      mediaMaxHeight,
      mediaAspectRatio,
      mediaFit,
      mediaInset,
      mediaAlign
    },
    { directMedia: true }
  ) as CSSProperties;
  const rootClassName = ["image-comparison", classProp, className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClassName}
      style={{ ...layoutStyle, ...style }}
      aria-label={`${leftLabel} and ${rightLabel} comparison`}
    >
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
