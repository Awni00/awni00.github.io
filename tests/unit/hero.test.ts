import { describe, expect, it } from "vitest";

import { configWarnings, siteConfig, themeConfig } from "../../src/config/resolve";
import { defaultSiteConfig } from "../../src/config/defaults/site";
import type { HeroConfig } from "../../src/config/types";
import { justifyClasses, validateJustifyConfig } from "../../src/lib/article/justify";
import {
  heroTextMeasure,
  missingHeroLinkKeys,
  normalizeHeroConfig,
  resolveHeroLinks,
  textMeasureWarning,
  validateLayoutConfig,
  validateSiteLinks
} from "../../src/lib/home/hero";
import { getHeroIcon, heroIcons, isHeroIconName } from "../../src/lib/home/heroIcons";

const defaults = defaultSiteConfig.homepage.hero as unknown as HeroConfig;

function hero(overrides: { [K in keyof HeroConfig]?: Partial<HeroConfig[K]> }): HeroConfig {
  return {
    ...defaults,
    ...overrides,
    photo: { ...defaults.photo, ...overrides.photo },
    caption: { ...defaults.caption, ...overrides.caption },
    links: { ...defaults.links, ...overrides.links },
    phone: { ...defaults.phone, ...overrides.phone }
  } as HeroConfig;
}

describe("resolved hero config", () => {
  it("uses the margin-card defaults", () => {
    const resolved = siteConfig.homepage.hero;
    expect(resolved.enabled).toBe(true);
    expect(resolved.photo).toEqual({
      side: "left",
      width: 240,
      shape: "rounded",
      radius: 12,
      position: "50% 22%",
      sticky: false
    });
    expect(resolved.caption).toEqual({ showName: true, extra: [] });
    expect(resolved.links.show).toEqual(["email", "cv", "scholar", "github", "x", "linkedin"]);
    expect(resolved.links.style).toEqual({ desktop: "pills", mobile: "pills" });
    expect(resolved.phone.layout).toBe("centered");
  });

  it("defaults the page width so the bio measure is 660px", () => {
    expect(themeConfig.layout.contentWidth).toBe(1020);
    expect(heroTextMeasure(themeConfig.layout.contentWidth, 240)).toBe(660);
    expect(configWarnings).toEqual([]);
  });

  it("defaults justification off", () => {
    expect(themeConfig.typography.justify).toEqual({ enabled: false, hyphenate: true, minWidth: "all" });
  });
});

describe("normalizeHeroConfig", () => {
  it("accepts the defaults without issues", () => {
    const result = normalizeHeroConfig(defaults);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.hero).toEqual(defaults);
  });

  it("clamps the photo width to 180–300 with a warning", () => {
    const wide = normalizeHeroConfig(hero({ photo: { width: 400 } }));
    expect(wide.hero.photo.width).toBe(300);
    expect(wide.warnings[0]).toMatch(/photo\.width is 400px; using 300px \(allowed 180–300\)/);
    expect(wide.errors).toEqual([]);

    const narrow = normalizeHeroConfig(hero({ photo: { width: 120 } }));
    expect(narrow.hero.photo.width).toBe(180);

    for (const width of [180, 240, 300]) {
      const ok = normalizeHeroConfig(hero({ photo: { width } }));
      expect(ok.hero.photo.width).toBe(width);
      expect(ok.warnings).toEqual([]);
    }
  });

  it("rejects a non-numeric photo width", () => {
    const result = normalizeHeroConfig(hero({ photo: { width: "240px" as unknown as number } }));
    expect(result.errors[0]).toMatch(/photo\.width must be a number/);
  });

  it("accepts both sides and rejects anything else", () => {
    expect(normalizeHeroConfig(hero({ photo: { side: "left" } })).errors).toEqual([]);
    expect(normalizeHeroConfig(hero({ photo: { side: "right" } })).errors).toEqual([]);
    const bad = normalizeHeroConfig(hero({ photo: { side: "top" as "left" } }));
    expect(bad.errors).toEqual(['site.homepage.hero.photo.side is "top"; expected one of "left", "right".']);
  });

  it("checks shape, link styles, and phone layout", () => {
    const result = normalizeHeroConfig(
      hero({
        photo: { shape: "oval" as "circle" },
        links: { style: { desktop: "buttons" as "pills", mobile: "icons" } },
        phone: { layout: "stacked" as "centered" }
      })
    );
    expect(result.errors).toHaveLength(3);
    expect(result.errors.join("\n")).toMatch(/photo\.shape is "oval"/);
    expect(result.errors.join("\n")).toMatch(/links\.style\.desktop is "buttons"; expected one of "pills", "icons", "list", "text"/);
    expect(result.errors.join("\n")).toMatch(/phone\.layout is "stacked"; expected one of "centered", "compact"/);
  });

  it("checks radius, focal point, and the string arrays", () => {
    const result = normalizeHeroConfig(
      hero({
        photo: { radius: -4, position: "50%; background: red" },
        caption: { extra: [1] as unknown as string[] },
        links: { show: "email" as unknown as string[] }
      })
    );
    expect(result.errors).toHaveLength(4);
    expect(result.errors.join("\n")).toMatch(/radius must be a number of pixels, 0 or more/);
    expect(result.errors.join("\n")).toMatch(/position "50%; background: red" is not a valid object-position/);
    expect(result.errors.join("\n")).toMatch(/caption\.extra must be an array of strings/);
    expect(result.errors.join("\n")).toMatch(/links\.show must be an array of strings/);
  });
});

