# AR SAMOON — Premium TikTok Downloader

A real, working TikTok video downloader — paste a public TikTok link, get a clean watermark-free MP4. Built and branded end-to-end as **AR SAMOON**.

No fake data. No mock API. No placeholder download button. The backend calls a real provider and returns real video data, or a real error if something's wrong.

---

## Features

- Paste a public TikTok link → get title, creator, thumbnail, duration, and a direct MP4 download link (HD when available), plus audio-only download when the provider supplies it.
- Handles short links (`vt.tiktok.com`, `vm.tiktok.com`) as well as full `tiktok.com` URLs.
- Realistic staged loading state ("Analyzing video… → Fetching video… → Preparing download…") backed by a single real request — never a frozen page.
- Full error handling: empty input, invalid URL, non-TikTok link, private/deleted video, provider timeout, provider failure, rate limiting — each with a clear, honest message. No stack traces or internals ever reach the browser.
- Simple in-memory per-IP rate limiting (no database required).
- Premium dark UI: glass cards, one accent gradient, serif display type (Fraunces) + Inter body text, subtle motion, fully responsive from phone to desktop, keyboard-accessible, respects reduced-motion.
- Provider is fully swappable — the frontend and API route never talk to TikTok directly, only to an internal `TikTokProvider` interface.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **Tailwind CSS** for styling
- Next.js **serverless API routes** (`app/api/download/route.ts`) — no separate backend needed
- No database, no auth — intentionally, for now. See "Roadmap" below.

## Architecture

```
Browser (Downloader component)
   │  POST /api/download { url }
   ▼
app/api/download/route.ts        — validates input, rate-limits, calls the provider, never leaks internals
   │
   ▼
lib/tiktok/index.ts (getTikTokProvider)  — picks a provider by env var, defaults to a safe known-good one
   │
   ▼
lib/tiktok/tikwm.ts (TikwmProvider)      — talks to the actual TikTok resolver, normalizes the response
   │
   ▼
types/index.ts (ResolvedVideo)           — the one shape every provider must return
```

Folder layout:

```
app/
  api/download/route.ts   API endpoint the frontend calls
  layout.tsx              Root layout, fonts, metadata/SEO
  page.tsx                Home page / hero
  icon.tsx                Generated favicon
  globals.css
components/
  Navbar.tsx, Footer.tsx, Downloader.tsx, ResultCard.tsx
lib/
  tiktok/
    index.ts              Provider registry/factory
    tikwm.ts               The active provider implementation
  validate-url.ts          URL validation
  rate-limit.ts            In-memory rate limiter
types/index.ts             Shared types + error codes
```

### Why this abstraction matters

`app/api/download/route.ts` only ever calls `getTikTokProvider().resolve(url)`. It has no idea which real service is behind that call. That means:

- If the current provider ever goes down or changes its response shape, you fix **one file** (`lib/tiktok/tikwm.ts`, or add a new file next to it) — the API route, the UI, and the types never change.
- Adding **Instagram, YouTube Shorts, or another platform later** (you mentioned this) is a separate, additive provider module and a separate route (e.g. `app/api/download/instagram/route.ts` calling a new `lib/instagram/` provider) — it won't touch or risk what already works here.

## Provider selection — why TikWM

TikTok has no official public "download my video" API for third-party apps, so every downloader on the internet relies on an unofficial resolver. I compared the realistic options before picking one:

| Option | Verdict |
|---|---|
| Paid marketplace APIs (Zylalabs, RapidAPI listings, etc.) | Free tiers cap out at ~50 requests total, then require a paid subscription — not viable for a real free product from day one. |
| Scraping TikTok's own pages directly | Fragile, breaks on every TikTok markup change, and is the kind of thing that gets an IP blocked fast. |
| **TikWM (`tikwm.com/api`)** | Free, no API key for standard use (nothing to leak), returns clean **watermark-free** MP4 links directly in JSON, widely used in production TikTok-downloader projects, and needs zero native dependencies — runs fine in a Vercel serverless function. |

