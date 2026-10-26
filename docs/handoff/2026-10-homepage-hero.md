# Homepage Hero Redesign: Implementation Handoff

> Copied from the handoff bundle at
> `/Users/awni/Documents/project-code/awni00.github.io/.scratch/home-hero-handoff/`
> (outside this repo). "This folder" below means that bundle: its 16 MB of
> `screenshots/` and the `reference/` mockup were deliberately not copied here.

Date: 2026-10-25. The design was reached with the site owner (awni00.github.io) through a layout survey and two rounds of mockups.
Target repo: `academic-map-template`. The downstream site syncs it afterwards.

Bundle contents (this folder):

- `screenshots/before-current-*`: the hero as it is today (desktop 1440, tablet 768, phone 390).
- `screenshots/final-{medium,long}-{dark,light}-*`: **the target design**, with the defaults below, at all three widths. These are the reference for visual acceptance.
- `screenshots/variant-*`: non-default settings (photo on the right, justified text, sticky card, short bio).
- `reference/mock.html`: a working HTML/CSS reference for the whole hero, driven by query params: `side`, `w`, `radius`, `fit`, `text`, `phone`, `dlinks`, `mlinks`, `sticky`, `len`, `theme`. Its theme tokens and fonts are copied from the site's build. Serve the folder over HTTP to view it, e.g. a tiny static server; `file://` won't load the images in the browser pane.
- `reference/index.html`: the review grid of all widths. `reference/links.html`: link-style close-ups at 1:1.
- `reference/layout-survey-notes.json`: the survey of 11 academic homepages that motivated the direction.

## 1. Problem (before)

The current `.hero` (`src/styles/globals.css` ~L403–450, plus the 820px breakpoint ~L1156–1172; markup in `src/layouts/HomeLayout.astro`) is a grid of `minmax(0,1fr) 168px` beside the **whole** bio:

- The photo is 168px tall next to ~1,200px of text, leaving ~1,050px of empty column under the photo.
- The text is capped at 70ch (630px), but the photo is pinned to the 1100px container edge, leaving ~300px of dead space between them.
- Name, photo, and links are scattered; the social links fall below the first screen at every width.
- Tablet: the 820px breakpoint collapses at 768 even though there is room. The photo becomes a lone 96px circle, and the name appears twice (header and h1).

## 2. Target design ("A3: margin card")

The photo and a short identity caption sit in a card **beside** the bio column. The text never wraps around the card.

### Structure

```
<section class="hero">
  <aside class="hero-card">          <!-- FIRST in source order, so it stacks above the bio on phone -->
    <img>                            <!-- rounded square, object-fit: cover, configurable focal point -->
    <div class="hero-caption">       <!-- name (optional), role, affiliation, extra lines -->
    <nav class="hero-links">         <!-- link pills -->
  </aside>
  <div class="hero-bio">…MDX bio…</div>
</section>
```

Put the card first in the source and place it with **explicit grid columns**, not `order`. The mockup's first version used `order:-1`, which didn't apply once the layout stopped being a grid, so the card landed below the bio on phone.

### Desktop (> 900px)

- Grid: `[photo-w] [gap 56px] [text]`, with `align-items: start`. With `photo.side: "right"`, the columns mirror via `grid-column` assignment.
- Photo width defaults to **240px**. Text column `minmax(0, 1fr)`, so it fills the remaining container width (see §4).
- Caption: Inter (`--font-ui`); name 15px/600, role 13px `--color-fg-soft`, affiliation 13px `--color-muted`; 12px below the photo.
- Links: **pills** in an equal-width 3-column grid that spans exactly the photo width, so both edges line up with the photo (see `final-*-desktop.png`). Each pill: 1px `--color-border` outline, radius 999px, 12.5px label, 12px icon, ~6px vertical padding, 6px gaps. On hover, border and label turn `--color-accent`.

### Tablet (561–900px)

- **Same two-column structure. No float or wrapping.** The card is `0.75 × photo-w` (180px at the default) with a 32px gap.
- Caption is 1px smaller. Links are pills (wrapping flex), with tap targets ≥ 44px (min-height 40px plus 8px gaps).

### Phone (≤ 560px)

- `phone.layout: "centered"` (the default): the card stacks centered above the bio. Photo 160px; caption and pills centered. Pills are 40px tall, 14px labels, wrapping (2 rows of 3 at 390px).
- `phone.layout: "compact"`: a 76px photo on the left, with the caption and links beside it, in one row above the bio.

### Bug to avoid (found in the mockups)

At phone width, a side-specific rule (`.side-left.margin .card { float:left }`, 3 classes) out-specified the phone rule (`.ph-center .card { float:none }`, 2 classes). As a result, `side: left` kept wrapping on phone while `side: right` looked correct. Keep breakpoint overrides at least as specific as the side variants, or avoid side-specific layout rules below the tablet breakpoint entirely. **Test both sides at all three widths.**

## 3. Configuration (site config)

Fit these into the existing `site.homepage.hero` (currently `{ enabled }`) and `theme.typography`. Document every setting in `docs/configuration.md`, and add validation with clear error messages.

