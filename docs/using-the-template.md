# Using The Template

## Start Locally

```bash
npm install
npm run dev
```

Run checks before publishing:

```bash
npm run validate
npm run build
```

## Edit Site Configuration

Use the site-owned override file:

```txt
src/site/config.ts
```

Most personal choices belong there: name, role, affiliation, homepage section
toggles, navigation, social links, publication author highlighting, graph
styling, theme preferences, and entry type choices.

Do not edit `src/config/defaults/` in a downstream website unless you intend to
diverge from the template.

## Custom Pages

Custom pages live in:

```txt
src/content/pages/
```

Examples:

```txt
src/content/pages/home.mdx      -> /
src/content/pages/research.mdx  -> /research
src/content/pages/foo/bar.mdx   -> /foo/bar
```

Use custom pages for durable website pages such as research, teaching, about,
lab members, resources, or CV notes. These pages are outside the writing graph.

## Writing Entries

Writing entries live in:

```txt
src/content/writing/
```

Required frontmatter:

```yaml
title: "Entry Title"
type: "note"
```

Common optional frontmatter:

```yaml
aliases:
  - Alternative Name
date: "2026-05-24"
summary: "Short description."
venue: "Conference or Journal Name"
tags:
  - learning-theory
links:
  - machine-learning-theory/bias-variance-refresher
draft: false
external:
  arxiv: "https://arxiv.org/abs/..."
  code: "https://github.com/..."
layout:
  width: reading
  asides: margin
  toc:
    minDepth: 2
    maxDepth: 4
```

For paper-style writing entries, `venue` is intentionally stored in entry
frontmatter even if the same paper also appears in `src/data/publications.bib`.
This keeps writing entries portable and prevents article headers from depending
on a BibTeX lookup.

`layout.toc` controls which article heading depths appear in the table of
contents for this entry. Depths map to Markdown heading levels `##` through
`######`; `#` is reserved for the article title rendered by the layout. Omitted
fields inherit from the type-level or global default, which includes `h2` and
`h3`.

Routes mirror the content-relative path:

```txt
src/content/writing/machine-learning-theory/index.mdx
  -> /writing/machine-learning-theory

src/content/writing/machine-learning-theory/bias-variance-refresher.mdx
  -> /writing/machine-learning-theory/bias-variance-refresher
```

Create entries with:

```bash
npm run new:entry -- --type note --title "My Note" --path learning/my-note
```

If the configured entry type owns a folder, the script creates
`path/index.mdx`; otherwise it creates `path.mdx`.

## Graph Links

The writing graph is built from frontmatter `links` and `[[wikilinks]]`.
Ordinary Markdown links do not create graph edges.

```yaml
links:
  - machine-learning-theory
```

```md
This entry links to [[machine-learning-theory]].
This entry links with a label to [[machine-learning-theory|ML theory]].
This relative link points beside the current file: [[./neighbor-entry]].
```

Resolution order:

1. Canonical content path from `src/content/writing`.
2. Relative path from the current entry folder for `./` and `../`.
3. Unique explicit alias.

Use full paths for nested entries unless you define a unique alias.

## Publications And News

Publications are generated from:

```txt
src/data/publications.bib
```

Homepage news comes from:

```txt
src/data/news.yaml
```

Both files are site-owned after adoption.

## Article Components

MDX entries can use built-in technical writing components:

- `Box`
- `Callout`
- `Statement`
- `Theorem`
- `Proof`
- `Figure`
- `FigureGrid`
- `Picture`
- `Aside`
- `TableOfContents`
- `Video`
- `YouTubeVideo`
- `TwoColumns`
- `Comparison`
- `ModelViewer`

Use the prose components by role:

| Component | Use for | Avoid using for |
| --- | --- | --- |
| `Callout` | Editorial notes, tips, warnings, caveats, examples, and reader guidance. | Formal claims or boxed equations. |
| `Statement` | Formal theorem-like environments: `Definition`, `Assumption`, `Lemma`, `Proposition`, `Theorem`, `Corollary`, `Result`, or `Example`. | Informal advice or visual emphasis alone. |
| `Theorem` | Convenience wrapper for literal theorem environments. | General formal blocks; prefer `Statement` with an explicit `label`. |
| `Proof` | Proof paragraphs following a formal statement. | Standalone notes or derivations that are not proofs. |
| `Box` | Boxed takeaways, emphasized formulas, compact summaries, or implementation objectives. | Warnings, tips, or formal theorem-like claims. |

Examples:

```mdx
<Callout type="tip" title="Main idea">
The graph should represent intentional conceptual links, not every hyperlink.
</Callout>

<Statement label="Definition" title="point-wise risk" id="def:risk">
The point-wise expected squared loss at a query $x_0$ is
$$
R(x_0) = \mathbb{E}[(\hat f(x_0) - Y_0)^2].
$$
</Statement>

<Theorem title="Generalization bound" id="thm:generalization">
Let $\mathcal{F}$ be a finite function class.
</Theorem>

<Proof>
Apply the union bound over $\mathcal{F}$.
</Proof>

<Box title="Training loss">
$$
\mathcal{L}(\theta, \phi; x)
=
-\mathbb{E}_{q_\phi(z \mid x)}[\log p_\theta(x \mid z)]
+
\mathrm{KL}(q_\phi(z \mid x) \| p(z)).
$$
</Box>
```

Prefer these components over raw HTML for article structure. Avoid inline `style`,
layout `<div>` wrappers, raw `<table>`, and raw `<img>` tags in authored MDX;
use Markdown tables, `Figure`, `FigureGrid`, `TwoColumns`, `Callout`,
`Statement`, and `Box` so the
template owns the visual language.

## Article Typography

Article typography is controlled by semantic `--article-*` CSS custom
properties near the top of `src/styles/article.css`. Override those tokens for
article-specific scale changes instead of setting one-off component font sizes.

| Role | Default | Used for |
| --- | --- | --- |
| Body | `18px` / `1.7` line-height | Article prose and content-bearing component bodies: `Callout`, `Statement`, `Theorem`, `Proof`, and `Box`. |
| Article title | `48px`, `36px` on mobile | Writing-entry titles. |
| Summary | `20px`, `17px` on mobile | Entry summaries under the title. |
| Headings | `24px`, `20px`, `18px`, `16px` | Article `h2` through `h5`/`h6`. |
| Component title / formal label | `18px` | `Callout` titles, `Box` titles, `Statement` parenthetical titles, and `Statement`/`Theorem` labels; typography, case, weight, and font family distinguish the role. |
| Metadata label | `12px` | Article metadata labels, sidebar headings, TOC depth labels, footer labels, and compact image labels. |
| Caption / aside / UI | `13px` | Figure captions, margin notes, TOC text, tags, and compact article navigation. |
| Table | `14px` | Tables and structured article-footer rows. |

## Validation

Run:

```bash
npm run validate
```

Validation catches missing titles, invalid entry types, invalid dates, duplicate
writing paths, duplicate aliases, reserved writing paths, unresolved wikilinks,
unresolved frontmatter links, and BibTeX parse failures.
