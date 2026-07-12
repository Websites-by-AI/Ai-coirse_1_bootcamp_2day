'use client';

import { useState } from "react";
import type { ReleaseNote } from "@/lib/releases";

function ReleaseIcon({ name, size = 17 }: { name: "check" | "cloud" | "code" | "copy" | "github" | "key" | "link" | "refresh" | "rocket" | "warning"; size?: number }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.5 4.5 0 0 0 7 18Z" /></>,
    code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3" /><path d="M14 5 10 19" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    github: <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .9.1-.6.4-1.1.7-1.3-2.3-.3-4.7-1.1-4.7-5a3.8 3.8 0 0 1 1-2.6 3.5 3.5 0 0 1 .1-2.5s.8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1a3.5 3.5 0 0 1 .1 2.5 3.8 3.8 0 0 1 1 2.6c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />,
    key: <><circle cx="8" cy="15" r="3" /><path d="m10.3 12.7 8.2-8.2 2 2-2 2 1.5 1.5-2 2-1.5-1.5-3.9 3.9" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.2-1.2" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 4v7h-7" /></>,
    rocket: <><path d="M14 4c2.3-2.3 5.3-2 6-2-.1.7.3 3.7-2 6l-7 7-5-5 8-6Z" /><path d="M9 12 5 12l-2 3 5 1M12 15v4l-3 2-1-5" /></>,
    warning: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const deploymentEnvironment = `# PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# AI Vault — secret طولانی و ثابت، حداقل ۳۲ کاراکتر
AI_KEYS_ENCRYPTION_SECRET=replace-with-long-random-secret

# یک یا چند API اختیاری برای تحلیل واقعی
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# ضدربات Cloudflare Turnstile (اختیاری)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# ارسال رزومه (اختیاری)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=VibeLab <no-reply@your-domain.example>`;

export default function SetupReleaseCenter({ releases, githubUrl, connectedProviders }: { releases: ReleaseNote[]; githubUrl: string | null; connectedProviders: number }) {
  const [notice, setNotice] = useState("");
  const copySetup = async () => {
    try {
      await navigator.clipboard.writeText(deploymentEnvironment);
      setNotice("نمونه‌ی environment بدون secret در کلیپ‌بورد کپی شد.");
    } catch { setNotice("کپی خودکار ممکن نیست؛ متن تنظیمات را دستی انتخاب کنید."); }
  };

  return <section className="release-center" id="release-center"><div className="release-head"><div><p><ReleaseIcon name="rocket" size={15} /> DEPLOYMENT & RELEASE CENTER</p><h2>نسخه‌ی کد، راه‌اندازی و اتصال سرویس‌ها</h2><span>هر تغییر اصلی با نسخه و تغییرات قابل مشاهده ثبت می‌شود. نسخه‌های قبل برای مرجع در پایین نگه‌داری می‌شوند.</span></div><button onClick={copySetup}><ReleaseIcon name="copy" size={16} /> کپی تنظیمات محیط</button></div>{notice && <p className="release-notice"><ReleaseIcon name="check" size={15} /> {notice}</p>}<div className="release-status-grid"><article><span className="release-status-icon source"><ReleaseIcon name="code" size={18} /></span><div><p>نسخه‌ی جاری</p><b>{releases[0]?.version ?? "v1.0.0"}</b><small>{releases[0]?.sourceRef}</small></div></article><article><span className={`release-status-icon ${githubUrl ? "good" : "warning"}`}><ReleaseIcon name={githubUrl ? "github" : "warning"} size={18} /></span><div><p>GitHub Source</p>{githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer">Repository متصل است <ReleaseIcon name="link" size={13} /></a> : <><b>متصل نیست</b><small>برای نمایش لینک، GITHUB_REPOSITORY_URL را در محیط تنظیم کنید.</small></>}</div></article><article><span className={`release-status-icon ${connectedProviders ? "good" : "warning"}`}><ReleaseIcon name="key" size={18} /></span><div><p>AI Analysis</p><b>{connectedProviders ? `${connectedProviders.toLocaleString("fa-IR")} Provider سالم` : "Fallback فعال"}</b><small>{connectedProviders ? "تحلیل رزومه و پروژه با AI خارجی اجرا می‌شود." : "برای AI واقعی از بخش AI API کلید و تست اتصال را ثبت کنید."}</small></div></article></div><div className="release-setup-grid"><article className="release-env"><div><span><ReleaseIcon name="cloud" size={17} /></span><p><b>راهنمای Vercel / Node Hosting</b><small>این متغیرها را در Environment Variables محیط production وارد کنید. مقدار secret را هرگز در پنل یا GitHub عمومی قرار ندهید.</small></p></div><pre>{deploymentEnvironment}</pre></article><article className="release-cloudflare"><div><span><ReleaseIcon name="cloud" size={17} /></span><p><b>راهنمای Cloudflare</b><small>Cloudflare را به‌عنوان DNS / CDN / WAF جلوی hosting Node.js قرار دهید.</small></p></div><ol><li>SSL/TLS را روی <b>Full (strict)</b> قرار دهید.</li><li>برای <code>/api/auth/*</code> و <code>/api/admin/*</code> Rate Limit فعال کنید.</li><li>برای ثبت‌نام عمومی Turnstile بسازید و هر دو کلید آن را در environment وارد کنید.</li><li>در صورت deploy روی Vercel، Cloudflare صرفاً proxy و WAF است؛ PostgreSQL از سرور Node.js متصل می‌شود.</li></ol></article></div><div className="release-history"><div><p>RELEASE HISTORY</p><h3>نسخه‌های فعلی و قبلی</h3></div>{releases.map((release) => <article className={release.current ? "current" : ""} key={release.version}><span>{release.version}</span><div><b>{release.title}</b><small>{release.date} · {release.sourceRef}</small><ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul></div>{release.current && <em>نسخه فعال</em>}</article>)}</div><p className="release-disclaimer"><ReleaseIcon name="warning" size={14} /> سورس در workspace فعلی وجود دارد اما remote GitHub به این پروژه متصل نیست؛ پس لینک GitHub ساختگی نمایش داده نمی‌شود. پس از push کردن repository، فقط <code>GITHUB_REPOSITORY_URL</code> را تنظیم کنید.</p></section>;
}