describe("hero links", () => {
  const links = {
    email: "mailto:me@example.edu",
    cv: "/cv.pdf",
    github: "https://github.com/me",
    scholar: "",
    orcid: { label: "ORCID", href: "https://orcid.org/0000", icon: "orcid" },
    lab: { label: "My Lab", href: "https://lab.example.edu" },
    "personal-site": "https://me.example.edu"
  };

  it("follows the show order and skips keys with no link", () => {
    const resolved = resolveHeroLinks(["github", "scholar", "x", "email", "cv"], links);
    expect(resolved.map((link) => link.key)).toEqual(["github", "email", "cv"]);
    expect(resolved[0]).toEqual({ key: "github", label: "GitHub", href: "https://github.com/me", icon: "github" });
    expect(resolved[2].label).toBe("CV");
  });

  it("resolves custom links and title-cases unknown string keys", () => {
    const resolved = resolveHeroLinks(["orcid", "lab", "personal-site"], links);
    expect(resolved).toEqual([
      { key: "orcid", label: "ORCID", href: "https://orcid.org/0000", icon: "orcid" },
      { key: "lab", label: "My Lab", href: "https://lab.example.edu", icon: "lab" },
      { key: "personal-site", label: "Personal Site", href: "https://me.example.edu", icon: "personal-site" }
    ]);
  });

  it("drops duplicate keys in show", () => {
    expect(resolveHeroLinks(["cv", "cv"], links)).toHaveLength(1);
  });

  it("reports show keys that have no link", () => {
    expect(missingHeroLinkKeys(["email", "x", "scholar", "orcid"], links)).toEqual(["x", "scholar"]);
  });

  it("validates site.links values", () => {
    expect(validateSiteLinks(links)).toEqual({ errors: [], warnings: [] });
    const result = validateSiteLinks({
      noLabel: { href: "https://example.com" },
      noHref: { label: "Thing" },
      wrong: 42,
      oddIcon: { label: "Odd", href: "https://example.com", icon: "sparkle" }
    });
    expect(result.errors).toEqual([
      'site.links.noLabel needs a non-empty "label".',
      'site.links.noHref needs a non-empty "href".',
      "site.links.wrong must be a URL string or { label, href, icon }."
    ]);
    expect(result.warnings[0]).toMatch(/site\.links\.oddIcon\.icon "sparkle" is not a bundled icon/);
  });
});

describe("hero icons", () => {
  it("bundles an icon for every key the template labels", () => {
    for (const key of ["email", "cv", "scholar", "github", "x", "linkedin", "orcid", "bluesky", "semantic-scholar"]) {
      expect(isHeroIconName(key), key).toBe(true);
    }
  });

  it("resolves aliases and falls back to the link icon", () => {
    expect(getHeroIcon("twitter")).toBe(heroIcons.x);
    expect(getHeroIcon("Google-Scholar")).toBe(heroIcons.scholar);
    expect(getHeroIcon("not-an-icon")).toBe(heroIcons.link);
    expect(getHeroIcon(undefined)).toBe(heroIcons.link);
  });

  it("uses a document glyph for the CV, not a letter mark", () => {
    expect(heroIcons.cv.mode).toBe("stroke");
  });
});

describe("content width", () => {
  it("validates theme.layout.contentWidth", () => {
    expect(validateLayoutConfig({ contentWidth: 1020 }).errors).toEqual([]);
    expect(validateLayoutConfig({ contentWidth: 400 }).errors[0]).toMatch(/between 640 and 1600/);
    expect(validateLayoutConfig({ contentWidth: "wide" as unknown as number }).errors[0]).toMatch(/must be a number/);
  });

  it("warns when the bio measure leaves 520–720px", () => {
    expect(textMeasureWarning(1020, 240)).toBeNull();
    expect(textMeasureWarning(1100, 180)).toMatch(/bio measure is 800px/);
    expect(textMeasureWarning(860, 300)).toMatch(/bio measure is 440px/);
  });
});

describe("justification", () => {
  const base = { enabled: false, hyphenate: true, minWidth: "all" as const };

  it("adds no classes when off", () => {
    expect(justifyClasses(base)).toEqual([]);
  });

  it("follows the site setting and its options", () => {
    expect(justifyClasses({ ...base, enabled: true })).toEqual(["prose-justify", "prose-justify--hyphenate"]);
    expect(justifyClasses({ enabled: true, hyphenate: false, minWidth: "tablet" })).toEqual([
      "prose-justify",
      "prose-justify--tablet"
    ]);
  });

  it("lets a page override switch it either way", () => {
    expect(justifyClasses(base, true)).toEqual(["prose-justify", "prose-justify--hyphenate"]);
    expect(justifyClasses({ ...base, enabled: true }, false)).toEqual([]);
  });

  it("validates the config", () => {
    expect(validateJustifyConfig(base).errors).toEqual([]);
    const result = validateJustifyConfig({ enabled: "yes", hyphenate: true, minWidth: "phone" } as never);
    expect(result.errors).toEqual([
      "theme.typography.justify.enabled must be true or false.",
      'theme.typography.justify.minWidth is "phone"; expected "all" or "tablet".'
    ]);
  });
});
