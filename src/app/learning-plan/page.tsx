import type { Metadata } from "next";
import Link from "next/link";
import LearningPlanClient from "./learning-plan-client";

export const metadata: Metadata = {
  title: "مدل پیشنهاد آموزش از روی رزومه | VibeLab",
  description: "رزومه را وارد کنید و مسیر یادگیری، ویدیوهای رایگان، منابع فارسی، برنامه دو روزه، نقاط آموزشی و مربی مناسب دریافت کنید.",
};

export default function LearningPlanPage() {
  return (
    <main dir="rtl" className="learning-page">
      <section className="learning-hero">
        <div className="learning-container">
          <p>AI EDUCATION RECOMMENDER</p>
          <h1>از روی رزومه، مسیر آموزش، ویدیو، مربی و نقطه آموزشی پیشنهاد بده.</h1>
          <span>
            این ماژول برای کارآموزی VibeLab ساخته شده: رزومه/معرفی کاربر را می‌گیرد، منابع YouTube/Aparat/Faradars و دوره‌های رایگان را پیشنهاد می‌کند و بعد یک برنامه دو روزه در مدل نقطه‌ای شبیه اسنپ می‌سازد.
          </span>
          <div>
            <Link href="/internship">صفحه کارآموزی</Link>
            <Link href="/panel">پنل کاربر</Link>
          </div>
        </div>
      </section>
      <div className="learning-container">
        <LearningPlanClient />
      </div>
    </main>
  );
}
