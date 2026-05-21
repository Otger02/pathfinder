import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers";

test.describe("Dashboard (authenticated)", () => {
  test.skip(
    !process.env.TEST_USER_EMAIL,
    "Set TEST_USER_EMAIL + TEST_USER_PASSWORD to run authenticated tests"
  );

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test("shows greeting and key UI elements", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // QuickStats cards
    await expect(page.locator(".card").first()).toBeVisible();
    // New process CTA
    await expect(page.getByRole("link", { name: /nou procés|nuevo proceso|new process/i })).toBeVisible();
    // Urgent help section
    await expect(page.getByRole("link", { name: /112/ })).toBeVisible();
  });

  test("'view all cases' link navigates to /cases", async ({ page }) => {
    const link = page.getByRole("link", { name: /veure tots|ver todos|view all/i });
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/cases/);
    }
  });

  test("new process CTA navigates to /chat", async ({ page }) => {
    await page.getByRole("link", { name: /nou procés|nuevo proceso|new process/i }).click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test("SOS button is visible and has correct aria-label", async ({ page }) => {
    const sos = page.getByRole("button", { name: /SOS|ajuda urgent|ayuda urgente/i });
    await expect(sos).toBeVisible();
  });
});
