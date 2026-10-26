# Website Migration Roadmap

Moving awni.xyz from the old Jekyll (al-folio) site to the academic-map template.
Started 2026-10-12. Items from `TODO.md` are folded in here.

Owner tags: **(you)** is prose you write. **(claude)** is scaffolding, config, data, and plumbing.
Open decisions are marked **DECIDE**.

**Launch scope:** sections 1–8 must land before cutover. Section 9 comes after launch.

**Working principle for every session (this one and dispatched ones):** keep it visual. Use mockups for design work and before/after screenshots for changes, so each step is concrete and easy to review.

---

## 0. Decisions

- [x] Research areas (2026-10-25): three hubs, under `/blog/topics/<slug>` so they don't look like paper pages (e.g. `/blog/topics/abstraction` vs `/blog/abstractor`). Papers can belong to several hubs.
  - `/blog/topics/abstraction`, **Inductive Biases for Abstraction**: Abstractors, RelConvNet, DAT, Relational Bottleneck, Relation-function approx., Recursive latent reasoning
  - `/blog/topics/reasoning`, **Reasoning in Transformers & LLMs**: Recursive latent reasoning, CoT Information, Latent strategies, Transformer theories
  - `/blog/topics/theory`, **Theoretical Foundations**: CoT Information, Relation-function approx., Info-structure RL, Decentralized MARL, Transformer theories
- [ ] **DECIDE (near launch): News.** Keep it off, or turn it on?
- [x] Blog URL layout: flat. Papers and posts at `/blog/<slug>`, hubs at `/blog/topics/<slug>`.
- [x] Teaching: page removed. TA roles go in the CV, which you'll update yourself (not tracked here).
- [x] About page: deleted.
- [x] geneDRAGNN: omitted (no page, and commented out of the bib).
- [x] Template backlog: triaged in a separate session in `academic-map-template`, with its hand-off at `docs/handoff/2026-10-triage.md` there.

## 1. Blog restructure: `/writing` → `/blog` ✅ (2026-10-12)

- [x] `writing.route: "/blog"`, label "Blog", RSS at `/blog/rss.xml`. Nav is Home · Research · Blog · Publications · CV. Homepage preview → `/blog`.
- [x] Flattened `src/content/writing/research/*` → `src/content/writing/*`. Rewrote every `/writing/research/...` link in content and the bib.
- [x] Moved assets `public/writing/research/<slug>/` → `public/blog/<slug>/`.
- [x] Replaced the 5 hand-written redirect stubs with `shortUrl:` frontmatter (`/abstractor`, `/cot-info`, `/dual-attention`, `/relational-convolutions`, `/algorithmic-generalization-transformer-architectures`).
- [x] Renamed `disentangling-latent-llm-modes.mdx` → `latent-strategies-in-lms.mdx`, matching the public code repo. Added arXiv and code links and the venue.
- [ ] (you) Leftover TODOs in `latent-strategies-in-lms.mdx` frontmatter: aliases and summary.
- [ ] Misc projects (dot-tasks, slurmkit, neurol) are still drafts under `writing/misc-projects/`. Decide on a "Projects" hub when they're published (post-launch).
- Note: `uncovering-latent-strategies-in-lms.mdx` is a draft holding your intro notes for the blog post. It was left in place (it's a draft, so it isn't built).

## 2. Research page + area hubs

- [x] (claude) Created `src/content/pages/research.mdx` → `/research` (placeholder body), with the nav pointing at it.
- [x] (claude) Deleted the `writing/research/index.mdx` hub and removed `research` from every entry's `links`.
- [x] (claude) Scaffolded the three hubs in `src/content/writing/topics/<slug>/index.mdx`, with two-way links between each hub and its papers. *Transformer theories* links to its hubs from its own page only; add it to the hubs' `links` when it's published.
- [ ] (you) Write the Research page: overview of the areas, linking to each hub.
- [ ] (you) Draft the hub/topic pages: intro and `summary` for `abstraction`, `reasoning`, and `theory`. Validation warns until the summaries exist. Discuss or refine with Claude as needed.

