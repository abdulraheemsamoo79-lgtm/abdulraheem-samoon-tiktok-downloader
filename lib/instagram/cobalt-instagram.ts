import {
  InstagramMediaItem,
  InstagramProvider,
  InstagramResolveError,
  ResolvedInstagramPost,
} from "@/types/instagram";
import { callCobalt, CobaltClientError } from "@/lib/cobalt/client";

export class CobaltInstagramProvider implements InstagramProvider {
  readonly name = "cobalt";
  private readonly timeoutMs: number;

  constructor(timeoutMs = 20000) {
    this.timeoutMs = timeoutMs;
  }

  async resolve(url: string): Promise<ResolvedInstagramPost> {
    let result;
    try {
      result = await callCobalt(url, { downloadMode: "auto" }, this.timeoutMs);
    } catch (err) {
      if (err instanceof CobaltClientError) {
        if (err.kind === "NOT_CONFIGURED") {
          throw new InstagramResolveError(
            "PROVIDER_NOT_CONFIGURED",
            "Instagram downloads aren't set up yet on this deployment — a Cobalt instance needs to be configured. See the README."
          );
        }
        if (err.kind === "TIMEOUT") {
          throw new InstagramResolveError(
            "TIMEOUT",
            "The provider took too long to respond. Please try again."
          );
        }
        throw new InstagramResolveError(
          "NETWORK_ERROR",
          "Couldn't reach the video provider. Check your connection and try again."
        );
      }
      throw err;
    }

    if (result.status === "error") {
      const code = (result.error?.code || "").toLowerCase();
      if (
        code.includes("private") ||
        code.includes("not_found") ||
        code.includes("content.post.unavailable") ||
        code.includes("link.unsupported")
      ) {
        throw new InstagramResolveError(
          "PRIVATE_OR_UNAVAILABLE",
          "This post is private, deleted, or unavailable."
        );
      }
      if (code.includes("rate")) {
        throw new InstagramResolveError(
          "RATE_LIMITED",
          "The provider is rate-limiting requests right now. Please try again shortly."
        );
      }
      throw new InstagramResolveError(
        "PROVIDER_ERROR",
        "We couldn't process this Instagram link. Please check the URL and try again."
      );
    }

    if (result.status === "picker") {
      const items: InstagramMediaItem[] = result.picker.map((p) => ({
        type: p.type,
        url: p.url,
        thumbnailUrl: p.thumb ?? null,
      }));
      if (items.length === 0) {
        throw new InstagramResolveError(
          "UNSUPPORTED",
          "This post format isn't supported yet."
        );
      }
      return {
        sourceUrl: url,
        primary: items[0]!,
        items,
        filenameHint: result.audioFilename ?? null,
      };
    }

    if (result.status === "tunnel" || result.status === "redirect") {
      const item: InstagramMediaItem = {
        type: "video",
        url: result.url,
        thumbnailUrl: null,
      };
      return {
        sourceUrl: url,
        primary: item,
        items: [item],
        filenameHint: result.filename ?? null,
      };
    }

    if (result.status === "local-processing") {
      const first = result.tunnel[0];
      if (!first) {
        throw new InstagramResolveError(
          "UNSUPPORTED",
          "This post format isn't supported yet."
        );
      }
      const item: InstagramMediaItem = {
        type: "video",
        url: first,
        thumbnailUrl: null,
      };
      return {
        sourceUrl: url,
        primary: item,
        items: [item],
        filenameHint: result.output?.filename ?? null,
      };
    }

    throw new InstagramResolveError(
      "UNKNOWN",
      "We couldn't process this Instagram link. Please check the URL and try again."
    );
  }
}
