# Cloudflare — تنظیمات درست برای این پروژه (OpenNext)

این پروژه حالا با **@opennextjs/cloudflare** برای Cloudflare آماده است.

## مهم
- سایت Node کامل روی **Vercel** هم کار می‌کند: https://ai-coirse-1-bootcamp-2day.vercel.app
- برای Cloudflare باید از **Workers (OpenNext)** استفاده شود، نه output خام `.next`

---

## گزینه A (پیشنهادی): Cloudflare Workers via OpenNext + Git

### Build settings در Cloudflare Dashboard
| Field | Value |
|------|--------|
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |
| **Root directory** | *(empty)* |
| **Node version** | `20` (`NODE_VERSION=20`) |
| Install | `npm install --no-audit --no-fund` |

> اگر UI فقط Pages-style دارد و Install/Deploy جدا ندارد:
> Build command:
> ```bash
> npm install --no-audit --no-fund && npx opennextjs-cloudflare build && npx wrangler deploy
> ```
> Build output directory: **خالی / not used for Workers**

### Runtime
- Compatibility flags: `nodejs_compat`
- **Root directory را `nodejs_compat` نگذار**
- Secret به نام `nodejs_compat` نساز

### Variables (اختیاری برای لندینگ)
| Name | Required for landing |
|------|----------------------|
| `NODE_VERSION=20` | yes |
| `DATABASE_URL` | no (demo mode) |
| Google vars | no (optional) |

---

## گزینه B: فقط Vercel (ساده‌ترین)
- همان repo
- Framework Next.js
- Build: `npm run build`
- سایت: https://ai-coirse-1-bootcamp-2day.vercel.app

---

## فایل‌های لازم در GitHub
حتماً push شوند:
- `package.json`
- `package-lock.json` (**کامل، نه خالی**)
- `wrangler.jsonc`
- `open-next.config.ts`
- `public/_headers`
- `src/**`
- `scripts/fix-pg-cloudflare.mjs`

بدون `package-lock.json` Cloudflare با `npm ci` می‌میرد.

---

## دستور محلی تست Cloudflare bundle
```bash
npm install
npx opennextjs-cloudflare build
# optional local worker preview:
# npx opennextjs-cloudflare preview
```