## 3. Publications

- [x] Added *Uncovering Latent Reasoning Strategies in Language Models* (arXiv 2607.17674). Checked against Google Scholar; it's the only new paper, with no new acceptances.
- [x] Commented out geneDRAGNN (`@comment`).
- [x] Fixed the *Relational Bottleneck* author list in the bib and on the page (added Segert, Giallanza, Dulberg, per arXiv).
- [x] Added `blog` links for every paper that has a page, plus arXiv IDs for Decentralized MARL and Relational Bottleneck.
- [x] Added *Putting Transformer Theories to the Test* to the bib, with placeholders listed in a note above the entry: arXiv ID, `blog` link, preview, tldr.
- [ ] **Launch check:** that paper now renders on `/publications`. If launch happens before the arXiv announcement, decide whether to show it.
- [ ] `tldr` for the two new papers (latent strategies, transformer theories). **(you)**
- [x] **Preview-image redesign ✅ (2026-10-26).** Every publication preview is replaced with one minimalist, algorithmic style.
  - Each image is a seeded p5.js sketch in `preview-art/papers/<slug>/`; the alternates you liked are kept there too.
  - `preview-art/selection.json` records the pick for each paper. `preview-art/README.md` covers the style guide and the render/export commands.
  - The site serves 800×600 WebPs at `public/publications/<slug>.webp`, 11–118 KB each (the old PNGs were up to 6.9 MB).
  - Two picks are animated loops (Unlocking OOD, Relational Bottleneck). Each has a static version in `preview-art/`.
  - The two new papers now have previews, and the nine old PNGs are deleted.
- [x] Decided (2026-10-26): keep `public/publications/genedraggn-genai-2.png` for now. The commented-out geneDRAGNN entry still points to it.
- [ ] Choose which papers are `selected`. All 10 currently are, and the homepage shows 6.
- [ ] Optional: several bib `abstract` fields are shortened versions of the paper abstracts. Keep them short, or use the full text?
- [ ] Sync each page's frontmatter `bibtex:` with the canonical citation (also see the CITE item in the backlog).

## 4. Abstract-only paper pages ✅ (2026-10-12)

- [x] New: `/blog/relation-function-approximation`, with the full arXiv abstract. Summary finalized. **(you) Review** the `tags` I drafted.
- [x] Switched to `article.mode: abstract` with full arXiv abstracts (the old ones were truncated): Decentralized MARL, Info-structure RL, Relational Bottleneck.
- [ ] *Putting Transformer Theories to the Test*: draft page created (`transformer-theories.mdx`, abstract-only, `draft: true`). Not yet announced on arXiv (`submit/8270939`). Authors filled in. **(you)** still need the date and summary. Once the arXiv ID exists, add a bib entry and remove `draft`.
- [x] Hub links added to all paper pages.

## 5. Homepage

- [ ] (you) Draft the updated bio and summary of research interests in `home.mdx`: shorter, current, and pointing to `/research`. Strip the scratch notes and TODOs.
- [ ] **Homepage layout redesign** (the profile-picture placement looks awkward). It's a template change, so it's implemented upstream in `academic-map-template`:
  1. Discuss, then survey reference academic homepages: how they lay out the photo against the bio, and how that adapts across screen sizes.
  2. Mock up several designs (sub-agents allowed) at phone, tablet, and desktop widths, using sample texts of representative lengths (short, medium, long bio). Iterate.
  3. Hand the chosen mockup to a session in `academic-map-template` to implement responsively, with before/after screenshots. Then sync the template downstream.
- [ ] (claude) Check section layout and length once the bio is final. Possibly retitle the homepage preview ("Research Writing") to fit "Blog".
- [ ] Affiliation display (from `TODO.md`). Clarify what's missing.

## 6. Teaching / About / CV ✅

- [x] Deleted `teaching.mdx` and `about.mdx`. Removed Teaching from the nav.

## 7. Theme and visuals

