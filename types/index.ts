/**
 * Shared types for the AR SAMOON TikTok resolver pipeline.
 * These are provider-agnostic: every TikTokProvider implementation
 * normalizes its response into this shape, so the frontend and any
 * future mobile client never need to know which provider was used.
 */

export interface ResolvedVideo {
  id: string;
  title: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  thumbnailUrl: string;
  durationSeconds: number | null;
  downloadUrl: string;
  downloadUrlHd: string | null;
  audioUrl: string | null;
  format: "mp4";
  hasWatermark: boolean;
  sourceUrl: string;
}

export type TikTokErrorCode =
  | "EMPTY_URL"
  | "INVALID_URL"
  | "NOT_TIKTOK"
  | "PRIVATE_OR_DELETED"
  | "UNSUPPORTED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class TikTokResolveError extends Error {
  code: TikTokErrorCode;

  constructor(code: TikTokErrorCode, message: string) {
    super(message);
    this.name = "TikTokResolveError";
    this.code = code;
  }
}

export interface TikTokProvider {
  /** Human-readable id for logs/health checks, e.g. "tikwm" */
  readonly name: string;
  /** Resolve a public TikTok URL into a normalized ResolvedVideo. */
  resolve(url: string): Promise<ResolvedVideo>;
}

/** Shape returned by POST /api/download */
export interface DownloadApiResponse {
  success: boolean;
  data?: ResolvedVideo;
  error?: {
    code: TikTokErrorCode;
    message: string;
  };
}
