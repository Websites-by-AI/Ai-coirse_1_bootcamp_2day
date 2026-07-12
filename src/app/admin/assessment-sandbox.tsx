'use client';

import { FormEvent, useState } from "react";

type Result = { score: number; fitLevel: string; recommendation: string; analysisSource: "ai" | "rule_based" };

function SandboxIcon({ name, size = 17 }: { name: "brain" | "check" | "flask" | "play" | "spark"; size?: number }) {
  const paths = {
    brain: <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    flask: <><path d="M9 3h6m-5 0v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" /><path d="M8 15h8" /></>,
    play: <path d="m9 7 7 5-7 5V7Z" />,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const demoInput = {
  goal: "ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام",
  experienceLevel: "با ابزارهای AI کمی کار کرده‌ام",
  weeklyHours: "7",
  projectIdea: "می‌خواهم برای یک کسب‌وکار خانگی، یک لندینگ ساده و یک ویدیوی کوتاه معرفی بسازم تا سفارش‌های محلی بیشتری دریافت کنم.",
};

export default function AssessmentSandbox() {
  const [goal, setGoal] = useState(demoInput.goal);
  const [experienceLevel, setExperienceLevel] = useState(demoInput.experienceLevel);
  const [weeklyHours, setWeeklyHours] = useState(demoInput.weeklyHours);
  const [projectIdea, setProjectIdea] = useState(demoInput.projectIdea);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetDemo = () => {
    setGoal(demoInput.goal);
    setExperienceLevel(demoInput.experienceLevel);
    setWeeklyHours(demoInput.weeklyHours);
    setProjectIdea(demoInput.projectIdea);
    setError("");
  };

  const runTest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/assessment-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, experienceLevel, weeklyHours: Number(weeklyHours), projectIdea }) });
      const payload = (await response.json()) as { result?: Result; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error ?? "تست تحلیل انجام نشد.");
      setResult(payload.result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تست تحلیل انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="assessment-sandbox" id="assessment-sandbox">
      <div className="sandbox-head"><div><p><SandboxIcon name="flask" size={15} /> AI Fit Scanner / Sandbox</p><h2>تست تحلیل با ورودی دمو</h2><span>این تست حساب یا ثبت‌نام جدید نمی‌سازد. اگر provider متصل باشد، مصرف token آن ثبت می‌شود.</span></div><button onClick={resetDemo}><SandboxIcon name="spark" size={15} /> بازیابی ورودی دمو</button></div>
      <form className="sandbox-form" onSubmit={runTest}>
        <label>هدف<select value={goal} onChange={(event) => setGoal(event.target.value)}><option>ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام</option><option>تولید محتوا و ویدیوی AI برای کسب‌وکار</option><option>شروع فریلنسری با ابزارهای هوش مصنوعی</option><option>آزمایش و شناخت ابزارهای AI</option></select></label>
        <label>تجربه<select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)}><option>تازه شروع کرده‌ام</option><option>با ابزارهای AI کمی کار کرده‌ام</option><option>پروژه یا تجربه‌ی کاری داشته‌ام</option></select></label>
        <label>ساعت هفتگی<input value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} type="number" min="1" max="80" dir="ltr" /></label>
        <label className="sandbox-idea">ایده‌ی پروژه<textarea value={projectIdea} onChange={(event) => setProjectIdea(event.target.value)} minLength={15} /></label>
        <div className="sandbox-run"><button disabled={loading}>{loading ? "در حال تحلیل..." : "اجرای تست تحلیل"}<SandboxIcon name="play" size={15} /></button>{error && <span className="sandbox-error">{error}</span>}</div>
      </form>
      {result && <div className="sandbox-result"><span><b>{result.score.toLocaleString("fa-IR")}</b><small>امتیاز</small></span><div><p><SandboxIcon name="check" size={14} /> {result.fitLevel}</p><b>{result.analysisSource === "ai" ? "خروجی از API هوش مصنوعی" : "خروجی از موتور ارزیابی مقدماتی"}</b><small>{result.recommendation}</small></div></div>}
    </section>
  );
}
