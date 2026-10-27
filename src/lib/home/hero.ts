import type {
  CustomLink,
  HeroConfig,
  HeroLinkStyle,
  HeroPhoneLayout,
  HeroPhotoShape,
  HeroPhotoSide,
  ThemeConfig
} from "../../config/types";
import { isHeroIconName } from "./heroIcons";

/**
 * Resolution and validation for the homepage hero and the site-wide content
 * width that the hero is sized against.
 *
 * Kept free of config imports so the unit tests can feed it any shape. The
 * resolved config (`src/config/resolve.ts`) runs these once: errors throw
 * there, which stops `astro build` and the dev server; warnings are reported
 * by `npm run validate`.
 */

export const HERO_PHOTO_WIDTH = { min: 180, max: 300 } as const;
/** Fixed gap between the card and the bio on desktop. Tablet uses 32px. */
export const HERO_GAP = 56;
/** Fixed desktop page gutter, included in `theme.layout.contentWidth`. */
export const PAGE_GUTTER = 32;
/** The bio measure, in px, outside which validation warns. */
export const HERO_MEASURE = { min: 520, max: 720 } as const;
export const CONTENT_WIDTH = { min: 640, max: 1600 } as const;

const PHOTO_SIDES: readonly HeroPhotoSide[] = ["left", "right"];
const PHOTO_SHAPES: readonly HeroPhotoShape[] = ["rounded", "circle", "square"];
const LINK_STYLES: readonly HeroLinkStyle[] = ["pills", "icons", "list", "text", "text-icons"];
const PHONE_LAYOUTS: readonly HeroPhoneLayout[] = ["centered", "compact"];

export type ConfigIssues = { errors: string[]; warnings: string[] };

export type HeroLink = {
  key: string;
  label: string;
  href: string;
  icon: string;
};

/** Display labels for the keys the template knows; anything else is title-cased. */
const KNOWN_LINK_LABELS: Record<string, string> = {
  email: "Email",
  cv: "CV",
  scholar: "Scholar",
  github: "GitHub",
  gitlab: "GitLab",
  x: "Twitter",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  orcid: "ORCID",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  threads: "Threads",
  "semantic-scholar": "Semantic Scholar",
  researchgate: "ResearchGate",
  arxiv: "arXiv",
  youtube: "YouTube",
  website: "Website",
  rss: "RSS"
};

/**
 * Check the hero block and return it with the photo width clamped into range.
 * Enum and type mistakes are errors; an out-of-range width is a warning,
 * because the clamped value is a reasonable reading of what was meant.
 */
export function normalizeHeroConfig(hero: HeroConfig): { hero: HeroConfig } & ConfigIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  const at = "site.homepage.hero";

  checkEnum(errors, `${at}.photo.side`, hero.photo.side, PHOTO_SIDES);
  checkEnum(errors, `${at}.photo.shape`, hero.photo.shape, PHOTO_SHAPES);
  checkEnum(errors, `${at}.links.style.desktop`, hero.links.style.desktop, LINK_STYLES);
  checkEnum(errors, `${at}.links.style.mobile`, hero.links.style.mobile, LINK_STYLES);
  checkEnum(errors, `${at}.phone.layout`, hero.phone.layout, PHONE_LAYOUTS);

  let width = hero.photo.width;
  if (typeof width !== "number" || !Number.isFinite(width)) {
    errors.push(`${at}.photo.width must be a number of pixels, got ${JSON.stringify(width)}.`);
    width = 240;
  } else if (width < HERO_PHOTO_WIDTH.min || width > HERO_PHOTO_WIDTH.max) {
    const clamped = Math.min(HERO_PHOTO_WIDTH.max, Math.max(HERO_PHOTO_WIDTH.min, width));
    warnings.push(
      `${at}.photo.width is ${width}px; using ${clamped}px (allowed ${HERO_PHOTO_WIDTH.min}–${HERO_PHOTO_WIDTH.max}).`
    );
    width = clamped;
  }

  if (typeof hero.photo.radius !== "number" || !(hero.photo.radius >= 0)) {
    errors.push(`${at}.photo.radius must be a number of pixels, 0 or more, got ${JSON.stringify(hero.photo.radius)}.`);
  }
  if (typeof hero.photo.position !== "string" || !hero.photo.position.trim()) {
    errors.push(`${at}.photo.position must be a CSS object-position such as "50% 22%".`);
  } else if (/[;{}<>]/.test(hero.photo.position)) {
    errors.push(`${at}.photo.position "${hero.photo.position}" is not a valid object-position.`);
  }
  checkStringArray(errors, `${at}.caption.extra`, hero.caption.extra);
  checkStringArray(errors, `${at}.links.show`, hero.links.show);

  return {
    hero: { ...hero, photo: { ...hero.photo, width: Math.round(width) } },
    errors,
    warnings
  };
}

