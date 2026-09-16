import { NextRequest, NextResponse } from "next/server";
import { getInstagramProvider } from "@/lib/instagram";
import { validateInstagramUrl } from "@/lib/validate-instagram-url";
import { isRateLimited } from "@/lib/rate-limit";
import {
  InstagramApiResponse,
  InstagramErrorCode,
  InstagramResolveError,
} from "@/types/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(
  code: InstagramErrorCode,
  message: string,
  status: number
): NextResponse<InstagramApiResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  if (isRateLimited(`ig:${ip}`)) {
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
    const cleanUrl = validateInstagramUrl(rawUrl);
    const provider = getInstagramProvider();
    const data = await provider.resolve(cleanUrl);

    const payload: InstagramApiResponse = { success: true, data };
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    if (err instanceof InstagramResolveError) {
      const status =
        err.code === "RATE_LIMITED"
          ? 429
          : err.code === "EMPTY_URL" ||
            err.code === "INVALID_URL" ||
            err.code === "NOT_INSTAGRAM"
          ? 400
          : err.code === "PROVIDER_NOT_CONFIGURED"
          ? 503
          : 502;
      return fail(err.code, err.message, status);
    }

    console.error("[api/download/instagram] unexpected error:", err);
    return fail(
      "UNKNOWN",
      "We couldn't process this Instagram link. Please check the URL and try again.",
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
