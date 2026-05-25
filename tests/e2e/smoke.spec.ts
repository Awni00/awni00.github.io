import { expect, test } from "@playwright/test";

test("main static routes render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Awni Altabaa" })).toBeVisible();

  await page.goto("/publications");
  await expect(page.getByRole("heading", { name: "Publications" })).toBeVisible();

  await page.goto("/teaching");
  await expect(page.getByRole("heading", { name: "Teaching" })).toBeVisible();

  await page.goto("/writing/research");
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
});

test("publication abstracts open as configured popups", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".publication-abstract")).toHaveCount(0);
  await page.locator('[data-dialog-open="abstract-example2026biasvariance"]').click();
  const homeDialog = page.getByRole("dialog", {
    name: "Abstract for Bias and Variance: an Illustrated Refresher"
  });
  await expect(homeDialog).toBeVisible();
  await expect(homeDialog).toContainText("A demo publication for the academic-graph template");
  await homeDialog.getByRole("button", { name: "Close" }).click();

  await page.goto("/publications");
  await expect(page.locator(".publication-abstract")).toHaveCount(0);
  await page.locator('[data-dialog-open="abstract-example2026biasvariance"]').click();
  const publicationsDialog = page.getByRole("dialog", {
    name: "Abstract for Bias and Variance: an Illustrated Refresher"
  });
  await expect(publicationsDialog).toBeVisible();
  await expect(publicationsDialog).toContainText("A demo publication for the academic-graph template");
});

test("writing browser supports URL state and preview", async ({ page }) => {
  await page.goto("/writing?view=map");
  await expect(page.getByRole("tab", { name: "map" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Research" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open entry" })).toHaveAttribute(
    "href",
    "/writing/research"
  );
});

test("research entry, RSS, and redirects render", async ({ page }) => {
  await page.goto("/writing/research/cot-info");
  await expect(
    page.getByRole("heading", {
      name: "CoT Information: Improved Sample Complexity under Chain-of-Thought Supervision"
    })
  ).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();

  const rss = await page.goto("/writing/rss.xml");
  expect(await rss?.text()).toContain('<rss version="2.0">');

  const redirect = await page.goto("/cot-info/index.html");
  expect(redirect?.ok()).toBe(true);
  await expect(page).toHaveURL(/\/writing\/research\/cot-info\/?$/);
});

test("theme toggle changes preference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Theme:/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", /light|dark|system/);
});
