/**
 * In-memory sliding-window rate limiter.
 *
 * Trade-offs (acceptable for the pilot, replace with Upstash for scale):
 * - On Vercel, each serverless instance has its own Map, so the effective
 *   limit is `max * (instance count)`. For the expected pilot traffic
 *   (low single digits of concurrent users) this is still meaningful.
 * - Cold starts reset the bucket for that instance.
 * - No coordination across regions.
 *
 * If/when traffic justifies it, swap the storage layer for `@upstash/ratelimit`
 * or Vercel KV; the public API of this module stays the same.
 */

export type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const buckets = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.keyPrefix}:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const previous = buckets.get(key) ?? [];
  const timestamps = previous.filter((t) => t > windowStart);

  if (timestamps.length >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: timestamps[0] + config.windowMs,
    };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.max - timestamps.length,
    resetAt: now + config.windowMs,
  };
}

/**
 * Best-effort client IP extraction. Vercel always sets `x-forwarded-for`;
 * other hosting may use `x-real-ip`. Falls back to `"unknown"`, which is
 * a single shared bucket — by design, so abuse from unknown-IP clients
 * still gets rate-limited collectively.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Convenience wrapper: build a 429 Response with `Retry-After` headers from
 * a failing `RateLimitResult`. Use directly in route handlers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: "Too many requests", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
