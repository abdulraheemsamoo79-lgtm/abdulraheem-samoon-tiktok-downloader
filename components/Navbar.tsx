export function Navbar() {
  return (
    <header className="border-b border-line/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral-violet text-sm font-semibold text-white">
            AR
          </span>
          <span className="font-display text-lg tracking-tight text-ivory">
            AR SAMOON
          </span>
        </div>
        <a
          href="#downloader"
          className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-coral/50 hover:text-ivory"
        >
          Start downloading
        </a>
      </div>
    </header>
  );
}