- [ ] Pick a light/dark theme pair. Compare the built-ins at `/fixtures/themes` in dev, or define a custom theme in `src/site/themes.ts`.
- [ ] Fonts (`src/site/fonts.ts`), if you want something other than the defaults.
- [ ] Replace the template-placeholder `public/og-image.svg`. Check the favicon.

## 8. Launch cutover (at the end, with your OK at each step)

The live site is still Jekyll, served from the `gh-pages` branch (Pages "legacy" build). The default branch is `master`.
The `deploy` workflow on `main` builds fine, but the `github-pages` environment's branch protection rejects `main`.

- [x] Pushed `archive/jekyll-site-2026-05-24` to origin.
- [ ] Pre-flight: `npm run validate && npm run build && npm run test`, check 404, sitemap, RSS, and page weight.
- [ ] Commit `.nvmrc` (20 → 22, matches CI) and remove `.jekyll-cache/`.
- [ ] GitHub settings: allow `main` in the `github-pages` environment, set the Pages source to "GitHub Actions", and confirm the `awni.xyz` CNAME.
- [ ] Set the default branch to `main`. Then decide on deleting `master` and `gh-pages`, and prune the old `sync/template-*` branches.
- [ ] Old-URL check: `/publications/` and `/cv/` work. Old al-folio `/teaching/`, `/blog/`, and `/projects/` paths either resolve or are fine to 404.

## 9. After launch

- [ ] Finish the blog post for the latent-reasoning-strategies paper.
- [ ] Misc-project posts (dot-tasks, slurmkit, …) and maybe a "Projects" hub.

## Template backlog (fix upstream in academic-map-template, then sync)

Being triaged in the separate session (see section 0). Items:
- [ ] Bug: some graph nodes are clickable/hoverable and others aren't.
- [ ] Bug: the React graph possibly re-renders repeatedly.
- [ ] Bug: `featured:` frontmatter does nothing.
- [ ] Homepage layout configurability (Selected Publications width when News is off; general component layout).
- [ ] "Recent Writing" as a single row or carousel.
- [ ] Option to hide backlinks. Rename "Outgoing"; maybe undirected links.
- [ ] Rename the "Publisher" link and the "VENUE" header label.
- [ ] Restyle the publication link buttons.
- [ ] CITE: control which BibTeX fields are shown.
- [ ] Performance pass.
- [ ] **New (2026-10-12, not in the triage session's list):** `tests/unit/routes.test.ts` and `tests/unit/shortLinks.test.ts` hardcode `/writing` but read the site config. Any downstream site that sets `writing.route` fails 9 tests. The tests should run against template defaults.
- [ ] **New:** the publications list doesn't render math in abstracts, so the bib abstract for the latent-strategies paper uses plain-text formulas.
- [ ] **New (2026-10-25):** the blog browser hardcodes "Writing" / "All writing" (`src/components/graph/GraphBrowser.tsx:169,187`) instead of using `writing.label`, so it shows "Writing" even with the label set to "Blog".
- [ ] **New (2026-10-25):** `/blog/topics` (the parent of the hub URLs) returns a 404. Make it redirect to the browser's topics view, `/blog?view=topics`.
- [ ] **New (2026-10-25), separate session:** the blog map opens with a hub pre-selected in the info sidebar, but the graph shows no selection (no halo). It should open with nothing selected.
- [ ] **New (2026-10-26):** publication previews render at only about 74×55 px on desktop, too small for the new preview art to read. A larger desktop tile, or an enlarge-on-hover, would help. On mobile they are fine (about 220×165).
- [ ] **New (2026-10-26):** animated previews (an animated WebP in the `preview` field) can't respect `prefers-reduced-motion`. Add an optional still field (e.g. `preview_still`), rendered with `<picture>` and a `(prefers-reduced-motion: reduce)` source. The stills already exist in `preview-art/`.
- [ ] **New (2026-10-26):** previews are light tiles only. Add an optional dark-mode variant field (e.g. `preview_dark`). `preview-art/` already renders a dark (`ink`) version of every pick.
- [ ] `dot-tasks` setup for this repo (`.tasks/` exists, with one stale todo about theming support).