TikWM is what's wired up now (`lib/tiktok/tikwm.ts`). It's an unofficial, community-run service, not a TikTok product — the honest tradeoff of every downloader like this. If it ever becomes unreliable, swap it out:

1. Create `lib/tiktok/<new-provider>.ts` implementing the `TikTokProvider` interface from `types/index.ts`.
2. Register it in `lib/tiktok/index.ts`.
3. Set `TIKTOK_PROVIDER=<new-provider>` in your environment.

Nothing else in the app needs to change.

## Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same keys in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Required | Purpose |
|---|---|---|
| `TIKTOK_PROVIDER` | No (defaults to `tikwm`) | Which provider implementation to use |
| `TIKTOK_API_KEY` | No | Not needed by TikWM today; reserved so a paid/keyed provider can be dropped in later without code changes |
| `TIKTOK_REQUEST_TIMEOUT_MS` | No (defaults 15000) | How long to wait for the provider before failing gracefully |
| `RATE_LIMIT_MAX` | No (defaults 20) | Max requests per IP per window |
| `RATE_LIMIT_WINDOW_MS` | No (defaults 60000) | Rate limit window in ms |

Nothing is hardcoded — every tunable lives in env vars, and no secret is ever sent to the browser (the provider call happens only inside `app/api/download/route.ts`, which runs server-side).

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000, paste a public TikTok link, and download.

Before considering any change done, run:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # production build
```

Fix real errors — don't ignore them.

## Deploying to Vercel (step by step)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com → **Add New → Project** → import that repository.
3. Framework preset: Vercel auto-detects **Next.js** — leave build/output settings default.
4. Under **Environment Variables**, add the variables from `.env.example` you want to override (all are optional — the app works with zero env vars set, using its defaults).
5. Click **Deploy**. Vercel gives you a free `*.vercel.app` domain immediately.
6. Test with a real public TikTok link on the deployed URL before sharing it.

## Free-tier limitations

- TikWM is a free, unofficial, community-run service — it can rate-limit or go down without notice, same as any free unofficial API. That's why timeouts, retries-via-clear-errors, and the swappable provider layer exist.
- The rate limiter is in-memory, so it resets on cold start and isn't shared across regions — it's a first line of defense against casual abuse, not a hard global cap. If you need a hard shared limit later, swap `lib/rate-limit.ts`'s internals for Upstash Redis; nothing else changes.
- Very long videos, slideshows/photo posts, and some region-restricted content may not resolve — the app will show a clear error rather than pretending it worked.

## Troubleshooting

- **"This link isn't from TikTok"** — make sure you copied the link from the TikTok app's Share button or the address bar on tiktok.com, not a shortened link from a different service.
- **"This video is private, deleted, or unavailable"** — the video isn't publicly accessible anymore, or was taken down.
- **"The provider took too long to respond"** — TikWM is briefly slow/overloaded; try again in a few seconds.
- **"We're getting a lot of requests right now"** — you've hit the per-IP rate limit; wait for the window to reset (`RATE_LIMIT_WINDOW_MS`).
- Nothing downloading at all in production but working locally → double check you didn't accidentally set `TIKTOK_PROVIDER` to something unregistered in Vercel's env vars (it safely falls back to `tikwm`, but double-check for typos).

## Roadmap (not built yet, by design)

Per current direction: keep this simple and working first — no database, no accounts, no admin panel for now. Planned next, once this is stable:

- Additional downloaders under the same brand (Instagram, etc.) as separate provider modules + routes, reusing this exact architecture.
- A React Native/Expo mobile app consuming this same `/api/download` endpoint — the API already returns a clean, structured JSON shape (`ResolvedVideo` in `types/index.ts`) with direct file URLs, which a mobile app can hand to its own "save to gallery" APIs (e.g. Expo `MediaLibrary`). The web app intentionally doesn't try to write to a phone gallery itself — a browser can't do that safely, and pretending otherwise would be fake functionality.
- Optional accounts/history/admin panel (Supabase + Prisma) if and when it's actually needed — deliberately left out for now to keep the product simple and fast to ship.

---

© AR SAMOON — All Rights Reserved. Not affiliated with TikTok Inc. Intended for downloading publicly accessible content you have the right to use.
