import { expect, test, type Page } from "@playwright/test";

async function gotoDomReady(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test("main static routes render", async ({ page }) => {
  await gotoDomReady(page, "/");
  await expect(page.getByRole("heading", { name: "Awni Altabaa" })).toBeVisible();

  await gotoDomReady(page, "/publications");
  await expect(page.getByRole("heading", { name: "Publications" })).toBeVisible();

  await gotoDomReady(page, "/teaching");
  await expect(page.getByRole("heading", { name: "Teaching" })).toBeVisible();

  await gotoDomReady(page, "/writing/research");
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
});

test("publication abstracts open as configured popups", async ({ page }) => {
  await gotoDomReady(page, "/");
  await expect(page.locator(".publication-abstract")).toHaveCount(0);
  await page.locator('[data-dialog-open="abstract-altabaa2025cotinformation"]').click();
  const homeDialog = page.getByRole("dialog", {
    name: "Abstract for CoT Information: Improved Sample Complexity under Chain-of-Thought Supervision"
  });
  await expect(homeDialog).toBeVisible();
  await expect(homeDialog).toContainText("Learning complex functions");
  await homeDialog.getByRole("button", { name: "Close" }).click();

  await gotoDomReady(page, "/publications");
  await expect(page.locator(".publication-abstract")).toHaveCount(0);
  await page.locator('[data-dialog-open="abstract-altabaa2025cotinformation"]').click();
  const publicationsDialog = page.getByRole("dialog", {
    name: "Abstract for CoT Information: Improved Sample Complexity under Chain-of-Thought Supervision"
  });
  await expect(publicationsDialog).toBeVisible();
  await expect(publicationsDialog).toContainText("Learning complex functions");
});

test("writing browser supports URL state and preview", async ({ page }) => {
  await gotoDomReady(page, "/writing?view=map");
  await expect(page.getByRole("tab", { name: "map" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Research" })).toBeVisible();
  await expect(page.locator(".preview-pane").getByRole("heading").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open entry" })).toHaveAttribute(
    "href",
    /\/writing\//
  );
});

test("research entry, RSS, and redirects render", async ({ page }) => {
  await gotoDomReady(page, "/writing/research/cot-info");
  await expect(
    page.getByRole("heading", {
      name: "CoT Information: Improved Sample Complexity under Chain-of-Thought Supervision"
    })
  ).toBeVisible();
  await expect(page.locator(".article-byline")).toContainText("Venue");
  await expect(page.locator(".article-byline")).toContainText("Neural Information Processing Systems (NeurIPS), spotlight");
  await expect(page.locator(".katex").first()).toBeVisible();

  await gotoDomReady(page, "/writing/research/algorithmic-generalization-transformer-architectures");
  await expect(page.locator(".figure-grid[data-columns='4']").first()).toBeVisible();
  await expect(page.locator(".callout").filter({ hasText: "The Central Question" })).toBeVisible();

  const rss = await page.goto("/writing/rss.xml");
  expect(await rss?.text()).toContain('<rss version="2.0">');

  const redirect = await page.goto("/cot-info/index.html");
  expect(redirect?.ok()).toBe(true);
  await expect(page).toHaveURL(/\/writing\/research\/cot-info\/?$/);
});

test("theme toggle changes preference", async ({ page }) => {
  await gotoDomReady(page, "/writing/research/cot-info");
  await page.getByRole("button", { name: /Theme:/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", /light|dark|system/);
});
