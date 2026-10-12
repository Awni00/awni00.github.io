# Website Migration Roadmap

Moving awni.xyz from the old Jekyll (al-folio) site to the academic-map template.
Started 2026-10-12. Items from `TODO.md` are folded in here.

Owner tags: **(you)** is prose you write. **(claude)** is scaffolding, config, data, and plumbing.
Open decisions are marked **DECIDE**.

**Launch scope:** sections 1–8 must land before cutover. Section 9 comes after launch.

---

## 0. Decisions

- [ ] **DECIDE: research areas.** Pick the hubs. Hub membership comes from links, not folders, so a paper can sit in several hubs. Candidates:
  - Relational reasoning & architectural inductive biases: Abstractor, RelConvNet, DAT, Relational Bottleneck, Relation-function approximation
  - Reasoning & OOD / algorithmic generalization: Recursive latent reasoning, CoT Information, Latent reasoning strategies
  - Statistical / learning-theoretic foundations: CoT Information, Info-structure RL, Relation-function approximation
  - (Multi-agent) reinforcement learning: Info-structure RL, Decentralized MARL
- [ ] **DECIDE (near launch): News.** Keep it off, or turn it on?
- [x] Blog URL layout: flat. Papers and posts at `/blog/<slug>`, hubs at `/blog/<area>`.
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
- [ ] (claude) Scaffold one hub per area once the areas are decided (frontmatter, member-paper links, an empty body). Until then the blog has no hubs.
- [ ] (you) Write the Research page: overview of the areas, linking to each hub.
- [ ] (you) Write each hub's intro.

## 3. Publications

- [x] Added *Uncovering Latent Reasoning Strategies in Language Models* (arXiv 2607.17674). Checked against Google Scholar; it's the only new paper, with no new acceptances.
- [x] Commented out geneDRAGNN (`@comment`).
- [x] Fixed the *Relational Bottleneck* author list in the bib and on the page (added Segert, Giallanza, Dulberg, per arXiv).
- [x] Added `blog` links for every paper that has a page, plus arXiv IDs for Decentralized MARL and Relational Bottleneck.
- [ ] Preview image (`preview = {...}`) and `tldr` for the new paper. **(you)** write the tldr; supply or pick the image.
- [ ] Choose which papers are `selected`. All 10 currently are, and the homepage shows 6.
- [ ] Optional: several bib `abstract` fields are shortened versions of the paper abstracts. Keep them short, or use the full text?
- [ ] Sync each page's frontmatter `bibtex:` with the canonical citation (also see the CITE item in the backlog).

## 4. Abstract-only paper pages ✅ (2026-10-12)

- [x] New: `/blog/relation-function-approximation`, with the full arXiv abstract. **(you) Review** its `summary` and `tags`, which I drafted from the abstract.
- [x] Switched to `article.mode: abstract` with full arXiv abstracts (the old ones were truncated): Decentralized MARL, Info-structure RL, Relational Bottleneck.
- [ ] Add hub links to these pages once the areas are settled (see section 2).

## 5. Homepage

- [ ] (you) Rewrite the bio/intro in `home.mdx`: shorter, current, and pointing to `/research`. Strip the scratch notes and TODOs.
- [ ] (claude) Profile-picture layout and spacing in the hero.
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
- [ ] Optional: alternative abstract preview images for papers.

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
- [ ] `dot-tasks` setup for this repo (`.tasks/` exists, with one stale todo about theming support).
