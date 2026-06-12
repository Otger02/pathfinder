/**
 * scripts/capture-screenshots.ts
 *
 * Captures real app screenshots (mobile viewport, Catalan UI) for the
 * visual dossier. Requires the dev server running on :3001.
 *
 *   npm run dev          # terminal 1
 *   npx tsx scripts/capture-screenshots.ts
 *
 * Output: docs/screenshots/*.png — consumed by generate-dossier-ca.ts.
 */

import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const OUT = join(process.cwd(), "docs", "screenshots");

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, // iPhone-ish portrait
    deviceScaleFactor: 2,
  });
  // Crop the bottom strip so the Next.js dev-mode badge never appears.
  const shot = (path: string) =>
    page.screenshot({ path, clip: { x: 0, y: 0, width: 390, height: 790 } });

  // 1. Landing
  await page.goto(`${BASE}/?lang=ca`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(join(OUT, "landing.png"));
  console.log("✓ landing.png");

  // 2. Chat — decision tree (root node)
  await page.goto(`${BASE}/chat?lang=ca`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(join(OUT, "tree.png"));
  console.log("✓ tree.png");

  // 3. Tree two levels deep (pick first option twice for a richer shot)
  const clickFirstOption = async () => {
    const buttons = page.locator("button.opt-btn, [data-testid=tree-option], main button");
    // Heuristic: first visible button that isn't nav/lang
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const el = buttons.nth(i);
      const text = ((await el.textContent()) ?? "").trim();
      if (text.length > 12 && (await el.isVisible())) {
        await el.click();
        return true;
      }
    }
    return false;
  };
  if (await clickFirstOption()) {
    await page.waitForTimeout(700);
    await clickFirstOption();
    await page.waitForTimeout(700);
    await shot(join(OUT, "tree-deep.png"));
    console.log("✓ tree-deep.png");
  }

  // 4. Privacy page (shows the compliance face of the product)
  await page.goto(`${BASE}/privacy?lang=ca`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot(join(OUT, "privacy.png"));
  console.log("✓ privacy.png");

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
