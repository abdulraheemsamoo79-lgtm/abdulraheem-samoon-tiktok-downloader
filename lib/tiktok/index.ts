import { TikTokProvider } from "@/types";
import { TikwmProvider } from "./tikwm";

/**
 * Provider registry. To add a new provider later:
 *   1. Create lib/tiktok/<provider-name>.ts implementing TikTokProvider.
 *   2. Register it in this map.
 *   3. Set TIKTOK_PROVIDER=<provider-name> in your environment.
 * No other file needs to change — app/api/download/route.ts only ever
 * talks to the TikTokProvider interface.
 */
export function getTikTokProvider(): TikTokProvider {
  const name = (process.env.TIKTOK_PROVIDER || "tikwm").toLowerCase();
  const timeoutMs = Number(process.env.TIKTOK_REQUEST_TIMEOUT_MS) || 15000;

  switch (name) {
    case "tikwm":
      return new TikwmProvider(timeoutMs);
    default:
      // Unknown provider configured — fail safe to the known-good default
      // rather than silently returning fake data.
      return new TikwmProvider(timeoutMs);
  }
}
