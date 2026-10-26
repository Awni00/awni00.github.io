import type { JustifyMinWidth, ThemeConfig } from "../../config/types";
import type { ConfigIssues } from "../home/hero";

export type JustifyConfig = ThemeConfig["typography"]["justify"];

const MIN_WIDTHS: readonly JustifyMinWidth[] = ["all", "tablet"];

/** Check `theme.typography.justify`. */
export function validateJustifyConfig(justify: JustifyConfig): ConfigIssues {
  const errors: string[] = [];
  const at = "theme.typography.justify";
  if (typeof justify?.enabled !== "boolean") errors.push(`${at}.enabled must be true or false.`);
  if (typeof justify?.hyphenate !== "boolean") errors.push(`${at}.hyphenate must be true or false.`);
  if (!MIN_WIDTHS.includes(justify?.minWidth)) {
    errors.push(`${at}.minWidth is ${JSON.stringify(justify?.minWidth)}; expected "all" or "tablet".`);
  }
  return { errors, warnings: [] };
}

/**
 * The classes that justify one prose container, or none.
 *
 * `override` is the page's `article.justify` frontmatter: it switches
 * justification on or off for that page, keeping the site's `hyphenate` and
 * `minWidth`. The CSS (`.prose-justify` in globals.css) applies only to the
 * container's own paragraphs and list items, so asides, callouts, figures,
 * tables, and code inside it stay left-aligned.
 */
export function justifyClasses(justify: JustifyConfig, override?: boolean): string[] {
  if (!(override ?? justify.enabled)) return [];
  return [
    "prose-justify",
    justify.hyphenate && "prose-justify--hyphenate",
    justify.minWidth === "tablet" && "prose-justify--tablet"
  ].filter((name): name is string => Boolean(name));
}
