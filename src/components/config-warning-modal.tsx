"use client";

import { useEffect, useMemo, useState } from "react";
import type { RuntimeIssue, RuntimeStatus } from "@/lib/runtime-status";

const severityLabel: Record<RuntimeIssue["severity"], string> = {
  critical: "خطای مهم",
  warning: "هشدار",
  info: "راهنما",
};

export default function ConfigWarningModal({
  initialStatus,
}: {
  initialStatus?: RuntimeStatus | null;
}) {
  const [status, setStatus] = useState<RuntimeStatus | null>(initialStatus ?? null);
  const [open, setOpen] = useState(Boolean(initialStatus?.issues?.length));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/auth/settings", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          runtime?: RuntimeStatus;
        };
        if (!cancelled && payload.runtime) {
          setStatus(payload.runtime);
          if (payload.runtime.issues.length && !dismissed) setOpen(true);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            databaseConfigured: false,
            databaseReachable: null,
            googleStudentConfigured: false,
            googleAdminConfigured: false,
            siteUrlConfigured: false,
            demoMode: true,
            summary: "سایت در حالت نمایشی است؛ سرویس وضعیت در دسترس نبود.",
            issues: [
              {
                id: "settings_api",
                severity: "warning",
                title: "API وضعیت در دسترس نیست",
                detail:
                  "احتمالاً روی Cloudflare Pages فقط خروجی استاتیک سرو می‌شود یا API اجرا نمی‌شود.",
                fix: "برای لاگین/دیتابیس کامل از Vercel استفاده کنید. Root directory در Cloudflare باید خالی باشد نه nodejs_compat.",
              },
            ],
          });
          if (!dismissed) setOpen(true);
        }
      }
    };
    if (!initialStatus) void load();
    return () => {
      cancelled = true;
    };
  }, [dismissed, initialStatus]);

  const issues = status?.issues ?? [];
  const hasCritical = useMemo(
    () => issues.some((issue) => issue.severity === "critical"),
    [issues],
  );

  if (!status || issues.length === 0) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          className="config-warning-fab"
          onClick={() => setOpen(true)}
          aria-label="نمایش هشدارهای پیکربندی"
        >
          {hasCritical ? "!" : "i"}
          <span>هشدار پیکربندی</span>
        </button>
      )}

      {open && (
        <div className="config-warning-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="config-warning-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="config-warning-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p>CONFIGURATION WARNING</p>
                <h2 id="config-warning-title">سایت باز است — بعضی سرویس‌ها کامل نیستند</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن">
                ×
              </button>
            </header>

            <p className="config-warning-summary">{status.summary}</p>

            <div className="config-warning-badges">
              <span className={status.databaseConfigured ? "ok" : "bad"}>
                DB: {status.databaseConfigured ? "تنظیم شده" : "نیست"}
              </span>
              <span
                className={
                  status.databaseReachable === true
                    ? "ok"
                    : status.databaseReachable === false
                      ? "bad"
                      : "warn"
                }
              >
                اتصال DB:{" "}
                {status.databaseReachable === true
                  ? "موفق"
                  : status.databaseReachable === false
                    ? "ناموفق"
                    : "بررسی نشده"}
              </span>
              <span className={status.googleStudentConfigured ? "ok" : "warn"}>
                Google کاربر: {status.googleStudentConfigured ? "فعال" : "خاموش"}
              </span>
              <span className={status.demoMode ? "warn" : "ok"}>
                {status.demoMode ? "حالت نمایشی" : "حالت کامل"}
              </span>
            </div>

            <ul className="config-warning-list">
              {issues.map((issue) => (
                <li key={issue.id} data-severity={issue.severity}>
                  <div>
                    <b>
                      {severityLabel[issue.severity]} · {issue.title}
                    </b>
                    <p>{issue.detail}</p>
                    <small>{issue.fix}</small>
                  </div>
                </li>
              ))}
            </ul>

            <div className="config-warning-actions">
              <a href="/api/auth/settings" target="_blank" rel="noreferrer">
                وضعیت JSON
              </a>
              <a href="/api/health" target="_blank" rel="noreferrer">
                health
              </a>
              <button
                type="button"
                onClick={() => {
                  setDismissed(true);
                  setOpen(false);
                }}
              >
                فهمیدم، ادامه بده
              </button>
            </div>

            <footer>
              <p>
                Cloudflare: Root directory را <b>خالی</b> بگذارید.{" "}
                <code>nodejs_compat</code> فقط Compatibility Flag است، نه Root و نه Secret.
              </p>
              <p>
                برای دیتابیس/لاگین واقعی: <b>Vercel + Supabase</b> — نه Secrets اجباری روی Pages.
              </p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
