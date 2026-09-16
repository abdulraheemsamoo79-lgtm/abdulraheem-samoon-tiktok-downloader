export function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-base text-ivory">AR SAMOON</p>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} AR SAMOON — All Rights Reserved
          </p>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-muted">
          For downloading publicly available content you have the right to
          use. Not affiliated with TikTok Inc.
        </p>
      </div>
    </footer>
  );
}
