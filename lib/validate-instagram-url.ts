import { InstagramResolveError } from "@/types/instagram";

const INSTAGRAM_HOST_PATTERN = /(^|\.)instagram\.com$/i;
const INSTAGRAM_SHORT_HOSTS = new Set(["instagr.am"]);

/**
 * Validates that a string is a well-formed, public Instagram URL
 * (post, reel, or IGTV link). Mirrors lib/validate-url.ts's shape so
 * both platforms behave consistently, without sharing implementation.
 */
export function validateInstagramUrl(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new InstagramResolveError("EMPTY_URL", "Please paste an Instagram link.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new InstagramResolveError(
      "INVALID_URL",
      "That doesn't look like a valid URL."
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new InstagramResolveError(
      "INVALID_URL",
      "That doesn't look like a valid URL."
    );
  }

  const host = parsed.hostname.toLowerCase();
  const isInstagramHost =
    INSTAGRAM_HOST_PATTERN.test(host) || INSTAGRAM_SHORT_HOSTS.has(host);

  if (!isInstagramHost) {
    throw new InstagramResolveError(
      "NOT_INSTAGRAM",
      "This link isn't from Instagram. Paste a link copied from the Instagram app or website."
    );
  }

  return parsed.toString();
}
