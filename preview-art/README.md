# Preview art

Sources for the publication preview images. Each image is a small seeded
[p5.js](https://p5js.org) sketch drawn from the site theme's `bg`, `fg` and
`accent`, so every preview can be re-rendered when the theme changes.

```
preview-art/
  STYLE_GUIDE.md        visual system ("Quiet Structure") every sketch follows
  selection.json        paper slug → the version used on the site (null = undecided)
  lib/                  runtime (palette, helpers, harness) and render tools
  papers/<slug>/        one folder per paper; several versions may be kept
    <ID>.js             sketch source (ID = P1, P2, R1, …)
    <ID>.paper.png      1200×900 still, light tile
    <ID>.ink.png        1200×900 still, dark tile
    <ID>.paper.webp     800×600 loop (animated sketches only)
```

## Rendering

From the repo root, with dependencies installed (`npm install`):

```
node preview-art/lib/render.mjs preview-art/papers/cot-info/P2.js   # one sketch
node preview-art/lib/render.mjs --all                               # every kept version
node preview-art/lib/sheet.mjs out.png preview-art/papers/cot-info/*.paper.png   # contact sheet with 96×72 thumbnails
node preview-art/lib/frames.mjs out.png preview-art/papers/<slug>/<ID>.js      # frame strip for an animated sketch
```

Requirements:
- Playwright's Chromium (`npx playwright install chromium`).
- The STIX Two Text font for labels. It ships with macOS and is free from Google Fonts.
- `img2webp` from libwebp for animated sketches.

## Exporting to the site

```
node preview-art/lib/export.mjs              # every paper in selection.json
node preview-art/lib/export.mjs cot-info     # just one
```

This writes `public/publications/<slug>.webp`. Static picks become an 800×600 WebP
of 200 KB or less, and an animated pick's loop is copied as is. The bib's
`preview` field is `<slug>.webp`.

To render with another palette, add the theme's `bg`/`fg`/`accent` to `THEMES`
in `lib/preview-art.js` and pass `--themes <name>`.
