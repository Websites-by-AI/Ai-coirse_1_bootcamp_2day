import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "کانال‌ها و ربات‌های VibeLab | تلگرام و بله",
  description: "اتصال مسیر آموزشی VibeLab به ربات تلگرام، کانال تلگرام و آماده‌سازی برای ربات/کانال بله.",
};

const channels = [
  {
    title: "ربات تلگرام VibeLab",
    status: "فعال",
    url: "https://t.me/ai_vibelab_bot",
    detail: "تحلیل رزومه کوتاه، پیشنهاد مسیر آموزشی، کارآموزی و برنامه دو روزه داخل خود چت.",
  },
  {
    title: "کانال تلگرام VibeLab News",
    status: "فعال",
    url: "https://t.me/vibelab_channel",
    detail: "کانال اطلاع‌رسانی آموزش‌ها، فراخوان‌ها، مسیرهای کارآموزی و منابع یادگیری.",
  },
  {
    title: "ربات بله VibeLab",
    status: "آماده اتصال پس از دریافت توکن",
    url: "#bale-setup",
    detail: "برای بله باید Bot Token و لینک کانال/شناسه مقصد داده شود تا webhook و پیام‌های مشابه تلگرام فعال شود.",
  },
  {
    title: "کانال بله VibeLab",
    status: "نیازمند ساخت کانال",
    url: "#bale-setup",
    detail: "پس از ساخت کانال بله، لینک یا شناسه کانال را بدهید تا در سایت و ربات‌ها نمایش داده شود.",
  },
];

const telegramSkills = [
  "منوی داخلی کوتاه و قابل فهم",
  "Callback Query برای دکمه‌های بدون لینک",
  "تحلیل رزومه داخل خود چت",
  "پیشنهاد نقطه آموزشی و مربی",
  "ارسال پست خودکار به کانال",
  "Dry-run قبل از انتشار واقعی",
  "ثبت eventها در Cloudflare D1",
  "Webhook امن با Secret Token",
  "قالب‌های محتوایی قابل چرخش",
  "اتصال آینده به بله و کانال‌های دیگر",
];

export default function ChannelsPage() {
  return (
    <main dir="rtl" className="channels-page">
      <section className="channels-hero">
        <div className="channels-container">
          <p>MESSENGER DELIVERY SYSTEM</p>
          <h1>مسیر آموزشی فقط داخل سایت نیست؛ در تلگرام و بله هم ادامه پیدا می‌کند.</h1>
          <span>
            VibeLab رزومه کاربر را می‌گیرد، مسیر آموزشی شخصی‌سازی‌شده می‌سازد و بعد همان مسیر را از طریق سایت، ربات تلگرام، کانال تلگرام و در مرحله بعد بله به کاربر می‌رساند.
          </span>
          <div>
            <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer">شروع با ربات تلگرام</a>
            <a href="https://t.me/vibelab_channel" target="_blank" rel="noreferrer">عضویت در کانال تلگرام</a>
            <Link href="/learning-plan">ساخت مسیر از رزومه</Link>
          </div>
        </div>
      </section>

      <section className="channels-container channels-grid">
        {channels.map((item) => (
          <article key={item.title}>
            <span>{item.status}</span>
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
            {item.url.startsWith("http") ? <a href={item.url} target="_blank" rel="noreferrer">باز کردن</a> : <a href={item.url}>جزئیات اتصال</a>}
          </article>
        ))}
      </section>

      <section className="channels-container telegram-skills-section">
        <p>TELEGRAM BOT SKILLS</p>
        <h2>مهارت‌هایی که برای ربات و کانال VibeLab فعال شده‌اند</h2>
        <div>{telegramSkills.map((skill, index) => <span key={skill}>{String(index + 1).padStart(2, "0")} · {skill}</span>)}</div>
      </section>

      <section id="bale-setup" className="channels-container bale-setup">
        <p>BALE SETUP</p>
        <h2>برای اتصال بله چه چیزی لازم است؟</h2>
        <ul>
          <li>توکن ربات بله از BotFather/بات‌ساز بله</li>
          <li>لینک یا شناسه کانال بله</li>
          <li>متن خوشامدگویی و دستورها، مشابه تلگرام</li>
          <li>Webhook URL پیشنهادی: <code>https://v2.vibelab.ir/api/bale/webhook</code></li>
        </ul>
        <p className="bale-note">توکن بله را داخل چت عمومی نفرستید؛ باید به شکل Secret روی Cloudflare ذخیره شود.</p>
      </section>
    </main>
  );
}
