# Cloudflare vs Vercel

## وضعیت شما
- ✅ Vercel: https://ai-coirse-1-bootcamp-2day.vercel.app
- ❌ Cloudflare Pages: fail چون `package-lock.json` روی GitHub نیست/خراب است

Cloudflare error:
```text
The npm ci command can only install with an existing package-lock.json
```

## توصیه
از **Vercel** به‌عنوان سایت اصلی استفاده کنید.
Cloudflare را فقط برای DNS دامنه بگذارید (اختیاری).

اگر هنوز Cloudflare Pages می‌خواهید:
1. `package-lock.json` کامل را از این پروژه روی GitHub آپلود کنید
2. Install command = `npm install --no-audit --no-fund`
3. Build command = `npm run build`
4. Output = `.next`
5. Root directory = empty
6. NODE_VERSION = 20
7. Runtime flag only: `nodejs_compat` (not secret, not root dir)

حتی بعد از build موفق، Pages برای API/DB کامل مثل Vercel نیست.
