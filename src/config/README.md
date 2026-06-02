# Config System

This directory implements the resolved configuration API and template defaults
used by components, layouts, pages, scripts, and tests.

Ownership: template-owned. Downstream sites should edit `src/site/config.ts`
instead of changing files here. Direct edits are local divergence unless the
change is intended for the template upstream.

Defaults live in `defaults/`; exported resolved config lives at this directory's
top level.

See [Repo Ownership](../../docs/repo-ownership.md) for the full policy.
