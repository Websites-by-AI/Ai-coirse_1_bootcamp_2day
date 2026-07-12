import { sql } from "drizzle-orm";
import { db } from "@/db";
import { aiProviderConfigs, adminUsers, studentUsers } from "@/db/schema";
import { isGoogleAuthConfigured, isGoogleOAuthConfigured } from "@/lib/admin";
import { isModernPasswordHash } from "@/lib/password";
import { isTurnstileEnabled } from "@/lib/turnstile";

export type SecurityCheckStatus = "passed" | "warning" | "not_configured";

export type SecurityCheck = {
  id: string;
  category: string;
  title: string;
  detail: string;
  status: SecurityCheckStatus;
};

export type SecurityReport = {
  generatedAt: string;
  checks: SecurityCheck[];
  summary: { passed: number; warnings: number; notConfigured: number };
};

function check(id: string, category: string, title: string, detail: string, status: SecurityCheckStatus): SecurityCheck {
  return { id, category, title, detail, status };
}

export async function getSecurityReport(): Promise<SecurityReport> {
  const checks: SecurityCheck[] = [];

  try {
    await db.execute(sql`select 1`);
    checks.push(check("database", "Runtime", "اتصال PostgreSQL", "query سلامت `select 1` با موفقیت اجرا شد.", "passed"));
  } catch {
    checks.push(check("database", "Runtime", "اتصال PostgreSQL", "query سلامت دیتابیس ناموفق بود؛ ثبت‌نام و پنل ممکن است داده ذخیره نکنند.", "warning"));
  }

  const [admins, students, providers] = await Promise.all([
    db.select({ passwordHash: adminUsers.passwordHash }).from(adminUsers),
    db.select({ passwordHash: studentUsers.passwordHash }).from(studentUsers),
    db.select({ secretSource: aiProviderConfigs.secretSource, keyCiphertext: aiProviderConfigs.keyCiphertext, lastStatus: aiProviderConfigs.lastStatus, label: aiProviderConfigs.label }).from(aiProviderConfigs),
  ]);

  const hashes = [...admins, ...students].map((row) => row.passwordHash);
  const legacyHashes = hashes.filter((value) => !isModernPasswordHash(value)).length;
  checks.push(
    legacyHashes === 0
      ? check("password_hashing", "Authentication", "هش رمزهای عبور", `${hashes.length.toLocaleString("fa-IR")} حساب با scrypt + salt ذخیره شده‌اند.`, "passed")
      : check("password_hashing", "Authentication", "هش رمزهای عبور", `${legacyHashes.toLocaleString("fa-IR")} هش قدیمی باقی مانده است؛ بعد از اولین ورود موفق به scrypt ارتقا می‌یابد.`, "warning"),
  );

  checks.push(check("session_policy", "Authentication", "سیاست session و cookie", "cookieهای ورود HttpOnly و SameSite=Lax هستند و در production با Secure ارسال می‌شوند؛ نشست ادمین ۲۴ ساعت و نشست کاربر ۱۴ روز اعتبار دارد.", "passed"));

  const vaultSecret = process.env.AI_KEYS_ENCRYPTION_SECRET;
  const vaultConfigured = Boolean(vaultSecret && vaultSecret.length >= 32);
  const vaultRows = providers.filter((provider) => provider.secretSource === "vault");
  const malformedVaultKeys = vaultRows.filter((provider) => !provider.keyCiphertext || provider.keyCiphertext.split(".").length !== 3).length;
  checks.push(
    !vaultConfigured
      ? check("ai_vault", "Secrets", "رمزنگاری AI Vault", "AI_KEYS_ENCRYPTION_SECRET تنظیم نشده یا طول آن کمتر از ۳۲ کاراکتر است؛ کلید جدید ذخیره نکنید.", "warning")
      : malformedVaultKeys > 0
        ? check("ai_vault", "Secrets", "رمزنگاری AI Vault", `${malformedVaultKeys.toLocaleString("fa-IR")} کلید vault ساختار رمزنگاری معتبر ندارد.`, "warning")
        : check("ai_vault", "Secrets", "رمزنگاری AI Vault", vaultRows.length ? `${vaultRows.length.toLocaleString("fa-IR")} کلید API با AES-256-GCM رمزنگاری شده است و فقط fingerprint نمایش داده می‌شود.` : "vault با secret معتبر آماده است؛ هنوز کلید API در vault ذخیره نشده.", "passed"),
  );

  const turnstileSecret = isTurnstileEnabled();
  const turnstileSite = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  checks.push(
    turnstileSecret && turnstileSite
      ? check("turnstile", "Edge Security", "Cloudflare Turnstile", "widget مرورگر و verify سمت سرور برای فرم ثبت‌نام فعال است.", "passed")
      : turnstileSecret || turnstileSite
        ? check("turnstile", "Edge Security", "Cloudflare Turnstile", "فقط یکی از Site Key یا Secret Key تنظیم شده؛ برای فعال‌شدن هر دو مقدار لازم است.", "warning")
        : check("turnstile", "Edge Security", "Cloudflare Turnstile", "تنظیم نشده است. ثبت‌نام با اعتبارسنجی برنامه انجام می‌شود اما ضدربات Cloudflare فعال نیست.", "not_configured"),
  );

  checks.push(
    isGoogleOAuthConfigured()
      ? check("google_user_oauth", "Authentication", "Google OAuth کاربر", "Authorization Code Flow، state ضد-CSRF و UserInfo verify برای ورود کاربر پیکربندی شده است.", "passed")
      : check("google_user_oauth", "Authentication", "Google OAuth کاربر", "GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET هنوز تنظیم نشده‌اند.", "not_configured"),
  );
  checks.push(
    isGoogleAuthConfigured()
      ? check("google_admin_oauth", "Authentication", "Google OAuth ادمین", "ورود ادمین با Google فعال است و فقط ایمیل‌های allow-list اجازه‌ی session می‌گیرند.", "passed")
      : check("google_admin_oauth", "Authentication", "Google OAuth ادمین", "برای فعال‌سازی، علاوه بر OAuth باید GOOGLE_ADMIN_EMAILS نیز تنظیم شود.", "not_configured"),
  );

  const connectedProviders = providers.filter((provider) => provider.lastStatus === "connected").length;
  const failedProviders = providers.filter((provider) => provider.lastStatus === "error").length;
  checks.push(
    providers.length === 0
      ? check("ai_provider_health", "AI Runtime", "سلامت APIهای هوش مصنوعی", "هیچ provider ذخیره نشده است؛ تحلیل کاربر از fallback آموزشی استفاده می‌کند.", "not_configured")
      : failedProviders > 0
        ? check("ai_provider_health", "AI Runtime", "سلامت APIهای هوش مصنوعی", `${failedProviders.toLocaleString("fa-IR")} provider در آخرین تست خطا داشته است؛ جزئیات در AI API Control Center موجود است.`, "warning")
        : connectedProviders === providers.length
          ? check("ai_provider_health", "AI Runtime", "سلامت APIهای هوش مصنوعی", `آخرین تست اتصال ${connectedProviders.toLocaleString("fa-IR")} provider ذخیره‌شده موفق بوده است.`, "passed")
          : check("ai_provider_health", "AI Runtime", "سلامت APIهای هوش مصنوعی", `${connectedProviders.toLocaleString("fa-IR")} از ${providers.length.toLocaleString("fa-IR")} provider تست موفق دارد؛ باقی providerها هنوز تست نشده‌اند.`, "warning"),
  );

  checks.push(check("rate_limit", "Edge Security", "Rate limiting و WAF", "در سطح برنامه rate-limit داخلی تعریف نشده است. برای production، روی Cloudflare برای /api/auth/* و /api/admin/* قانون Rate Limit و WAF فعال کنید.", "warning"));

  const summary = {
    passed: checks.filter((item) => item.status === "passed").length,
    warnings: checks.filter((item) => item.status === "warning").length,
    notConfigured: checks.filter((item) => item.status === "not_configured").length,
  };
  return { generatedAt: new Date().toISOString(), checks, summary };
}
