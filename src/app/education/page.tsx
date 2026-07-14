import type { Metadata } from "next";
import AvatarTool from "./avatar-tool";
import "./education.css";

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z" />,
    brain: <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8M8.5 8.5 12 12l3.5-3.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clapper: <><path d="M4 7h16v13H4zM4 7l3-4h13v4M4 12h16M9 3l3 4m2-4 3 4" /></>,
    code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3" /><path d="M14 5 10 19" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 16-5-5L5 20" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.2-1.2" /></>,
    play: <path d="m9 7 7 5-7 5V7Z" />,
    rocket: <><path d="M14 4c2.3-2.3 5.3-2 6-2-.1.7.3 3.7-2 6l-7 7-5-5 8-6Z" /><path d="M9 12 5 12l-2 3 5 1M12 15v4l-3 2-1-5" /><circle cx="15" cy="7" r="1" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />,
    users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8m5 8.7v-1.5a3.5 3.5 0 0 0-2.6-3.4" /></>,
    wand: <><path d="m4 20 11-11M14 4l1 2m2 1 2 1m-8-3 1 2m2 1 2 1" /><path d="m5 14-1 1m3 2-1 1m-3-7 2 1" /></>,
    video: <><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 14 22l-2-1.5-2 1.5 1.5-8.5" /></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const vibeTracks = [
  {
    title: 'مبانی Vibe Coding',
    desc: 'یاد بگیرید چطور با زبان طبیعی و توضیح ساده، کد تولید کنید و محصول بسازید.',
    icon: 'wand',
    tone: 'blue',
    items: ['پرامپت‌نویسی برای کد', 'اشکال‌زدایی با AI', 'گردش کار Cursor / v0'],
  },
  {
    title: 'ساخت رابط کاربری',
    desc: 'از ایده تا UI آماده: طراحی کامپوننت‌ها، فرم‌ها و داشبوردها بدون دست کدنویسی.',
    icon: 'layers',
    tone: 'purple',
    items: ['طراحی با توضیح متنی', 'تنظیم رنگ و تایپوگرافی', 'ریسپانسیو و انیمیشن'],
  },
  {
    title: 'اتصال به API و دیتا',
    desc: 'یادگیری اتصال بک‌اند، دیتابیس و APIهای خارجی فقط با راهنمایی AI.',
    icon: 'code',
    tone: 'coral',
    items: ['REST API با Next.js', 'دیتابیس و Drizzle', 'احراز هویت و سشن'],
  },
  {
    title: 'انتشار و بهینه‌سازی',
    desc: 'پروژه را روی Vercel یا Cloudflare Pages منتشر کنید و عملکرد را بهبود دهید.',
    icon: 'rocket',
    tone: 'green',
    items: ['Deploy روی Vercel', 'تنظیم دامنه و SSL', 'بهینه‌سازی سرعت'],
  },
];

const faradarsCourses = [
  {
    title: 'آموزش هوش مصنوعی و یادگیری ماشین',
    desc: 'مسیر جامع یادگیری مفاهیم پایه تا پیشرفته AI و ML به زبان فارسی.',
    tags: ['فارسی', 'مبتدی تا پیشرفته'],
    link: 'https://faradars.org/artificial-intelligence-and-machine-learning',
    colors: ['#5368ea', '#8c64e9'],
  },
  {
    title: 'آموزش پایتون برای Data Science',
    desc: 'یادگیری پایتون، کتابخانه‌های NumPy، Pandas و مصورسازی داده.',
    tags: ['فارسی', 'پروژه‌محور'],
    link: 'https://faradars.org/python-programming',
    colors: ['#e78259', '#ec7a64'],
  },
  {
    title: 'آموزش طراحی رابط کاربری UI/UX',
    desc: 'اصول طراحی تجربه کاربری، وایرفریم، پروتوتایپ و تست کاربری.',
    tags: ['فارسی', 'طراحی'],
    link: 'https://faradars.org/ui-ux-design',
    colors: ['#43ae83', '#38b58a'],
  },
];

const freeCourses = [
  {
    num: '۰۱',
    title: 'Google AI Essentials (Coursera)',
    desc: 'دوره رایگان گوگل برای درک مبانی هوش مصنوعی و کاربردهای عملی آن.',
    link: 'https://www.coursera.org/google-ai',
  },
  {
    num: '۰۲',
    title: 'DeepLearning.AI Prompt Engineering',
    desc: 'بهترین منبع آموزش مهندسی پرامپت با Andrew Ng و OpenAI.',
    link: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
  },
  {
    num: '۰۳',
    title: 'Fast.ai Practical Deep Learning',
    desc: 'یادگیری عمیق عملی برای کدنویسان؛ از صفر تا مدل‌های واقعی.',
    link: 'https://course.fast.ai/',
  },
  {
    num: '۰۴',
    title: 'CS50 AI with Python (Harvard)',
    desc: 'دوره معروف هاروارد برای هوش مصنوعی با پایتون.',
    link: 'https://cs50.harvard.edu/ai/',
  },
  {
    num: '۰۵',
    title: 'YouTube: AI Jason / Prompt Engineering',
    desc: 'ویدیوهای رایگان و به‌روز درباره ابزارهای AI و پرامپت‌نویسی.',
    link: 'https://www.youtube.com/@AIJasonZ',
  },
  {
    num: '۰۶',
    title: 'YouTube: Fireship AI Tutorials',
    desc: 'آموزش‌های سریع و فشرده درباره AI، Next.js و ابزارهای مدرن.',
    link: 'https://www.youtube.com/@Fireship',
  },
];

