import Link from "next/link";

const primaryCards = [
  {
    title: "مسیر آموزش از روی رزومه",
    text: "رزومه یا معرفی کوتاه را وارد کنید و مسیر آموزشی، ویدیو، مربی و نقطه مناسب را بگیرید.",
    href: "/learning-plan",
    icon: "🧭",
  },
  {
    title: "کارآموزی طراحی سایت و محتوا",
    text: "ورودی‌های دیوار، شیپور و تلگرام رزومه می‌دهند و مسیر کارآموزی می‌گیرند.",
    href: "/apply?source=site&utm_source=site&utm_medium=homepage&utm_campaign=internship",
    icon: "🎓",
  },
  {
    title: "مدرسه اسنپی",
    text: "دانش‌آموز، مربی و مدرسه/فضای آموزشی را مثل اسنپ به هم وصل می‌کنیم.",
    href: "/school-snap",
    icon: "🏫",
  },
];

const services = [
  "تحلیل رزومه با AI",
  "پیشنهاد دوره‌های YouTube، آپارات و فرادرس",
  "برنامه دو روزه ساخت خروجی واقعی",
  "کارتابل کارآموزی و تسک‌های هفتگی",
  "ربات تلگرام و کانال آموزش",
  "جذب پروژه از دیوار، شیپور و شبکه‌های کاری",
];

const posts = [
  { title: "فراخوان جذب کارآموز VibeLab", tag: "کارآموزی", href: "/internship" },
  { title: "کارتابل کارآموزی Websites by AI", tag: "میزکار", href: "/internship-desk" },
  { title: "ربات تلگرام و کانال‌های آموزشی", tag: "پیام‌رسان", href: "/channels" },
  { title: "MASIR؛ از رزومه تا اولین پروژه", tag: "مسیر شغلی", href: "/masir" },
];

const stats = [
  ["Cloudflare D1", "دیتابیس فعال"],
  ["Telegram Bot", "تحلیل داخل چت"],
  ["10+ Hubs", "تهران و کرج"],
  ["4 نفر", "حد نصاب حضوری"],
];

export default function WordPressHome() {
  return (
    <main dir="rtl" className="wp-site">
      <header className="wp-header">
        <div className="wp-container wp-nav">
          <Link href="/" className="wp-brand"><span>V</span><b>VibeLab</b><small>Websites by AI</small></Link>
          <nav>
            <Link href="/apply">درخواست کارآموزی</Link>
            <Link href="/learning-plan">مسیر آموزش</Link>
            <Link href="/school-snap">مدرسه اسنپی</Link>
            <Link href="/channels">ربات‌ها</Link>
            <Link href="/admin">ادمین</Link>
          </nav>
        </div>
      </header>

      <section className="wp-hero">
        <div className="wp-container wp-hero-grid">
          <div className="wp-hero-copy">
            <p className="wp-eyebrow">پلتفرم آموزش، کارآموزی و مسیر شغلی با هوش مصنوعی</p>
            <h1>از رزومه تا اولین پروژه؛ با مسیر آموزشی شخصی‌سازی‌شده.</h1>
            <p>
              VibeLab رزومه کاربر را می‌گیرد، مسیر آموزش و بازاریابی پیشنهاد می‌دهد، مربی و نقطه آموزشی نزدیک را پیدا می‌کند و کارآموز را تا ساخت نمونه‌کار واقعی جلو می‌برد.
            </p>
            <div className="wp-actions">
              <Link href="/apply?source=homepage&utm_source=homepage&utm_medium=cta&utm_campaign=internship">شروع رایگان</Link>
              <Link href="https://t.me/ai_vibelab_bot" target="_blank">ربات تلگرام</Link>
            </div>
          </div>
          <aside className="wp-hero-panel">
            <div className="wp-panel-top"><span>Live Platform</span><b>کارآموزی + آموزش</b></div>
            {stats.map(([value, label]) => <div className="wp-stat" key={label}><b>{value}</b><small>{label}</small></div>)}
          </aside>
        </div>
      </section>

      <section className="wp-container wp-card-row">
        {primaryCards.map((card) => (
          <Link href={card.href} className="wp-feature-card" key={card.title}>
            <span>{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <em>مشاهده و شروع ←</em>
          </Link>
        ))}
      </section>

      <section className="wp-container wp-layout">
        <div className="wp-main-content">
          <div className="wp-section-title"><p>خدمات اصلی</p><h2>مدل ساده، تمیز و قابل فهم مثل یک سایت وردپرسی</h2></div>
          <div className="wp-service-grid">
            {services.map((item, index) => <article key={item}><b>{(index + 1).toLocaleString("fa-IR")}</b><span>{item}</span></article>)}
          </div>

          <div className="wp-section-title"><p>آخرین بخش‌های فعال</p><h2>مسیرهایی که کاربر باید ببیند</h2></div>
          <div className="wp-post-list">
            {posts.map((post) => <Link href={post.href} key={post.title}><small>{post.tag}</small><b>{post.title}</b><span>ادامه مطلب</span></Link>)}
          </div>
        </div>

        <aside className="wp-sidebar">
          <div className="wp-widget">
            <h3>ورود سریع</h3>
            <Link href="/login">ورود کاربر</Link>
            <Link href="/register">ثبت‌نام</Link>
            <Link href="/panel">پنل کاربر</Link>
            <Link href="/admin">پنل ادمین</Link>
          </div>
          <div className="wp-widget accent">
            <h3>آگهی دیوار و شیپور</h3>
            <p>برای آگهی‌ها از لینک اختصاصی استفاده کن تا منبع ورودی در ادمین ذخیره شود.</p>
            <Link href="/apply?source=divar&utm_source=divar&utm_medium=classified&utm_campaign=ai_internship">لینک دیوار</Link>
            <Link href="/apply?source=sheypoor&utm_source=sheypoor&utm_medium=classified&utm_campaign=ai_internship">لینک شیپور</Link>
          </div>
        </aside>
      </section>

      <section className="wp-cta">
        <div className="wp-container">
          <h2>ساده، روشن و آماده جذب کارآموز</h2>
          <p>کاربر رزومه می‌دهد، مسیر آموزشی و بازاریابی می‌گیرد، و اگر ۴ نفر در یک منطقه آماده شوند جلسه حضوری هماهنگ می‌شود.</p>
          <Link href="/apply">ثبت درخواست کارآموزی</Link>
        </div>
      </section>
    </main>
  );
}
