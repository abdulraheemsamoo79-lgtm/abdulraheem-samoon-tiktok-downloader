import { InstagramProvider } from "@/types/instagram";
import { CobaltInstagramProvider } from "./cobalt-instagram";

/**
 * Provider registry for Instagram — same pattern as lib/tiktok/index.ts.
 * To add YouTube or Snapchat later against the same Cobalt instance,
 * create a sibling module (lib/youtube/, lib/snapchat/) reusing
 * lib/cobalt/client.ts, rather than editing this file.
 */
export function getInstagramProvider(): InstagramProvider {
  const name = (process.env.INSTAGRAM_PROVIDER || "cobalt").toLowerCase();
  const timeoutMs = Number(process.env.COBALT_REQUEST_TIMEOUT_MS) || 20000;

  switch (name) {
    case "cobalt":
    default:
      return new CobaltInstagramProvider(timeoutMs);
  }
}
