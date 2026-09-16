/**
 * Instagram types — deliberately isolated from types/index.ts (TikTok).
 * Nothing here is imported by the TikTok pipeline, and nothing from
 * TikTok's types is imported here. Each platform is a self-contained
 * module; adding YouTube or Snapchat later means adding another file
 * like this one, not editing this one.
 */

export interface InstagramMediaItem {
  type: "photo" | "video" | "gif";
  url: string;
  thumbnailUrl: string | null;
}

export interface ResolvedInstagramPost {
  sourceUrl: string;
  /** What the UI downloads by default — the first/only item. */
  primary: InstagramMediaItem;
  /** Full list — length 1 for a reel/single post, >1 for a carousel. */
  items: InstagramMediaItem[];
  filenameHint: string | null;
}

export type InstagramErrorCode =
  | "EMPTY_URL"
  | "INVALID_URL"
  | "NOT_INSTAGRAM"
  | "PROVIDER_NOT_CONFIGURED"
  | "PRIVATE_OR_UNAVAILABLE"
  | "UNSUPPORTED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class InstagramResolveError extends Error {
  code: InstagramErrorCode;

  constructor(code: InstagramErrorCode, message: string) {
    super(message);
    this.name = "InstagramResolveError";
    this.code = code;
  }
}

export interface InstagramProvider {
  readonly name: string;
  resolve(url: string): Promise<ResolvedInstagramPost>;
}

/** Shape returned by POST /api/download/instagram */
export interface InstagramApiResponse {
  success: boolean;
  data?: ResolvedInstagramPost;
  error?: {
    code: InstagramErrorCode;
    message: string;
  };
}
