import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("redirects unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("shows auth page with email input", async ({ page }) => {
    await page.goto("/auth?lang=ca");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("can switch to password mode", async ({ page }) => {
    await page.goto("/auth?lang=ca");

    const switchBtn = page.getByRole("button", { name: /prefereixo contrasenya/i });
    await switchBtn.click();

    // After switching, both email and password inputs must be visible.
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/auth?lang=ca");
    await page.getByRole("button", { name: /prefereixo contrasenya/i }).click();

    await page.locator('input[type="email"]').fill("wrong@test.invalid");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /accedir|acceder|sign in|connexion|دخول/i }).click();

    // Some error indicator must surface (i18n'd copy varies — match on class).
    await expect(page.locator(".text-danger, [class*=danger]").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
