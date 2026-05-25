# Using GitHub's Template Button

GitHub's template button is the simplest way to create a new independent site.

1. Open the template repository on GitHub.
2. Click **Use this template**.
3. Create a new repository for your website.
4. Clone the new repository.
5. Run:

```bash
npm install
npm run dev
```

Then replace starter content and edit:

```txt
src/site/config.ts
src/content/
src/data/
public/
```

This workflow is intentionally simple, but it does not preserve shared Git
history with the template repository. If you later want to merge template
updates, use manual patches or perform a one-time unrelated-history merge.

For long-term syncing, prefer the upstream-remote workflow in
[Syncing With The Template](syncing-with-template.md).
