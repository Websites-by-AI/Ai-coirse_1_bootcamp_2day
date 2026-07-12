'use client';

import { useMemo, useState } from "react";
import type { DashboardAssessment } from "@/lib/admin";

function AssessmentIcon({ name, size = 17 }: { name: "brain" | "check" | "clock" | "filter" | "spark" | "user"; size?: number }) {
  const paths = {
    brain: <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2.5A4.5 4.5 0 0 1 9.5 14h5a4.5 4.5 0 0 1 4.5 4.5V21" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function assessmentTone(level: string) {
  if (level === "آماده برای ماراتن") return "fit";
  if (level === "نیازمند آماده‌سازی کوتاه") return "prep";
  return "foundation";
}

export default function StudentAssessmentList({ assessments, totalStudents, readyStudents }: { assessments: DashboardAssessment[]; totalStudents: number; readyStudents: number }) {
  const [filter, setFilter] = useState("همه");
  const visible = useMemo(() => assessments.filter((assessment) => filter === "همه" || assessment.fitLevel === filter), [assessments, filter]);

  return (
    <section className="student-analysis" id="student-analysis">
      <div className="student-analysis-head"><div><p><AssessmentIcon name="brain" size={15} /> Student Fit Analysis</p><h2>ارزیابی مناسب‌بودن کاربران</h2><span>تحلیل آموزشی برای کمک به انتخاب مسیر؛ هرگز جایگزین قضاوت انسانی یا تصمیم استخدامی نیست.</span></div><div className="student-analysis-stats"><span><b>{totalStudents.toLocaleString("fa-IR")}</b> حساب کاربر</span><span><b>{readyStudents.toLocaleString("fa-IR")}</b> آماده برای ماراتن</span></div></div>
      <div className="student-filter-row"><span><AssessmentIcon name="filter" size={15} /> فیلتر نتیجه</span>{["همه", "آماده برای ماراتن", "نیازمند آماده‌سازی کوتاه", "پیشنهاد مسیر مقدماتی"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {visible.length ? <div className="student-analysis-list">{visible.map((assessment) => <article className="student-analysis-card" key={assessment.id}><div className="student-analysis-person"><span>{assessment.fullName.slice(0, 1)}</span><div><b>{assessment.fullName}</b><small>{assessment.email}</small></div><em>{assessment.analysisSource === "ai" ? "AI تحلیل" : "ارزیابی مقدماتی"}</em></div><div className="student-analysis-score"><span className={assessmentTone(assessment.fitLevel)}><b>{assessment.score.toLocaleString("fa-IR")}</b><small>امتیاز</small></span><div><b>{assessment.fitLevel}</b><p><AssessmentIcon name="clock" size={13} /> {assessment.weeklyHours.toLocaleString("fa-IR")} ساعت در هفته · {assessment.experienceLevel}</p></div></div><div className="student-analysis-goal"><b>هدف: </b>{assessment.goal}</div><p className="student-analysis-recommendation"><AssessmentIcon name="spark" size={15} /> {assessment.recommendation}</p></article>)}</div> : <div className="student-analysis-empty"><AssessmentIcon name="user" size={20} /> هنوز ارزیابی کاربری با این فیلتر وجود ندارد.</div>}
    </section>
  );
}
