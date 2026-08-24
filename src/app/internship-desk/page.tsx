import type { Metadata } from "next";
import Link from "next/link";
import { internshipDeskTasks, internshipDeskVideos, internshipProject, internshipWorkspace } from "@/lib/internship-desk";

export const metadata: Metadata = {
  title: "کارتابل کارآموزی | Websites by AI و VibeLab",
  description: "میزکار اختصاصی کارآموز شامل پروژه تخصصی، تسک‌های هفتگی، ویدیوهای آموزشی، گروه ۴ نفره و هماهنگی جلسه حضوری/آنلاین.",
};

export default function InternshipDeskPage() {
  return (
    <main dir="rtl" className="internship-desk-page">
      <section className="desk-hero">
        <div className="desk-container desk-hero-grid">
          <div>
            <p>Websites by AI | کارتابل کارآموزی</p>
            <h1>میزکار و کارتابل اختصاصی کارآموز</h1>
            <span>پروژه تخصصی انتخابی، تسک‌های هفتگی، ویدیوهای آموزشی و هماهنگی گروه ۴ نفره در یک صفحه.</span>
            <div className="desk-actions">
              <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer">ربات تلگرام ✈️</a>
              <Link href="/internship">طرح کارآموزی</Link>
              <Link href="/apply">ثبت رزومه</Link>
            </div>
          </div>
          <aside className="desk-status-card">
            <b>📍 گروه ۴ نفره منطقه</b>
            <strong>در صف هماهنگی جلسه حضوری</strong>
            <small>اگر یک نفر دیگر در همین نقطه آماده شود، جلسه حضوری فعال می‌شود.</small>
          </aside>
        </div>
      </section>

      <section className="desk-container desk-grid">
        <article className="desk-card desk-meeting">
          <p>💻 جلسه آنلاین نیم‌ساعته معارفه و شروع تسک‌ها</p>
          <h2>آنلاین • امشب ساعت ۲۱:۰۰</h2>
          <span>جلسه معارفه اولیه برای بررسی رزومه، تعیین پروژه تخصصی و تحویل سورس‌کدهای آماده هفته اول برگزار می‌شود.</span>
          <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer">ورود به گروه تلگرام جلسه ↗</a>
        </article>

        <article className="desk-card desk-project">
          <p>🛠️ پروژه عملی تخصیص‌یافته به شما</p>
          <small>{internshipProject.label}</small>
          <h2>{internshipProject.title}</h2>
          <span>{internshipProject.description}</span>
          <div>
            <a href={internshipProject.demoUrl} target="_blank" rel="noreferrer">مشاهده دمو ↗</a>
            <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer">ثبت پیشرفت در ربات</a>
          </div>
        </article>
      </section>

      <section className="desk-container desk-section">
        <div className="desk-section-head">
          <p>📋 بورد تسک‌های عملی و پروژه این هفته</p>
          <h2>هر هفته یک خروجی قابل ارائه</h2>
        </div>
        <div className="desk-task-list">
          {internshipDeskTasks.map((task) => <article key={task.title} data-tone={task.tone}><h3>{task.title}</h3><p>{task.path}</p><b>{task.status}</b></article>)}
        </div>
      </section>

      <section className="desk-container desk-section">
        <div className="desk-section-head">
          <p>🎬 ویدیوهای آموزشی لازم برای این هفته</p>
          <h2>قبل از انجام تسک‌ها این ویدیوها را ببین</h2>
        </div>
        <div className="desk-video-grid">
          {internshipDeskVideos.map((video) => <a key={video.title} href={video.url} target="_blank" rel="noreferrer"><small>{video.source} · {video.duration}</small><h3>{video.title}</h3><p>{video.task}</p></a>)}
        </div>
      </section>

      <section className="desk-container desk-section desk-workspace">
        <div className="desk-section-head">
          <p>🏢 فضای کار اشتراکی گروه ۴ نفره شما</p>
          <h2>{internshipWorkspace.location}</h2>
        </div>
        <div className="desk-workspace-grid">
          <span>👥 ظرفیت گروه: {internshipWorkspace.groupStatus}</span>
          <span>💰 هزینه جلسه: {internshipWorkspace.cost}</span>
          <span>📞 هماهنگی: <a href={`tel:${internshipWorkspace.phone}`}>{internshipWorkspace.phone}</a></span>
          <a href={internshipWorkspace.mapUrl} target="_blank" rel="noreferrer">دیدن محل روی نقشه ↗</a>
        </div>
      </section>
    </main>
  );
}
