import { Downloader } from "@/components/Downloader";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-void-radial animate-glow"
      />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-28">
        <p className="text-sm font-medium tracking-wide text-coral">
          AR SAMOON
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-ivory sm:text-5xl">
          Download TikTok videos.
          <br />
          Simple. Fast. Premium.
        </h1>
        <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-muted">
          Paste any public TikTok link and get a clean, watermark-free MP4 —
          built for people who care about quality.
        </p>

        <div className="mt-10 w-full">
          <Downloader />
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface/60 p-5">
            <p className="font-display text-lg text-ivory">No watermark</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Every download is the clean file — nothing added on top.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface/60 p-5">
            <p className="font-display text-lg text-ivory">Any device</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Built to feel native on phones, tablets, and desktop alike.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface/60 p-5">
            <p className="font-display text-lg text-ivory">Built by AR SAMOON</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              A small, focused product — no accounts, no clutter, no ads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
