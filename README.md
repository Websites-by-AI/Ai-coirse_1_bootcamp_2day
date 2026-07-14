# VibeLab Bootcamp (Next.js + PostgreSQL)


## Deploy stack (Supabase + Vercel + optional Cloudflare DNS)

Full Persian guide with clickable links: **[DEPLOY_LINKS.md](./DEPLOY_LINKS.md)**

| Piece | Service | Link |
|------|---------|------|
| Database | Supabase | https://supabase.com/dashboard |
| App host | Vercel | https://vercel.com/new |
| DNS/CDN | Cloudflare | https://dash.cloudflare.com/ |
| Repo | GitHub | https://github.com/Websites-by-AI/Ai-coirse_1_bootcamp_2day |

**Recommended:** Vercel runs the app, Supabase holds Postgres, Cloudflare only manages domain DNS.

After deploy check:
- `/api/health` → `{"ok":true}`
- `/api/auth/settings` → Google/login status

## Cloudflare / Deploy (read this first)

Your last Cloudflare failure was:

```text
npm ci ... package.json and package-lock.json are not in sync
```

**Fixed here** by regenerating `package-lock.json`.

### Exact Cloudflare dashboard settings

See **[CLOUDFLARE_SETTINGS.md](./CLOUDFLARE_SETTINGS.md)** and **[CLOUDFLARE_FIX.md](./CLOUDFLARE_FIX.md)**.

**Recommended (works with login + Google + Postgres):**
- Host: **Vercel / Railway / Render**
- Build command: `npm run build`
- Install command: `npm ci`
- Start command: `npm run start`
- Node: 20+

**Do not use for this app:**
- `npx @cloudflare/next-on-pages@1` with Next 16
- Build output `/.vercel/output/static` or `/.next/standalone` as static Pages output

---

# VibeLab — AI Course Bootcamp (Day 2)

Fullstack Next.js (App Router) + PostgreSQL (Drizzle) app for the VibeLab 2-day AI product bootcamp.

## What was broken (Cloudflare Pages)

The GitHub repo mixed a **Vite** frontend (`vite build`, `@tailwindcss/vite`) with **Next.js** sources and Cloudflare settings (`output: 'standalone'`, build output `.next/standalone`).

Cloudflare ran:

```bash
npm run build   # → vite build
```

and failed with:

```text
Cannot find module '@tailwindcss/postcss'
```

because `postcss.config.mjs` referenced `@tailwindcss/postcss` while the Vite `package.json` only listed `@tailwindcss/vite`.

## What was fixed here

1. **Single framework**: pure **Next.js App Router** under `src/app` (Vite entrypoints removed).
2. **Correct dependencies**: Next.js, Drizzle, `pg`, Tailwind v4 via `@tailwindcss/postcss`, `nodemailer`, etc.
3. **Database schema**: full VibeLab tables in `src/db/schema.ts` (admins, students, projects, AI providers, enrollments, …).
4. **API + panels**: register, student panel, public profile, admin dashboard, AI provider control, health check.
5. **Build validated**: `next typegen`, `tsc --noEmit`, `next build`, and production health check all pass.

## Local development

```bash
npm install
# ensure DATABASE_URL in .env
npx drizzle-kit push
npm run dev
```

### Required env

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
AI_KEYS_ENCRYPTION_SECRET=replace-with-a-long-random-32-plus-character-secret
```

Optional: Google OAuth, Turnstile, SMTP, OpenAI / Anthropic / Gemini keys — see `.env.example`.

### Demo accounts (seeded on first use)

- Admin: `admin` / `admin123` (see `src/lib/admin.ts`)
- Student demo: created via `/register` or student demo login API

## Main routes

| Route | Description |
|-------|-------------|
| `/` | Landing (RTL Persian VibeLab site) |
| `/register` | Student registration + assessment |
| `/panel` | Student project + resume panel |
| `/profile/[id]` | Public creator profile |
| `/admin` | Admin dashboard |
| `/api/health` | DB health check |

## Cloudflare Pages notes

This app is a **Node/Next.js** server app (API routes + cookies + Postgres).  
Plain Cloudflare Pages static hosting is **not** enough for the full stack.

Recommended options:

1. **Node host** (Vercel, Railway, Render, Fly, VPS) with:
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Output: default `.next` (do **not** point CF at Vite `dist`)
2. If you insist on Cloudflare, use **OpenNext / Cloudflare Workers adapter** for Next.js — not `vite build` and not raw `.next/standalone` as static assets.

### Wrong Cloudflare settings (what caused the failure)

- Build command: `npm run build` while scripts were Vite
- Build output directory: `/.next/standalone` treated as static Pages output
- Missing `@tailwindcss/postcss` for PostCSS config

### Correct Node deployment settings

- **Framework**: Next.js
- **Build command**: `npm run build`
- **Start command**: `npm run start`
- **Node version**: 20+
- **Env vars**: at least `DATABASE_URL`, `AI_KEYS_ENCRYPTION_SECRET`

## Scripts

```bash
npm run dev        # development
npm run build      # production build
npm run start      # production server
npm run typecheck  # TypeScript
```


## User login & Google registration

### Always available
- Student email/password register: `/register`
- Student email/password login: `/login` or `/register` → tab «ورود»
- Admin password login: `/admin`

### Demo accounts
- Student: `demo.student@vibelab.ir` / `VibeStudent2025!`
- Admin: `admin@vibelab.ir` / `VibeLab2025!`

### Enable Google login + registration
Set:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_STUDENT_REDIRECT_URI=https://your-domain/api/auth/student/google/callback
GOOGLE_REDIRECT_URI=https://your-domain/api/auth/google/callback
GOOGLE_ADMIN_EMAILS=admin@your-domain.com
```

Then in Google Cloud Console add both redirect URIs.

Status endpoint: `GET /api/auth/settings`

Routes:
- Start student Google: `/api/auth/student/google?returnTo=/panel`
- Start admin Google: `/api/auth/google?returnTo=/admin`


## Cloudflare (OpenNext)

This repo includes OpenNext Cloudflare support:

- Build: `npx opennextjs-cloudflare build`
- Config: `wrangler.jsonc`, `open-next.config.ts`
- See `CLOUDFLARE_SETTINGS.md`

Primary production recommendation remains **Vercel** for full Postgres login features.
