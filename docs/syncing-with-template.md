# Syncing With The Template

There are two supported adoption workflows.

## Option 1: GitHub Template Button

Use GitHub's **Use this template** button when you want a quick independent
starting point and do not expect to merge many future template updates.

This creates a new repository with the template files but without a shared Git
history. That is simple, but later syncing requires manual copy, patching, or a
one-time unrelated-history merge.

Good fit:

- A one-off academic site.
- A site that will mostly evolve independently.
- Users who value setup simplicity over long-term syncing.

## Option 2: Upstream Remote Workflow

Use the upstream-remote workflow when you want your website repository to keep
receiving template improvements through ordinary Git merges.

Create the site from the template history:

```bash
git clone git@github.com:OWNER/academic-map-template.git my-site
cd my-site
git remote rename origin template
git remote add origin git@github.com:OWNER/my-site.git
git push -u origin main
```

Your remotes should look like:

```txt
origin    git@github.com:OWNER/my-site.git
template  git@github.com:OWNER/academic-map-template.git
```

Make site edits in site-owned paths:

```txt
src/site/
src/content/
src/data/
public/
```

Make reusable features in the template repository, then merge them into the
site.

## Routine Sync

In the website repository:

```bash
git fetch template
git checkout main
git pull origin main
git checkout -b sync/template-YYYY-MM-DD
git merge template/main
npm install
npm run validate
npm run build
npm run test
```

Open a pull request from `sync/template-YYYY-MM-DD` into the website's `main`.

## Resolving Conflicts

Use the ownership boundary:

- Keep the website version for site-owned content and data.
- Keep the template version for reusable components, layouts, library code,
  scripts, tests, and default config.
- Read conflicts in `src/site/config.ts` carefully because they often represent
  intentional local choices.

After resolving conflicts:

```bash
npm run validate
npm run build
npm run test
```

## Feature Workflow

For changes that should benefit every website using the template:

1. Implement the feature in the template repository.
2. Add docs and tests in the template repository.
3. Merge the template feature to `template/main`.
4. Sync each downstream site from `template/main`.
5. Configure the feature in each site's `src/site/config.ts` or content files.

This keeps the template as the source of reusable layout and feature behavior.
