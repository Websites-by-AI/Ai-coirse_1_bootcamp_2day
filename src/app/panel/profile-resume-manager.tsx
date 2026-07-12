'use client';

import { FormEvent, useMemo, useRef, useState } from "react";
import type { ProfileView, ResumeView } from "@/lib/profile";

type Props = { userId: number; userName: string; initialData: { profile: ProfileView; resume: ResumeView } };

function ResumeIcon({ name, size = 17 }: { name: "check" | "download" | "file" | "link" | "mail" | "profile" | "share" | "spark" | "upload"; size?: number }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    download: <path d="M12 4v11m-4-4 4 4 4-4M5 20h14" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.2-1.2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2.5A4.5 4.5 0 0 1 9.5 14h5a4.5 4.5 0 0 1 4.5 4.5V21" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4M5 20h14" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const demoResumeText = "سارا فرهمند | سازنده‌ی محصول AI\n\nخلاصه: به کسب‌وکارهای کوچک کمک می‌کنم تا با AI، محتوا و محصول دیجیتال بسازند.\n\nپروژه‌ها:\n- لندینگ و ویدیوی معرفی برای برند محلی\n- پنل محتوایی با Next.js و ابزارهای AI\n\nمهارت‌ها: Google AI Studio، Claude، Next.js، Vibe Coding، سناریونویسی و تولید محتوا.";

export default function ProfileResumeManager({ userId, userName, initialData }: Props) {
  const [profile, setProfile] = useState(initialData.profile);
  const [resume, setResume] = useState(initialData.resume);
  const [resumeText, setResumeText] = useState(initialData.resume.contentText || demoResumeText);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState(`رزومه ${userName} از VibeLab`);
  const [emailMessage, setEmailMessage] = useState(`سلام، رزومه و پروفایل ${userName} از طریق VibeLab ارسال شده است.`);
  const [busy, setBusy] = useState<"save" | "analyze" | "upload" | "email" | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const profileLink = useMemo(() => typeof window === "undefined" ? `/profile/${userId}` : `${window.location.origin}/profile/${userId}`, [userId]);

  const updateProfileValue = (key: keyof ProfileView, value: string | boolean) => setProfile((current) => ({ ...current, [key]: value }));

  const saveProfile = async () => {
    setBusy("save"); setNotice("");
    try {
      const response = await fetch("/api/auth/student/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const result = (await response.json()) as { profile?: ProfileView; error?: string };
      if (!response.ok || !result.profile) throw new Error(result.error ?? "ذخیره پروفایل ناموفق بود.");
      setProfile(result.profile); setNotice("پروفایل ذخیره شد و لینک عمومی به‌روز است.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ذخیره پروفایل ناموفق بود."); } finally { setBusy(null); }
  };

  const analyzeResume = async () => {
    setBusy("analyze"); setNotice("");
    try {
      const response = await fetch("/api/auth/student/resume/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, resumeText }) });
      const result = (await response.json()) as { profile?: ProfileView; resume?: ResumeView; error?: string };
      if (!response.ok || !result.resume || !result.profile) throw new Error(result.error ?? "تحلیل رزومه ناموفق بود.");
      setProfile(result.profile); setResume(result.resume); setResumeText(result.resume.contentText); setNotice(result.resume.analysisSource === "ai" ? "AI رزومه را با ورودی‌های جدید تحلیل کرد؛ مصرف token ثبت شد." : "تحلیل آموزشی fallback با ورودی‌های جدید انجام شد؛ برای AI واقعی یک provider متصل کنید.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "تحلیل رزومه ناموفق بود."); } finally { setBusy(null); }
  };

  const uploadResume = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setNotice("ابتدا فایل رزومه را انتخاب کنید."); return; }
    setBusy("upload"); setNotice("");
    try {
      const data = new FormData(); data.set("file", file);
      const response = await fetch("/api/auth/student/resume/import", { method: "POST", body: data });
      const result = (await response.json()) as { resume?: ResumeView; error?: string };
      if (!response.ok || !result.resume) throw new Error(result.error ?? "آپلود رزومه ناموفق بود.");
      setResume(result.resume); if (result.resume.contentText) setResumeText(result.resume.contentText); setNotice("فایل رزومه در حساب شما ذخیره شد. برای دریافت بازخورد، تحلیل را اجرا کنید.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "آپلود رزومه ناموفق بود."); } finally { setBusy(null); }
  };

  const emailResume = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy("email"); setNotice("");
    try {
      const response = await fetch("/api/auth/student/resume/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient, subject, message: emailMessage }) });
      const result = (await response.json()) as { status?: string; detail?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "ارسال رزومه ناموفق بود.");
      setNotice(result.detail ?? "درخواست ارسال رزومه ثبت شد.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ارسال رزومه ناموفق بود."); } finally { setBusy(null); }
  };

  const shareProfile = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `پروفایل ${userName} در VibeLab`, url: profileLink });
      else await navigator.clipboard.writeText(profileLink);
      setNotice("لینک عمومی پروفایل برای اشتراک‌گذاری آماده شد.");
    } catch { setNotice("اشتراک‌گذاری لغو شد یا clipboard در دسترس نیست."); }
  };

  return <section className="profile-resume" id="profile-resume"><div className="resume-head"><div><p><ResumeIcon name="profile" size={15} /> CREATOR PROFILE & RESUME</p><h2>پروفایل، رزومه و لینک عمومی شما</h2><span>اطلاعات را تغییر دهید و «تحلیل رزومه» را بزنید؛ نتیجه باید براساس ورودی جدید به‌روزرسانی شود.</span></div><button onClick={shareProfile}><ResumeIcon name="share" size={16} /> اشتراک پروفایل</button></div>{notice && <p className="resume-notice"><ResumeIcon name="check" size={15} /> {notice}</p>}<div className="profile-resume-grid"><section className="profile-form"><div className="profile-link-row"><span><ResumeIcon name="link" size={15} /> لینک عمومی</span><code>{profileLink}</code><a href={`/profile/${userId}`} target="_blank" rel="noreferrer">باز کردن</a></div><label>عنوان حرفه‌ای<input value={profile.headline} onChange={(event) => updateProfileValue("headline", event.target.value)} /></label><label>معرفی کوتاه<textarea value={profile.bio} onChange={(event) => updateProfileValue("bio", event.target.value)} /></label><label>مهارت‌ها<input value={profile.skills} onChange={(event) => updateProfileValue("skills", event.target.value)} placeholder="مثلاً Gemini، Claude، Next.js" /></label><label>لینک نمونه‌کار اصلی<input value={profile.portfolioUrl ?? ""} onChange={(event) => updateProfileValue("portfolioUrl", event.target.value)} placeholder="https://..." dir="ltr" /></label><label className="public-toggle"><input type="checkbox" checked={profile.isPublic} onChange={(event) => updateProfileValue("isPublic", event.target.checked)} /><span>پروفایل عمومی باشد</span></label><button className="profile-save" onClick={saveProfile} disabled={busy !== null}>{busy === "save" ? "در حال ذخیره..." : "ذخیره پروفایل"}<ResumeIcon name="check" size={16} /></button></section><section className="resume-workspace"><div className="resume-upload"><div><span><ResumeIcon name="upload" size={18} /></span><p><b>فایل رزومه را وارد کنید</b><small>TXT، MD، PDF یا DOCX تا ۵ مگابایت. فایل برای ارسال ایمیل ذخیره می‌شود.</small></p></div><form onSubmit={uploadResume}><input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><button disabled={busy !== null}>{busy === "upload" ? "در حال آپلود..." : "ذخیره فایل"}</button></form>{resume.fileName && <span className="resume-file"><ResumeIcon name="file" size={14} /> فایل فعلی: {resume.fileName}</span>}</div><label className="resume-text-label">متن رزومه برای تحلیل و تست ورودی<textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} /></label><div className="resume-actions"><button onClick={() => setResumeText(demoResumeText)}><ResumeIcon name="spark" size={15} /> بارگذاری متن دمو</button><button className="resume-analyze" onClick={analyzeResume} disabled={busy !== null}>{busy === "analyze" ? "در حال تحلیل..." : "تحلیل رزومه با ورودی فعلی"}<ResumeIcon name="spark" size={15} /></button></div>{resume.analysisSource !== "not_analyzed" && <div className="resume-analysis"><span><b>{resume.score.toLocaleString("fa-IR")}</b><small>امتیاز رزومه</small></span><div><p>{resume.analysisSource === "ai" ? "تحلیل AI متصل" : resume.analysisSource === "demo" ? "گزارش نمونه" : "تحلیل آموزشی fallback"}</p><b>بازخورد برای نسخه‌ی فعلی رزومه</b><small>{resume.review}</small></div></div>}</section></div><form className="resume-email" onSubmit={emailResume}><div><span><ResumeIcon name="mail" size={18} /></span><p><b>ارسال رزومه با ایمیل</b><small>در صورت تنظیم SMTP، فایل رزومه پیوست می‌شود؛ در غیر این‌صورت درخواست در outbox ذخیره خواهد شد.</small></p></div><label>گیرنده<input value={recipient} onChange={(event) => setRecipient(event.target.value)} type="email" required placeholder="client@example.com" dir="ltr" /></label><label>موضوع<input value={subject} onChange={(event) => setSubject(event.target.value)} required /></label><label>پیام<textarea value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} required /></label><button disabled={busy !== null}>{busy === "email" ? "در حال ارسال..." : "ارسال یا ثبت در صف"}<ResumeIcon name="mail" size={16} /></button></form></section>;
}
