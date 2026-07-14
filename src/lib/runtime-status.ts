export type RuntimeIssue = {
  id: string;
  severity: "critical" | "warning";
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

/**
 * Only real blocking/missing production secrets become modal issues.
 * Optional Google / site URL hints are available via /api/auth/settings JSON,
 * but they must NOT open a popup on a working Vercel site.
 */
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
      title: "DATABASE_URL تنظیم نشده",
      detail:
        "سایت باز است، ولی ورود/ثبت‌نام/پنل بدون دیتابیس ذخیره نمی‌شود.",
      fix: "در Vercel → Settings → Environment Variables مقدار DATABASE_URL (Supabase) را بگذارید.",
    });
  } else if (databaseReachable === false) {
    issues.push({
      id: "database_unreachable",
      severity: "critical",
      title: "اتصال دیتابیس ناموفق است",
      detail: "DATABASE_URL هست، ولی PostgreSQL در دسترس نیست.",
      fix: "Connection string سوپابیس (pooler port 6543) و DATABASE_SSL=true را بررسی کنید.",
    });
  }

  const critical = issues.some((i) => i.severity === "critical");
  const demoMode = !databaseConfigured || databaseReachable === false;
  const summary = critical
    ? "سایت بالا است ولی دیتابیس وصل نیست."
    : demoMode
      ? "سایت در حالت بدون دیتابیس است."
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
