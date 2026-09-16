import { NextRequest, NextResponse } from "next/server";
import { getTikTokProvider } from "@/lib/tiktok";
import { validateTikTokUrl } from "@/lib/validate-url";
import { isRateLimited } from "@/lib/rate-limit";
import { DownloadApiResponse, TikTokResolveError } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(
  code: TikTokResolveError["code"],
  message: string,
  status: number
): NextResponse<DownloadApiResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  if (isRateLimited(ip)) {
    return fail(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and try again.",
      429
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_URL", "Invalid request body.", 400);
  }

  const rawUrl =
    typeof body === "object" && body !== null && "url" in body
      ? String((body as Record<string, unknown>).url ?? "")
      : "";

  try {
    const cleanUrl = validateTikTokUrl(rawUrl);
    const provider = getTikTokProvider();
    const video = await provider.resolve(cleanUrl);

    const payload: DownloadApiResponse = { success: true, data: video };
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    if (err instanceof TikTokResolveError) {
      const status =
        err.code === "RATE_LIMITED" ? 429 : err.code === "EMPTY_URL" || err.code === "INVALID_URL" || err.code === "NOT_TIKTOK" ? 400 : 502;
      return fail(err.code, err.message, status);
    }

    // Never leak internals — log server-side only, return a generic message.
    console.error("[api/download] unexpected error:", err);
    return fail(
      "UNKNOWN",
      "We couldn't process this TikTok link. Please check the URL and try again.",
      500
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: { code: "UNSUPPORTED", message: "Use POST." } },
    { status: 405 }
  );
}
