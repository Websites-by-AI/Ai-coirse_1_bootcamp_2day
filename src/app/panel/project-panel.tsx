'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectView } from "@/lib/projects";
import type { ProfileView, ResumeView } from "@/lib/profile";
import ProfileResumeManager from "./profile-resume-manager";

type Student = { id: number; fullName: string; email: string; phone: string };

function ProjectIcon({ name, size = 18 }: { name: "chart" | "check" | "code" | "external" | "github" | "plus" | "refresh" | "share" | "spark" | "web"; size?: number }) {
  const paths = {
    chart: <><path d="M4 20V10m5 10V4m5 16v-7m5 7V7" /><path d="M3 20h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14" /></>,
    external: <><path d="M14 4h6v6m0-6-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>,
    github: <><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .9.1-.6.4-1.1.7-1.3-2.3-.3-4.7-1.1-4.7-5a3.8 3.8 0 0 1 1-2.6 3.5 3.5 0 0 1 .1-2.5s.8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.5 3.5 0 0 1 .1 2.5 3.8 3.8 0 0 1 1 2.6c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 4v7h-7" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
    web: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function meterLabel(value: number) { return value >= 75 ? "قوی" : value >= 55 ? "مناسب" : "در حال رشد"; }

export default function ProjectPanel({ student, initialProjects, initialProfileData }: { student: Student; initialProjects: ProjectView[]; initialProfileData: { profile: ProfileView; resume: ResumeView } }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const addProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/auth/student/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), description: data.get("description"), githubUrl: data.get("githubUrl"), deploymentUrl: data.get("deploymentUrl") }) });
      const result = (await response.json()) as { project?: ProjectView; error?: string };
      if (!response.ok || !result.project) throw new Error(result.error ?? "پروژه ذخیره نشد.");
      setProjects((items) => [result.project!, ...items]); setShowForm(false); setMessage("پروژه ثبت شد؛ اکنون اسکن و قیمت‌گذاری را اجرا کنید.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ثبت پروژه ناموفق بود."); } finally { setLoading(false); }
  };

  const scanProject = async (id: number) => {
    setScanningId(id); setMessage("");
    try {
      const response = await fetch(`/api/auth/student/projects/${id}/scan`, { method: "POST" });
      const result = (await response.json()) as { project?: ProjectView; error?: string };
      if (!response.ok || !result.project) throw new Error(result.error ?? "اسکن پروژه ناموفق بود.");
      setProjects((items) => items.map((item) => item.id === id ? result.project! : item));
      setMessage(result.project.analysis?.analysisSource === "ai" ? "اسکن و تحلیل با AI انجام شد؛ مصرف token در پنل ادمین ثبت شده است." : "اسکن انجام شد؛ چون AI متصل نیست، تخمین آموزشی fallback ثبت شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "اسکن پروژه ناموفق بود."); } finally { setScanningId(null); }
  };

  const shareProject = async (project: ProjectView) => {
    try {
      if (navigator.share) await navigator.share({ title: project.name, text: `نسخه آنلاین پروژه ${project.name}`, url: project.deploymentUrl });
      else await navigator.clipboard.writeText(project.deploymentUrl);
      setMessage("لینک نسخه‌ی آنلاین پروژه برای اشتراک‌گذاری آماده شد.");
    } catch { setMessage("اشتراک‌گذاری لغو شد یا دسترسی clipboard موجود نیست."); }
  };

  return <main dir="rtl" className="project-panel-page"><header className="project-panel-header"><a href="/" className="project-panel-brand"><span>V</span><b>VibeLab</b><small>PROJECT SPACE</small></a><div><a href="/register">مسیرسنج من</a><button onClick={() => router.push("/register")}>{student.fullName.slice(0, 1)}</button></div></header><section className="project-panel-hero"><div><span><ProjectIcon name="spark" size={15} /> فضای پروژه‌ی من</span><h1>{student.fullName}، پروژه‌هایت را<br /><em>به نمونه‌کار قابل قیمت‌گذاری</em> تبدیل کن.</h1><p>لینک repository عمومی GitHub و نسخه‌ی منتشرشده‌ی Vercel، Cloudflare Pages، Netlify یا هر HTTPS public URL را ثبت کنید؛ اسکنر کیفیت فنی، محصول و بازه‌ی قیمت آموزشی را نشان می‌دهد.</p></div><button onClick={() => setShowForm(!showForm)}><ProjectIcon name={showForm ? "check" : "plus"} size={18} /> {showForm ? "بستن فرم" : "افزودن پروژه"}</button></section>{message && <p className="project-message"><ProjectIcon name="check" size={15} /> {message}</p>}{showForm && <form className="project-add-form" onSubmit={addProject}><div><span><ProjectIcon name="code" size={19} /></span><p><b>ثبت پروژه برای اسکن</b><small>فقط repository عمومی GitHub و URLهای HTTPS عمومی پذیرفته می‌شوند.</small></p></div><label>نام پروژه<input name="name" required placeholder="مثلاً لندینگ فروشگاه سبز" /></label><label>لینک GitHub<input name="githubUrl" type="url" required placeholder="https://github.com/owner/repository" dir="ltr" /></label><label>لینک نسخه‌ی آنلاین<input name="deploymentUrl" type="url" required placeholder="https://your-project.vercel.app" dir="ltr" /></label><label className="project-description">توضیح پروژه<textarea name="description" required minLength={20} placeholder="مسئله، مخاطب و خروجی پروژه را کوتاه توضیح دهید..." /></label><button disabled={loading}>{loading ? "در حال ذخیره..." : "ثبت پروژه"}<ProjectIcon name="plus" size={16} /></button></form>}<ProfileResumeManager userId={student.id} userName={student.fullName} initialData={initialProfileData} /><section className="projects-wrap"><div className="projects-section-head"><div><p>PORTFOLIO SCANNER</p><h2>پروژه‌های ثبت‌شده</h2></div><span>{projects.length.toLocaleString("fa-IR")} پروژه</span></div><div className="project-grid">{projects.map((project) => <article className="project-card" key={project.id}><div className="project-card-top"><div><span className="project-card-icon"><ProjectIcon name="code" size={20} /></span><div><p>{project.lastScanStatus === "completed" ? "SCAN READY" : project.lastScanStatus === "demo_ready" ? "DEMO PROJECT" : "NOT SCANNED"}</p><h3>{project.name}</h3></div></div><button onClick={() => shareProject(project)} title="اشتراک‌گذاری لینک پروژه"><ProjectIcon name="share" size={17} /></button></div>{project.screenshotUrl && <a className="project-screenshot" href={project.deploymentUrl} target="_blank" rel="noreferrer"><img src={project.screenshotUrl} alt={`اسکرین‌شات ${project.name}`} /><span>نمای نسخه‌ی آنلاین</span></a>}<p className="project-description-copy">{project.description}</p><div className="project-links"><a href={project.githubUrl} target="_blank" rel="noreferrer"><ProjectIcon name="github" size={15} /> کد GitHub <ProjectIcon name="external" size={13} /></a><a href={project.deploymentUrl} target="_blank" rel="noreferrer"><ProjectIcon name="web" size={15} /> نسخه‌ی آنلاین <ProjectIcon name="external" size={13} /></a></div>{project.analysis ? <><div className="project-meters">{[{ label: "کد", value: project.analysis.codeScore }, { label: "محصول", value: project.analysis.productScore }, { label: "بازار", value: project.analysis.marketScore }].map((meter) => <div key={meter.label}><p><span>{meter.label}</span><b>{meter.value.toLocaleString("fa-IR")}٪ · {meterLabel(meter.value)}</b></p><i><em style={{ width: `${meter.value}%` }} /></i></div>)}</div><div className="project-price"><span><ProjectIcon name="chart" size={19} /></span><div><p>بازه‌ی تخمینی اجرای پروژه</p><b>{project.analysis.estimatedMin.toLocaleString("fa-IR")} تا {project.analysis.estimatedMax.toLocaleString("fa-IR")} <small>{project.analysis.currency}</small></b></div></div><p className="project-scan-summary"><ProjectIcon name="spark" size={14} /> {project.analysis.scanSummary}</p><p className="project-report">{project.analysis.report}</p><span className="analysis-source">{project.analysis.analysisSource === "ai" ? "تحلیل با AI متصل" : project.analysis.analysisSource === "demo" ? "گزارش نمونه" : "تخمین آموزشی fallback"}</span></> : <div className="project-pending"><ProjectIcon name="spark" size={17} /> برای دریافت امتیاز و قیمت، اسکن را اجرا کنید.</div>}<button className="scan-button" onClick={() => scanProject(project.id)} disabled={scanningId === project.id}>{scanningId === project.id ? "در حال اسکن کد و سایت..." : "اسکن کد، سایت و تخمین قیمت"}<ProjectIcon name="refresh" size={16} /></button></article>)}</div>{projects.length === 0 && <div className="project-empty"><ProjectIcon name="code" size={26} /><b>هنوز پروژه‌ای ثبت نکرده‌اید.</b><p>اولین repository و لینک نسخه‌ی آنلاین خود را اضافه کنید.</p></div>}</section></main>;
}
