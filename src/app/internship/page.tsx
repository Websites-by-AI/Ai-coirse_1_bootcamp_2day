import type { Metadata } from "next";
import Link from "next/link";
import { internshipLocations } from "@/lib/internship";
import { snapPricingRules, snapTrainingSteps, snapTrainingZones } from "@/lib/snap-training";
import InternshipApplication from "./internship-application";

export const metadata: Metadata = {
  title: "کارآموزی VibeLab | طراحی سایت و تولید محتوا با AI",
  description:
    "برنامه کارآموزی و آموزش VibeLab برای طراحی سایت، تولید محتوا، رزومه، نمونه‌کار و مسیر گرفتن پروژه با ابزارهای هوش مصنوعی.",
  alternates: { canonical: "/internship" },
};

const tracks = [
  {
    title: "کارآموز طراحی سایت با AI",
    subtitle: "Website Builder Intern",
    outcome: "ساخت یک سایت یا لندینگ واقعی برای کسب‌وکار، رزومه یا کمپین",
    skills: ["تحلیل نیاز مشتری", "ساخت لندینگ", "Vibe Coding", "انتشار روی Cloudflare/Vercel", "بهینه‌سازی متن و CTA"],
  },
  {
    title: "کارآموز تولید محتوا با AI",
    subtitle: "AI Content Producer Intern",
    outcome: "ساخت Content Kit شامل سناریو، کپشن، استوری‌بورد، ویدیو کوتاه و تقویم محتوا",
    skills: ["پرامپت‌نویسی", "سناریونویسی", "تولید ویدیو AI", "تقویم محتوایی", "تحلیل بازار و مخاطب"],
  },
];

const programBlocks = [
  { week: "روز اول · صبح", title: "رزومه، بازار و نقشه لندینگ", text: "رزومه بررسی می‌شود، مشتری هدف انتخاب می‌شود و ساختار سایت، Hero، CTA و فرم سفارش طراحی می‌شود." },
  { week: "روز اول · عصر", title: "Vibe Coding و ساخت سایت", text: "نسخه اولیه سایت/لندینگ با AI ساخته می‌شود و فرم دریافت لید به Cloudflare D1 وصل می‌شود." },
  { week: "روز دوم · صبح", title: "محتوا، ویدیو و SEO", text: "کپشن، سناریو، مقاله SEO و محتوای معرفی برای پروژه و مشتری هدف تولید می‌شود." },
  { week: "روز دوم · عصر", title: "بازاریابی و اولین مشتری", text: "پیام معرفی، قیمت اولیه، آگهی دیوار/شیپور و برنامه ۷ روزه پیگیری مشتری آماده می‌شود." },
];

const expectations = [
  "حداقل ۶ تا ۸ ساعت زمان در هفته",
  "داشتن یک ایده، نمونه‌کار یا علاقه مشخص",
  "آمادگی برای ساخت خروجی واقعی، نه فقط دیدن آموزش",
  "ثبت‌نام در سایت و تکمیل assessment اولیه",
];

export default function InternshipPage() {
  return (
    <main dir="rtl" className="internship-page">
      <section className="internship-hero">
        <div className="internship-container">
          <div className="internship-kicker">VIBELAB INTERNSHIP + TRAINING</div>
          <h1>کارآموزی عملی طراحی سایت و تولید محتوا با هوش مصنوعی</h1>
          <p>
            این یک برنامه فشرده دو روزه است: روز اول سایت/لندینگ و فرم سفارش را می‌سازی؛ روز دوم محتوا، SEO، پیام معرفی و مسیر جذب اولین مشتری را آماده می‌کنی.
          </p>
          <div className="internship-actions">
            <Link href="/register">ثبت‌نام و سنجش مسیر</Link>
            <Link href="/panel" className="secondary">ورود به پنل کاربر</Link>
            <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer" className="secondary">ربات تلگرام</a>
          </div>
        </div>
      </section>

      <section className="internship-container internship-section">
        <div className="internship-section-head">
          <p>TRACKS</p>
          <h2>دو مسیر کارآموزی</h2>
        </div>
        <div className="internship-track-grid">
          {tracks.map((track) => (
            <article key={track.title}>
              <span>{track.subtitle}</span>
              <h3>{track.title}</h3>
              <p>{track.outcome}</p>
              <div>
                {track.skills.map((skill) => <em key={skill}>{skill}</em>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="internship-container internship-section snap-model-section">
        <div className="internship-section-head">
          <p>SNAPP-STYLE TRAINING MODEL</p>
          <h2>مدل اسنپی آموزش: رزومه بده، نقطه و مربی بگیر</h2>
          <span>در این مدل، کارآموز مثل انتخاب سفر در اسنپ، نزدیک‌ترین نقطه آموزشی و مربی مناسب را بر اساس رزومه، هدف و محله دریافت می‌کند.</span>
        </div>
        <div className="snap-model-grid">
          {snapTrainingSteps.map((step) => <article key={step.title}><b>{step.title}</b><p>{step.text}</p></article>)}
        </div>
        <div className="snap-rules-grid">
          <article><h3>قواعد هزینه و اجرا</h3>{snapPricingRules.map((item) => <span key={item}>{item}</span>)}</article>
          <article><h3>زون‌های فعال پیشنهادی</h3>{snapTrainingZones.map((item) => <span key={item}>{item}</span>)}</article>
        </div>
      </section>

      <section className="internship-container internship-section">
        <div className="internship-section-head">
          <p>SNAPP-STYLE HUBS</p>
          <h2>۵ نقطه آموزشی پیشنهادی در تهران و کرج</h2>
          <span>کارآموز نزدیک‌ترین نقطه را انتخاب می‌کند. ۳۰ دقیقه اول برای آشنایی رایگان است؛ بعد از آن هزینه فضای کار اشتراکی یا کافه‌کاری با خود کارآموز است.</span>
        </div>
        <div className="internship-location-grid">
          {internshipLocations.map((item) => <article key={item.id}><small>{item.city} · {item.area}</small><h3>{item.title}</h3><p>{item.bestFor}</p><b>{item.price}</b><em>{item.access}</em></article>)}
        </div>
      </section>

      <section className="internship-container internship-section">
        <div className="internship-section-head">
          <p>PROGRAM</p>
          <h2>برنامه فشرده دو روزه: سایت + بازاریابی</h2>
        </div>
        <div className="internship-week-list">
          {programBlocks.map((item) => (
            <article key={item.week}>
              <b>{item.week}</b>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="internship-container internship-bottom-grid">
        <article>
          <p>برای چه کسانی مناسب است؟</p>
          <h2>مناسب برای کارآموز، فریلنسر تازه‌کار و تولیدکننده محتوا</h2>
          <ul>
            {expectations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <p>خروجی نهایی</p>
          <h2>چیزی که در پایان باید داشته باشی</h2>
          <ul>
            <li>یک سایت یا Content Kit قابل ارائه</li>
            <li>رزومه و پروفایل عمومی VibeLab</li>
            <li>پیام آماده معرفی برای مشتری یا کارفرما</li>
            <li>برنامه هفتگی برای پیدا کردن پروژه</li>
          </ul>
        </article>
      </section>

      <section className="internship-container internship-section">
        <InternshipApplication />
      </section>

      <section className="internship-cta">
        <div className="internship-container">
          <h2>اگر می‌خواهی وارد مسیر کار عملی با AI شوی، از سنجش مسیر شروع کن.</h2>
          <Link href="/register">شروع کارآموزی و آموزش</Link>
        </div>
      </section>
    </main>
  );
}
