# استقرار امن VibeLab

## 1. دامنه‌ی پایدار و لینک اشتراک‌گذاری
لینک‌های `*.e2b.app` فقط preview sandbox هستند و با پایان sandbox ممکن است `Sandbox Not Found` شوند.

برای لینک پایدار:
1. برنامه را روی یک hosting پایدار Node.js اجرا کنید.
2. دامنه‌ی اصلی را در Cloudflare به origin hosting متصل کنید.
3. در Cloudflare، SSL/TLS را روی **Full (strict)** قرار دهید.
4. بعد از انتشار، لینک اشتراک‌گذاری سایت به‌طور خودکار origin همان دامنه را کپی می‌کند.

## 2. PostgreSQL
این برنامه از `pg` و Drizzle ORM استفاده می‌کند؛ runtime باید اتصال TCP خروجی به PostgreSQL داشته باشد.

متغیر موردنیاز:
```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

برای Cloudflare Workers معمولی، `pg` با اتصال TCP مستقیم مناسب نیست. راه پیشنهادی این است که اپ Next.js را روی Node.js hosting اجرا کنید و Cloudflare فقط DNS/CDN/WAF باشد؛ یا در صورت نیاز به edge-only، لایه‌ی دیتابیس را به سرویس HTTP-compatible مانند Hyperdrive/Neon serverless driver بازطراحی کنید.

## 3. Cloudflare Turnstile
فرم ثبت‌نام عمومی از Turnstile پشتیبانی می‌کند، اما فقط وقتی هر دو کلید تنظیم شده باشند فعال است:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_SITE_KEY
TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY
```

1. از Cloudflare Dashboard > Turnstile یک widget بسازید.
2. دامنه‌ی نهایی سایت را در hostnameهای مجاز widget ثبت کنید.
3. site key را در `NEXT_PUBLIC_TURNSTILE_SITE_KEY` و secret را فقط در secret manager سرور قرار دهید.
4. هرگز `TURNSTILE_SECRET_KEY` را با `NEXT_PUBLIC_` شروع نکنید.

## 4. پیشنهادهای WAF و Rate Limit Cloudflare
- روی مسیرهای `/api/auth/*` و `/api/admin/*` Rate Limiting فعال کنید.
- برای `/api/auth/register` یک قانون پیشنهادی: 10 درخواست در 10 دقیقه برای هر IP.
- Bot Fight Mode یا Super Bot Fight Mode را فعال کنید.
- یک WAF rule برای block کردن کشورها یا ASNهای نامرتبط، فقط در صورت نیاز کسب‌وکار بسازید.
- endpointهای admin از cookie session و `HttpOnly` استفاده می‌کنند؛ همچنان نباید آن‌ها را public cache کنید.

## 5. ورود Google برای ادمین
در Google Cloud Console یک OAuth Web Client بسازید و callback دامنه‌ی نهایی را دقیقاً ثبت کنید:

```text
https://YOUR_DOMAIN/api/auth/google/callback
https://YOUR_DOMAIN/api/auth/student/google/callback
```

سپس این مقادیر را در secret manager قرار دهید:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_ADMIN_EMAILS=admin@example.com,second-admin@example.com
GOOGLE_REDIRECT_URI=https://YOUR_DOMAIN/api/auth/google/callback
```

فقط ایمیل‌هایی که در `GOOGLE_ADMIN_EMAILS` هستند اجازه‌ی session ادمین می‌گیرند.

## 6. APIهای هوش مصنوعی و توکن
کلیدهای OpenAI، Anthropic و Gemini را می‌توان از بخش **AI API و هشدارها** در پنل ادمین اضافه کرد. کلیدهای واردشده با AES-256-GCM رمزنگاری و فقط fingerprint آن‌ها نمایش داده می‌شود.

یا می‌توانید کلید را در environment قرار دهید تا پنل آن را خودکار شناسایی کند:

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
```

برای هر provider در پنل:
- تست اتصال واقعی انجام دهید.
- مدل، سقف توکن ماهانه و آستانه هشدار را مشخص کنید.
- AI Fit Scanner را با ورودی دمو اجرا کنید.
- در نبود API متصل، ارزیابی کاربر به rule-based fallback تبدیل می‌شود و ثبت‌نام متوقف نمی‌شود.

## 7. ارسال رزومه با SMTP
پنل کاربر می‌تواند فایل رزومه را به ایمیل گیرنده پیوست کند. برای ارسال واقعی این متغیرها را در secret manager تنظیم کنید:

```text
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM=VibeLab <no-reply@your-domain.example>
```

بدون SMTP، درخواست ارسال در جدول `resume_emails` با وضعیت `queued_smtp_configuration` ثبت می‌شود اما ایمیل ارسال نمی‌شود. فایل‌های TXT، MD، PDF و DOCX تا ۵ مگابایت پذیرفته می‌شوند؛ فایل در دیتابیس به‌صورت base64 برای پیوست SMTP ذخیره می‌شود.

## 8. Release Center و GitHub
پنل ادمین نسخه‌ی جاری، نسخه‌های قبلی و وضعیت source را در **Release Center** نمایش می‌دهد. در sandbox فعلی هیچ Git remote متصل نیست؛ بنابراین لینک ساختگی GitHub نمایش داده نمی‌شود.

پس از ساخت repository و push کردن source، این متغیر را در environment production قرار دهید:

```text
GITHUB_REPOSITORY_URL=https://github.com/YOUR_ORG/YOUR_REPOSITORY
```

Release Center لینک را فقط وقتی نمایش می‌دهد که URL با `https://github.com/` شروع شود. نسخه‌ی جاری در `src/lib/releases.ts` ثبت شده و برای هر تغییر اصلی باید نسخه و release note جدید به ابتدای آن اضافه شود؛ نسخه‌های قبلی برای مرجع حفظ می‌شوند.

## 9. Secrets
`AI_KEYS_ENCRYPTION_SECRET` باید یک مقدار تصادفی طولانی و پایدار باشد. پس از ذخیره‌ی API Keyها، تغییر این secret باعث غیرقابل‌خواندن‌شدن کلیدهای vault قبلی می‌شود.
