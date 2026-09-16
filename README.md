# AR SAMOON — Premium Downloader

A real, working TikTok + Instagram downloader — paste a public link, get a clean watermark-free file. Built and branded end-to-end as **AR SAMOON**. Installable as an app on your phone (see below) and built so it's easy to add more platforms.

No fake data. No mock API. No placeholder download button. The backend calls a real provider and returns real data, or a real error if something's wrong.

---

## Features

- **TikTok**: paste a link → get title, creator, thumbnail, duration, and a direct MP4 download link (HD when available), plus audio-only download when the provider supplies it. Handles short links (`vt.tiktok.com`, `vm.tiktok.com`) as well as full `tiktok.com` URLs.
- **Instagram**: paste a reel/post link → get a direct download link. Carousel posts (multiple photos/videos in one post) are supported and show every item.
- Realistic staged loading state ("Analyzing… → Fetching… → Preparing download…") backed by a single real request — never a frozen page.
- Full error handling per platform: empty input, invalid URL, wrong-platform link, private/deleted content, provider timeout, provider failure, rate limiting, not-configured — each with a clear, honest message. No stack traces or internals ever reach the browser.
- Simple in-memory per-IP rate limiting (no database required).
- **Installable as an app** (PWA) — add it to your phone's home screen and it opens full-screen, no browser chrome. Because it's the live site running standalone (not a separately-built app package), any change you push to the web — new UI, a fixed API, a new downloader — shows up the next time it's opened. No app-store rebuild step. See "Installing as an app" below.
- Premium dark UI: glass cards, one accent gradient, serif display type (Fraunces) + Inter body text, subtle motion, fully responsive from phone to desktop, keyboard-accessible, respects reduced-motion.
- Each platform is fully isolated and swappable — the frontend and API routes never talk to TikTok/Instagram directly, only to internal `TikTokProvider` / `InstagramProvider` interfaces.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **Tailwind CSS** for styling
- Next.js **serverless API routes** (`app/api/download/route.ts`) — no separate backend needed
- No database, no auth — intentionally, for now. See "Roadmap" below.

## Architecture

Each platform is its own vertical slice — its own types, provider, route, and (for now) its own UI components — so they can't break each other:

```
TikTok:
Browser (Downloader) → POST /api/download → lib/tiktok/index.ts → lib/tiktok/tikwm.ts → TikWM (hosted, no key)

Instagram:
Browser (InstagramDownloader) → POST /api/download/instagram → lib/instagram/index.ts → lib/instagram/cobalt-instagram.ts → lib/cobalt/client.ts → YOUR self-hosted Cobalt instance
```

Folder layout:

```
app/
  api/
    download/route.ts             TikTok endpoint
    download/instagram/route.ts   Instagram endpoint
    pwa-icon/route.ts             Generates the app icon at any size (for the manifest)
  manifest.ts                     PWA manifest (auto-served at /manifest.webmanifest)
  layout.tsx                      Root layout, fonts, metadata/SEO, PWA meta
  page.tsx                        Home page / hero / platform tabs
  icon.tsx / apple-icon.tsx       Generated favicon / iOS home-screen icon
  globals.css
components/
  Navbar.tsx, Footer.tsx
  PlatformTabs.tsx                 Switches between TikTok / Instagram
  Downloader.tsx, ResultCard.tsx           TikTok UI
  InstagramDownloader.tsx, InstagramResultCard.tsx   Instagram UI
  InstallHint.tsx                  "Install app" button / iOS instructions
lib/
  tiktok/            index.ts (factory) + tikwm.ts (provider)
  instagram/         index.ts (factory) + cobalt-instagram.ts (provider)
  cobalt/client.ts   Shared low-level client for any Cobalt-backed platform
  validate-url.ts, validate-instagram-url.ts
  rate-limit.ts      Shared in-memory rate limiter
types/
  index.ts           TikTok types + error codes
  instagram.ts        Instagram types + error codes (isolated from TikTok's)
public/sw.js          Minimal service worker (installability only, see PWA section)
```

### Why this abstraction matters

Each API route only ever calls its own provider factory (`getTikTokProvider()` / `getInstagramProvider()`) — it has no idea which real service is behind that call. That means:

- If a provider ever goes down or changes its response shape, you fix **one file** — the route, the UI, and the types never change.
- **Adding YouTube or Snapchat next** (both work through the same self-hosted Cobalt instance) is: create `types/youtube.ts`, `lib/youtube/` (reusing `lib/cobalt/client.ts`), `app/api/download/youtube/route.ts`, and a `YouTubeDownloader` component + a new tab in `PlatformTabs.tsx`. Nothing in the TikTok or Instagram slices needs to change.

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

## Instagram provider — why Cobalt, self-hosted

Instagram has no equivalent to TikWM: there is no reliable, free, no-key hosted resolver for it. What actually exists:

| Option | Verdict |
|---|---|
| Paid marketplace APIs (Zylalabs, RapidAPI listings) | Same problem as before — trial caps around 50 requests, then paid. |
| Undocumented scraper scripts found on GitHub/npm | Break constantly, no support, easy to get IP-blocked. |
| The public `api.cobalt.tools` hosted instance | Cobalt's own docs explicitly say hosted instances are bot-protected and **not intended to be used by other projects without permission** — using it here would be both against the project's own terms and unreliable (Turnstile challenges). |
| **Self-hosted Cobalt** (`imputnet/cobalt`, 39k+ ★ on GitHub) | Real, open-source, actively maintained, supports Instagram (and YouTube, Snapchat Spotlight, Twitter/X, Reddit, SoundCloud, and more) through one consistent JSON API. You control it, so no shared rate limits and no ToS conflict. |

Self-hosting is the only option here that's both legitimate and durable, so that's what's wired up (`lib/cobalt/client.ts` + `lib/instagram/cobalt-instagram.ts`).

### Setting up Instagram downloads

1. Deploy your own Cobalt instance — the fastest way is Railway's official one-click template: search "Cobalt" in the Railway template marketplace (or deploy `imputnet/cobalt`'s Docker image, `ghcr.io/imputnet/cobalt`, directly). It takes about 2 minutes and needs no manual server setup.
2. Once deployed, Railway gives it a public URL like `https://your-cobalt.up.railway.app`.
3. In this project's environment variables (`.env.local` locally, Vercel dashboard in production), set:
   ```
   COBALT_API_URL=https://your-cobalt.up.railway.app
   ```
4. (Optional but recommended once this is public) On your Cobalt instance, set `API_AUTH_REQUIRED=1` and configure an API key, then set `COBALT_API_KEY=<that key>` here too — otherwise anyone who finds your Cobalt URL can use it directly.
5. Redeploy this project (or just restart it locally) and test with a real public Instagram reel link.

Until `COBALT_API_URL` is set, the Instagram tab will show a clear "Instagram downloads aren't set up yet" error instead of pretending to work — never a fake success.

### Adding YouTube or Snapchat next

Both are supported by the same self-hosted Cobalt instance you already set up for Instagram — no new infrastructure needed. Follow the pattern described above under "Why this abstraction matters."

## Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same keys in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Required | Purpose |
|---|---|---|
| `TIKTOK_PROVIDER` | No (defaults to `tikwm`) | Which provider implementation to use |
| `TIKTOK_API_KEY` | No | Not needed by TikWM today; reserved so a paid/keyed provider can be dropped in later without code changes |
| `TIKTOK_REQUEST_TIMEOUT_MS` | No (defaults 15000) | How long to wait for the provider before failing gracefully |
| `RATE_LIMIT_MAX` | No (defaults 20) | Max requests per IP per window |
| `RATE_LIMIT_WINDOW_MS` | No (defaults 60000) | Rate limit window in ms |
| `INSTAGRAM_PROVIDER` | No (defaults to `cobalt`) | Which Instagram provider implementation to use |
| `COBALT_API_URL` | **Yes, for Instagram** | URL of your self-hosted Cobalt instance — see "Setting up Instagram downloads" above. Instagram downloads show a clear error until this is set; nothing else in the app is affected |
| `COBALT_API_KEY` | No | Only needed if you enabled `API_AUTH_REQUIRED` on your Cobalt instance |
| `COBALT_REQUEST_TIMEOUT_MS` | No (defaults 20000) | How long to wait for your Cobalt instance before failing gracefully |

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
4. Under **Environment Variables**, add the variables from `.env.example` you want to override. TikTok works with zero env vars set. For Instagram, you must add `COBALT_API_URL` (see "Setting up Instagram downloads" below) — without it, the Instagram tab shows a clear "not set up yet" message rather than fake results.
5. Click **Deploy**. Vercel gives you a free `*.vercel.app` domain immediately.
6. Test with a real public TikTok link on the deployed URL before sharing it.

