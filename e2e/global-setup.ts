/**
 * Playwright global setup — authenticates the test user via the dev-only
 * /api/test/login route (Supabase service-role OTP verify), saves the
 * browser cookies to e2e/.auth/user.json.
 *
 * Required env vars (read from .env.local automatically):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - TEST_USER_EMAIL
 *   - E2E_LOGIN_SECRET
 */
import { chromium, type FullConfig } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

export default async function globalSetup(_config: FullConfig) {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, "utf-8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const testEmail = process.env.TEST_USER_EMAIL;
  const secret = process.env.E2E_LOGIN_SECRET;

  if (!testEmail || !secret) {
    console.warn("[playwright] Skipping auth setup — missing TEST_USER_EMAIL or E2E_LOGIN_SECRET.");
    return;
  }

  const baseURL = "http://localhost:3001";
  const loginUrl =
    `${baseURL}/api/test/login` +
    `?email=${encodeURIComponent(testEmail)}` +
    `&secret=${encodeURIComponent(secret)}` +
    `&returnTo=${encodeURIComponent("/dashboard?lang=ca")}`;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(loginUrl);
  await page.waitForURL("**/dashboard**", { timeout: 30_000 });

  const stateDir = path.resolve(process.cwd(), "e2e", ".auth");
  fs.mkdirSync(stateDir, { recursive: true });
  await context.storageState({ path: path.join(stateDir, "user.json") });

  await browser.close();
  console.log(`[playwright] Auth state saved for ${testEmail}`);
}
