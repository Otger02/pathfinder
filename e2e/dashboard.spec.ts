import { test, expect } from "@playwright/test";

test.describe("Dashboard (authenticated)", () => {
  test("shows greeting and key UI elements", async ({ page }) => {
    await page.goto("/dashboard?lang=ca");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // QuickStats cards
    await expect(page.locator(".card").first()).toBeVisible();
    // New process CTA
    await expect(
      page.getByRole("link", { name: /nou procés|nuevo proceso|new process/i })
    ).toBeVisible();
    // Urgent help section
    await expect(page.getByRole("link", { name: /112/ })).toBeVisible();
  });

  test("new process CTA navigates to /chat", async ({ page }) => {
    await page.goto("/dashboard?lang=ca");
    await page
      .getByRole("link", { name: /nou procés|nuevo proceso|new process/i })
      .click();
    await expect(page).toHaveURL(/\/chat/);
  });

  test("SOS button is visible", async ({ page }) => {
    await page.goto("/dashboard?lang=ca");
    const sos = page.getByRole("button", { name: /SOS|ajuda urgent|ayuda urgente/i });
    await expect(sos).toBeVisible();
  });
});
