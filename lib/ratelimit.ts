/**
 * Rate limiting for TradeHub.
 *
 * Default: an in-process sliding-window limiter — real and correct, but scoped
 * to a single server instance. On serverless (Vercel) each lambda keeps its own
 * window, which still meaningfully throttles abuse from a single warm instance.
 *
 * Production / distributed: set `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN`, install `@upstash/ratelimit` + `@upstash/redis`,
 * and replace the body of `rateLimit` with an Upstash sliding window so the
 * limit is shared across every instance. The function signature below is the
 * stable contract callers depend on, so swapping the backend is transparent.
 */

export interface RateLimitOptions {
  /** Max requests allowed within the trailing window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the current window frees up (oldest hit + windowMs). */
  reset: number;
}

/** key -> ascending list of hit timestamps (ms) within the window. */
const store = new Map<string, number[]>();
/** key -> last access (ms), used to evict idle keys and bound memory. */
const lastSeen = new Map<string, number>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, ts] of lastSeen) {
    if (now - ts > 600_000) {
      store.delete(key);
      lastSeen.delete(key);
    }
  }
}

/**
 * Sliding-window rate limit. Returns `success: false` once `limit` hits have
 * occurred for `key` within the trailing `windowMs`. Successful calls record a
 * hit; rejected calls do not (so a blocked caller can't extend their own ban).
 */
export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  sweep(now);
  const cutoff = now - windowMs;

  const bucket = store.get(key);
  // Drop timestamps that have aged out of the window.
  const recent = bucket ? bucket.filter((t) => t > cutoff) : [];

  if (recent.length >= limit) {
    store.set(key, recent);
    lastSeen.set(key, now);
    return { success: false, limit, remaining: 0, reset: recent[0] + windowMs };
  }

  recent.push(now);
  store.set(key, recent);
  lastSeen.set(key, now);
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - recent.length),
    reset: recent[0] + windowMs,
  };
}
