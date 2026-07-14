# Cloudflare Deploy Failure — Fixed Checklist

## Latest error (commit 250d9ce)

```text
npm ci can only install packages when package.json and package-lock.json are in sync
Missing: next@16.2.6, @tailwindcss/postcss@4.1.17, drizzle-orm@0.45.2, ...
```

### Fix applied in this workspace
1. Regenerated a clean matching `package-lock.json`
2. Pinned dependency versions (no caret mismatch)
3. Kept Next.js scripts (`next build`, not `vite build`)

### What you must push to GitHub
These files **must** be on `main` together:
- `package.json`
- `package-lock.json`  ← critical
- `src/**`
- `next.config.ts`
- `postcss.config.mjs`
- `tsconfig.json`

## Second problem: wrong Cloudflare build command

Your Pages settings:
- Build command: `npx @cloudflare/next-on-pages@1`
- Output: `/.vercel/output/static`

`@cloudflare/next-on-pages` peer dependency only supports **Next <= 15.5.x**.  
This project is **Next 16.2.6** and uses **PostgreSQL (`pg`)**, so Pages edge is the wrong runtime.

## Correct deploy path
Use Node host:
- Build: `npm run build`
- Start: `npm run start`
- Install: `npm ci`
- Env: see `CLOUDFLARE_SETTINGS.md`

Use Cloudflare only as DNS/WAF/CDN in front of the Node host.

## After push
1. Cloudflare → Settings → Builds
2. Change install to `npm ci`
3. Prefer Vercel for the app itself
4. Re-deploy
