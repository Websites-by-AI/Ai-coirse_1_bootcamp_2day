import type { Metadata } from "next";
import Link from "next/link";
import InternshipApplication from "../internship/internship-application";

export const metadata: Metadata = {
  title: "درخواست کارآموزی VibeLab | از دیوار و شیپور تا مسیر آموزش",
  description: "فرم سریع برای ورودی‌های دیوار، شیپور، تلگرام و سایت؛ رزومه را وارد کنید تا مسیر کارآموزی و آموزش شخصی‌سازی شود.",
};

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
          </div>
        </div>
      </section>
      <section className="internship-container internship-section">
        <InternshipApplication />
      </section>
    </main>
  );
}