/**
 * Check `site.links`. A value is a URL string, or a `{ label, href, icon }`
 * object for a link the template has no built-in label for.
 */
export function validateSiteLinks(links: Record<string, unknown>): ConfigIssues {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(links ?? {})) {
    if (typeof value === "string") continue;
    if (!isRecord(value)) {
      errors.push(`site.links.${key} must be a URL string or { label, href, icon }.`);
      continue;
    }
    if (typeof value.label !== "string" || !value.label.trim()) {
      errors.push(`site.links.${key} needs a non-empty "label".`);
    }
    if (typeof value.href !== "string" || !value.href.trim()) {
      errors.push(`site.links.${key} needs a non-empty "href".`);
    }
    if (value.icon !== undefined && (typeof value.icon !== "string" || !isHeroIconName(value.icon))) {
      warnings.push(
        `site.links.${key}.icon "${String(value.icon)}" is not a bundled icon; a generic link icon is used. See src/lib/home/heroIcons.ts.`
      );
    }
  }
  return { errors, warnings };
}

/**
 * Keys in `links.show` with no matching `site.links` entry. These are skipped
 * when rendering; the warning is only worth giving when the site wrote the
 * list itself, since the default list names links most sites never set.
 */
export function missingHeroLinkKeys(show: readonly string[], links: Record<string, unknown>): string[] {
  return show.filter((key) => !hasLink(links[key]));
}

/** The links the hero renders, in `show` order, with labels and icons filled in. */
export function resolveHeroLinks(
  show: readonly string[],
  links: Record<string, string | CustomLink>
): HeroLink[] {
  const seen = new Set<string>();
  const resolved: HeroLink[] = [];
  for (const key of show) {
    if (seen.has(key)) continue;
    seen.add(key);
    const value = links[key];
    if (!hasLink(value)) continue;
    if (typeof value === "string") {
      resolved.push({ key, label: KNOWN_LINK_LABELS[key] ?? titleCase(key), href: value, icon: key });
    } else {
      resolved.push({ key, label: value.label, href: value.href, icon: value.icon ?? key });
    }
  }
  return resolved;
}

/** Check `theme.layout`. */
export function validateLayoutConfig(layout: ThemeConfig["layout"]): ConfigIssues {
  const errors: string[] = [];
  const width = layout?.contentWidth;
  if (typeof width !== "number" || !Number.isFinite(width)) {
    errors.push(`theme.layout.contentWidth must be a number of pixels, got ${JSON.stringify(width)}.`);
  } else if (width < CONTENT_WIDTH.min || width > CONTENT_WIDTH.max) {
    errors.push(
      `theme.layout.contentWidth is ${width}px; it must be between ${CONTENT_WIDTH.min} and ${CONTENT_WIDTH.max}.`
    );
  }
  return { errors, warnings: [] };
}

/** The bio's line length on a wide desktop: the content box minus the card and the gap. */
export function heroTextMeasure(contentWidth: number, photoWidth: number): number {
  return contentWidth - 2 * PAGE_GUTTER - HERO_GAP - photoWidth;
}

/**
 * A warning when the content width and photo width leave the bio too narrow
 * or too wide to read comfortably, or null. A hero without a photo keeps the
 * same measure, so the check is the same either way.
 */
export function textMeasureWarning(contentWidth: number, photoWidth: number): string | null {
  const measure = heroTextMeasure(contentWidth, photoWidth);
  if (measure >= HERO_MEASURE.min && measure <= HERO_MEASURE.max) return null;
  return (
    `The homepage bio measure is ${measure}px (theme.layout.contentWidth ${contentWidth} − ` +
    `${2 * PAGE_GUTTER} gutters − ${HERO_GAP} gap − ${photoWidth} photo); ` +
    `${HERO_MEASURE.min}–${HERO_MEASURE.max}px reads best.`
  );
}

function checkEnum<T extends string>(errors: string[], path: string, value: unknown, allowed: readonly T[]): void {
  if (!allowed.includes(value as T)) {
    errors.push(`${path} is ${JSON.stringify(value)}; expected one of ${allowed.map((v) => `"${v}"`).join(", ")}.`);
  }
}

function checkStringArray(errors: string[], path: string, value: unknown): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push(`${path} must be an array of strings.`);
  }
}

function hasLink(value: unknown): value is string | CustomLink {
  if (typeof value === "string") return value.trim() !== "";
  return isRecord(value) && typeof value.href === "string" && value.href.trim() !== "";
}

function titleCase(key: string): string {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
