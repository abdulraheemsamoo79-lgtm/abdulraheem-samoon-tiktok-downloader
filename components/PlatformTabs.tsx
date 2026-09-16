"use client";

import { useState } from "react";
import { Downloader } from "./Downloader";
import { InstagramDownloader } from "./InstagramDownloader";

type Platform = "tiktok" | "instagram";

const TABS: { id: Platform; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
];

export function PlatformTabs() {
  const [platform, setPlatform] = useState<Platform>("tiktok");

  return (
    <div id="downloader" className="scroll-mt-24">
      <div
        role="tablist"
        aria-label="Choose a platform"
        className="mx-auto mb-6 flex w-fit gap-1 rounded-full border border-line bg-surface/60 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={platform === tab.id}
            onClick={() => setPlatform(tab.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              platform === tab.id
                ? "bg-coral-violet text-white"
                : "text-muted hover:text-ivory"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {platform === "tiktok" ? <Downloader /> : <InstagramDownloader />}
    </div>
  );
}
