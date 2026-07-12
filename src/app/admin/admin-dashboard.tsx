'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AiAlert, AiProviderDashboardItem } from "@/lib/ai";
import type { SecurityReport } from "@/lib/security";
import type { ReleaseNote } from "@/lib/releases";
import type { DashboardAssessment, DashboardEnrollment } from "@/lib/admin";
import AiProviderManager from "./ai-provider-manager";
import AssessmentSandbox from "./assessment-sandbox";
import SecurityCenter from "./security-center";
import SetupReleaseCenter from "./setup-release-center";
import StudentAssessmentList from "./student-assessment-list";

type DashboardData = { registrations: DashboardEnrollment[]; assessments: DashboardAssessment[]; stats: { total: number; pending: number; confirmed: number; newLeads: number; students: number; readyStudents: number } };
type AiDashboardData = { providers: AiProviderDashboardItem[]; alerts: AiAlert[] };
type StatusFilter = "همه" | "جدید" | "در انتظار" | "تأیید شده" | "لغو شده";

function AdminIcon({ name, size = 18 }: { name: "arrow" | "calendar" | "check" | "database" | "exit" | "grid" | "mail" | "more" | "refresh" | "search" | "settings" | "spark" | "users"; size?: number }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    exit: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 4v7h-7" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.4 2.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.4-2.4.1-.1A1.7 1.7 0 0 0 6 15a1.7 1.7 0 0 0-1.5-1H4.3v-3.4h.2A1.7 1.7 0 0 0 6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1L8 4.6l.1.1A1.7 1.7 0 0 0 10 5a1.7 1.7 0 0 0 1-1.5v-.2h3.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
    users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8m5 8.7v-1.5a3.5 3.5 0 0 0-2.6-3.4" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function statusClass(status: string) {
  if (status === "تأیید شده") return "confirmed";
  if (status === "در انتظار") return "pending";
  if (status === "لغو شده") return "cancelled";
  return "new";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function AdminDashboard({ admin, initialData, initialAiData, initialSecurityReport, releases, githubUrl }: { admin: { displayName: string; username: string }; initialData: DashboardData; initialAiData: AiDashboardData; initialSecurityReport: SecurityReport; releases: ReleaseNote[]; githubUrl: string | null }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialData.registrations);
  const [filter, setFilter] = useState<StatusFilter>("همه");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => ({
    total: registrations.length,
    pending: registrations.filter((item) => item.status === "در انتظار").length,
    confirmed: registrations.filter((item) => item.status === "تأیید شده").length,
    newLeads: registrations.filter((item) => item.status === "جدید").length,
  }), [registrations]);

  const visibleRegistrations = useMemo(() => registrations.filter((item) => {
    const matchesStatus = filter === "همه" || item.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesSearch = !needle || `${item.fullName} ${item.email} ${item.phone}`.toLowerCase().includes(needle);
    return matchesStatus && matchesSearch;
  }), [filter, query, registrations]);

  const updateStatus = async (id: number, status: string) => {
    setSavingId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/enrollments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = (await response.json()) as { enrollment?: { status: string }; error?: string };
      if (!response.ok || !result.enrollment) throw new Error(result.error ?? "به‌روزرسانی ناموفق بود.");
      setRegistrations((items) => items.map((item) => item.id === id ? { ...item, status: result.enrollment!.status } : item));
      setMessage("وضعیت ثبت‌نام ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در ذخیره‌ی تغییرات");
    } finally {
      setSavingId(null);
      window.setTimeout(() => setMessage(""), 2500);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  };

  return (
    <main dir="rtl" className="admin-app">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span>V</span><b>VibeLab</b><small>ADMIN</small></a>
        <nav className="admin-side-nav"><a className="active" href="#overview"><AdminIcon name="grid" /> نمای کلی</a><a href="#registrations"><AdminIcon name="users" /> ثبت‌نام‌ها <em>{stats.total}</em></a><a href="#workshop"><AdminIcon name="calendar" /> ماراتن دو روزه</a><a href="#ai-apis"><AdminIcon name="settings" /> AI API و هشدارها</a><a href="#assessment-sandbox"><AdminIcon name="settings" /> تست AI Scanner</a><a href="#security-tests"><AdminIcon name="settings" /> تست‌های امنیتی</a><a href="#release-center"><AdminIcon name="settings" /> نسخه‌ها و راه‌اندازی</a><a href="#student-analysis"><AdminIcon name="spark" /> تحلیل کاربران</a><a href="/"><AdminIcon name="spark" /> صفحه‌ی سایت</a></nav>
        <div className="admin-side-bottom"><div className="admin-db-chip"><span><AdminIcon name="database" size={16} /></span><div><b>PostgreSQL</b><small><i /> اتصال برقرار است</small></div></div><button onClick={logout}><AdminIcon name="exit" /> خروج از پنل</button></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><p>سلام، {admin.displayName}</p><h1>نمای کلی ماراتن</h1></div><div className="admin-top-actions"><button onClick={() => router.refresh()} title="به‌روزرسانی داده‌ها"><AdminIcon name="refresh" /></button><a href="/" target="_blank" rel="noreferrer">مشاهده‌ی سایت <AdminIcon name="arrow" size={16} /></a><span className="admin-user-avatar">م</span></div></header>
        <div className="admin-content" id="overview">
          <div className="admin-context"><span><i /> دوره‌ی فعال</span><b>VibeLab / ماراتن ساخت با AI</b><small>آخرین بروزرسانی: هم‌اکنون</small></div>
          <section className="admin-stats"><article><div className="admin-stat-icon blue"><AdminIcon name="users" /></div><p>کل ثبت‌نام‌ها</p><b>{stats.total.toLocaleString("fa-IR")}</b><span>همه‌ی ورودی‌های ثبت‌شده</span></article><article><div className="admin-stat-icon purple"><AdminIcon name="spark" /></div><p>سرنخ‌های جدید</p><b>{stats.newLeads.toLocaleString("fa-IR")}</b><span>نیازمند پیگیری تیم</span></article><article><div className="admin-stat-icon orange"><AdminIcon name="calendar" /></div><p>در انتظار تأیید</p><b>{stats.pending.toLocaleString("fa-IR")}</b><span>منتظر هماهنگی نهایی</span></article><article><div className="admin-stat-icon green"><AdminIcon name="check" /></div><p>ثبت‌نام تأییدشده</p><b>{stats.confirmed.toLocaleString("fa-IR")}</b><span>صندلی رزرو شده</span></article></section>
          <section className="admin-workshop-card" id="workshop"><div className="admin-workshop-copy"><span><AdminIcon name="spark" size={15} /> برنامه‌ی فعال</span><h2>ماراتن دو روزه‌ی Vibe Coding</h2><p>از تولید محتوا با Gemini، Claude، Higgsfield و Kling تا ساخت وب‌اپ با Emergent؛ بدون نیاز به کدنویسی.</p><div><b>روز اول: Content Engine</b><i /><b>روز دوم: Vibe Product</b></div></div><div className="admin-workshop-meter"><span>ظرفیت اولیه</span><b>{stats.confirmed.toLocaleString("fa-IR")} <small>از ۳۰ نفر</small></b><i><em style={{ width: `${Math.min(100, (stats.confirmed / 30) * 100)}%` }} /></i><small>برای بازخورد شخصی، ظرفیت محدود است.</small></div></section>
          <SecurityCenter initialReport={initialSecurityReport} />
          <SetupReleaseCenter releases={releases} githubUrl={githubUrl} connectedProviders={initialAiData.providers.filter((provider) => provider.lastStatus === "connected").length} />
          <AiProviderManager initialData={initialAiData} />
          <AssessmentSandbox />
          <StudentAssessmentList assessments={initialData.assessments} totalStudents={initialData.stats.students} readyStudents={initialData.stats.readyStudents} />
          <section className="admin-table-section" id="registrations"><div className="admin-table-header"><div><p>مدیریت ثبت‌نام‌ها</p><h2>سرنخ‌ها و شرکت‌کنندگان</h2></div><div className="admin-table-tools"><label><AdminIcon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نام یا ایمیل" /></label><button onClick={() => router.refresh()}><AdminIcon name="refresh" size={16} /> بروزرسانی</button></div></div><div className="admin-filter-row">{(["همه", "جدید", "در انتظار", "تأیید شده", "لغو شده"] as StatusFilter[]).map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}{item === "همه" && <span>{stats.total.toLocaleString("fa-IR")}</span>}</button>)}</div>{message && <p className="admin-action-message"><AdminIcon name="check" size={15} /> {message}</p>}<div className="admin-table-wrap"><table><thead><tr><th>شرکت‌کننده</th><th>مسیر</th><th>منبع</th><th>تاریخ</th><th>وضعیت</th><th>مدیریت</th></tr></thead><tbody>{visibleRegistrations.map((item) => <tr key={item.id}><td><div className="participant"><span>{item.fullName.slice(0, 1)}</span><div><b>{item.fullName}</b><small>{item.email}<br />{item.phone}</small></div></div></td><td>{item.track}</td><td><span className="source-tag">{item.source}</span></td><td>{formatDate(item.createdAt)}</td><td><span className={`status-badge ${statusClass(item.status)}`}><i /> {item.status}</span></td><td><div className="row-actions"><select value={item.status} disabled={savingId === item.id} onChange={(event) => updateStatus(item.id, event.target.value)} aria-label={`تغییر وضعیت ${item.fullName}`}><option>جدید</option><option>در انتظار</option><option>تأیید شده</option><option>لغو شده</option></select><button title="جزئیات"><AdminIcon name="more" size={18} /></button></div></td></tr>)}</tbody></table>{visibleRegistrations.length === 0 && <div className="admin-empty">نتیجه‌ای برای این جست‌وجو وجود ندارد.</div>}</div></section>
        </div>
      </section>
    </main>
  );
}
