'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AiAlert, AiProviderDashboardItem } from "@/lib/ai";
import type { SecurityReport } from "@/lib/security";
import type { ReleaseNote } from "@/lib/releases";
import type { DashboardAssessment, DashboardEnrollment, DashboardInternshipApplication, DashboardStudentUser } from "@/lib/admin";
import AiProviderManager from "./ai-provider-manager";
import AssessmentSandbox from "./assessment-sandbox";
import SecurityCenter from "./security-center";
import SetupReleaseCenter from "./setup-release-center";
import StudentAssessmentList from "./student-assessment-list";

type DashboardData = { registrations: DashboardEnrollment[]; assessments: DashboardAssessment[]; users?: DashboardStudentUser[]; internshipApplications?: DashboardInternshipApplication[]; stats: { total: number; pending: number; confirmed: number; newLeads: number; students: number; readyStudents: number } };
type AiDashboardData = { providers: AiProviderDashboardItem[]; alerts: AiAlert[] };
type StatusFilter = "همه" | "جدید" | "در انتظار" | "تأیید شده" | "لغو شده";

const youtubeLearningResources = [
  { title: "ساخت رزومه و پروفایل فریلنسری با AI", channel: "YouTube Search", url: "https://www.youtube.com/results?search_query=AI+resume+portfolio+freelancing" },
  { title: "پیدا کردن پروژه فریلنس با LinkedIn و Upwork", channel: "YouTube Search", url: "https://www.youtube.com/results?search_query=find+freelance+clients+linkedin+upwork+ai" },
  { title: "Vibe Coding و ساخت MVP بدون کدنویسی", channel: "YouTube Search", url: "https://www.youtube.com/results?search_query=vibe+coding+build+MVP+AI" },
];

const jobPlaybook = [
  { title: "مدل پیدا کردن کار", detail: "هر کاربر باید یک پروفایل عمومی، ۳ نمونه‌کار، یک رزومه کوتاه و پیام معرفی ۵ خطی داشته باشد." },
  { title: "کانال‌های جذب پروژه", detail: "LinkedIn، Upwork، پونیشا، کارلنسر، گروه‌های تلگرام تخصصی و ارسال مستقیم به کسب‌وکارهای محلی." },
  { title: "شاخص آمادگی", detail: "امتیاز ارزیابی بالای ۷۵ + پروژه منتشرشده + رزومه تکمیل‌شده = آماده معرفی به کارفرما." },
];

