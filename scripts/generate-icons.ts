/**
 * Generate PWA icons for Pathfinder.
 *
 * Draws a compass logo on a cream background with "PATHFINDER" text.
 * Outputs 512x512 and 192x192 PNGs, plus maskable variants (full-bleed
 * square background with the artwork scaled into the central 80% safe
 * zone, so Android launcher masks — circle, squircle — never crop it).
 *
 * Run: npx tsx scripts/generate-icons.ts
 */

import { createCanvas, type CanvasRenderingContext2D } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const COLORS = {
  cream: "#F5F0E8",
  teal: "#0E5F6B",
  orange: "#E8872A",
  gray: "#999999",
  white: "#F5F0E8",
};

function generateIcon(size: number, maskable = false): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  if (maskable) {
    // Full-bleed background; the launcher mask may crop up to ~10% on
    // each side, so keep the artwork inside the central 80% safe zone.
    ctx.fillStyle = COLORS.cream;
    ctx.fillRect(0, 0, size, size);

    const SAFE = 0.8;
    ctx.translate((size * (1 - SAFE)) / 2, (size * (1 - SAFE)) / 2);
    ctx.scale(SAFE, SAFE);
  }

  drawArtwork(ctx, size);

  return canvas.toBuffer("image/png");
}

function drawArtwork(ctx: CanvasRenderingContext2D, size: number): void {
  const s = (pct: number) => size * pct; // scale helper

  // ── Background with rounded corners ───────────────────────────
  const radius = s(0.18);
  ctx.fillStyle = COLORS.cream;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Clip to rounded rect
  ctx.save();
  ctx.clip();

  // ── Compass parameters ────────────────────────────────────────
  const cx = size / 2;
  const cy = s(0.44); // slightly above center
  const outerR = s(0.28);
  const innerR = s(0.18);
  const outerStroke = s(0.028);
  const innerStroke = s(0.01);

  // ── Outer circle ──────────────────────────────────────────────
  ctx.strokeStyle = COLORS.teal;
  ctx.lineWidth = outerStroke;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  // ── Inner circle (subtle) ─────────────────────────────────────
  ctx.strokeStyle = COLORS.teal;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = innerStroke;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Cardinal points (small circles on the outer ring) ─────────
  const cardinalR = s(0.018);
  const cardinalDist = outerR;

  // North
  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(cx, cy - cardinalDist, cardinalR, 0, Math.PI * 2);
  ctx.fill();

  // South (orange)
  ctx.fillStyle = COLORS.orange;
  ctx.beginPath();
  ctx.arc(cx, cy + cardinalDist, cardinalR, 0, Math.PI * 2);
  ctx.fill();

  // East
  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(cx + cardinalDist, cy, cardinalR, 0, Math.PI * 2);
  ctx.fill();

  // West
  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(cx - cardinalDist, cy, cardinalR, 0, Math.PI * 2);
  ctx.fill();

  // ── Needle — North (teal, pointing up) ────────────────────────
  const needleWidth = s(0.055);
  const needleLen = innerR * 0.92;

  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.moveTo(cx, cy - needleLen);              // tip (top)
  ctx.lineTo(cx - needleWidth / 2, cy);        // bottom-left
  ctx.lineTo(cx + needleWidth / 2, cy);        // bottom-right
  ctx.closePath();
  ctx.fill();

  // ── Needle — South (orange, pointing down) ────────────────────
  ctx.fillStyle = COLORS.orange;
  ctx.beginPath();
  ctx.moveTo(cx, cy + needleLen);              // tip (bottom)
  ctx.lineTo(cx - needleWidth / 2, cy);        // top-left
  ctx.lineTo(cx + needleWidth / 2, cy);        // top-right
  ctx.closePath();
  ctx.fill();

  // ── Center point ──────────────────────────────────────────────
  const centerOuter = s(0.032);
  const centerInner = s(0.016);

  ctx.fillStyle = COLORS.teal;
  ctx.beginPath();
  ctx.arc(cx, cy, centerOuter, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(cx, cy, centerInner, 0, Math.PI * 2);
  ctx.fill();

  // ── Text: "PATHFINDER" ────────────────────────────────────────
  const fontSize = s(0.095);
  const textY = cy + outerR + s(0.12);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure "PATH" and "FINDER" to position them side by side
  ctx.font = `800 ${fontSize}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;

  const pathText = "PATH";
  const finderText = "FINDER";
  const pathWidth = ctx.measureText(pathText).width;
  const finderWidth = ctx.measureText(finderText).width;
  const totalWidth = pathWidth + finderWidth;
  const startX = cx - totalWidth / 2;

  // Draw "PATH" in teal
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.teal;
  ctx.fillText(pathText, startX, textY);

  // Draw "FINDER" in orange
  ctx.fillStyle = COLORS.orange;
  ctx.fillText(finderText, startX + pathWidth, textY);

  // ── Subtext: "by Tierra Digna" ────────────────────────────────
  const subFontSize = s(0.042);
  const subY = textY + fontSize * 0.7;

  ctx.font = `400 ${subFontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.gray;
  ctx.fillText("by Tierra Digna", cx, subY);

  ctx.restore();
}

// ── Generate all sizes and variants ─────────────────────────────────

// Run from the repo root (as the npm scripts do).
const outDir = join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });

for (const size of [512, 192]) {
  for (const maskable of [false, true]) {
    const buf = generateIcon(size, maskable);
    const path = join(outDir, `icon-${size}${maskable ? "-maskable" : ""}.png`);
    writeFileSync(path, buf);
    console.log(`✓ ${path} — ${buf.length} bytes (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}

console.log("\nDone!");
