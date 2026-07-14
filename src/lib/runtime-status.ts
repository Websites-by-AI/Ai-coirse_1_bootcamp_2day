export type RuntimeIssue = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  fix: string;
};

export type RuntimeStatus = {
  databaseConfigured: boolean;
  databaseReachable: boolean | null;
  googleStudentConfigured: boolean;
  googleAdminConfigured: boolean;
  siteUrlConfigured: boolean;
  demoMode: boolean;
  issues: RuntimeIssue[];
  summary: string;
};

function has(value?: string | null) {
  return Boolean(value && value.trim());
}

export function getRuntimeStatus(options?: {
  databaseReachable?: boolean | null;
}): RuntimeStatus {
  const databaseConfigured = has(process.env.DATABASE_URL);
  const googleStudentConfigured =
    has(process.env.GOOGLE_CLIENT_ID) && has(process.env.GOOGLE_CLIENT_SECRET);
  const googleAdminConfigured =
    googleStudentConfigured && has(process.env.GOOGLE_ADMIN_EMAILS);
  const siteUrlConfigured = has(process.env.NEXT_PUBLIC_SITE_URL);
  const databaseReachable = options?.databaseReachable ?? null;

  const issues: RuntimeIssue[] = [];

  if (!databaseConfigured) {
    issues.push({
      id: "database_missing",
      severity: "warning",
      title: "دیتابیس هنوز وصل نیست",
      detail:
        "DATABASE_URL تنظیم نشده است. سایت و صفحات نمایشی باز می‌شوند، ولی ورود/ثبت‌نام/پنل واقعی ذخیره نمی‌شود.",
      fix: "برای حالت کامل، اپ را روی Vercel ببرید و DATABASE_URL سوپابیس را آنجا بگذارید. روی Cloudflare Pages لازم نیست.",
    });
  } else if (databaseReachable === false) {
    issues.push({
      id: "database_unreachable",
      severity: "critical",
      title: "اتصال به دیتابیس برقرار نشد",
      detail: "DATABASE_URL هست، ولی سرور به PostgreSQL وصل نشد (SSL، رمز، یا host اشتباه).",
      fix: "Connection string سوپابیس (pooler port 6543) را بررسی کنید و DATABASE_SSL=true بگذارید.",
    });
  }

  if (!googleStudentConfigured) {
    issues.push({
      id: "google_student",
      severity: "info",
      title: "ورود Google کاربر غیرفعال است",
      detail: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET تنظیم نشده‌اند. ورود ایمیل/رمز و حساب دمو کار می‌کند.",
      fix: "در Google Cloud یک OAuth Web Client بسازید و کلیدها را فقط روی Vercel ست کنید.",
    });
  }

  if (!googleAdminConfigured) {
    issues.push({
      id: "google_admin",
      severity: "info",
      title: "ورود Google ادمین غیرفعال است",
      detail: "برای ادمین علاوه بر OAuth باید GOOGLE_ADMIN_EMAILS هم ست شود.",
      fix: "GOOGLE_ADMIN_EMAILS=you@gmail.com را در Vercel اضافه کنید.",
    });
  }

  if (!siteUrlConfigured) {
    issues.push({
      id: "site_url",
      severity: "info",
      title: "آدرس عمومی سایت مشخص نیست",
      detail: "NEXT_PUBLIC_SITE_URL خالی است. برای redirectهای Google بهتر است ست شود.",
      fix: "مثلاً https://your-app.vercel.app",
    });
  }

  issues.push({
    id: "cloudflare_root",
    severity: "warning",
    title: "تنظیم Root directory در Cloudflare",
    detail:
      "Root directory نباید nodejs_compat باشد. آن یک Compatibility Flag است نه پوشه پروژه.",
    fix: "Cloudflare Pages → Settings → Build → Root directory را خالی بگذارید. nodejs_compat را فقط در Runtime → Compatibility flags فعال کنید.",
  });

  const critical = issues.some((i) => i.severity === "critical");
  const demoMode = !databaseConfigured || databaseReachable === false;
  const summary = critical
    ? "سایت در حالت نمایشی با خطای اتصال اجرا می‌شود."
    : demoMode
      ? "سایت در حالت نمایشی/بدون دیتابیس باز است."
      : "پیکربندی پایه آماده است.";

  return {
    databaseConfigured,
    databaseReachable,
    googleStudentConfigured,
    googleAdminConfigured,
    siteUrlConfigured,
    demoMode,
    issues,
    summary,
  };
}
