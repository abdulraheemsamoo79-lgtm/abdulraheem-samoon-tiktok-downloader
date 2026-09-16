import { ResolvedVideo, TikTokProvider, TikTokResolveError } from "@/types";

const TIKWM_ENDPOINT = "https://www.tikwm.com/api/";

interface TikwmRawResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    title: string;
    author?: { unique_id?: string; nickname?: string; avatar?: string };
    duration?: number;
    cover?: string;
    play?: string; // watermark-free mp4
    hdplay?: string; // hd, watermark-free mp4 (may be absent)
    music?: string; // extracted audio
  };
}

/**
 * TikWM (tikwm.com) — chosen provider.
 *
 * Why: it is one of the few TikTok resolvers that (a) returns clean,
 * watermark-free MP4 links directly (no server-side proxying needed
 * on our end for the file itself), (b) needs no API key for standard
 * use so there's nothing to leak, (c) responds in JSON that's simple
 * to normalize, and (d) has no SDK / native dependency, so it runs
 * fine inside a Vercel serverless function. It's an unofficial,
 * community-run API, not an official TikTok product — see the README
 * for its tradeoffs and how to swap it out if it ever goes down.
 */
export class TikwmProvider implements TikTokProvider {
  readonly name = "tikwm";
  private readonly timeoutMs: number;

  constructor(timeoutMs = 15000) {
    this.timeoutMs = timeoutMs;
  }

  async resolve(url: string): Promise<ResolvedVideo> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(TIKWM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "AR-SAMOON-TikTok-Downloader/1.0",
        },
        body: new URLSearchParams({ url, hd: "1" }).toString(),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new TikTokResolveError(
          "TIMEOUT",
          "The provider took too long to respond. Please try again."
        );
      }
      throw new TikTokResolveError(
        "NETWORK_ERROR",
        "Couldn't reach the video provider. Check your connection and try again."
      );
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 429) {
      throw new TikTokResolveError(
        "RATE_LIMITED",
        "We're getting a lot of requests right now. Please try again in a moment."
      );
    }

    if (!response.ok) {
      throw new TikTokResolveError(
        "PROVIDER_ERROR",
        "The video provider returned an unexpected response."
      );
    }

    let json: TikwmRawResponse;
    try {
      json = (await response.json()) as TikwmRawResponse;
    } catch {
      throw new TikTokResolveError(
        "PROVIDER_ERROR",
        "The video provider returned an unreadable response."
      );
    }

    if (json.code !== 0 || !json.data) {
      const msg = (json.msg || "").toLowerCase();
      if (msg.includes("private") || msg.includes("not exist") || msg.includes("removed")) {
        throw new TikTokResolveError(
          "PRIVATE_OR_DELETED",
          "This video is private, deleted, or unavailable."
        );
      }
      throw new TikTokResolveError(
        "PROVIDER_ERROR",
        "We couldn't process this TikTok link. Please check the URL and try again."
      );
    }

    const d = json.data;

    if (!d.play) {
      throw new TikTokResolveError(
        "UNSUPPORTED",
        "This video format isn't supported yet."
      );
    }

    const video: ResolvedVideo = {
      id: d.id,
      title: d.title?.trim() || "Untitled TikTok video",
      author: {
        username: d.author?.unique_id ?? "unknown",
        displayName: d.author?.nickname ?? d.author?.unique_id ?? "Unknown creator",
        avatarUrl: d.author?.avatar ?? null,
      },
      thumbnailUrl: d.cover ?? "",
      durationSeconds: typeof d.duration === "number" ? d.duration : null,
      downloadUrl: d.play,
      downloadUrlHd: d.hdplay ?? null,
      audioUrl: d.music ?? null,
      format: "mp4",
      hasWatermark: false,
      sourceUrl: url,
    };

    return video;
  }
}
