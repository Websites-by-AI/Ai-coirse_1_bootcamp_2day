# راهنمای استقرار VibeLab روی Vercel و Cloudflare

> این سند گام‌به‌گام استقرار پروژه VibeLab Bootcamp را روی **Vercel** (توصیه‌شده) و **Cloudflare Pages** توضیح می‌دهد.

---

## فهرست

1. [پیش‌نیازها](#پیشنیازها)
2. [استقرار روی Vercel (توصیه‌شده)](#استقرار-روی-vercel-توصیهشده)
3. [استقرار روی Cloudflare Pages](#استقرار-روی-cloudflare-pages)
4. [تنظیم دیتابیس PostgreSQL](#تنظیم-دیتابیس-postgresql)
5. [تنظیم متغیرهای محیطی](#تنظیم-متغیرهای-محیطی)
6. [بررسی سلامت پس از استقرار](#بررسی-سلامت-پس-از-استقرار)
7. [عیب‌یابی رایج](#عیبیابی-رایج)

---

## پیش‌نیازها

- حساب کاربری در [GitHub](https://github.com)
- حساب کاربری در [Vercel](https://vercel.com) (رایگان)
- حساب کاربری در [Supabase](https://supabase.com) یا [Neon](https://neon.tech) (برای PostgreSQL)
- (اختیاری) حساب کاربری در [Cloudflare](https://dash.cloudflare.com) برای DNS و دامنه سفارشی

---

## استقرار روی Vercel (توصیه‌شده)

Vercel بهترین گزینه برای Next.js App Router با Node.js runtime و دسترسی TCP به PostgreSQL است.

### گام ۱: وارد کردن پروژه

1. به [vercel.com/new](https://vercel.com/new) بروید.
2. مخزن `Ai-coirse_1_bootcamp_2day` را از GitHub وارد کنید.
3. نام پروژه را `vibelab-bootcamp` بگذارید.
4. فریم‌ورک را روی **Next.js** تنظیم کنید.

### گام ۲: تنظیم Build

در تنظیمات پروژه Vercel، این مقادیر را بررسی کنید:

| تنظیم | مقدار |
|-------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | (خالی بگذارید) |
| Install Command | `npm install` یا `npm ci` |
| Node Version | 20.x |

### گام ۳: متغیرهای محیطی

در بخش **Settings → Environment Variables** این متغیرها را اضافه کنید:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
AI_KEYS_ENCRYPTION_SECRET=حداقل-۳۲-کاراکتر-تصادفی-قوی
```

> **نکته:** مقدار `AI_KEYS_ENCRYPTION_SECRET` باید حداقل ۳۲ کاراکتر باشد. می‌توانید از `openssl rand -hex 32` برای تولید آن استفاده کنید.

### گام ۴: دیپلوی

روی **Deploy** بزنید. پس از اتمام:

- `/api/health` → `{"ok":true}`
- `/api/auth/settings` → وضعیت Google OAuth

---

## استقرار روی Cloudflare Pages

> **هشدار:** این پروژه از Next.js App Router با `pg` (اتصال TCP مستقیم به PostgreSQL) استفاده می‌کند. Cloudflare Pages با `next-on-pages` محدودیت‌هایی برای Node.js APIها دارد. **توصیه می‌شود Cloudflare فقط برای DNS/دامنه استفاده شود و اپ روی Vercel میزبانی شود.**

### روش پیشنهادی: Cloudflare فقط برای DNS

1. اپ را روی Vercel مستقر کنید (بخش قبل).
2. دامنه سفارشی خود را در Cloudflare ثبت کنید.
3. در Cloudflare DNS، یک **CNAME Record** بسازید:
   - Name: `@`
   - Target: `cname.vercel-dns.com`
4. در Vercel، دامنه سفارشی را از بخش **Domains** متصل کنید.
5. در Cloudflare، SSL/TLS را روی **Full (strict)** قرار دهید.

### روش دوم: Cloudflare Pages مستقیم (محدود)

اگر حتماً می‌خواهید روی Cloudflare Pages بسازید:

1. در `package.json` اسکریپت‌های زیر موجود است:
   ```json
   "cf:build": "opennextjs-cloudflare build",
   "preview:cf": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
   "deploy:cf": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
   ```
2. متغیر `DATABASE_URL` باید به سرویس HTTP-compatible مانند **Neon serverless driver** یا **Supabase Pooler** تغییر کند.
3. فایل `open-next.config.ts` و `wrangler.toml` باید تنظیم شوند.
4. اجرا کنید:
   ```bash
   npm run cf:build
   npm run deploy:cf
   ```

> **توجه:** بسیاری از APIهای مدیریتی (SMTP، AI Provider Vault، Upload) در محیط Edge Cloudflare Workers نیازمند بازطراحی هستند.

---

## تنظیم دیتابیس PostgreSQL

### با Supabase

1. در [Supabase Dashboard](https://supabase.com/dashboard) یک پروژه بسازید.
2. به **Project Settings → Database** بروید.
3. Connection string را کپی کنید:
   ```
   postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
   ```
4. این مقدار را در `DATABASE_URL` در Vercel قرار دهید.
5. در محیط لوکال، migrations را اجرا کنید:
   ```bash
   npx drizzle-kit push
   ```

### با Neon

1. در [Neon Console](https://console.neon.tech) یک پروژه بسازید.
2. Connection string را از بخش **Connection Details** کپی کنید.
3. در Vercel ست کنید.

---

## تنظیم متغیرهای محیطی

جدول کامل متغیرهای اختیاری و اجباری:

| متغیر | وضعیت | توضیح |
|-------|-------|-------|
| `DATABASE_URL` | **اجباری** | اتصال PostgreSQL |
| `AI_KEYS_ENCRYPTION_SECRET` | **اجباری** | رمزنگاری کلیدهای AI در پنل ادمین |
| `OPENAI_API_KEY` | اختیاری | اتصال خودکار OpenAI |
| `ANTHROPIC_API_KEY` | اختیاری | اتصال خودکار Anthropic |
| `GEMINI_API_KEY` | اختیاری | اتصال خودکار Gemini |
| `GOOGLE_CLIENT_ID` | اختیاری | ورود با Google (ادمین) |
| `GOOGLE_CLIENT_SECRET` | اختیاری | ورود با Google (ادمین) |
| `GOOGLE_ADMIN_EMAILS` | اختیاری | لیست ایمیل‌های ادمین مجاز |
| `SMTP_HOST` | اختیاری | ارسال رزومه با ایمیل |
| `SMTP_PORT` | اختیاری | پورت SMTP (معمولاً 587) |
| `SMTP_FROM` | اختیاری | آدرس فرستنده |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | اختیاری | کپچای Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | اختیاری | Secret کپچا |

---

## بررسی سلامت پس از استقرار

پس از اولین deploy، این آدرس‌ها را بررسی کنید:

```
https://your-domain.vercel.app/api/health
→ {"ok":true}

https://your-domain.vercel.app/api/auth/settings
→ {"google":true/false, ...}

https://your-domain.vercel.app/
→ صفحه اصلی VibeLab

https://your-domain.vercel.app/education
→ مرکز آموزش

https://your-domain.vercel.app/panel
→ پنل کاربر (نیازمند ثبت‌نام)
```

---

## عیب‌یابی رایج

### خطای `package.json and package-lock.json are not in sync`

```bash
rm package-lock.json
npm install
npm run build
```

سپس فایل‌های به‌روز را commit و push کنید.

### خطای `AI_KEYS_ENCRYPTION_SECRET is not configured`

مقدار `AI_KEYS_ENCRYPTION_SECRET` را در Vercel Environment Variables با حداقل ۳۲ کاراکتر تنظیم کنید.

### خطای دیتابیس `connection refused`

- مطمئن شوید `DATABASE_URL` درست است.
- در Supabase، بخش **IPv4** را فعال کنید یا از **Connection Pooler** استفاده کنید.
- در Vercel، IPهای egress پویا هستند؛ استفاده از Supabase Pooler توصیه می‌شود.

### خطای `@tailwindcss/postcss` یا `Cannot find module`

```bash
rm -rf node_modules package-lock.json
npm install
```

### Cloudflare: `pg` module not found

Cloudflare Workers از ماژول‌های Node.js native مانند `pg` پشتیبانی نمی‌کنند. **از Vercel استفاده کنید** یا دیتابیس را به سرویس HTTP-compatible تغییر دهید.

---

## لینک‌های مفید

| سرویس | لینک |
|-------|------|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Drizzle ORM Docs | https://orm.drizzle.team |
| Next.js Deploy Docs | https://nextjs.org/docs/app/building-your-application/deploying |

---

**موفق باشید! 🚀**
