'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "./turnstile-widget";

type Student = { id: number; fullName: string; email: string; phone: string } | null;
type Assessment = {
  id: number;
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  projectIdea: string;
  score: number;
  fitLevel: "آماده برای ماراتن" | "نیازمند آماده‌سازی کوتاه" | "پیشنهاد مسیر مقدماتی";
  recommendation: string;
  analysisSource: "ai" | "rule_based";
  createdAt: string;
} | null;
type Mode = "register" | "login";
type JourneyTheme = "midnight" | "aurora" | "light";

const demoCredentials = { email: "demo.student@vibelab.ir", password: "VibeStudent2025!" };

function JourneyIcon({ name, size = 19 }: { name: "arrow" | "brain" | "check" | "clock" | "lock" | "login" | "logout" | "mail" | "moon" | "palette" | "rocket" | "spark" | "sun" | "user" | "wand"; size?: number }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    brain: <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    login: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></>,
    logout: <><path d="m14 17-5-5 5-5M9 12h12" /><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
    palette: <><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1" /><circle cx="12" cy="7" r="1" /><circle cx="16" cy="10" r="1" /><path d="M12 21c0-3 2-4 3.5-4 1.7 0 2.5-1 2.5-2.5C18 10 15.3 3 12 3" /></>,
    rocket: <><path d="M14 4c2.3-2.3 5.3-2 6-2-.1.7.3 3.7-2 6l-7 7-5-5 8-6Z" /><path d="M9 12 5 12l-2 3 5 1M12 15v4l-3 2-1-5" /><circle cx="15" cy="7" r="1" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2.5A4.5 4.5 0 0 1 9.5 14h5a4.5 4.5 0 0 1 4.5 4.5V21" /></>,
    wand: <><path d="m4 20 11-11M14 4l1 2m2 1 2 1m-8-3 1 2m2 1 2 1" /><path d="m5 14-1 1m3 2-1 1m-3-7 2 1" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function scoreTone(score: number) {
  if (score >= 75) return "great";
  if (score >= 55) return "ready";
  return "start";
}

function setFormField(form: HTMLFormElement | null, name: string, value: string) {
  const field = form?.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value;
}

function resultSignals(assessment: NonNullable<Assessment>) {
  const experience = assessment.experienceLevel === "پروژه یا تجربه‌ی کاری داشته‌ام" ? 92 : assessment.experienceLevel === "با ابزارهای AI کمی کار کرده‌ام" ? 74 : 52;
  return [
    { label: "هدف", value: assessment.goal.length > 20 ? 92 : 76 },
    { label: "تجربه", value: experience },
    { label: "زمان", value: Math.min(100, Math.max(24, assessment.weeklyHours * 12)) },
    { label: "ایده", value: Math.min(100, Math.max(28, assessment.projectIdea.trim().length)) },
  ];
}

export default function RegistrationExperience({ initialStudent, initialAssessment, turnstileSiteKey, googleEnabled }: { initialStudent: Student; initialAssessment: Assessment; turnstileSiteKey?: string; googleEnabled: boolean }) {
  const router = useRouter();
  const registerFormRef = useRef<HTMLFormElement>(null);
  const loginFormRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>("register");
  const [theme, setTheme] = useState<JourneyTheme>("midnight");
  const [student, setStudent] = useState<Student>(initialStudent);
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("vibelab-journey-theme") as JourneyTheme | null;
    if (saved === "midnight" || saved === "aurora" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("authError");
    if (!authError) return;
    const messages: Record<string, string> = {
      google_not_configured: "ورود Google در محیط production هنوز پیکربندی نشده است.",
      google_cancelled: "فرآیند ورود با Google لغو شد.",
      google_state_invalid: "اعتبارسنجی امنیتی ورود Google ناموفق بود؛ دوباره تلاش کنید.",
      google_token_failed: "دریافت توکن Google ناموفق بود.",
      google_profile_failed: "اطلاعات حساب Google قابل تأیید نبود.",
      google_connection_failed: "ارتباط با Google برقرار نشد؛ دوباره تلاش کنید.",
    };
    setError(messages[authError] ?? "ورود با Google ناموفق بود.");
    window.history.replaceState({}, "", "/register");
  }, []);

  const chooseTheme = (value: JourneyTheme) => {
    setTheme(value);
    window.localStorage.setItem("vibelab-journey-theme", value);
  };

  const fillDemoInputs = () => {
    setFormField(registerFormRef.current, "fullName", "کاربر نمونه‌ی VibeLab");
    setFormField(registerFormRef.current, "phone", "۰۹۱۲ ۵۵۵ ۴۰۸۲");
    setFormField(registerFormRef.current, "goal", "ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام");
    setFormField(registerFormRef.current, "experienceLevel", "با ابزارهای AI کمی کار کرده‌ام");
    setFormField(registerFormRef.current, "weeklyHours", "7");
    setFormField(registerFormRef.current, "projectIdea", "می‌خواهم برای یک کسب‌وکار خانگی، یک لندینگ ساده و یک ویدیوی کوتاه معرفی بسازم تا سفارش‌های محلی بیشتری دریافت کنم.");
    setError("نمونه‌ی فرم پر شد؛ برای ساخت حساب واقعی، ایمیل و رمز خودتان را وارد کنید.");
  };

  const fillDemoLogin = () => {
    setFormField(loginFormRef.current, "email", demoCredentials.email);
    setFormField(loginFormRef.current, "password", demoCredentials.password);
    setError("");
  };

  const openDemoAccount = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/student/demo", { method: "POST" });
      const result = (await response.json()) as { student?: Student; assessment?: Assessment; error?: string };
      if (!response.ok || !result.student || !result.assessment) throw new Error(result.error ?? "حساب دمو باز نشد.");
      setStudent(result.student);
      setAssessment(result.assessment);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود به حساب دمو ناموفق بود.");
    } finally {
      setDemoLoading(false);
    }
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          password: data.get("password"),
          goal: data.get("goal"),
          experienceLevel: data.get("experienceLevel"),
          weeklyHours: Number(data.get("weeklyHours")),
          projectIdea: data.get("projectIdea"),
          turnstileToken,
        }),
      });
      const result = (await response.json()) as { student?: Student; assessment?: Assessment; error?: string };
      if (!response.ok || !result.student || !result.assessment) throw new Error(result.error ?? "ثبت‌نام کامل نشد.");
      setStudent(result.student);
      setAssessment(result.assessment);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "خطا در ثبت‌نام؛ دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const submitExistingStudentAssessment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/student/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: data.get("goal"),
          experienceLevel: data.get("experienceLevel"),
          weeklyHours: Number(data.get("weeklyHours")),
          projectIdea: data.get("projectIdea"),
          turnstileToken,
        }),
      });
      const result = (await response.json()) as { assessment?: Assessment; error?: string };
      if (!response.ok || !result.assessment) throw new Error(result.error ?? "تحلیل مسیر کامل نشد.");
      setAssessment(result.assessment);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تحلیل مسیر کامل نشد.");
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/student/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      const result = (await response.json()) as { student?: Student; error?: string };
      if (!response.ok || !result.student) throw new Error(result.error ?? "ورود به حساب ناموفق بود.");
      setStudent(result.student);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود به حساب ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/student/logout", { method: "POST" });
    setStudent(null);
    setAssessment(null);
    setMode("register");
    router.refresh();
  };

  const diagram = useMemo(() => assessment ? resultSignals(assessment) : [], [assessment]);
  const turnstileTheme = theme === "light" ? "light" : "dark";

  return (
    <main dir="rtl" className={`journey-page ${theme}`}>
      <div className="journey-grid" /><div className="journey-orb one" /><div className="journey-orb two" />
      <header className="journey-header">
        <a href="/" className="journey-brand"><span>V</span><b>VibeLab</b><small>BY NOORA ACADEMY</small></a>
        <div className="journey-header-actions"><div className="journey-theme-picker" aria-label="انتخاب تم"><button className={theme === "midnight" ? "active" : ""} onClick={() => chooseTheme("midnight")} title="تم شب"><JourneyIcon name="moon" size={15} /></button><button className={theme === "aurora" ? "active" : ""} onClick={() => chooseTheme("aurora")} title="تم شفق"><JourneyIcon name="palette" size={15} /></button><button className={theme === "light" ? "active" : ""} onClick={() => chooseTheme("light")} title="تم روشن"><JourneyIcon name="sun" size={15} /></button></div><a href="/" className="journey-back">بازگشت به سایت <JourneyIcon name="arrow" size={16} /></a></div>
      </header>
      <section className="journey-layout">
        <aside className="journey-intro">
          <div className="journey-badge"><JourneyIcon name="brain" size={16} /> مسیرسنج هوشمند VibeLab</div>
          <h1>قبل از شروع،<br />مسیر <span>درست خودت</span> را پیدا کن.</h1>
          <p>ایده، تجربه و زمانت را به ما بگو. یک تحلیل آموزشی به تو می‌گوید ماراتن دو روزه برایت مناسب است یا با چه آماده‌سازی کوتاهی بهترین خروجی را می‌گیری.</p>
          <div className="journey-points"><span><i><JourneyIcon name="check" size={13} /></i> حساب کاربری و نتیجه در PostgreSQL ذخیره می‌شود</span><span><i><JourneyIcon name="check" size={13} /></i> تحلیل با AI متصل یا مدل ارزیابی مقدماتی انجام می‌شود</span><span><i><JourneyIcon name="check" size={13} /></i> نتیجه، پیشنهاد آموزشی است؛ نه قضاوت درباره‌ی توانایی شما</span></div>
          <div className="journey-flow"><div><span>۱</span><b>ساخت حساب</b><small>کمتر از ۲ دقیقه</small></div><i /><div><span>۲</span><b>تحلیل مسیر</b><small>فوری و خصوصی</small></div><i /><div><span>۳</span><b>شروع ساخت</b><small>با برنامه روشن</small></div></div>
        </aside>
        <section className="journey-card">
          {student && assessment ? (
            <div className="assessment-result">
              <div className="result-top"><span className="result-check"><JourneyIcon name="check" size={21} /></span><div><p>حساب کاربری شما فعال است</p><h2>{student.fullName}، نتیجه‌ی مسیرسنج آماده است.</h2></div><button onClick={logout} title="خروج از حساب"><JourneyIcon name="logout" size={17} /></button></div>
              <div className={`score-panel ${scoreTone(assessment.score)}`}><div className="score-ring"><b>{assessment.score.toLocaleString("fa-IR")}</b><small>از ۱۰۰</small></div><div><span>سطح پیشنهادی شما</span><h3>{assessment.fitLevel}</h3><p>{assessment.analysisSource === "ai" ? "تحلیل با اتصال AI فعال انجام شده است." : "ارزیابی مقدماتی بر اساس هدف، تجربه، زمان و ایده‌ی شما انجام شده است."}</p></div></div>
              <section className="fit-diagram"><div className="fit-diagram-head"><span><JourneyIcon name="brain" size={15} /> نمودار آمادگی شما</span><small>چهار سیگنال ورودی</small></div>{diagram.map((signal) => <div className="fit-signal" key={signal.label}><span>{signal.label}</span><i><em style={{ width: `${signal.value}%` }} /></i><b>{signal.value.toLocaleString("fa-IR")}٪</b></div>)}</section>
              <div className="result-recommendation"><span><JourneyIcon name="wand" size={18} /></span><div><b>پیشنهاد برای قدم بعدی</b><p>{assessment.recommendation}</p></div></div>
              <div className="result-actions"><a href="/panel">پنل پروژه و قیمت‌گذاری <JourneyIcon name="arrow" size={16} /></a><a href="/">دیدن طرح درس VibeLab</a><a href="https://t.me/+TrS3ViVv_zn3c8ls" target="_blank" rel="noreferrer">گروه گفت‌وگو با منتور</a></div>
              <p className="result-account"><JourneyIcon name="mail" size={14} /> نتیجه به حساب {student.email} متصل است و در پنل مدیریت قابل مشاهده است.</p>
            </div>
          ) : student ? (
            <form className="journey-form google-assessment-form" onSubmit={submitExistingStudentAssessment}>
              <div className="journey-form-head"><span><JourneyIcon name="brain" size={19} /></span><div><p>ورود با حساب Google موفق بود</p><h2>{student.fullName}، مسیرت را تکمیل کن</h2></div><button type="button" onClick={logout} className="fill-demo-button">خروج</button></div>
              <p className="google-assessment-note">حساب شما ساخته شده است. برای دریافت نتیجه، فقط چهار ورودی آموزشی زیر را کامل کنید.</p>
              <label>هدفت از یادگیری چیست؟<select name="goal" required defaultValue=""><option value="" disabled>یک گزینه انتخاب کنید</option><option>ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام</option><option>تولید محتوا و ویدیوی AI برای کسب‌وکار</option><option>شروع فریلنسری با ابزارهای هوش مصنوعی</option><option>آزمایش و شناخت ابزارهای AI</option></select></label>
              <div className="journey-fields two"><label>سطح تجربه<select name="experienceLevel" defaultValue="تازه شروع کرده‌ام"><option>تازه شروع کرده‌ام</option><option>با ابزارهای AI کمی کار کرده‌ام</option><option>پروژه یا تجربه‌ی کاری داشته‌ام</option></select></label><label>زمان هفتگی قابل‌اختصاص<input name="weeklyHours" type="number" min="1" max="80" defaultValue="6" required /><small><JourneyIcon name="clock" size={12} /> ساعت در هفته</small></label></div>
              <label>ایده یا مسئله‌ای که دوست داری بسازی<textarea name="projectIdea" required minLength={15} placeholder="یک مسئله یا ایده‌ی واقعی بنویسید..." /></label>
              <TurnstileWidget siteKey={turnstileSiteKey} theme={turnstileTheme} onToken={setTurnstileToken} />
              {error && <p className="journey-error">{error}</p>}
              <button className="journey-submit" disabled={loading}>{loading ? "در حال تحلیل مسیر..." : "دریافت تحلیل مسیر"}<JourneyIcon name="arrow" size={17} /></button>
            </form>
          ) : (
            <>
              <div className="journey-tabs"><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}><JourneyIcon name="user" size={16} /> ساخت حساب و ارزیابی</button><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}><JourneyIcon name="login" size={16} /> ورود به حساب</button></div>
              <button className="demo-account-button" onClick={openDemoAccount} disabled={demoLoading}><span><JourneyIcon name="spark" size={17} /></span><div><b>{demoLoading ? "در حال بازکردن حساب آزمایشی..." : "تست فوری با حساب دمو"}</b><small>نتیجه‌ی آماده، نمودار و داده‌ی واقعی PostgreSQL را ببینید.</small></div><JourneyIcon name="arrow" size={16} /></button>
              {googleEnabled ? <a className="student-google-login" href="/api/auth/student/google"><span>G</span> ادامه با حساب Google</a> : <div className="student-google-login disabled"><span>G</span><div><b>ورود با حساب Google</b><small>پس از تنظیم کلیدهای Google OAuth فعال می‌شود.</small></div></div>}
              {mode === "login" ? (
                <form ref={loginFormRef} className="journey-form login-form" onSubmit={submitLogin}>
                  <div className="journey-form-head"><span><JourneyIcon name="lock" size={19} /></span><div><p>حساب کاربری دارید؟</p><h2>نتیجه‌ی مسیرسنج را ببینید</h2></div><button type="button" className="fill-demo-button" onClick={fillDemoLogin}>پرکردن اطلاعات دمو</button></div>
                  <label>ایمیل<input name="email" type="email" placeholder="you@example.com" required dir="ltr" /></label>
                  <label>رمز عبور<input name="password" type="password" placeholder="رمز عبور شما" required dir="ltr" /></label>
                  {error && <p className="journey-error">{error}</p>}
                  <button className="journey-submit" disabled={loading}>{loading ? "در حال ورود..." : "ورود به حساب"}<JourneyIcon name="arrow" size={17} /></button>
                  <p className="demo-hint" dir="ltr">Demo: {demoCredentials.email} / {demoCredentials.password}</p>
                </form>
              ) : (
                <form ref={registerFormRef} className="journey-form" onSubmit={submitRegistration}>
                  <div className="journey-form-head"><span><JourneyIcon name="spark" size={19} /></span><div><p>ثبت‌نام رایگان</p><h2>حساب بساز و مسیرت را بسنج</h2></div><button type="button" className="fill-demo-button" onClick={fillDemoInputs}>پرکردن نمونه‌ی فرم</button></div>
                  <div className="journey-fields two"><label>نام و نام خانوادگی<input name="fullName" required placeholder="مثلاً سارا محمدی" /></label><label>شماره تماس<input name="phone" required placeholder="۰۹۱۲ ..." inputMode="tel" dir="ltr" /></label></div>
                  <div className="journey-fields two"><label>ایمیل<input name="email" type="email" required placeholder="you@example.com" dir="ltr" /></label><label>رمز عبور<input name="password" type="password" required minLength={8} placeholder="حداقل ۸ کاراکتر" dir="ltr" /></label></div>
                  <label>هدفت از یادگیری چیست؟<select name="goal" required defaultValue=""><option value="" disabled>یک گزینه انتخاب کنید</option><option>ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام</option><option>تولید محتوا و ویدیوی AI برای کسب‌وکار</option><option>شروع فریلنسری با ابزارهای هوش مصنوعی</option><option>آزمایش و شناخت ابزارهای AI</option></select></label>
                  <div className="journey-fields two"><label>سطح تجربه<select name="experienceLevel" defaultValue="تازه شروع کرده‌ام"><option>تازه شروع کرده‌ام</option><option>با ابزارهای AI کمی کار کرده‌ام</option><option>پروژه یا تجربه‌ی کاری داشته‌ام</option></select></label><label>زمان هفتگی قابل‌اختصاص<input name="weeklyHours" type="number" min="1" max="80" defaultValue="6" required /><small><JourneyIcon name="clock" size={12} /> ساعت در هفته</small></label></div>
                  <label>ایده یا مسئله‌ای که دوست داری بسازی<textarea name="projectIdea" required minLength={15} placeholder="مثلاً: یک لندینگ و ویدیوی کوتاه برای معرفی کافه‌ی خانگی‌ام به مشتری‌های محلی..." /></label>
                  <TurnstileWidget siteKey={turnstileSiteKey} theme={turnstileTheme} onToken={setTurnstileToken} />
                  {error && <p className="journey-error">{error}</p>}
                  <button className="journey-submit" disabled={loading}>{loading ? "در حال تحلیل مسیر..." : "ساخت حساب و تحلیل مسیر"}<JourneyIcon name="arrow" size={17} /></button>
                  <p className="journey-consent"><JourneyIcon name="lock" size={13} /> با ثبت‌نام، اطلاعات فقط برای حساب و پیشنهاد آموزشی شما ذخیره می‌شود.</p>
                </form>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}
