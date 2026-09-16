"use client";

import { useEffect, useRef, useState } from "react";
import { InstagramApiResponse, ResolvedInstagramPost } from "@/types/instagram";
import { InstagramResultCard } from "./InstagramResultCard";

type Stage = "idle" | "analyzing" | "fetching" | "preparing" | "done" | "error";

const STAGE_LABEL: Record<Stage, string | null> = {
  idle: null,
  analyzing: "Analyzing post…",
  fetching: "Fetching media…",
  preparing: "Preparing download…",
  done: null,
  error: null,
};

export function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<ResolvedInstagramPost | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = stage === "analyzing" || stage === "fetching" || stage === "preparing";

  useEffect(() => {
    if (!isLoading) return;
    const t1 = setTimeout(() => setStage((s) => (s === "analyzing" ? "fetching" : s)), 500);
    const t2 = setTimeout(() => setStage((s) => (s === "fetching" ? "preparing" : s)), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage === "analyzing"]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPost(null);

    if (!url.trim()) {
      setError("Please paste an Instagram link.");
      inputRef.current?.focus();
      return;
    }

    setStage("analyzing");

    try {
      const res = await fetch("/api/download/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json: InstagramApiResponse = await res.json();

      if (!json.success || !json.data) {
        setError(
          json.error?.message ||
            "We couldn't process this Instagram link. Please check the URL and try again."
        );
        setStage("error");
        return;
      }

      setPost(json.data);
      setStage("done");
    } catch {
      setError("Something went wrong on our end. Please try again.");
      setStage("error");
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }

  function handleClear() {
    setUrl("");
    setPost(null);
    setError(null);
    setStage("idle");
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste an Instagram post or reel link…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            aria-label="Instagram post URL"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 pr-16 text-sm text-ivory placeholder:text-muted/70 transition-colors focus:border-coral/60 disabled:opacity-60"
          />
          {url ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-ivory"
            >
              Clear
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              aria-label="Paste from clipboard"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-ivory"
            >
              Paste
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-xl bg-coral-violet px-6 py-3.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
        >
          {isLoading ? "Working…" : "Download"}
        </button>
      </form>

      <div className="mt-3 min-h-[1.25rem] text-center text-sm" aria-live="polite">
        {isLoading && STAGE_LABEL[stage] ? (
          <span className="text-muted">{STAGE_LABEL[stage]}</span>
        ) : null}
        {stage === "error" && error ? (
          <span className="text-coral">{error}</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mx-auto mt-8 w-full max-w-xl animate-pulse overflow-hidden rounded-2xl border border-line bg-surface/60">
          <div className="flex gap-4 p-5">
            <div className="h-28 w-20 shrink-0 rounded-lg bg-surface-raised" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-4/5 rounded bg-surface-raised" />
              <div className="h-3 w-1/2 rounded bg-surface-raised" />
            </div>
          </div>
          <div className="border-t border-line p-5">
            <div className="h-11 w-full rounded-xl bg-surface-raised" />
          </div>
        </div>
      ) : null}

      {stage === "done" && post ? <InstagramResultCard post={post} /> : null}
    </div>
  );
}
