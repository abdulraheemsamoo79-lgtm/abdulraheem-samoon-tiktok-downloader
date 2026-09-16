import type { MetadataRoute } from "next";

/**
 * Next.js auto-serves this at /manifest.webmanifest and links it in
 * <head> automatically — no other wiring needed for installability.
 *
 * Icons point at /api/pwa-icon (a dynamic route, see that file) rather
 * than static PNGs, so there's nothing to regenerate by hand if the
 * brand mark ever changes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AR SAMOON — Premium Downloader",
    short_name: "AR SAMOON",
    description:
      "Download TikTok, Instagram and more — fast, clean, no watermark. By AR SAMOON.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C0D12",
    theme_color: "#0C0D12",
    icons: [
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