export const metadata: Metadata = {
  title: "مرکز آموزش VibeLab | دوره‌های رایگان AI و Vibe Coding",
  description:
    "منابع آموزشی رایگان هوش مصنوعی، Vibe Coding، ساخت آواتار یوتیوب با AI و دوره‌های فارسی فرادرس. یاد بگیر، بساز و رشد کن.",
  keywords: [
    "آموزش AI",
    "دوره رایگان هوش مصنوعی",
    "Vibe Coding",
    "آموزش یوتیوب",
    "آواتار یوتیوب",
    "فرادرس",
    "Coursera",
    "DeepLearning.AI",
    "Fast.ai",
    "CS50",
  ],
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://vibelab.ir/education",
    title: "مرکز آموزش VibeLab | دوره‌های رایگان AI و Vibe Coding",
    description:
      "منابع آموزشی رایگان هوش مصنوعی، Vibe Coding، ساخت آواتار یوتیوب با AI و دوره‌های فارسی فرادرس.",
    images: [
      {
        url: "/og-education.jpg",
        width: 1200,
        height: 630,
        alt: "مرکز آموزش VibeLab - دوره‌های AI و Vibe Coding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مرکز آموزش VibeLab | دوره‌های رایگان AI و Vibe Coding",
    description:
      "منابع آموزشی رایگان هوش مصنوعی، Vibe Coding، ساخت آواتار یوتیوب با AI و دوره‌های فارسی فرادرس.",
    images: ["/og-education.jpg"],
  },
};

export default function EducationPage() {
  return (
    <main dir="rtl" className="edu-page dark">
      {/* Header */}
      <header className="edu-header">
        <div className="edu-container edu-nav-row">
          <a href="/" className="edu-brand" aria-label="VibeLab نورا">
            <span className="edu-logo"><i>V</i><b /></span>
            <span><strong>VibeLab</strong><small>EDUCATION HUB</small></span>
          </a>
          <nav className="edu-desktop-nav" aria-label="ناوبری آموزش">
            <a href="#vibe">Vibe Coding</a>
            <a href="#avatar">آواتار یوتیوب</a>
            <a href="#faradars">فرادرس</a>
            <a href="#free">دوره‌های رایگان</a>
            <a href="/panel">پنل کاربر</a>
          </nav>
          <div className="edu-nav-actions">
            <a href="/" className="edu-back-btn">
              <Icon name="arrow" size={14} /> بازگشت به سایت
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="edu-hero">
        <div className="edu-container edu-hero-content">
          <div className="edu-pill"><i /> مرکز یادگیری باز VibeLab</div>
          <h1>یاد بگیر، بساز و <span>رشد کن</span></h1>
          <p>مجموعه‌ای از بهترین منابع آموزشی Vibe Coding، طراحی آواتار با AI، دوره‌های فارسی فرادرس و ویدیوهای رایگان هوش مصنوعی.</p>
        </div>
        <div className="edu-container edu-hero-metrics">
          <div><b>۴+</b><span>مسیر آموزشی</span></div>
          <div><b>۱۰۰+</b><span>ساعت محتوای رایگان</span></div>
          <div><b>۳</b><span>پلتفرم معتبر</span></div>
          <div><b>۰</b><span>هزینه برای شروع</span></div>
        </div>
      </section>

      {/* Vibe Coding */}
      <section id="vibe" className="edu-section">
        <div className="edu-container">
          <div className="edu-section-head centered">
            <div className="edu-eyebrow"><Icon name="code" size={15} /> مسیر Vibe Coding</div>
            <h2>برنامه‌نویسی با <span>جریان فکر</span></h2>
            <p>دیگر لازم نیست ساعت‌ها کد بنویسید. با Vibe Coding، ایده‌تان را توضیح می‌دهید و AI آن را به محصول تبدیل می‌کند.</p>
          </div>
          <div className="edu-track-grid">
            {vibeTracks.map((track) => (
              <article className={`edu-track-card ${track.tone}`} key={track.title}>
                <div className="edu-track-icon"><Icon name={track.icon} size={20} /></div>
                <h3>{track.title}</h3>
                <p>{track.desc}</p>
                <ul>
                  {track.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Avatar Studio */}
      <section id="avatar" className="edu-section alt">
        <div className="edu-container">
          <div className="edu-section-head centered">
            <div className="edu-eyebrow coral"><Icon name="image" size={15} /> استودیو آواتار یوتیوب</div>
            <h2>آواتار حرفه‌ای برای <span>کانال یوتیوب</span></h2>
            <p>با AI و Vibe Coding، آواتار منحصربه‌فرد کانال خود را طراحی کنید. ابزار زیر پرامپت آماده و پیش‌نمایش زنده تولید می‌کند.</p>
          </div>

          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--line)', marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="video" size={18} /> آموزش سریع: آواتار یوتیوب با AI
              </h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12, lineHeight: 1.9 }}>
                ۱. نام کانال و حوزه فعالیت را انتخاب کنید.&nbsp;&nbsp;۲. سبک طراحی و پالت رنگی مورد علاقه‌تان را مشخص کنید.&nbsp;&nbsp;۳. پرامپت انگلیسی را در Midjourney، DALL-E یا Leonardo paste کنید.&nbsp;&nbsp;۴. خروجی را در ابزارهای رایگان مانند Remove.bg برش دایره‌ای دهید و روی کانال قرار دهید.
              </p>
            </div>
          </div>

          <AvatarTool />
        </div>
      </section>

      {/* Faradars */}
      <section id="faradars" className="edu-section">
        <div className="edu-container">
          <div className="edu-section-head centered">
            <div className="edu-eyebrow green"><Icon name="book" size={15} /> آکادمی فرادرس</div>
            <h2>دوره‌های تخصصی <span>به زبان فارسی</span></h2>
            <p>فرادرس بزرگ‌ترین پلتفرم آموزش آنلاین ایران است. دوره‌های منتخب AI، برنامه‌نویسی و طراحی را بررسی کنید.</p>
          </div>
          <div className="edu-course-grid">
            {faradarsCourses.map((course) => (
              <article className="edu-course-card" key={course.title}>
                <div className="edu-course-thumb" style={{ '--course-1': course.colors[0], '--course-2': course.colors[1] } as React.CSSProperties}>
                  <span><Icon name="play" size={14} /> مشاهده دوره</span>
                </div>
                <div className="edu-course-body">
                  <h4>{course.title}</h4>
                  <p>{course.desc}</p>
                  <div className="edu-course-meta">
                    {course.tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                  <a href={course.link} target="_blank" rel="noreferrer">
                    رفتن به فرادرس <Icon name="arrow" size={13} />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div style={{ maxWidth: 800, margin: '28px auto 0', padding: '14px 16px', borderRadius: 14, background: 'var(--surface-alt)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(56,181,138,.11)', color: '#38b58a' }}>
              <Icon name="award" size={18} />
            </span>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 11, lineHeight: 1.8 }}>
              <b style={{ color: 'var(--ink)' }}>تخفیف ویژه کاربران VibeLab:</b> با کد تخفیف <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 6, fontSize: 11 }}>VIBELAB10</code> از ۱۰٪ تخفیف دوره‌های فرادرس بهره‌مند شوید.
            </p>
          </div>
        </div>
      </section>

      {/* Free AI Video Courses */}
      <section id="free" className="edu-section alt">
        <div className="edu-container">
          <div className="edu-section-head centered">
            <div className="edu-eyebrow"><Icon name="video" size={15} /> دوره‌های ویدیویی رایگان</div>
            <h2>بهترین منابع <span>رایگان AI</span></h2>
            <p>دوره‌های دانشگاهی، آموزش‌های YouTube و منابع انگلیسی رایگان برای یادگیری عمیق هوش مصنوعی.</p>
          </div>

          <div className="edu-free-list">
            {freeCourses.map((course) => (
              <div className="edu-free-item" key={course.num}>
                <span className="edu-free-num">{course.num}</span>
                <div>
                  <h4>{course.title}</h4>
                  <p>{course.desc}</p>
                </div>
                <a href={course.link} target="_blank" rel="noreferrer">
                  مشاهده <Icon name="arrow" size={12} />
                </a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, textAlign: 'center', color: 'var(--muted)' }}>ویدیوی معرفی: چطور با AI یادگیری را سرعت ببخشیم</h3>
            <div style={{ maxWidth: 720, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <iframe
                className="edu-embed"
                src="https://www.youtube.com/embed/aircAruvnKk"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resume AI CTA */}
      <section className="edu-resume-cta">
        <div className="edu-container">
          <h2>رزومه‌ات را با <span>AI تحلیل کن</span></h2>
          <p>در پنل کاربری VibeLab، رزومه خود را آپلود کنید و تحلیل هوشمندانه AI را دریافت کنید. امتیاز رزومه، بازخورد تخصصی و پیشنهادات بهبود را ببینید.</p>
          <div className="edu-actions">
            <a href="/panel" className="edu-btn primary">
              <Icon name="spark" size={15} /> ورود به پنل و تحلیل رزومه
            </a>
            <a href="/register" className="edu-btn ghost">
              <Icon name="users" size={15} /> ثبت‌نام رایگان
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="edu-footer">
        <div className="edu-container">
          <p>© ۱۴۰۳ VibeLab Education Hub — ساخته‌شده برای سازندگان آینده.</p>
        </div>
      </footer>
    </main>
  );
}
