import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #FF4D6D 0%, #7C5CFF 100%)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        AR
      </div>
    ),
    { ...size }
  );
}
