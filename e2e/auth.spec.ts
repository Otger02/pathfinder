import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("redirects unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("shows auth page with lang selector", async ({ page }) => {
    await page.goto("/auth?lang=ca");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Language selector present
    await expect(page.locator("select, [data-lang-selector]").first()).toBeVisible();
  });

  test("can switch to password mode", async ({ page }) => {
    await page.goto("/auth?lang=ca");
    const switchBtn = page.getByRole("button", { name: /contrasenya/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
      await expect(page.getByLabel(/contrasenya|password/i)).toBeVisible();
    }
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/auth?lang=ca");

    const switchBtn = page.getByRole("button", { name: /contrasenya/i });
    if (await switchBtn.isVisible()) await switchBtn.click();

    await page.getByLabel(/correu|email/i).fill("wrong@test.invalid");
    await page.getByLabel(/contrasenya|password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /entrar|inicia/i }).click();

    // Error message should appear (don't check exact copy — it's i18n'd)
    await expect(page.locator("[role=alert], .text-danger, [class*=danger]").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
