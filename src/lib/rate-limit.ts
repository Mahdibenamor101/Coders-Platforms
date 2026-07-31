type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed-window rate limiter keyed by an arbitrary string
 * (e.g. "login:<ip>:<email>"). Single-process only: fine to slow down brute
 * force / spam-signup attempts on one instance, but state resets on
 * redeploy and isn't shared across instances - swap for a shared store
 * (Redis, Upstash) if/when this runs behind multiple instances.
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxAttempts) {
    return false;
  }

  bucket.count += 1;
  return true;
}
