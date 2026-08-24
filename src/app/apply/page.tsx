import type { Metadata } from "next";
import Link from "next/link";
import InternshipApplication from "../internship/internship-application";

export const metadata: Metadata = {
  title: "درخواست کارآموزی VibeLab | از دیوار و شیپور تا مسیر آموزش",
  description: "فرم سریع برای ورودی‌های دیوار، شیپور، تلگرام و سایت؛ رزومه را وارد کنید تا مسیر کارآموزی و آموزش شخصی‌سازی شود.",
};

const paths = [
  {
    title: "مسیر آموزشی",
    subtitle: "Skill Path",
    text: "برای کسی که می‌خواهد مهارت یاد بگیرد: طراحی سایت با AI، تولید محتوا، رزومه، نمونه‌کار، منابع YouTube/Aparat/Faradars و برنامه دو روزه.",
    items: ["تحلیل رزومه", "پیشنهاد ویدیو و دوره", "تمرین ساخت سایت یا محتوا", "رزومه و پروفایل کاری"],
  },
  {
    title: "مسیر بازاریابی و گرفتن پروژه",
    subtitle: "Market Path",
    text: "برای کسی که می‌خواهد از مهارت پول بسازد: ساخت پیشنهاد خدمات، پیام معرفی، پیدا کردن مشتری محلی، ثبت در پونیشا/جابینجا/لینکدین و فروش خدمات سایت/محتوا.",
    items: ["پیام معرفی آماده", "لیست مشتریان هدف", "پیشنهاد قیمت", "برنامه ۷ روزه جذب پروژه"],
  },
];

const attendanceRules = [
  "۳۰ دقیقه اول برای آشنایی و بررسی مسیر رایگان است.",
  "اگر در یک منطقه حداقل ۴ نفر آماده شوند، جلسه حضوری در مدرسه/دفتر/فضای کار اشتراکی هماهنگ می‌شود.",
  "اگر تعداد کمتر از ۴ نفر باشد، آموزش آنلاین یا جلسه کوتاه انسانی در گروه تلگرام انجام می‌شود تا گروه کامل شود.",
  "هزینه حضوری شامل سهم مربی + هزینه اجاره فضای کار اشتراکی، کلاس، صندلی یا اتاق جلسه است.",
  "ورودی دیوار و شیپور در پنل ادمین با source جدا ذخیره می‌شود تا پیگیری راحت باشد.",
];

export default function ApplyPage() {
  return (
    <main dir="rtl" className="internship-page apply-page">
      <section className="internship-hero">
        <div className="internship-container">
          <div className="internship-kicker">FAST APPLY / DIVAR / SHEYPOOR / TELEGRAM</div>
          <h1>رزومه‌ات را وارد کن تا مسیر کارآموزی مناسب پیشنهاد شود.</h1>
          <p>
            اگر از آگهی دیوار، شیپور یا کانال‌های VibeLab آمده‌ای، همینجا معرفی کوتاهت را بنویس. سیستم مسیر طراحی سایت، تولید محتوا، مدرسه اسنپی، مربی و نقطه آموزشی نزدیک را پیشنهاد می‌دهد.
          </p>
          <div className="internship-actions">
            <Link href="/learning-plan" className="secondary">دیدن مدل پیشنهاد آموزش</Link>
            <Link href="/school-snap" className="secondary">مدرسه اسنپی</Link>
            <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer" className="secondary">ادامه در ربات تلگرام</a>
          </div>
        </div>
      </section>

      <section className="internship-container apply-path-section">
        <div className="internship-section-head">
          <p>TWO PATHS</p>
          <h2>بعد از رزومه، دو مسیر به کاربر پیشنهاد می‌شود</h2>
          <span>کاربر می‌تواند فقط آموزش ببیند، یا هم‌زمان مسیر بازاریابی و گرفتن پروژه را هم شروع کند.</span>
        </div>
        <div className="apply-path-grid">
          {paths.map((path) => (
            <article key={path.title}>
              <small>{path.subtitle}</small>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
              <div>{path.items.map((item) => <em key={item}>{item}</em>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="internship-container apply-rules-section">
        <div className="internship-section-head">
          <p>GROUPING MODEL</p>
          <h2>قانون تشکیل جلسه حضوری در مدل اسنپی</h2>
        </div>
        <div className="apply-rules-list">
          {attendanceRules.map((rule, index) => <div key={rule}><b>{(index + 1).toLocaleString("fa-IR")}</b><span>{rule}</span></div>)}
        </div>
      </section>

      <section className="internship-container internship-section">
        <InternshipApplication />
      </section>
    </main>
  );
}
