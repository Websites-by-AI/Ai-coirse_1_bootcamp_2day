'use client';

import { useState } from "react";
import type { SecurityCheck, SecurityReport } from "@/lib/security";

function SecurityIcon({ name, size = 18 }: { name: "alert" | "check" | "clock" | "database" | "lock" | "refresh" | "shield"; size?: number }) {
  const paths = {
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 4v7h-7" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.5 2.9 8 7 10 4.1-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function statusCopy(status: SecurityCheck["status"]) {
  if (status === "passed") return "تأیید شد";
  if (status === "warning") return "نیازمند اقدام";
  return "پیکربندی نشده";
}

export default function SecurityCenter({ initialReport }: { initialReport: SecurityReport }) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshReport = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/security-report", { cache: "no-store" });
      const payload = (await response.json()) as { report?: SecurityReport; error?: string };
      if (!response.ok || !payload.report) throw new Error(payload.error ?? "اجرای تست‌ها ناموفق بود.");
      setReport(payload.report);
      setMessage("تست‌های runtime دوباره اجرا شدند.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "اجرای تست‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="security-center" id="security-tests">
      <div className="security-head"><div><p><SecurityIcon name="shield" size={15} /> Security Center</p><h2>تست‌های امنیتی و وضعیت پیکربندی</h2><span>این گزارش وضعیت runtime و پیکربندی‌های قابل‌بررسی را نشان می‌دهد؛ موارد Edge مانند WAF باید در Cloudflare بررسی شوند.</span></div><button onClick={refreshReport} disabled={loading}><SecurityIcon name="refresh" size={16} /> {loading ? "در حال اجرا..." : "اجرای مجدد تست‌ها"}</button></div>
      <div className="security-summary"><div className="security-score"><span><SecurityIcon name="shield" size={18} /></span><div><b>{report.summary.passed.toLocaleString("fa-IR")} تست تأییدشده</b><small>آخرین اجرا: {new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(report.generatedAt))}</small></div></div><div className="security-counter passed"><b>{report.summary.passed.toLocaleString("fa-IR")}</b><span>تأیید</span></div><div className="security-counter warning"><b>{report.summary.warnings.toLocaleString("fa-IR")}</b><span>هشدار</span></div><div className="security-counter pending"><b>{report.summary.notConfigured.toLocaleString("fa-IR")}</b><span>تنظیم نشده</span></div></div>
      {message && <p className="security-message"><SecurityIcon name={message.includes("دوباره") ? "check" : "alert"} size={15} /> {message}</p>}
      <div className="security-check-grid">{report.checks.map((item) => <article className={`security-check ${item.status}`} key={item.id}><div className="security-check-top"><span className="security-check-icon">{item.status === "passed" ? <SecurityIcon name="check" size={16} /> : item.status === "warning" ? <SecurityIcon name="alert" size={16} /> : <SecurityIcon name="clock" size={16} />}</span><div><small>{item.category}</small><h3>{item.title}</h3></div><em>{statusCopy(item.status)}</em></div><p>{item.detail}</p></article>)}</div>
      <div className="security-note"><SecurityIcon name="lock" size={16} /><span><b>دامنه‌ی پوشش گزارش:</b> اتصال دیتابیس، سیاست session، هش رمز، Vault API، OAuth، Turnstile و health ذخیره‌شده‌ی AI بررسی می‌شود. قوانین WAF و Rate Limit Cloudflare از بیرون این اپ قابل تأیید نیستند و با هشدار مشخص شده‌اند.</span></div>
    </section>
  );
}