const opportunityCalls = [
  {
    title: "Osome UAE — Business Setup",
    region: "UAE / Dubai",
    status: "آماده ارسال",
    deadline: "Rolling",
    responseTime: "۱ تا ۳ روز کاری",
    followUp: "۳ روز بعد از ارسال",
    contact: "Contact form",
    url: "https://osome.com/ae/contact-us/#contact-us-form",
    fit: "ثبت شرکت، مجوز فعالیت، ویزا، بانک و حسابداری برای VibeLab در امارات",
    template: `Hello Osome team,\n\nI am exploring UAE company setup options for VibeLab, an AI-powered learning and portfolio platform for creators, freelancers and small businesses. The platform is live at https://v2.vibelab.ir and currently runs on Cloudflare Workers with Cloudflare D1 database.\n\nVibeLab helps non-technical users build AI content kits, live websites/MVPs, resume-ready portfolios and job-finding workflows. We are preparing the product for a six-week AI program and potential UAE/MENA expansion.\n\nI would like guidance on the best UAE setup option for an AI education/software startup, including Free Zone vs Mainland, licensing activity, founder visa options, bank account setup, expected costs, and timeline.\n\nContact: Soheil — soheil.power@gmail.com — +1-208-5033653\nWebsite: https://v2.vibelab.ir\n\nBest,\nSoheil\nVibeLab`,
  },
  {
    title: "Presight AI-Startup Accelerator",
    region: "UAE / Abu Dhabi",
    status: "نیازمند بررسی cohort",
    deadline: "Cohort-based",
    responseTime: "۲ تا ۴ هفته",
    followUp: "۱۴ روز بعد",
    contact: "Accelerator form",
    url: "https://www.presight.ai/accelerator",
    fit: "شتاب‌دهنده AI برای محصول آماده، شبکه G42، بازار UAE و توسعه منطقه‌ای",
    template: `Startup: VibeLab\nWebsite: https://v2.vibelab.ir\nFounder contact: Soheil — soheil.power@gmail.com — +1-208-5033653\n\nVibeLab is an AI-powered learning and portfolio platform for non-technical creators, freelancers and small businesses. It helps users turn ideas into content kits, AI-generated videos, live websites, resumes and job-ready portfolios through a structured six-week program.\n\nWe are applying because the UAE is a strong launch market for practical AI adoption, SME digitization and workforce upskilling. VibeLab turns AI literacy into measurable outputs: content, websites, MVPs and job-ready portfolios.`,
  },
  {
    title: "Dubai Future / DCAI AI Accelerator",
    region: "UAE / Dubai",
    status: "رصد فراخوان بعدی",
    deadline: "Call-based",
    responseTime: "۲ تا ۶ هفته",
    followUp: "۱۴ روز بعد",
    contact: "Dubai Future form/news",
    url: "https://www.dubaifuture.ae/",
    fit: "AI برای دولت، رسانه، آموزش و خدمات؛ مناسب نسخه انگلیسی و pitch deck",
    template: `VibeLab can support practical AI upskilling for creators, SMEs and non-technical teams by combining structured learning with production-ready outputs: AI content kits, websites, portfolios and job-finding workflows.\n\nWe are interested in UAE/Dubai pilots for AI education, SME digitization and workforce readiness. Live product: https://v2.vibelab.ir`,
  },
  {
    title: "Mastercard Lighthouse UAE",
    region: "UAE / AI + commerce",
    status: "رصد و آماده‌سازی pitch",
    deadline: "Call-based",
    responseTime: "۲ تا ۶ هفته",
    followUp: "۱۴ روز بعد",
    contact: "Program/newsroom",
    url: "https://www.mastercard.com/news/eemea/en/newsroom/",
    fit: "اگر VibeLab برای SME commerce, trust, payments یا AI adoption position شود",
    template: `VibeLab helps micro and small businesses adopt AI by creating market-ready content, live websites and portfolio assets. For a UAE pilot, VibeLab can be positioned as an AI enablement layer for SMEs, creators and early-stage founders preparing to digitize sales, content and customer acquisition.`,
  },
  {
    title: "NVIDIA Inception",
    region: "Global",
    status: "Rolling / مناسب اقدام",
    deadline: "Rolling",
    responseTime: "۱ تا ۳ هفته",
    followUp: "۱۰ روز بعد",
    contact: "Startup application",
    url: "https://www.nvidia.com/en-us/startups/",
    fit: "اعتبار GPU/AI، شبکه فنی و اعتبار برند برای AI startup بدون نیاز اولیه به ویزا",
    template: `VibeLab is an AI-powered learning and portfolio platform using AI workflows to help non-technical users create content kits, websites, resumes and job-ready portfolios. We are looking for AI infrastructure, technical support and ecosystem access to expand the platform.`,
  },
  {
    title: "Microsoft for Startups Founders Hub",
    region: "Global",
    status: "Rolling / مناسب اقدام",
    deadline: "Rolling",
    responseTime: "فوری تا ۲ هفته",
    followUp: "۷ روز بعد",
    contact: "Founders Hub portal",
    url: "https://www.microsoft.com/startups",
    fit: "Azure/OpenAI credits، ابزار SaaS و پشتیبانی برای محصول AI education",
    template: `VibeLab is a live AI learning and portfolio platform at https://v2.vibelab.ir. We help creators, freelancers and SMEs turn AI learning into market-ready outputs: content kits, websites, MVPs, resumes and outreach workflows. We are seeking cloud and AI credits to scale the product.`,
  },
  {
    title: "Google for Startups Accelerator: AI / MENA",
    region: "Global / MENA",
    status: "Cohort-based",
    deadline: "بر اساس cohort",
    responseTime: "۲ تا ۶ هفته",
    followUp: "۱۴ روز بعد",
    contact: "Google startup form",
    url: "https://startup.google.com/accelerator/",
    fit: "AI startup، Google Cloud، MENA expansion، آموزش AI و SME digitization",
    template: `VibeLab is an AI-powered learning and portfolio platform for non-technical creators, freelancers and small businesses. We are preparing a six-week AI portfolio program for MENA users and seek mentorship, cloud support and go-to-market help.`,
  },
  {
    title: "Techstars Anywhere",
    region: "Remote / Americas timezone",
    status: "Cohort-based",
    deadline: "بر اساس batch",
    responseTime: "۲ تا ۶ هفته",
    followUp: "۱۴ روز بعد",
    contact: "Techstars application",
    url: "https://www.techstars.com/accelerators/anywhere",
    fit: "Remote-first accelerator؛ مناسب اگر time zone و سفرهای کوتاه ممکن باشد",
    template: `VibeLab is a remote-ready AI learning and portfolio platform. It helps non-technical users create AI content kits, live websites, resumes and client outreach workflows. We are looking for mentorship, network and early-stage acceleration.`,
  },
  {
    title: "Creative Destruction Lab (CDL)",
    region: "Canada / Global sites",
    status: "Canada eligibility را چک کن",
    deadline: "Annual cohorts",
    responseTime: "۴ تا ۸ هفته",
    followUp: "۲۱ روز بعد",
    contact: "CDL apply/contact",
    url: "https://creativedestructionlab.com/",
    fit: "AI/deep-tech mentorship؛ برای Canada pathway خوب است ولی visa/PR تضمین نمی‌کند",
    template: `VibeLab is an AI-enabled platform for practical AI education, portfolio generation and workforce readiness. The product is live and uses Cloudflare Workers + D1. We are exploring mentor-driven acceleration to validate the model for MENA and global markets.`,
  },
  {
    title: "DMZ / Toronto Metropolitan University",
    region: "Canada / Toronto",
    status: "نیازمند بررسی اقامت/حضور",
    deadline: "Cohort-based",
    responseTime: "۲ تا ۴ هفته",
    followUp: "۱۴ روز بعد",
    contact: "DMZ application/contact",
    url: "https://dmz.torontomu.ca/",
    fit: "شبکه tech Canada؛ ممکن است حضور Toronto یا traction لازم باشد؛ برای بدون ویزا ریسک دارد",
    template: `VibeLab is a live AI-powered learning and portfolio platform. We are exploring Canadian ecosystem opportunities, mentorship and potential incorporation/market entry options. We are currently based outside Canada and would like to understand eligibility for international founders.`,
  },
];

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
  const users = initialData.users ?? [];
  const internshipApplications = initialData.internshipApplications ?? [];
  const readyEmails = new Set(initialData.assessments.filter((item) => item.fitLevel === "آماده برای ماراتن" || item.score >= 75).map((item) => item.email));

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

  const copyOpportunityTemplate = async (title: string, template: string) => {
    try {
      await navigator.clipboard.writeText(template);
      setMessage(`متن فرم «${title}» کپی شد.`);
    } catch {
      setMessage("کپی خودکار ممکن نشد؛ متن را دستی انتخاب و کپی کنید.");
    } finally {
      window.setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <main dir="rtl" className="admin-app">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span>V</span><b>VibeLab</b><small>ADMIN</small></a>
        <nav className="admin-side-nav"><a className="active" href="#overview"><AdminIcon name="grid" /> نمای کلی</a><a href="#registrations"><AdminIcon name="users" /> ثبت‌نام‌ها <em>{stats.total}</em></a><a href="#workshop"><AdminIcon name="calendar" /> ماراتن دو روزه</a><a href="#ai-apis"><AdminIcon name="settings" /> AI API و هشدارها</a><a href="#assessment-sandbox"><AdminIcon name="settings" /> تست AI Scanner</a><a href="#security-tests"><AdminIcon name="settings" /> تست‌های امنیتی</a><a href="#release-center"><AdminIcon name="settings" /> نسخه‌ها و راه‌اندازی</a><a href="#users-model"><AdminIcon name="database" /> مدل کاربران</a><a href="#internship-apps"><AdminIcon name="users" /> کارآموزی <em>{internshipApplications.length}</em></a><a href="#opportunity-center"><AdminIcon name="mail" /> فراخوان‌ها و فرم‌ها</a><a href="#student-analysis"><AdminIcon name="spark" /> تحلیل کاربران</a><a href="/"><AdminIcon name="spark" /> صفحه‌ی سایت</a></nav>
        <div className="admin-side-bottom"><div className="admin-db-chip"><span><AdminIcon name="database" size={16} /></span><div><b>PostgreSQL</b><small><i /> اتصال برقرار است</small></div></div><button onClick={logout}><AdminIcon name="exit" /> خروج از پنل</button></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div><p>سلام، {admin.displayName}</p><h1>نمای کلی ماراتن</h1></div><div className="admin-top-actions"><button onClick={() => router.refresh()} title="به‌روزرسانی داده‌ها"><AdminIcon name="refresh" /></button><a href="/" target="_blank" rel="noreferrer">مشاهده‌ی سایت <AdminIcon name="arrow" size={16} /></a><span className="admin-user-avatar">م</span></div></header>
        <div className="admin-content" id="overview">
          <div className="admin-context"><span><i /> دوره‌ی فعال</span><b>VibeLab / ماراتن ساخت با AI</b><small>آخرین بروزرسانی: هم‌اکنون</small></div>
          <section className="admin-stats"><article><div className="admin-stat-icon blue"><AdminIcon name="users" /></div><p>کل ثبت‌نام‌ها</p><b>{stats.total.toLocaleString("fa-IR")}</b><span>همه‌ی ورودی‌های ثبت‌شده</span></article><article><div className="admin-stat-icon purple"><AdminIcon name="spark" /></div><p>سرنخ‌های جدید</p><b>{stats.newLeads.toLocaleString("fa-IR")}</b><span>نیازمند پیگیری تیم</span></article><article><div className="admin-stat-icon orange"><AdminIcon name="calendar" /></div><p>در انتظار تأیید</p><b>{stats.pending.toLocaleString("fa-IR")}</b><span>منتظر هماهنگی نهایی</span></article><article><div className="admin-stat-icon green"><AdminIcon name="check" /></div><p>ثبت‌نام تأییدشده</p><b>{stats.confirmed.toLocaleString("fa-IR")}</b><span>صندلی رزرو شده</span></article></section>
          <section className="admin-workshop-card" id="workshop"><div className="admin-workshop-copy"><span><AdminIcon name="spark" size={15} /> برنامه‌ی فعال</span><h2>ماراتن دو روزه‌ی Vibe Coding</h2><p>از تولید محتوا با Gemini، Claude، Higgsfield و Kling تا ساخت وب‌اپ با Emergent؛ بدون نیاز به کدنویسی.</p><div><b>روز اول: Content Engine</b><i /><b>روز دوم: Vibe Product</b></div></div><div className="admin-workshop-meter"><span>ظرفیت اولیه</span><b>{stats.confirmed.toLocaleString("fa-IR")} <small>از ۳۰ نفر</small></b><i><em style={{ width: `${Math.min(100, (stats.confirmed / 30) * 100)}%` }} /></i><small>برای بازخورد شخصی، ظرفیت محدود است.</small></div></section>
          <section className="admin-insight-grid" id="users-model">
            <article className="admin-insight-card wide"><div><p>DATABASE MODEL</p><h2>کاربران ذخیره‌شده در Cloudflare D1</h2><span>{users.length.toLocaleString("fa-IR")} کاربر واقعی / دمو</span></div><div className="admin-mini-table">{users.slice(0, 6).map((user) => <div key={user.id}><b>{user.fullName}</b><small>{user.email}</small><em className={readyEmails.has(user.email) ? "ready" : ""}>{readyEmails.has(user.email) ? "آماده معرفی" : user.status}</em></div>)}{users.length === 0 && <p>هنوز کاربری ثبت نشده است.</p>}</div></article>
            <article className="admin-insight-card"><p>YOUTUBE</p><h2>مسیرهای ویدیویی مکمل</h2>{youtubeLearningResources.map((item) => <a key={item.title} href={item.url} target="_blank" rel="noreferrer"><b>{item.title}</b><small>{item.channel}</small></a>)}</article>
            <article className="admin-insight-card"><p>JOB MODEL</p><h2>مدل پیدا کردن کار برای هنرجو</h2>{jobPlaybook.map((item) => <div key={item.title} className="job-playbook-item"><b>{item.title}</b><small>{item.detail}</small></div>)}</article>
          </section>
          <section className="opportunity-center" id="opportunity-center"><div className="opportunity-head"><div><p>UAE / ACCELERATOR FORMS</p><h2>فراخوان‌ها و فرم‌های آماده کپی</h2><span>برای ثبت شرکت، برنامه‌های شتاب‌دهنده و مکاتبه با سازمان‌ها؛ متن‌ها آماده‌اند و قبل از ارسال باید بازبینی شوند.</span></div><a href="https://github.com/Websites-by-AI/Ai-coirse_1_bootcamp_2day/blob/main/docs/UAE_FORM_PACK.md" target="_blank" rel="noreferrer">پک فرم‌ها</a></div><div className="opportunity-grid">{opportunityCalls.map((item) => <article className="opportunity-card" key={item.title}><div className="opportunity-card-top"><span>{item.region}</span><em>{item.status}</em></div><h3>{item.title}</h3><p>{item.fit}</p><div className="opportunity-meta"><span>Deadline: <b>{item.deadline}</b></span><span>Answer: <b>{item.responseTime}</b></span><span>Follow-up: <b>{item.followUp}</b></span><span>Contact: <b>{item.contact}</b></span></div><textarea readOnly value={item.template} aria-label={`متن فرم ${item.title}`} /><div className="opportunity-actions"><a href={item.url} target="_blank" rel="noreferrer">باز کردن فرم <AdminIcon name="arrow" size={14} /></a><button type="button" onClick={() => copyOpportunityTemplate(item.title, item.template)}>کپی متن فرم</button></div></article>)}</div><div className="opportunity-follow-table"><div><p>FOLLOW-UP TABLE</p><h3>جدول زمان پاسخ و پیگیری</h3></div><table><thead><tr><th>فراخوان</th><th>منطقه</th><th>زمان پاسخ</th><th>پیگیری</th><th>ایمیل جزئیات</th></tr></thead><tbody>{opportunityCalls.map((item) => <tr key={`row-${item.title}`}><td><b>{item.title}</b><small>{item.status}</small></td><td>{item.region}</td><td>{item.responseTime}</td><td>{item.followUp}</td><td><a href={`mailto:soheil.power@gmail.com?subject=${encodeURIComponent(`VibeLab call details: ${item.title}`)}&body=${encodeURIComponent(`${item.template}

URL: ${item.url}
Expected answer: ${item.responseTime}
Follow-up: ${item.followUp}`)}`}>ارسال به ایمیل</a></td></tr>)}</tbody></table></div></section>
          <section className="internship-admin-section" id="internship-apps"><div className="admin-table-header"><div><p>INTERNSHIP APPLICATIONS</p><h2>درخواست‌های کارآموزی</h2></div><span>{internshipApplications.length.toLocaleString("fa-IR")} درخواست</span></div><div className="internship-admin-grid">{internshipApplications.map((item) => <article key={item.id}><div><b>{item.fullName}</b><small>{item.email}<br />{item.phone}</small></div><span>{item.track}</span><em>{item.locationId}</em><p>{item.resumeText.slice(0, 180)}{item.resumeText.length > 180 ? "..." : ""}</p><small>زمان آزاد: {item.availability || "ثبت نشده"}</small></article>)}{internshipApplications.length === 0 && <div className="admin-empty">هنوز درخواست کارآموزی ثبت نشده است.</div>}</div></section>
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
