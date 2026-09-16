import { TikTokResolveError } from "@/types";

const TIKTOK_HOST_PATTERN = /(^|\.)tiktok\.com$/i;
const TIKTOK_SHORT_HOSTS = new Set(["vm.tiktok.com", "vt.tiktok.com"]);

/**
 * Validates that a string is a well-formed, public TikTok URL.
 * Throws a TikTokResolveError with a specific code on failure so the
 * API route and UI can show the right message without guessing.
 */
export function validateTikTokUrl(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new TikTokResolveError("EMPTY_URL", "Please paste a TikTok link.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new TikTokResolveError(
      "INVALID_URL",
      "That doesn't look like a valid URL."
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new TikTokResolveError(
      "INVALID_URL",
      "That doesn't look like a valid URL."
    );
  }

  const host = parsed.hostname.toLowerCase();
  const isTikTokHost =
    TIKTOK_HOST_PATTERN.test(host) || TIKTOK_SHORT_HOSTS.has(host);

  if (!isTikTokHost) {
    throw new TikTokResolveError(
      "NOT_TIKTOK",
      "This link isn't from TikTok. Paste a link copied from the TikTok app or website."
    );
  }

  return parsed.toString();
}
