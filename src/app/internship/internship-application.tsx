"use client";

import { FormEvent, useState } from "react";
import { internshipLocations } from "@/lib/internship";

export default function InternshipApplication() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/internship/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          track: data.get("track"),
          locationId: data.get("locationId"),
          resumeText: data.get("resumeText"),
          portfolioUrl: data.get("portfolioUrl"),
          availability: data.get("availability"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "ثبت انجام نشد.");
      form.reset();
      setMessage("درخواست کارآموزی ثبت شد. مرحله بعد: بررسی رزومه و هماهنگی اولین جلسه ۳۰ دقیقه‌ای رایگان.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در ثبت درخواست.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="internship-apply-form" onSubmit={submit}>
      <div className="internship-section-head">
        <p>APPLY</p>
        <h2>درخواست کارآموزی</h2>
        <span>اول رزومه/معرفی کوتاه را می‌گیریم، بعد مسیر کارآموزی طراحی سایت یا تولید محتوا پیشنهاد می‌شود.</span>
      </div>
      <label>نام و نام خانوادگی<input name="fullName" required placeholder="مثلاً سهیل ..." /></label>
      <label>ایمیل<input name="email" type="email" required placeholder="you@example.com" dir="ltr" /></label>
      <label>شماره تماس<input name="phone" required placeholder="09..." dir="ltr" /></label>
      <label>مسیر مورد علاقه<select name="track" required defaultValue=""><option value="" disabled>انتخاب مسیر</option><option>طراحی سایت با AI</option><option>تولید محتوا با AI</option><option>هر دو مسیر</option></select></label>
      <label>نقطه آموزشی<select name="locationId" required defaultValue=""><option value="" disabled>انتخاب نزدیک‌ترین نقطه</option>{internshipLocations.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <label>زمان‌های آزاد<input name="availability" placeholder="مثلاً شنبه و دوشنبه عصر" /></label>
      <label>لینک نمونه‌کار یا رزومه آنلاین<input name="portfolioUrl" type="url" placeholder="https://..." dir="ltr" /></label>
      <label className="internship-resume-field">رزومه یا معرفی کوتاه<textarea name="resumeText" required minLength={40} placeholder="خودت، مهارت‌ها، تجربه‌ها، هدف کارآموزی و پروژه‌ای که دوست داری بسازی را بنویس..." /></label>
      <button disabled={loading}>{loading ? "در حال ثبت..." : "ثبت درخواست و رزومه"}</button>
      {message && <p className="internship-form-message">{message}</p>}
    </form>
  );
}
