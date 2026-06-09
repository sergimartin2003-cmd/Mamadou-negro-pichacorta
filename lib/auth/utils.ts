const SAFE_PATH = /^\/(?!\/)/;

/**
 * Returns `next` only when it is a same-origin relative path with a single
 * leading slash. Rejects `//evil.com`, `/\evil`, and absolute URLs to prevent
 * open redirects. Falls back to `/feed`.
 */
export function safeNext(next?: string | null): string {
  if (!next) return "/feed";
  if (!SAFE_PATH.test(next)) return "/feed";
  if (next.includes("\\")) return "/feed";
  return next;
}
