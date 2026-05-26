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
```

For paper-style writing entries, `venue` is intentionally stored in entry
frontmatter even if the same paper also appears in `src/data/publications.bib`.
This keeps writing entries portable and prevents article headers from depending
on a BibTeX lookup.

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

- `Callout`
- `Theorem`
- `Proof`
- `MathBlock`
- `Figure`
- `Picture`
- `Aside`
- `TableOfContents`
- `Video`
- `YouTubeVideo`
- `TwoColumns`
- `Comparison`
- `ModelViewer`

Example:

```mdx
<Callout type="tip" title="Main idea">
The graph should represent intentional conceptual links, not every hyperlink.
</Callout>
```

## Validation

Run:

```bash
npm run validate
```

Validation catches missing titles, invalid entry types, invalid dates, duplicate
writing paths, duplicate aliases, reserved writing paths, unresolved wikilinks,
unresolved frontmatter links, and BibTeX parse failures.
