/**
 * Smoke test the provider chain for authenticated collection flows.
 *
 * Runs two scenarios against a temporary local dev server:
 * 1. OpenAI is primary and must pass the auth-memory regression.
 * 2. OpenAI is forced to fail and Anthropic must take over via fallback.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const STARTUP_TIMEOUT_MS = 120_000;
const HEALTHCHECK_INTERVAL_MS = 1_000;
const LOG_SETTLE_TIMEOUT_MS = 15_000;

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

function assertRequiredEnv() {
  const required = [
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "TEST_USER_EMAIL",
    "E2E_LOGIN_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

async function waitForServer(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTHCHECK_INTERVAL_MS));
  }

  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function waitForLogPatterns(
  getLogs: () => string,
  patterns: RegExp[],
  timeoutMs: number
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const logs = getLogs();
    if (patterns.every((pattern) => pattern.test(logs))) return logs;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return getLogs();
}

function terminateProcessTree(pid: number) {
  const result = spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], {
    stdio: "pipe",
    windowsHide: true,
  });

  if (result.status !== 0 && result.status !== 128) {
    const stderr = result.stderr.toString().trim();
    throw new Error(`Failed to stop dev server: ${stderr || "unknown error"}`);
  }
}

async function runScenario(options: {
  name: string;
  envOverrides: Record<string, string>;
  expectLogs: RegExp[];
  rejectLogs?: RegExp[];
}) {
  console.log(`\n=== ${options.name} ===`);

  let logs = "";
  const server = spawn("npm", ["run", "dev"], {
    cwd: process.cwd(),
    shell: true,
    windowsHide: true,
    env: {
      ...process.env,
      ...options.envOverrides,
    },
  });

  server.stdout?.on("data", (chunk) => {
    const text = chunk.toString();
    logs += text;
    process.stdout.write(text);
  });

  server.stderr?.on("data", (chunk) => {
    const text = chunk.toString();
    logs += text;
    process.stderr.write(text);
  });

  try {
    await waitForServer(`${BASE_URL}/auth`, STARTUP_TIMEOUT_MS);

    const testResult = spawnSync("npm", ["run", "test:auth-memory"], {
      cwd: process.cwd(),
      shell: true,
      windowsHide: true,
      env: {
        ...process.env,
        BASE_URL,
      },
      stdio: "inherit",
    });

    if (testResult.status !== 0) {
      throw new Error(`test:auth-memory failed with exit code ${testResult.status}`);
    }

    const settledLogs = await waitForLogPatterns(
      () => logs,
      options.expectLogs,
      LOG_SETTLE_TIMEOUT_MS
    );

    for (const pattern of options.expectLogs) {
      if (!pattern.test(settledLogs)) {
        throw new Error(`Expected server log not found: ${pattern}`);
      }
    }

    for (const pattern of options.rejectLogs ?? []) {
      if (pattern.test(settledLogs)) {
        throw new Error(`Unexpected server log found: ${pattern}`);
      }
    }

    console.log(`Scenario OK: ${options.name}`);
  } finally {
    if (server.pid) {
      terminateProcessTree(server.pid);
    }
  }
}

async function main() {
  loadEnvLocal();
  assertRequiredEnv();

  await runScenario({
    name: "OpenAI primary",
    envOverrides: {
      CHAT_PROVIDER_ORDER: "openai,anthropic",
    },
    expectLogs: [/provider order: openai,anthropic configured: \[ 'openai', 'anthropic' \]/, /tool extracted .*\(gpt-4\.1\)/],
    rejectLogs: [/provider failed: openai/],
  });

  await runScenario({
    name: "OpenAI fallback to Anthropic",
    envOverrides: {
      OPENAI_API_KEY: "invalid-openai-key",
      CHAT_PROVIDER_ORDER: "openai,anthropic",
    },
    expectLogs: [/provider failed: openai -> OpenAI API 401:/, /tool extracted .*\(claude-sonnet-4-5-20250929\)/],
  });

  console.log("\nAll provider smoke tests passed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Provider smoke test failed:", message);
  process.exit(1);
});