```ts
site.homepage.hero = {
  enabled: true,
  photo: {
    side: "left",             // "left" | "right"
    width: 240,               // px, desktop; clamp/validate to 180–300; tablet = 0.75×; phone fixed 160
    shape: "rounded",         // "rounded" | "circle" | "square"
    radius: 12,               // px, used by "rounded"
    position: "50% 22%",      // CSS object-position focal point for the square crop
    sticky: false,            // card stays in view while a long bio scrolls (desktop + tablet only)
  },
  caption: {
    showName: true,           // the header already shows the name; some sites will hide it here
    extra: [],                // optional extra lines, e.g. ["he/him", "On the academic job market, 2027"]
  },
  links: {
    show: ["email", "cv", "scholar", "github", "x", "linkedin"],  // which links appear in the hero, and their order (keys of site.links)
    style: { desktop: "pills", mobile: "pills" },                  // each: "pills" | "icons" | "list" | "text"
  },
  phone: { layout: "centered" },                                   // "centered" | "compact"
};
```

- **Link styles.** All four are in `reference/links.html`. On touch screens, every style must give each link a tap target ≥ 44px, whichever style is chosen.
  - `pills`: icon + label.
  - `icons`: icons spread across the photo width on desktop; 44px targets on touch.
  - `list`: two columns of icon + label with no chrome.
  - `text`: the current "Email · CV · …" row.
- **Custom links.** Besides the known keys, allow `site.links` entries of the form `{ label, href, icon }` (e.g. ORCID, Bluesky, Semantic Scholar) through a small icon registry. Prefer **bundled inline SVG icons**, not a runtime CDN (the mockup uses Font Awesome and Academicons from cdnjs only for speed). Use a document-style icon for CV; the Academicons "cv" glyph reads as "cv CV" next to its label.
- **No photo.** If `profileImage` is unset, the hero degrades to the text column alone, with the caption and links rendered above the bio.
- Fixed (not configurable): overall structure, breakpoints, gaps, reading measure, caption typography and order, tap-target sizes.

## 4. Site-wide content width (equal margins)

The owner wants equal left and right margins, with the header, hero, and later sections sharing the same edges, **consistently on every page**.

- Narrow the site container (`--content-wide`, currently 1100px in `src/styles/tokens.css`; used by the header, footer, homepage, etc. in `globals.css` lines ~77, 118, 221, 405, 454) to the hero's width. The default is about **1020px**: 660px text + 56px gap + 240px photo + 2 × 32px padding.
- Make the width configurable (e.g. `layout.contentWidth`). Because the hero's text column is `1fr`, the hero always spans the container exactly. Have validation warn if the resulting text measure falls outside ~520–720px.
- **Audit every page that used 1100px** (blog/graph browser, publications, entry pages with margin asides, the topics view), with before/after screenshots. The narrower container must not break the graph browser or the publications layout. If a page truly needs more width, give it an explicit wide variant instead of changing the shared token.

## 5. Site-wide text justification (new feature)

- `theme.typography.justify = { enabled: false, hyphenate: true, minWidth: "all" }`, where `minWidth` is `"all"` or `"tablet"` (i.e. ragged on phone). Default off, which keeps the current ragged-right text with `text-wrap: pretty`.
- When enabled, use `text-align: justify` (plus `hyphens: auto` when `hyphenate`) on **prose paragraphs and list items only**: homepage bio, custom pages, article bodies. Headings, captions, figure and table text, code, asides/margin notes, the publication list, and graph UI stay left-aligned. `hyphens` needs `<html lang>`, which the layout should already set; verify it.
- Per-page override in frontmatter, e.g. `article.justify: true | false`, following the existing per-entry `article` override pattern.
- See `screenshots/variant-justified-*` for the hero bio. Show a justified article page in the before/after set as well.

## 6. Process and acceptance

1. Work on a branch (e.g. `feat/homepage-hero-redesign`). Don't merge to `main` or push without the owner's OK.
2. Implement it in template-owned code (`HomeLayout.astro`, the hero component, `globals.css`/`tokens.css`, `src/config/*`, `docs/`). Keep the template's existing token names and theme system; don't hard-code colors.
3. Tests: unit tests for config resolution and validation (width clamp, side, link keys, custom links, justify). Playwright checks at 1440, 768, and 390 for:
   - no horizontal scroll;
   - card above the bio on phone;
   - card beside the bio, with no text wrapping under it, on tablet and desktop;
   - link tap targets ≥ 44px on touch viewports;
   - both `side` values.
4. **Visual verification is required.** For each width in each theme, put a BEFORE screenshot (current `main`) next to an AFTER screenshot, and compare the AFTER against `screenshots/final-*`. Do the same for the container audit in §4 and justification in §5. Show these to the owner in the browser pane.
5. Run `npm run validate`, `npm run test`, and `npm run build` until all pass.
6. Write a short summary for the downstream sync: which new config keys the site should set. The owner's site will use the defaults above with `photo.side: "left"`.
