# تنظیمات Cloudflare Pages (نسخه نهایی)

## خطای فعلی

```text
npm ci ... package.json and package-lock.json are not in sync
Missing: next@16.2.6, @tailwindcss/postcss@4.1.17, ...
```

### علت واقعی
روی GitHub:

| فایل | وضعیت |
|------|--------|
| `package.json` | جدید (Next.js / vibelab-bootcamp) ✅ |
| `package-lock.json` | **قدیمی Vite** (`react-vite-tailwind`) ❌ |

Cloudflare همیشه `npm ci` می‌زند و با lock قدیمی می‌میرد.

---

## ۱) کار ضروری روی GitHub

باید **هر دو** را با هم آپلود/پوش کنید:

1. `package.json`
2. `package-lock.json`  ← از همین پروژه (نام داخلش باید `vibelab-bootcamp` باشد نه `react-vite-tailwind`)

اگر با "Add files via upload" می‌روید، **حتماً package-lock.json جدید را هم جایگزین کنید**.

چک سریع بعد از push:
```bash
# در GitHub raw:
# package-lock.json خط اول packages.name باید vibelab-bootcamp باشد
```

---

## ۲) تنظیمات Build در Cloudflare (کپی/پیست)

| Field | Value |
|------|--------|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | *(خالی)* |
| **Install command** | `npm install --no-audit --no-fund` |
| **Node version** | `20` (`NODE_VERSION=20`) |
| Production branch | `main` |
| Build system version | 3 |
| Build cache | Clear cache یک‌بار |

### Install command کجاست؟
Settings → Builds → **Build configuration** → Advanced / Install command  
اگر فیلد Install command نبود:
- Variable بگذارید یا از UI جدید Pages استفاده کنید
- یا فقط lockfile درست را push کنید تا `npm ci` هم کار کند

---

## ۳) Variables / Secrets

| Name | Type | Value | لازم؟ |
|------|------|-------|--------|
| `NODE_VERSION` | Plaintext | `20` | بله |
| `DATABASE_URL` | Secret | — | **نه** برای لندینگ |
| `nodejs_compat` | — | **نه Secret** | فقط Runtime flag |

### Runtime → Compatibility Flags
- اضافه کنید: `nodejs_compat`
- **Root directory را nodejs_compat نگذارید**

---

## ۴) بعد از build موفق

Cloudflare Pages خروجی `.next` را مثل سایت Node کامل اجرا **نمی‌کند**.  
لندینگ ممکن است بالا بیاید/نیمه‌کاره باشد.

برای لاگین + DB واقعی:
- **Vercel** + **Supabase**

این ریپو بدون DB هم سایت را با Warning Modal نشان می‌دهد.

---

## ۵) Checklist قبل از Redeploy

1. [ ] `package-lock.json` روی GitHub = vibelab-bootcamp (نه vite)
2. [ ] Root directory خالی
3. [ ] Install command = `npm install --no-audit --no-fund` (امن‌تر)
4. [ ] Build command = `npm run build`
5. [ ] Clear build cache
6. [ ] `nodejs_compat` فقط در Runtime flags
7. [ ] Secret `nodejs_compat` را پاک کنید (لازم نیست)
