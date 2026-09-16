/**
 * Thin client for a self-hosted Cobalt instance (https://github.com/imputnet/cobalt).
 *
 * Why Cobalt, and why self-hosted:
 * TikTok has TikWM — a free, no-key, hosted resolver. Instagram has no
 * equivalent: every "free hosted API" for Instagram found during research
 * was either a paid marketplace listing with a ~50-request trial, or an
 * undocumented scraper likely to break or get IP-blocked. Cobalt is real,
 * open-source (39k+ GitHub stars), actively maintained, and supports
 * Instagram, YouTube, Snapchat Spotlight, Twitter/X, Reddit and more
 * through one consistent API — but Anthropic's/the project's own hosted
 * instance (api.cobalt.tools) explicitly asks that it not be used by
 * other projects without permission, and is bot-protected besides.
 *
 * The correct move is to self-host it — Cobalt is designed for this and
 * there's an official one-click Railway template, which fits this
 * project's existing deployment pattern. Point COBALT_API_URL at that
 * instance and every platform this client talks to (Instagram today,
 * YouTube/Snapchat later) works the same way. See README for setup.
 */

export interface CobaltRequestOptions {
  downloadMode?: "auto" | "audio" | "mute";
  videoQuality?: string;
  audioFormat?: string;
}

interface CobaltPickerItem {
  type: "photo" | "video" | "gif";
  url: string;
  thumb?: string;
}

export type CobaltResponse =
  | { status: "tunnel" | "redirect"; url: string; filename: string }
  | {
      status: "local-processing";
      service: string;
      type: string;
      tunnel: string[];
      output: { type: string; filename: string };
    }
  | {
      status: "picker";
      picker: CobaltPickerItem[];
      audio?: string;
      audioFilename?: string;
    }
  | {
      status: "error";
      error: { code: string; context?: { service?: string; limit?: number } };
    };

export type CobaltClientErrorKind =
  | "NOT_CONFIGURED"
  | "TIMEOUT"
  | "NETWORK"
  | "HTTP"
  | "PARSE";

export class CobaltClientError extends Error {
  kind: CobaltClientErrorKind;

  constructor(kind: CobaltClientErrorKind, message: string) {
    super(message);
    this.name = "CobaltClientError";
    this.kind = kind;
  }
}

export async function callCobalt(
  url: string,
  opts: CobaltRequestOptions = {},
  timeoutMs = 20000
): Promise<CobaltResponse> {
  const base = process.env.COBALT_API_URL;
  if (!base) {
    throw new CobaltClientError(
      "NOT_CONFIGURED",
      "COBALT_API_URL is not set — no Cobalt instance is configured."
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const apiKey = process.env.COBALT_API_KEY;
  if (apiKey) headers["Authorization"] = `Api-Key ${apiKey}`;

  let response: Response;
  try {
    response = await fetch(base.replace(/\/+$/, "") + "/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        url,
        downloadMode: opts.downloadMode ?? "auto",
        videoQuality: opts.videoQuality ?? "1080",
        audioFormat: opts.audioFormat ?? "mp3",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new CobaltClientError(
        "TIMEOUT",
        "The configured Cobalt instance took too long to respond."
      );
    }
    throw new CobaltClientError(
      "NETWORK",
      "Couldn't reach the configured Cobalt instance."
    );
  } finally {
    clearTimeout(timer);
  }

  let json: CobaltResponse;
  try {
    json = (await response.json()) as CobaltResponse;
  } catch {
    throw new CobaltClientError(
      "PARSE",
      "The configured Cobalt instance returned an unreadable response."
    );
  }

  if (!response.ok && json.status !== "error") {
    throw new CobaltClientError(
      "HTTP",
      `The configured Cobalt instance responded with HTTP ${response.status}.`
    );
  }

  return json;
}
