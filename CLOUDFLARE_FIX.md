# Cloudflare is now configured with OpenNext

## What changed
- Added `@opennextjs/cloudflare` + `wrangler`
- Added `wrangler.jsonc`, `open-next.config.ts`, `public/_headers`
- Fixed `pg-cloudflare` bundling via `scripts/fix-pg-cloudflare.mjs`
- Regenerated a full `package-lock.json` (required)

## Cloudflare dashboard values

| Field | Value |
|------|--------|
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | empty |
| NODE_VERSION | `20` |
| Compatibility flag | `nodejs_compat` (Runtime only) |
| Build output directory | *(leave empty for Workers)* |

If your UI only has one build box, use:

```bash
npm install --no-audit --no-fund && npx opennextjs-cloudflare build && npx wrangler deploy
```

## Must push to GitHub
1. `package-lock.json` (**not empty**)
2. `package.json`
3. `wrangler.jsonc`
4. `open-next.config.ts`
5. `scripts/fix-pg-cloudflare.mjs`
6. full `src/`

Without the lockfile, Cloudflare fails with:
```text
npm ci can only install with an existing package-lock.json
```

## Vercel still works
Keep using:
https://ai-coirse-1-bootcamp-2day.vercel.app

Cloudflare will work only after this OpenNext setup is pushed and build command is changed away from raw `.next` output.
