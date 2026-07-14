# لینک‌ها و تنظیمات کامل دیپلوی VibeLab

## معماری پیشنهادی (درست و پایدار)

```text
کاربر → دامنه شما (Cloudflare DNS)
      → Vercel (اجرای Next.js + API + Login + Google)
      → Supabase Postgres (دیتابیس)
```

| نقش | سرویس | لینک |
|-----|--------|------|
| کد | GitHub | https://github.com/Websites-by-AI/Ai-coirse_1_bootcamp_2day |
| اپ / هاست Node | **Vercel** | https://vercel.com/new |
| دیتابیس | **Supabase** | https://supabase.com/dashboard |
| DNS / CDN / SSL | Cloudflare | https://dash.cloudflare.com/ |
| Google Login | Google Cloud | https://console.cloud.google.com/apis/credentials |
| دامنه خرید | Namecheap / Cloudflare Registrar / ... | — |

---

## ۱) Supabase (دیتابیس) — اول این را بساز

### لینک‌ها
- ساخت پروژه: https://supabase.com/dashboard/projects
- بعد از ساخت پروژه: **Project Settings → Database**
- Connection string: **Database → Connect → Connection string → URI**

### کدام Connection String؟
برای **Vercel** از **Transaction pooler** استفاده کن (port `6543`):

```env
DATABASE_URL=postgresql://postgres.XXXX:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
DATABASE_SSL=true
```

نمونه شکل لینک:
```text
postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### جداول را بساز
روی ماشین لوکال (با همان `DATABASE_URL` سوپابیس):

```bash
npm ci
npx drizzle-kit push
```

یا SQL Editor سوپابیس را باز کن و schema را push کن.

Dashboard SQL:
`https://supabase.com/dashboard/project/<PROJECT_REF>/sql`

---

## ۲) Vercel (اجرای سایت) — دوم این را وصل کن

### لینک‌ها
- Import Git repo: https://vercel.com/new
- مستقیم از GitHub این ریپو:  
  https://vercel.com/new/clone?repository-url=https://github.com/Websites-by-AI/Ai-coirse_1_bootcamp_2day
- داشبورد پروژه‌ها: https://vercel.com/dashboard
- دامنه‌ها: `Project → Settings → Domains`
- Env vars: `Project → Settings → Environment Variables`

### تنظیمات Build در Vercel
| Field | Value |
|------|--------|
| Framework Preset | Next.js |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | *(خالی / default)* |
| Node.js Version | `20.x` |

### Environment Variables در Vercel
```env
DATABASE_URL=postgresql://postgres.XXX:PASSWORD@...pooler.supabase.com:6543/postgres
DATABASE_SSL=true
AI_KEYS_ENCRYPTION_SECRET=یک-رمز-تصادفی-حداقل-۳۲-کاراکتر

NEXT_PUBLIC_SITE_URL=https://YOUR_VERCEL_DOMAIN.vercel.app

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADMIN_EMAILS=you@gmail.com
GOOGLE_REDIRECT_URI=https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/google/callback
GOOGLE_STUDENT_REDIRECT_URI=https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/student/google/callback

GITHUB_REPOSITORY_URL=https://github.com/Websites-by-AI/Ai-coirse_1_bootcamp_2day
```

بعد از Deploy، لینک پیش‌فرض شبیه این است:
```text
https://ai-coirse-1-bootcamp-2day.vercel.app
```
(یا هر نامی که Vercel بدهد)

Health check:
```text
https://YOUR_DOMAIN.vercel.app/api/health
```
باید برگرداند: `{"ok":true}`

---

## ۳) دامنه اختصاصی (اختیاری ولی بهتر)

### مسیر A — دامنه مستقیم روی Vercel (ساده‌ترین)
1. Vercel → Project → **Settings → Domains**
2. دامنه را Add کن: مثلاً `vibelab.ir` یا `app.vibelab.ir`
3. Vercel رکوردهای DNS را نشان می‌دهد
4. در Cloudflare DNS همان رکوردها را بگذار:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A / CNAME | `@` یا `app` | مقداری که Vercel می‌گوید | **DNS only (خاکستری)** اول |

بعد از فعال شدن SSL:
- `NEXT_PUBLIC_SITE_URL=https://vibelab.ir`
- Google redirect URIها را با دامنه جدید عوض کن

### مسیر B — Cloudflare فقط DNS/CDN جلوی Vercel
1. دامنه را به Cloudflare اضافه کن: https://dash.cloudflare.com/
2. Nameserverهای دامنه را به Cloudflare بده
3. CNAME به Vercel:
   - `CNAME app → cname.vercel-dns.com` (یا مقدار Vercel)
4. SSL/TLS در Cloudflare = **Full (strict)**
5. Proxy می‌تواند نارنجی باشد، ولی اگر مشکل cookie/SSL دیدی موقتاً DNS only کن

### Cloudflare Pages را برای این اپ اصلی استفاده نکن
چون:
- Next 16 + Postgres + Login کامل روی Pages edge پایدار نیست
- دیتابیس TCP (`pg`) برای Workers/Pages بدون adapter خاص مشکل دارد

Cloudflare Workers/D1 هم جایگزین مستقیم `pg` این پروژه نیست مگر بازنویسی بزرگ.

---

## ۴) Google OAuth

لینک:
https://console.cloud.google.com/apis/credentials

1. Create Credentials → OAuth client ID → Web application
2. Authorized redirect URIs:

**اگر روی Vercel پیش‌فرض هستی:**
```text
https://YOUR_PROJECT.vercel.app/api/auth/student/google/callback
https://YOUR_PROJECT.vercel.app/api/auth/google/callback
```

**اگر دامنه داری:**
```text
https://your-domain.com/api/auth/student/google/callback
https://your-domain.com/api/auth/google/callback
```

**لوکال:**
```text
http://localhost:3000/api/auth/student/google/callback
http://localhost:3000/api/auth/google/callback
```

---

## ۵) چک‌لیست نهایی

1. [ ] Supabase project ساخته شد  
2. [ ] `DATABASE_URL` pooler (6543) کپی شد  
3. [ ] `npx drizzle-kit push` روی Supabase اجرا شد  
4. [ ] ریپو به Vercel وصل شد  
5. [ ] Envها در Vercel ست شد  
6. [ ] Deploy سبز شد  
7. [ ] `/api/health` = ok  
8. [ ] `/login` با دمو کار کرد  
9. [ ] Google redirect URI اضافه شد  
10. [ ] دامنه (اختیاری) به Vercel وصل شد  

### حساب‌های دمو
- Student: `demo.student@vibelab.ir` / `VibeStudent2025!`
- Admin: `admin@vibelab.ir` / `VibeLab2025!`

### مسیرهای مهم بعد از دیپلوی
| صفحه | URL |
|------|-----|
| خانه | `https://YOUR_DOMAIN/` |
| ورود | `https://YOUR_DOMAIN/login` |
| ثبت‌نام | `https://YOUR_DOMAIN/register` |
| پنل کاربر | `https://YOUR_DOMAIN/panel` |
| ادمین | `https://YOUR_DOMAIN/admin` |
| سلامت DB | `https://YOUR_DOMAIN/api/health` |
| وضعیت Auth | `https://YOUR_DOMAIN/api/auth/settings` |

---

## جمع‌بندی یک‌خطی

- **دیتابیس:** Supabase → https://supabase.com/dashboard  
- **سایت:** Vercel → https://vercel.com/new  
- **دامنه:** Vercel Domains یا Cloudflare DNS جلوی Vercel  
- **نه** Cloudflare Pages به‌عنوان runtime اصلی این اپ
