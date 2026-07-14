# راهنمای استقرار دوپلتفرمی: Vercel + Cloudflare

> این پروژه روی **Vercel** (با تمام قابلیت‌ها) و **Cloudflare Pages** (با حالت دمو/استاتیک) قابل اجراست.

---

## تفاوت Vercel و Cloudflare در این پروژه

| قابلیت | Vercel (Node.js) | Cloudflare (Edge) |
|--------|------------------|-------------------|
| دیتابیس PostgreSQL | ✅ کامل با `pg` | ⚠️ فقط دمو (بدون دیتابیس) |
| ثبت‌نام کاربر | ✅ کامل | ⚠️ فرم نمایشی |
| پنل کاربر + رزومه | ✅ کامل | ⚠️ صفحه دمو |
| صفحه اصلی | ✅ | ✅ |
| مرکز آموزش `/education` | ✅ | ✅ |
| API یوتیوب | ✅ | ✅ |
| تم‌ها (دارک/لایت) | ✅ | ✅ |

> **نکته:** برای فعال کردن دیتابیس روی Cloudflare، باید از `@neondatabase/serverless` استفاده کنید (راهنمای پیشرفته در انتهای سند).

---

## استقرار روی Vercel (توصیه‌شده - تمام قابلیت‌ها)

### گام ۱: وارد کردن پروژه
1. به [vercel.com/new](https://vercel.com/new) بروید.
2. مخزن GitHub خود را وارد (Import) کنید.
3. نام پروژه: `vibelab-bootcamp`
4. Framework Preset: **Next.js**

### گام ۲: تنظیمات Build
| تنظیم | مقدار |
|-------|-------|
| Build Command | `npm run build` |
| Output Directory | *(خالی)* |
| Install Command | `npm install` |
| Node Version | `20.x` |

### گام ۳: متغیرهای محیطی (Environment Variables)
در **Settings → Environment Variables** این‌ها را اضافه کنید:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
AI_KEYS_ENCRYPTION_SECRET=حداقل-۳۲-کاراکتر-تصادفی-قوی
```

**اختیاری:**
```env
YOUTUBE_API_KEY=AIzaSy...        # برای API یوتیوب
OPENAI_API_KEY=sk-...            # برای تحلیل AI
SMTP_HOST=smtp.gmail.com         # برای ارسال ایمیل رزومه
SMTP_PORT=587
SMTP_FROM=noreply@yourdomain.com
```

### گام ۴: دیپلوی
روی **Deploy** بزنید. پس از اتمام:
- `https://your-app.vercel.app/api/health` → `{"ok":true}`
- `https://your-app.vercel.app/` → صفحه اصلی
- `https://your-app.vercel.app/education` → مرکز آموزش

---

## استقرار روی Cloudflare Pages

### گام ۱: نصب Wrangler (در صورت نیاز محلی)
```bash
npm install -g wrangler
# یا
npx wrangler login
```

### گام ۲: Build برای Cloudflare
```bash
npm install
npm run cf:build
```

این دستور پوشه `.open-next/` را می‌سازد.

### گام ۳: Deploy با Wrangler
```bash
npm run deploy:cf
```

یا مستقیماً:
```bash
npx wrangler deploy
```

### گام ۴: اتصال از طریق Dashboard (جایگزین)
1. به [dash.cloudflare.com](https://dash.cloudflare.com) بروید.
2. **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. پوشه `.open-next/assets` را آپلود کنید.
4. یا از **Connect to Git** استفاده کنید و Build Command را بگذارید:
   ```
   npm install --no-audit --no-fund && npx opennextjs-cloudflare build
   ```

### ⚠️ محدودیت Cloudflare
در حالت پیش‌فرض، روی Cloudflare **دیتابیس غیرفعال** است و برنامه در حالت دمو اجرا می‌شود:
- صفحات استاتیک (لندینگ، آموزش، ثبت‌نام) کاملاً کار می‌کنند.
- فرم‌ها نمایشی هستند (داده ذخیره نمی‌شود).
- برای فعال‌سازی دیتابیس روی Cloudflare، بخش پیشرفته را ببینید.

---

## استقرار هم‌زمان روی هر دو (توصیه نهایی)

### استراتژی پیشنهادی:
1. **اپ اصلی** را روی **Vercel** دیپلوی کنید (با دیتابیس Supabase).
2. **دامنه سفارشی** را در **Cloudflare** مدیریت کنید:
   - DNS → CNAME → `cname.vercel-dns.com`
   - SSL/TLS → **Full (strict)**
3. **Cloudflare Pages** را فقط برای **فایل‌های استاتیک پشتیبان** یا **زیردامنه** (`static.yourdomain.com`) نگه دارید.

---

## پیشرفته: دیتابیس روی Cloudflare با Neon

اگر می‌خواهید دیتابیس روی Cloudflare هم کار کند:

### ۱. نصب درایور Neon
```bash
npm install @neondatabase/serverless
```

### ۲. تغییر `src/db/index.ts`
به جای `drizzle-orm/node-postgres` از `drizzle-orm/neon-serverless` استفاده کنید:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### ۳. تغییر `wrangler.jsonc`
متغیر `DATABASE_URL` را اضافه کنید:
```json
{
  "vars": {
    "DATABASE_URL": "postgresql://..."
  }
}
```

> **هشدار:** این تغییرات باعث می‌شود پروژه روی Vercel همچنان کار کند، اما نیاز به تست دارد.

---

## چک‌لیست قبل از ZIP کردن و ارسال

```bash
# ۱. نصب پکیج‌ها
npm install

# ۲. بررسی TypeScript
npm run typecheck

# ۳. Build برای Vercel
npm run build

# ۴. Build برای Cloudflare (اختیاری)
npm run cf:build

# ۵. بررسی سلامت
# /api/health → {"ok":true}
```

---

## لینک‌های مفید

| سرویس | لینک |
|-------|------|
| Vercel Dashboard | https://vercel.com/dashboard |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Supabase (PostgreSQL) | https://supabase.com/dashboard |
| Neon (PostgreSQL) | https://console.neon.tech |
| YouTube API Console | https://console.cloud.google.com/apis/library/youtube.googleapis.com |

---

**موفق باشید! 🚀**
