"use client";

import Image from "next/image";
import { ResolvedVideo } from "@/types";

function formatDuration(seconds: number | null): string | null {
  if (seconds === null) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function ResultCard({ video }: { video: ResolvedVideo }) {
  const bestUrl = video.downloadUrlHd || video.downloadUrl;
  const duration = formatDuration(video.durationSeconds);

  return (
    <div className="animate-fade-up mx-auto mt-8 w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/80 backdrop-blur">
      <div className="flex gap-4 p-5">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
          {video.thumbnailUrl ? (
            // TikTok CDN images are unpredictable subdomains; unoptimized avoids
            // failed remote-pattern matches breaking the preview in production.
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm leading-snug text-ivory">
            {video.title}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span className="truncate">@{video.author.username}</span>
            {duration ? (
              <>
                <span aria-hidden>·</span>
                <span>{duration}</span>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <span>{video.hasWatermark ? "Watermarked" : "No watermark"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line p-5 sm:flex-row">
        <a
          href={bestUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-coral-violet px-5 py-3 text-center text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Download MP4{video.downloadUrlHd ? " (HD)" : ""}
        </a>
        {video.audioUrl ? (
          <a
            href={video.audioUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-line px-5 py-3 text-center text-sm text-muted transition-colors hover:border-coral/50 hover:text-ivory"
          >
            Save audio
          </a>
        ) : null}
      </div>
    </div>
  );
}
