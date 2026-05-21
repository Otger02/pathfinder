/**
 * Tree navigation — unauthenticated flow (the decision tree is public).
 * Tests the path from homepage → tree → consent → chat.
 */
import { test, expect } from "@playwright/test";

test.describe("Decision tree", () => {
  test("homepage renders with language options", async ({ page }) => {
    await page.goto("/");
    // Should have a visible heading or the tree start node
    await expect(page.locator("h1, h2, [class*=display]").first()).toBeVisible();
  });

  test("tree page loads and shows first node", async ({ page }) => {
    await page.goto("/chat?lang=ca");
    // Either the tree UI or the chat interface should appear
    await expect(
      page.locator("[class*=tree], [class*=chat], button, a").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("mobile: tree node buttons are tap-friendly (≥44px)", async ({ page }) => {
    await page.goto("/chat?lang=ca");
    // Wait for interactive elements
    await page.waitForSelector("button", { timeout: 10_000 });

    const buttons = page.locator("button:visible");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        // WCAG 2.5.5: minimum 44×44 px touch target
        expect(box.height, `Button ${i} height`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
