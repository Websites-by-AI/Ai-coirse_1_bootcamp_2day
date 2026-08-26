"use client";

import { FormEvent, useState } from "react";
import type { LearningHub, LearningResource, MentorProfile } from "@/lib/learning-data";
import type { ResumeRagInsight } from "@/lib/resume-rag";

type Plan = {
  track: string;
  summary: string;
  firstVideo: LearningResource;
  resources: LearningResource[];
  hubs: LearningHub[];
  mentors: MentorProfile[];
  twoDayProgram: { day: string; title: string; output: string }[];
  rag?: ResumeRagInsight;
};

export default function LearningPlanClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const response = await fetch("/api/learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          goal: data.get("goal"),
          cityPreference: data.get("cityPreference"),
          resumeText: data.get("resumeText"),
        }),
      });
      const result = (await response.json()) as { plan?: Plan; error?: string };
      if (!response.ok || !result.plan) throw new Error(result.error ?? "خطا در ساخت برنامه");
      setPlan(result.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ساخت برنامه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="learning-app">
      <form className="learning-form" onSubmit={submit}>
        <div>
          <p>RESUME TO LEARNING PLAN</p>
          <h2>رزومه را بده، مسیر ویدیو، مربی و نقطه آموزشی بگیر</h2>
        </div>
        <label>نام<input name="fullName" required placeholder="نام و نام خانوادگی" /></label>
        <label>ایمیل<input name="email" type="email" required dir="ltr" placeholder="you@example.com" /></label>
        <label>شماره تماس<input name="phone" required dir="ltr" placeholder="09..." /></label>
        <label>شهر / منطقه ترجیحی<input name="cityPreference" placeholder="تهران، نارمک، کرج..." defaultValue="تهران" /></label>
        <label className="wide">هدف یادگیری<input name="goal" placeholder="مثلاً طراحی سایت، تولید محتوا، رزومه، فریلنسری..." defaultValue="ساخت سایت و تولید محتوا با AI" /></label>
        <label className="wide">رزومه یا معرفی<textarea name="resumeText" required minLength={60} placeholder="مهارت‌ها، تجربه، هدف، ابزارهایی که بلد هستی و پروژه‌ای که دوست داری بسازی را بنویس..." /></label>
        <button disabled={loading}>{loading ? "در حال ساخت برنامه..." : "ساخت برنامه آموزشی"}</button>
        {error && <span className="learning-error">{error}</span>}
      </form>

      {plan && (
        <div className="learning-result">
          <div className="learning-summary"><span>مسیر پیشنهادی</span><h2>{plan.track}</h2><p>{plan.summary}</p></div>
          {plan.rag && <section className="rag-insight"><div className="rag-insight-head"><span>{plan.rag.provider === "huggingface_rag" ? "HF RAG فعال" : "RAG داخلی فعال"}</span><h3>تحلیل شخصی‌سازی‌شده رزومه</h3>{plan.rag.model && <small>{plan.rag.model}</small>}</div><p>{plan.rag.summary}</p><div className="rag-columns"><article><b>نقاط قوت</b>{plan.rag.strengths.map((item) => <span key={item}>{item}</span>)}</article><article><b>موارد تکمیل</b>{plan.rag.gaps.map((item) => <span key={item}>{item}</span>)}</article><article><b>قدم بعدی</b>{plan.rag.nextActions.map((item) => <span key={item}>{item}</span>)}</article></div><small className="rag-source-note">منابع بازیابی‌شده: {plan.rag.retrievedSources.map((item) => item.title).join("، ")}</small></section>}
          <article className="first-video"><p>اولین ویدیو پیشنهادی</p><h3>{plan.firstVideo.title}</h3><span>{plan.firstVideo.source} · {plan.firstVideo.level}</span><a href={plan.firstVideo.url} target="_blank" rel="noreferrer">دیدن ویدیو/منبع</a></article>
          <section><h3>منابع آموزشی پیشنهادی</h3><div className="resource-grid">{plan.resources.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer"><b>{item.title}</b><small>{item.source} · {item.level}</small><p>{item.reason}</p></a>)}</div></section>
          <section><h3>برنامه دو روزه در مدل اسنپ آموزشی</h3><div className="program-grid">{plan.twoDayProgram.map((item) => <article key={item.day}><b>{item.day}</b><h4>{item.title}</h4><p>{item.output}</p></article>)}</div></section>
          <section><h3>نقاط آموزشی و هزینه فضای کار اشتراکی</h3><div className="hub-grid">{plan.hubs.map((hub) => <article key={hub.id}><span>{hub.city} · {hub.area}</span><h4>{hub.title}</h4><p>{hub.bestFor}</p><b>{hub.coworkingCost}</b><small>{hub.mentorSessionCost}</small></article>)}</div></section>
          <section><h3>۱۰ مربی پیشنهادی</h3><div className="mentor-grid">{plan.mentors.map((mentor) => <article key={mentor.id}><b>{mentor.name}</b><span>{mentor.specialty}</span><p>{mentor.bestFor}</p><small>{mentor.city} · {mentor.dayRate}</small></article>)}</div></section>
        </div>
      )}
    </section>
  );
}
