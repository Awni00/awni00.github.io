import { expect, test, type Page } from "@playwright/test";

// The selection halo is painted on the canvas, so the DOM cannot say whether
// it is there. Record what the writing map actually paints instead:
//   - every label, keyed by text, with the graph-space point just inside its
//     node and the transform it was painted under, so a test can click a node
//     by name;
//   - every selection halo, by the graph point of the node it surrounds. A
//     label is painted at its node's x, a few units above or below it, so a
//     halo belongs to the nearest label on its vertical.
// The halo is the one fill drawSelectedGlow paints at 0.18 alpha; nothing else on the
// map uses it.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.__labels = {};
    w.__glows = [];
    const proto = CanvasRenderingContext2D.prototype;
    const fillText = proto.fillText;
    proto.fillText = function (text: string, x: number, y: number, ...rest: any[]) {
      if (this.canvas.closest(".graph-canvas")) {
        // Labels sit `radius + 6` above or below their node; 8 lands inside
        // the node's near edge whatever its radius.
        const dy = this.textBaseline === "bottom" ? 8 : -8;
        const m = this.getTransform();
        w.__labels[text] = { x, y: y + dy, labelY: y, m: [m.a, m.b, m.c, m.d, m.e, m.f] };
      }
      return fillText.call(this, text, x, y, ...rest);
    };
    const arc = proto.arc;
    proto.arc = function (...args: Parameters<typeof arc>) {
      if (this.canvas.closest(".graph-canvas") && Math.abs(this.globalAlpha - 0.18) < 1e-6) {
        w.__glows.push({ x: args[0], y: args[1] });
      }
      return arc.apply(this, args);
    };
  });
});

async function openMap(page: Page, path = "/writing") {
  await page.goto(path);
  await waitForMap(page);
}

async function waitForMap(page: Page) {
  // Clicking before hydration would hit the server-rendered panel, which has
  // no handlers yet.
  await page.waitForFunction(
    () => !document.querySelector('astro-island[component-url*="GraphBrowser"][ssr]')
  );
  await page.locator(".graph-canvas").scrollIntoViewIfNeeded();
  await expect(page.locator(".graph-canvas canvas")).toBeVisible();
  // Wait for the layout to settle so a node is still where it was measured
  // by the time the click lands.
  let previous = "";
  await expect
    .poll(async () => {
      const current = JSON.stringify(await page.evaluate(() => (window as any).__labels));
      const settled = current !== "{}" && current === previous;
      previous = current;
      return settled;
    }, { intervals: [300] })
    .toBe(true);
}

async function clickNode(page: Page, label: string) {
  const point = await page.evaluate((name) => {
    const entry = (window as any).__labels[name];
    if (!entry) return null;
    const canvas = document.querySelector(".graph-canvas canvas") as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    const [a, b, c, d, e, f] = entry.m;
    return {
      x: rect.left + (a * entry.x + c * entry.y + e) / dpr,
      y: rect.top + (b * entry.x + d * entry.y + f) / dpr
    };
  }, label);
  expect(point, `no node labelled ${label} on the map`).not.toBeNull();
  await page.mouse.click(point!.x, point!.y);
}

/** Label of the node the most recent halo was painted around, if any. */
async function haloLabel(page: Page) {
  return page.evaluate(() => {
    const w = window as any;
    const glow = w.__glows.at(-1);
    if (!glow) return null;
    // Hubs can share a vertical, so x alone is ambiguous.
    const [match] = Object.entries(w.__labels)
      .filter(([, entry]: [string, any]) => Math.abs(entry.x - glow.x) < 0.5)
      .sort(
        ([, a]: [string, any], [, b]: [string, any]) =>
          Math.abs(a.labelY - glow.y) - Math.abs(b.labelY - glow.y)
      );
    return match ? match[0] : "(unlabelled node)";
  });
}

test("the map opens with nothing selected", async ({ page }) => {
  await openMap(page);
  const preview = page.locator(".preview-pane");
  await expect(preview).toContainText("Select a node on the map");
  await expect(preview.locator(".preview-title")).toHaveCount(0);
  // The panel listing the hubs is not a selection of any of them.
  await expect(preview.locator(".sidebar-section__label")).toContainText("Hubs");
  expect(await page.evaluate(() => (window as any).__glows.length)).toBe(0);
});

test("clicking a node shows its halo and its details together", async ({ page }) => {
  await openMap(page);
  await clickNode(page, "Hub 2");
  const title = page.locator(".preview-pane .preview-title");
  await expect(title).toHaveText("Hub 2");
  await expect.poll(() => haloLabel(page)).toBe("Hub 2");

  // Moving the selection moves both.
  await clickNode(page, "Hub 3");
  await expect(title).toHaveText("Hub 3");
  await expect.poll(() => haloLabel(page)).toBe("Hub 3");
});

test("picking a hub from the panel marks it on the canvas", async ({ page }) => {
  await openMap(page);
  await page.locator(".preview-pane .preview-link", { hasText: "Hub 4" }).click();
  await expect(page.locator(".preview-pane .preview-title")).toHaveText("Hub 4");
  await expect.poll(() => haloLabel(page)).toBe("Hub 4");
});

// Only the view round-trips through the URL; selection is session-only by
// design (see readStateFromUrl). So the URL-restored states to hold to the
// invariant are: arriving on another view and switching to the map, and a
// selection carried across a view switch, which remounts the canvas.
test("the map agrees with the panel after a view switch", async ({ page }) => {
  await page.goto("/writing?view=list");
  // The server renders the default view and the URL's view is applied after
  // hydration, so a click before then would be overwritten by it.
  await expect(page.getByRole("tab", { name: "list" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "map" }).click();
  await waitForMap(page);
  await expect(page.locator(".preview-pane")).toContainText("Select a node on the map");
  expect(await page.evaluate(() => (window as any).__glows.length)).toBe(0);

  await clickNode(page, "Hub 1");
  await expect(page.locator(".preview-pane .preview-title")).toHaveText("Hub 1");

  await page.getByRole("tab", { name: "topics" }).click();
  await expect(page).toHaveURL(/\?view=topics$/);
  await page.evaluate(() => {
    const w = window as any;
    w.__labels = {};
    w.__glows = [];
  });
  await page.getByRole("tab", { name: "map" }).click();
  await waitForMap(page);
  await expect(page.locator(".preview-pane .preview-title")).toHaveText("Hub 1");
  await expect.poll(() => haloLabel(page)).toBe("Hub 1");
});
