import type { Metadata } from "next";
import Link from "next/link";
import { schoolSnapHubs, schoolSnapMentorTypes, schoolSnapRoles, schoolSnapSteps } from "@/lib/school-snap";

export const metadata: Metadata = {
  title: "مدل اسنپ آموزش برای دانش‌آموز، مربی و مدرسه | VibeLab",
  description:
    "مدل نقطه‌ای آموزش برای دانش‌آموزان و مربیان: تحلیل رزومه و هدف، پیشنهاد مدرسه یا فضای آموزشی نزدیک، هزینه مربی و اجاره فضا، و تشکیل کلاس حضوری/آنلاین.",
};

export default function SchoolSnapPage() {
  return (
    <main dir="rtl" className="school-snap-page">
      <section className="school-snap-hero">
        <div className="school-snap-container">
          <p>SNAP-STYLE EDUCATION NETWORK</p>
          <h1>دانش‌آموز، مربی و مدرسه را مثل اسنپ به هم وصل کن.</h1>
          <span>
            دانش‌آموز رزومه، پایه، هدف کنکور یا هدف مهارتی را وارد می‌کند. سیستم نزدیک‌ترین مدرسه، دفتر یا فضای کار اشتراکی و مربی مناسب را پیشنهاد می‌دهد؛ اگر گروه به حد نصاب برسد حضوری، و اگر نرسد آنلاین/هیبرید برگزار می‌شود.
          </span>
          <div>
            <Link href="/learning-plan">ساخت مسیر از رزومه</Link>
            <Link href="/internship">کارآموزی طراحی سایت و محتوا</Link>
          </div>
        </div>
      </section>

      <section className="school-snap-container school-section">
        <div className="school-section-head">
          <p>ROLES</p>
          <h2>سه طرف اصلی شبکه آموزشی</h2>
        </div>
        <div className="school-role-grid">
          {schoolSnapRoles.map((role) => <article key={role.title}><small>{role.subtitle}</small><h3>{role.title}</h3><p>{role.text}</p></article>)}
        </div>
      </section>

      <section className="school-snap-container school-section">
        <div className="school-section-head">
          <p>FLOW</p>
          <h2>فرایند آموزش حضوری/آنلاین</h2>
        </div>
        <div className="school-flow-grid">
          {schoolSnapSteps.map((step, index) => <article key={step}><b>{(index + 1).toLocaleString("fa-IR")}</b><p>{step}</p></article>)}
        </div>
      </section>

      <section className="school-snap-container school-section">
        <div className="school-section-head">
          <p>MAP + COST</p>
          <h2>۱۰ نقطه پیشنهادی تهران و کرج</h2>
          <span>هزینه‌ها تخمینی هستند و برای تصمیم اولیه نمایش داده می‌شوند. هزینه نهایی با مدرسه/فضا و مربی هماهنگ می‌شود.</span>
        </div>
        <div className="school-hub-grid">
          {schoolSnapHubs.map((hub) => <article key={hub.id}><small>{hub.city} · {hub.area}</small><h3>{hub.title}</h3><p>{hub.bestFor}</p><b>{hub.rentCost}</b><em>{hub.mentorCost}</em><a href={`https://www.google.com/maps/search/${encodeURIComponent(hub.mapQuery)}`} target="_blank" rel="noreferrer">دیدن روی نقشه</a></article>)}
        </div>
      </section>

      <section className="school-snap-container school-section">
        <div className="school-section-head">
          <p>MENTORS</p>
          <h2>۱۰ نوع مربی قابل اتصال</h2>
        </div>
        <div className="school-mentor-tags">{schoolSnapMentorTypes.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="school-snap-cta">
        <div className="school-snap-container">
          <h2>برای شروع، رزومه یا هدف آموزشی را وارد کن تا مسیر و نقطه مناسب پیشنهاد شود.</h2>
          <Link href="/learning-plan">شروع مسیر آموزشی</Link>
        </div>
      </section>
    </main>
  );
}
