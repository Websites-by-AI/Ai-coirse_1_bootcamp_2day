import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "مسیر | پلتفرم هوشمند توسعه شغلی",
  description:
    "مسیر یک سفر ۵ مرحله‌ای هوشمند است: تحلیل رزومه با هوش مصنوعی، دوره‌های هدفمند فارسی، معلم حضوری در محله، مدرک معتبر بین‌المللی و اتصال به بازار کار.",
  alternates: { canonical: "/masir" },
};

const steps = [
  {
    num: "۰۱",
    title: "تحلیل رزومه با AI",
    text: "رزومه‌ات را آپلود کن. هوش مصنوعی، هدف شغلی و مسیر دقیق‌ات را تعریف می‌کند.",
  },
  {
    num: "۰۲",
    title: "دوره‌های هدفمند",
    text: "بهترین دوره‌های رایگان یوتیوب و دوره‌های تخصصی فرادرس، آپارات و منابع فارسی/رایگان را پیشنهاد می‌گیری.",
  },
  {
    num: "۰۳",
    title: "معلم محلی، مثل اسنپ",
    text: "نقشه باز می‌شود، معلم‌های متخصص شهر تو نمایش داده می‌شوند و می‌توانی جلسه حضوری رزرو کنی.",
  },
  {
    num: "۰۴",
    title: "مدرک معتبر بین‌المللی",
    text: "مسیر مدارک گوگل، متا، آمازون و IBM را می‌بینی تا رزومه‌ات سنگین‌تر و قابل ارائه‌تر شود.",
  },
  {
    num: "۰۵",
    title: "بازار کار جهانی و ایرانی",
    text: "آپ‌ورک، فایور، پونیشا، جابینجا و مسیرهای پروژه‌ای را می‌بینی و بلافاصله برای کار آماده می‌شوی.",
  },
];

export default function MasirPage() {
  return (
    <main dir="rtl" className="masir-page">
      <header className="masir-nav">
        <Link href="/masir" className="masir-brand">
          <b>مسیر</b>
          <small>MASIR</small>
        </Link>
        <nav>
          <Link href="/learning-plan">مسیر</Link>
          <Link href="/login">ورود</Link>
          <Link href="/register">ثبت‌نام</Link>
        </nav>
      </header>

      <section className="masir-hero">
        <div className="masir-orb one" />
        <div className="masir-orb two" />
        <div className="masir-container masir-hero-grid">
          <div className="masir-copy">
            <span>پلتفرم هوشمند توسعه شغلی</span>
            <h1>
              مسیرت را پیدا کن،
              <br />
              <em>از رزومه تا اولین پروژه.</em>
            </h1>
            <p>
              مسیر یک سفر ۵ مرحله‌ای هوشمند است: تحلیل رزومه با هوش مصنوعی، دوره‌های هدفمند فارسی، معلم حضوری در محله‌ات، مدرک معتبر بین‌المللی، و اتصال به بازار کار.
            </p>
            <div className="masir-actions">
              <Link href="/learning-plan">شروع رایگان</Link>
              <Link href="/login" className="ghost">ورود به حساب</Link>
            </div>
            <div className="masir-stats">
              <strong>+۱۲۰۰ کاربر فعال</strong>
              <strong>+۸۵ معلم متخصص</strong>
              <strong>۲۴ شهر</strong>
            </div>
          </div>

          <div className="masir-ai-card">
            <p>learning</p>
            <h2>هوش مصنوعی Claude 4.5</h2>
            <span>رزومه‌ات را در کمتر از ۳۰ ثانیه تحلیل می‌کند</span>
            <div className="masir-card-lines">
              <i style={{ width: "88%" }} />
              <i style={{ width: "72%" }} />
              <i style={{ width: "94%" }} />
            </div>
            <Link href="/learning-plan">تحلیل رزومه و ساخت مسیر</Link>
          </div>
        </div>
      </section>

      <section className="masir-steps">
        <div className="masir-container">
          <div className="masir-section-head">
            <p>۵ مرحله تا شغل رویایی</p>
            <h2>یک نقشه راه واضح، بدون سردرگمی.</h2>
          </div>
          <div className="masir-step-grid">
            {steps.map((step) => (
              <article key={step.num}>
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="masir-cta">
        <div className="masir-container">
          <h2>آماده‌ای مسیر شغلی‌ات را تغییر بدهی؟</h2>
          <p>همین حالا ثبت‌نام کن و در کمتر از ۵ دقیقه اولین قدم را بردار.</p>
          <Link href="/register">شروع رایگان مسیر</Link>
        </div>
      </section>

      <footer className="masir-footer">© ۲۰۲۶ مسیر — ساخته شده با ❤ برای جوانان ایران</footer>
    </main>
  );
}
