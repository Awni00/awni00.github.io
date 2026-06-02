# Repository Editing Guidance

This repository is an academic website template. Its reusable implementation is
maintained in the template upstream, while each downstream website owns its site
configuration, content, data, and personal assets.

In downstream repos, prefer editing `src/site/`, `src/content/`, `src/data/`,
and site-owned files under `public/`. Treat `src/components/`, `src/layouts/`,
`src/lib/`, `src/pages/`, `src/styles/`, `src/config/`, `scripts/`, `tests/`,
and root build configuration as template-owned.

Editing template-owned files downstream is allowed, but it is local divergence
and can complicate future template syncs. Broadly useful changes should be made
in the template repo and merged downstream.

See [Repo Ownership](docs/repo-ownership.md) for the full policy.
