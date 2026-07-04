/**
 * In-memory rate limiter for API routes.
 *
 * Uses a fixed-window counter per key stored in a module-level Map, which
 * survives across requests within the same Node.js process.
 *
 * For multi-instance or serverless deployments, replace with a Redis-backed
 * implementation — e.g. @upstash/ratelimit — by swapping out `checkRateLimit`.
 * The call-sites in API routes do not need to change.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Prune expired entries periodically to prevent unbounded memory growth.
const pruneInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1_000);

// Allow Node.js to exit even if this timer is still pending.
if (pruneInterval.unref) pruneInterval.unref();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitConfig {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed within the window. */
  max: number;
}

/**
 * Check (and increment) a rate-limit counter for `key`.
 *
 * @param key    Unique identifier, e.g. `"import:<userId>"`.
 * @param config Window duration and request cap.
 * @returns      `allowed: false` when the limit is exceeded.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt: new Date(resetAt) };
  }

  if (existing.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: new Date(existing.resetAt) };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.max - existing.count,
    resetAt: new Date(existing.resetAt),
  };
}
