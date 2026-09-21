# Hathmaluwa

Hathmaluwa is a feed aggregator for Sri Lankan blogs: it collects posts from a curated list of blogs, ingests them via [WebSub](https://www.w3.org/TR/websub/) (with a polling fallback), and serves a searchable, paginated feed at hathmaluwa.org, plus an RSS feed and a self-serve blog signup form.

## Stack

- **Next.js 16** (App Router, React 19) — pages and API routes live in [`app/`](app)
- **Prisma 6** over Postgres ([`prisma/schema.prisma`](prisma/schema.prisma)) — hosted on **Supabase**
- **Radix Themes** + a hand-rolled token-based design system ([`styles/`](styles), [`design/hathmaluwa/`](design/hathmaluwa)) — see [Design system](#design-system)
- **GitHub Actions** for CI and scheduled background jobs ([`.github/workflows/`](.github/workflows))

## Data model

Two tables, defined in [`prisma/schema.prisma`](prisma/schema.prisma):

- **`Blog`** — a subscribed blog: its URL, feed URL, WebSub hub/subscription state (`subscriptionStatus`, `leaseExpiresAt`, `subscriptionSecret`), and moderation flags (`approved`, `banned`).
- **`BlogPost`** — a single post belonging to a `Blog`, with title, URL, timestamp, summary and thumbnail. Upserted by URL, so re-ingesting the same post updates it in place.

Prisma models are `camelCase`; the underlying Postgres columns are `snake_case` via `@map`/`@@map`. `lib/prisma.ts` exports a singleton `PrismaClient`, cached on `globalThis` in development so hot reloads don't exhaust Supabase's connection limit. Migrations live in [`prisma/migrations/`](prisma/migrations).

## How posts get in: the WebSub pipeline

Most ingestion happens without polling, using WebSub push notifications:

1. **Onboarding** ([`lib/websub/onboardBlog.ts`](lib/websub/onboardBlog.ts)) — given a blog URL, discovers its feed ([`discover.ts`](lib/websub/discover.ts)), checks whether the feed advertises a WebSub hub, and either:
   - subscribes to the hub ([`subscribe.ts`](lib/websub/subscribe.ts)), generating a per-blog signing secret ([`secret.ts`](lib/websub/secret.ts)); or
   - marks the blog `unsupported` if no hub is advertised, so the polling fallback picks it up instead.

   Either way it does a one-time backfill ([`backfillBlog.ts`](lib/websub/backfillBlog.ts)) so the feed isn't empty until the next update.

2. **Hub verification & push delivery** ([`app/api/websub/callback/route.ts`](app/api/websub/callback/route.ts)) — the hub calls back per blog (`?blogId=...`):
   - `GET` handles the hub's subscription-verification challenge and echoes it back.
   - `POST` delivers new/updated feed content; the payload's `X-Hub-Signature` is HMAC-verified against the blog's stored secret ([`verifySignature.ts`](lib/websub/verifySignature.ts)) before entries are parsed ([`parseFeed.ts`](lib/websub/parseFeed.ts)) and upserted as `BlogPost` rows.

3. **Two scheduled GitHub Actions jobs** cover what push alone can't:
   - [`poll-unsupported-blogs.yml`](.github/workflows/poll-unsupported-blogs.yml) → `pnpm poll-unsupported-blogs` ([`scripts/poll-unsupported-blogs.ts`](scripts/poll-unsupported-blogs.ts)), every 30 minutes, for blogs with no WebSub hub.
   - [`renew-websub-subscriptions.yml`](.github/workflows/renew-websub-subscriptions.yml) → `pnpm websub:renew` ([`scripts/renew-subscriptions.ts`](scripts/renew-subscriptions.ts)), every 6 hours, renewing subscriptions before their lease expires.

Public, unauthenticated entry points that trigger outbound fetches (the signup form, WebSub discovery) go through an SSRF guard ([`ssrfGuard.ts`](lib/websub/ssrfGuard.ts), [`ssrfContext.ts`](lib/websub/ssrfContext.ts), [`safeFetch.ts`](lib/websub/safeFetch.ts)) that blocks requests to internal/private addresses.

## Getting a blog listed

- **Self-serve**: [`/signup`](app/signup) → [`app/api/signup/route.ts`](app/api/signup/route.ts) validates the submission, runs it through the SSRF-guarded `onboardBlog`, and creates the blog with `approved: false`. It only shows up in the public feed after an operator runs `pnpm approve-blog`.
- **Operator-run scripts** (already-curated blogs, bulk imports, cleanup): [`scripts/`](scripts) — `add-blog`, `bulk-add-blogs`, `approve-blog`, `list-pending-blogs`, `backfill-blog`, `dedupe-blog-stubs`, `fix-blog-authors`, `fix-blog-homepage-urls`, `migrate-websub-hub`. Each is exposed as a `pnpm` script in [`package.json`](package.json).

## App routes

- `/` ([`app/page.tsx`](app/page.tsx)) — the main feed: latest posts, search (`?q=`), pagination, and a sidebar of recent/last-week posts. Only shows posts from `approved && !banned` blogs.
- `/feed` ([`app/feed/route.ts`](app/feed/route.ts)) — RSS output, linked from `<head>` in [`app/layout.tsx`](app/layout.tsx).
- `/signup` ([`app/signup/`](app/signup)) — public blog submission form.
- `/badge` ([`app/badge/page.tsx`](app/badge/page.tsx)) — the "listed on Hathmaluwa" badge page (badge assets in [`public/badges/`](public/badges)).
- `/contact` ([`app/contact/`](app/contact)) — contact page.
- `/admin` ([`app/admin/`](app/admin)) — Google-OAuth-gated moderation panel (approve/ban blogs). Login at `/admin/login`; everything under `app/admin/(protected)/` requires a session.

## Admin auth

Google OAuth, restricted to an email allowlist (`ADMIN_EMAILS`):

- [`lib/googleOAuth.ts`](lib/googleOAuth.ts) — OAuth flow, via [`app/api/admin/auth/google/route.ts`](app/api/admin/auth/google/route.ts) and its callback.
- [`lib/adminAuth.ts`](lib/adminAuth.ts) — signs/verifies the session cookie (`ADMIN_SESSION_SECRET`).
- [`proxy.ts`](proxy.ts) — runs on every `/admin/*` request; this is an **optimistic, cookie-presence-only** check (no signature verification — the edge-ish proxy runtime may lack the Node crypto API `jwtVerify` needs). It only redirects to `/admin/login` when the cookie is absent. Every admin page/action still calls `getAdminSession()` server-side for the real, verified check — per Next.js's guidance that middleware/proxy must never be the sole line of defense.

## Design system

Brand rules live in [`design/hathmaluwa/README.md`](design/hathmaluwa/README.md); tokens in [`design/hathmaluwa/tokens.json`](design/hathmaluwa/tokens.json), implemented as CSS custom properties in [`styles/tokens.css`](styles/tokens.css) and consumed by [`styles/site.css`](styles/site.css) (all classes prefixed `hm-`). Key rules, enforced throughout `app/` and `components/`:

- Colors always come from tokens (`var(--navy)`, `var(--surface)`, ...) — never hard-coded.
- Light/dark themes are `:root` plus `[data-theme="dark"]`; the inline script in [`app/layout.tsx`](app/layout.tsx) applies the saved theme before first paint to avoid a flash, kept in sync with [`components/theme-toggle.tsx`](components/theme-toggle.tsx).
- Logos in [`public/badges/`](public/badges) are used exactly as supplied — never redrawn or recolored; in dark theme they sit on a white panel (`var(--logo-ground)`).
- The Sinhala tagline is fixed copy in [`lib/site.ts`](lib/site.ts); Sinhala text (`lang="si"`, see [`lib/lang.ts`](lib/lang.ts)) keeps `line-height: 1.75`.
- [`design/hathmaluwa/sample-page.html`](design/hathmaluwa/sample-page.html) is a visual layout reference, not code to copy.

Component building blocks live in [`components/`](components) (`layout`, `nav`, `sidebar`, `post-card`, `pagination`, `footer`, `tagline`, `theme-toggle`, `thumb`, `copy-code`). [`.storybook/`](.storybook) hosts component stories.

## Local development

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, ADMIN_* (see comments in the file)
pnpm dev
```

`postinstall` runs `prisma generate` automatically. Database migrations run against Supabase's direct (non-pooled) connection:

```bash
npx prisma migrate dev
```

## CI / deployment

[`node.yml`](.github/workflows/node.yml) runs `pnpm build` on every push to `master`. The two ingestion cron jobs (above) run independently of the app deployment and need their own `DATABASE_URL`/`DIRECT_URL` secrets configured in the repo.
