import { expect, test } from "@playwright/test";

test("main static routes render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your Name" })).toBeVisible();
  await page.goto("/publications");
  await expect(page.getByRole("heading", { name: "Publications" })).toBeVisible();
  await page.goto("/research");
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
});

test("writing browser supports URL state and preview", async ({ page }) => {
  await page.goto("/writing?view=map");
  await expect(page.getByRole("tab", { name: "map" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Machine Learning Theory/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Education and Teaching" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Entry" })).toHaveAttribute(
    "href",
    "/writing/education-teaching"
  );
});

test("writing entry and RSS render", async ({ page }) => {
  await page.goto("/writing/machine-learning-theory/bias-variance-refresher");
  await expect(page.getByRole("heading", { name: "Bias and Variance: an Illustrated Refresher" })).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();
  const response = await page.goto("/writing/rss.xml");
  expect(await response?.text()).toContain("<rss version=\"2.0\">");
});

test("theme toggle changes preference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Theme:/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", /light|dark|system/);
});
