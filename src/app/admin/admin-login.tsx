'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const demoAccount = {
  username: "admin@vibelab.ir",
  password: "VibeLab2025!",
};

function PanelIcon({ name }: { name: "arrow" | "check" | "eye" | "lock" | "mail" | "spark" }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" />,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AdminLogin({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("authError");
    if (!authError) return;
    const messages: Record<string, string> = {
      google_not_configured: "ورود گوگل هنوز در محیط production پیکربندی نشده است.",
      google_not_allowed: "این حساب Google در فهرست مدیران مجاز نیست.",
      google_cancelled: "فرآیند ورود Google لغو شد.",
      google_state_invalid: "اعتبارسنجی ورود Google ناموفق بود؛ دوباره تلاش کنید.",
      google_token_failed: "دریافت توکن Google ناموفق بود.",
      google_profile_failed: "اطلاعات حساب Google قابل تأیید نبود.",
      google_connection_failed: "ارتباط با Google برقرار نشد؛ دوباره تلاش کنید.",
    };
    setOauthNotice(messages[authError] ?? "ورود با Google ناموفق بود.");
    window.history.replaceState({}, "", "/admin");
  }, []);

  const useDemo = () => {
    setUsername(demoAccount.username);
    setPassword(demoAccount.password);
    setError("");
  };

  const loginWithCredentials = async (nextUsername: string, nextPassword: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: nextUsername, password: nextPassword }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "ورود به پنل ناموفق بود.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginWithCredentials(username, password);
  };

  const quickDemoLogin = async () => {
    setUsername(demoAccount.username);
    setPassword(demoAccount.password);
    await loginWithCredentials(demoAccount.username, demoAccount.password);
  };

  return (
    <main dir="rtl" className="admin-login-page">
      <div className="admin-login-grid" /><div className="admin-login-orb first" /><div className="admin-login-orb second" />
      <section className="admin-login-layout">
        <aside className="admin-login-aside">
          <a href="/" className="admin-brand"><span>V</span><b>VibeLab</b></a>
          <div className="admin-aside-copy"><div className="admin-aside-icon"><PanelIcon name="spark" /></div><p>فضای مدیریتی</p><h1>پروژه‌ها، ثبت‌نام‌ها و ماراتن VibeLab را از یک‌جا <em>هدایت کن.</em></h1><span>دسترسی مدیریت فقط برای تیم آکادمی فعال است.</span></div>
          <div className="admin-aside-status"><i><PanelIcon name="check" /></i><div><b>دیتابیس متصل و آماده است</b><small>اطلاعات پنل با PostgreSQL همگام می‌شود.</small></div></div>
        </aside>
        <section className="admin-login-card">
          <a href="/" className="admin-mobile-brand"><span>V</span> VibeLab</a>
          <div className="admin-login-heading"><p>ورود مدیریت</p><h2>خوش آمدی!</h2><span>برای ورود به فضای مدیریت، اطلاعات حساب را وارد کن.</span></div>
          {oauthNotice && <p className="oauth-notice">{oauthNotice}</p>}
          <div className="admin-demo-box"><button className="demo-credentials" type="button" onClick={useDemo}><span className="demo-icon"><PanelIcon name="spark" /></span><span><b>حساب دمو را داخل فرم پر کن</b><small>admin@vibelab.ir&nbsp; / &nbsp;VibeLab2025!</small></span><PanelIcon name="arrow" /></button><button className="direct-demo-login" type="button" disabled={loading} onClick={quickDemoLogin}>{loading ? "در حال ورود..." : "ورود مستقیم با حساب دمو"}<PanelIcon name="arrow" /></button></div>
          {googleEnabled ? (
            <a className="google-login" href="/api/auth/google?returnTo=/admin"><span>G</span> ورود امن با حساب Google</a>
          ) : (
            <div className="google-login disabled"><span>G</span><div><b>ورود با حساب Google</b><small>پس از تنظیم GOOGLE_CLIENT_ID، GOOGLE_CLIENT_SECRET و GOOGLE_ADMIN_EMAILS فعال می‌شود.</small></div></div>
          )}
          <form onSubmit={submit} className="admin-login-form">
            <label>نام کاربری یا ایمیل<div className="admin-input"><PanelIcon name="mail" /><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="admin@vibelab.ir" /></div></label>
            <label>رمز عبور<div className="admin-input"><PanelIcon name="lock" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="رمز عبور" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="نمایش رمز عبور"><PanelIcon name="eye" /></button></div></label>
            {error && <p className="admin-login-error">{error}</p>}
            <button className="admin-login-submit" disabled={loading} type="submit">{loading ? "در حال بررسی..." : "ورود به پنل مدیریت"}<PanelIcon name="arrow" /></button>
          </form>
          <p className="admin-login-foot"><PanelIcon name="lock" /> نشست شما امن و زمان‌دار است.</p>
        </section>
      </section>
    </main>
  );
}
