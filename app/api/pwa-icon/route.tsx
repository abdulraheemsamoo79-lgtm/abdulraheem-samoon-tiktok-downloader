import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Generates the app icon at whatever size the manifest asks for
 * (?size=192 / 512 / anything else), so there's one source of truth
 * for the brand mark instead of a set of hand-exported PNGs to keep
 * in sync.
 */
export function GET(req: NextRequest) {
  const sizeParam = Number(req.nextUrl.searchParams.get("size"));
  const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 512;
  const fontSize = Math.round(size * 0.42);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF4D6D 0%, #7C5CFF 100%)",
          color: "#fff",
          fontSize,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -2,
        }}
      >
        AR
      </div>
    ),
    { width: size, height: size }
  );
}
