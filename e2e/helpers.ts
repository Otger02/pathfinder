/**
 * E2E helpers: shared Supabase auth utilities for tests.
 * Uses password login (mode=password) — requires TEST_USER_EMAIL + TEST_USER_PASSWORD env vars.
 */
import { type Page } from "@playwright/test";

export async function loginViaUI(page: Page) {
  const email = process.env.TEST_USER_EMAIL!;
  const password = process.env.TEST_USER_PASSWORD!;

  await page.goto("/auth?lang=ca");

  // Switch to password mode
  const switchBtn = page.getByRole("button", { name: /contrasenya/i });
  if (await switchBtn.isVisible()) {
    await switchBtn.click();
  }

  await page.getByLabel(/correu|email/i).fill(email);
  await page.getByLabel(/contrasenya|password/i).fill(password);
  await page.getByRole("button", { name: /entrar|inicia|sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}
