"use client";

import Image from "next/image";
import { ResolvedInstagramPost } from "@/types/instagram";

export function InstagramResultCard({ post }: { post: ResolvedInstagramPost }) {
  const isCarousel = post.items.length > 1;

  return (
    <div className="animate-fade-up mx-auto mt-8 w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/80 backdrop-blur">
      <div className="flex gap-4 p-5">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
          {post.primary.thumbnailUrl ? (
            <Image
              src={post.primary.thumbnailUrl}
              alt="Instagram media preview"
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-ivory">
            {isCarousel
              ? `Carousel post — ${post.items.length} items`
              : post.primary.type === "photo"
              ? "Photo post"
              : "Video / Reel"}
          </p>
          <p className="mt-2 text-xs text-muted">Ready to download</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line p-5">
        {!isCarousel ? (
          <a
            href={post.primary.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-coral-violet px-5 py-3 text-center text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Download {post.primary.type === "photo" ? "photo" : "video"}
          </a>
        ) : (
          <div className="flex flex-col gap-2">
            {post.items.map((item, i) => (
              <a
                key={i}
                href={item.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-line px-5 py-3 text-center text-sm text-muted transition-colors hover:border-coral/50 hover:text-ivory"
              >
                Item {i + 1} — {item.type}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