## Installing as an app (PWA)

This is a Progressive Web App: a `manifest.webmanifest` (`app/manifest.ts`) and a minimal service worker (`public/sw.js`) make it installable straight from the browser — no app store, no separate mobile build.

**On Android (Chrome):** open the deployed site → you'll see an "Install AR SAMOON app" button appear on the page (or use Chrome's menu → "Install app" / "Add to Home Screen"). It opens full-screen from your home screen from then on.

**On iPhone (Safari):** tap the Share icon → "Add to Home Screen". Safari doesn't support the automatic install prompt, so the page shows this instruction directly when it detects iOS.

**Why updates "just work":** the installed app isn't a separately-built package — it's a home-screen shortcut that opens your live deployed URL in standalone mode. The service worker intentionally caches nothing (see the comment in `public/sw.js`), so every open hits your real, current deployment. Push a change to `main`, Vercel redeploys, and the "app" is instantly up to date — no rebuild, no re-install, no app-store review.

**If you later want an actual Play Store / App Store listing:** wrap this same live URL with a tool like [Capacitor](https://capacitorjs.com/) in "server URL" mode, or a [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity) on Android. Both still just load your live site, so you keep the exact same "update the web, the app updates" behavior — the only thing that changes is where the icon lives.

## Free-tier limitations

- TikWM is a free, unofficial, community-run service — it can rate-limit or go down without notice, same as any free unofficial API. That's why timeouts, retries-via-clear-errors, and the swappable provider layer exist.
- The rate limiter is in-memory, so it resets on cold start and isn't shared across regions — it's a first line of defense against casual abuse, not a hard global cap. If you need a hard shared limit later, swap `lib/rate-limit.ts`'s internals for Upstash Redis; nothing else changes.
- Very long videos, slideshows/photo posts, and some region-restricted content may not resolve — the app will show a clear error rather than pretending it worked.

## Troubleshooting

- **"This link isn't from TikTok"** — make sure you copied the link from the TikTok app's Share button or the address bar on tiktok.com, not a shortened link from a different service.
- **"This video is private, deleted, or unavailable"** — the video isn't publicly accessible anymore, or was taken down.
- **"The provider took too long to respond"** — TikWM is briefly slow/overloaded; try again in a few seconds.
- **"We're getting a lot of requests right now"** — you've hit the per-IP rate limit; wait for the window to reset (`RATE_LIMIT_WINDOW_MS`).
- **"Instagram downloads aren't set up yet on this deployment"** — you haven't set `COBALT_API_URL` yet. See "Setting up Instagram downloads" above.
- Instagram works locally but not on Vercel → you probably set `COBALT_API_URL` in `.env.local` only; add it in Vercel's dashboard too and redeploy.
- Nothing downloading at all in production but working locally → double check you didn't accidentally set `TIKTOK_PROVIDER`/`INSTAGRAM_PROVIDER` to something unregistered in Vercel's env vars (both safely fall back to their defaults, but double-check for typos).
- **Install button doesn't show up** — the browser only offers install once a page has been visited a couple of times / meets its own heuristics, and iOS Safari never shows it at all (use the Share → Add to Home Screen instructions instead).

## Roadmap (not built yet, by design)

Per current direction: keep this simple and working first — no database, no accounts, no admin panel for now. Planned next, once this is stable:

- **YouTube and Snapchat downloaders** — same self-hosted Cobalt instance already set up for Instagram, following the exact pattern in "Adding YouTube or Snapchat next" above.
- A real Play Store / App Store listing via Capacitor or a Trusted Web Activity wrapping this same live site (see "Installing as an app" above) — if the PWA install experience ever isn't enough.
- Optional accounts/history/admin panel (Supabase + Prisma) if and when it's actually needed — deliberately left out for now to keep the product simple and fast to ship.

---

© AR SAMOON — All Rights Reserved. Not affiliated with TikTok Inc. Intended for downloading publicly accessible content you have the right to use.
