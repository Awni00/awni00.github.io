# Source Tree

This directory contains the Astro source for the template and the main
customization surfaces for downstream sites.

Template-owned areas include `components/`, `layouts/`, `lib/`, `pages/`,
`styles/`, `config/`, and `content.config.ts`. Site-owned areas after adoption
include `site/`, `content/`, and `data/`.

Prefer expressing downstream changes through site-owned files. Editing
template-owned source files is local divergence unless the change is merged from
the template upstream.

See [Repo Ownership](../docs/repo-ownership.md) for the full policy.
