<div align="center">

# TradeHub

**The competitive social network for traders.**
TradingView × Reddit × Discord × Duolingo-grade gamification × esports ranked ladder — with Apple-level polish.

</div>

---

TradeHub turns trading into a competitive online game: connect a verified account, post setups, climb a seasonal ranked ladder (Bronze → Elite), battle in competitions, and level up through a gamified learning hub.

This repository is a **production** Next.js application (not a prototype). It **builds, runs, and deploys today** in demo mode using seeded launch content, and turns fully live the moment you add your Supabase / Stripe / OAuth credentials — the integration code is real and guarded, never mocked.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript (strict) |
| Styling | Tailwind v4 — the original `tokens.css` design system ported **verbatim** |
| Backend | Supabase — Postgres + Auth + Storage + Realtime, full **RLS** |
| Data/state | TanStack Query · Zustand · async data-access layer (seed ↔ Supabase) |
| Motion | Framer Motion (subtle, `prefers-reduced-motion` aware) |
| Payments | Stripe Checkout + webhooks |
| Analytics | PostHog (no-op until keyed) |
| Tests | Vitest (domain logic) |

## Features

Feed (votes, trade cards, charts) · Trader profiles with verified stats & equity curve · **Ranked ladder** with ELO/MMR, tiers, divisions, seasonal resets and an anti-fake credibility score · Competitions (seasonal / 48h battles / friends) · Discord-style communities (servers, channels, chat, members) · DMs · Notifications · **Gamified learning hub** (XP, streaks, paths, lessons) · TradeHub Pro (Stripe) · Settings & connected accounts · Auth (email + Google/Apple/Discord/X) and a 5-step onboarding wizard. Fully responsive — desktop rails collapse to a mobile bottom-nav + drawer.

## Quick start (demo mode — no keys needed)

```bash
npm install
cp .env.example .env.local   # leave values empty to run on seeded data
npm run dev                  # http://localhost:3000  → opens on /feed
```

With no credentials the app serves realistic seeded content through the same async data layer that talks to Supabase in production, and auth/Stripe actions degrade gracefully (clear "configure X" messaging) instead of crashing.

## Going live

1. **Supabase** — create a project, then run the SQL in `supabase/migrations/0001…0004` in order and `supabase/seed.sql`. Enable Auth providers (Email, Google, Apple, Discord, Twitter/X), create `avatars` + `charts` Storage buckets, and turn on Realtime for `channel_messages`, `dm_messages`, `notifications`, `competition_entries`. Full guide: [`supabase/README.md`](supabase/README.md). Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Stripe** — create Pro/Elite products, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`, and point a webhook at `/api/stripe/webhook`.
3. **Rate limiting (recommended)** — set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` for a distributed limiter (otherwise the in-process limiter in `lib/ratelimit.ts` is used).
4. **Analytics (optional)** — `NEXT_PUBLIC_POSTHOG_KEY`.

See `.env.example` for the full list.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm test           # vitest
```

## Deploy

Import the repo into **Vercel** (framework auto-detected; `vercel.json` adds security headers), add the env vars above, and ship. CI (`.github/workflows/ci.yml`) runs typecheck + lint + build + tests on every push/PR.

## Architecture

```
app/(app)/*      authed screens (feed, profile, rankings, competitions, …)
app/(auth)/*     login / signup / forgot / onboarding
app/api/stripe/* checkout + webhook route handlers
components/ui     design-system primitives (ported 1:1 from the prototype)
components/shell  responsive Sidebar / TopBar / RightPanel / MobileNav + drawer
lib/data         async data-access layer (seed today, Supabase in prod) + seed
lib/domain       tiers, ELO/MMR, stats & anti-fake credibility (unit-tested)
lib/auth         server actions, zod schemas, redirect safety
lib/supabase     browser/server/middleware clients
lib/ratelimit    sliding-window limiter (Upstash-ready)
supabase/        SQL migrations (schema, RLS, RPCs) + seed + setup guide
tests/           Vitest suites for the domain logic
```

## Security posture

RLS on every table (validated against real Postgres — no cross-user writes); SECURITY DEFINER functions pin `search_path`; server actions derive identity from `auth.uid()` (never the client); Stripe checkout is authenticated and the webhook verifies signatures + dedupes events; auth errors are generic (no user enumeration); redirects are allow-listed to same-origin paths; rate limiting on auth + write paths; security headers via `vercel.json`.

---

<div align="center"><sub>Dark-first. Verified. Competitive. Built to feel like a billion-dollar product.</sub></div>
