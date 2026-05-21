/**
 * Tree navigation — unauthenticated flow (the decision tree is public).
 */
import { test, expect } from "@playwright/test";

test.describe("Decision tree", () => {
  test("homepage loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    // Just verify the body rendered; the home page is a voice-detection landing.
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("tree page loads and shows first node", async ({ page }) => {
    await page.goto("/chat?lang=ca");
    // The tree-node class is used for each option button on the decision tree.
    await expect(page.locator(".tree-node").first()).toBeVisible({ timeout: 10_000 });
  });

  test("mobile: tree node buttons are tap-friendly (≥44px)", async ({ page }) => {
    await page.goto("/chat?lang=ca");
    await page.locator(".tree-node").first().waitFor({ timeout: 10_000 });

    const nodes = page.locator(".tree-node");
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await nodes.nth(i).boundingBox();
      if (box) {
        // WCAG 2.5.5: minimum 44×44 px touch target
        expect(box.height, `Tree node ${i} height`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
