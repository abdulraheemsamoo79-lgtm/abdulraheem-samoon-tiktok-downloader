/**
 * Best-effort in-memory rate limiter.
 *
 * This is intentionally simple: it lives in the serverless function's
 * memory, so it resets on cold start and isn't shared across regions
 * or instances. That's fine as a first line of defense against casual
 * abuse. If you outgrow it, swap this file's internals for a shared
 * store (e.g. Upstash Redis) — callers don't need to change.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  max = Number(process.env.RATE_LIMIT_MAX) || 20,
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}
