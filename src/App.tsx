import React, { useState, useEffect, ReactNode } from 'react';
import './vibelab.css';

type Theme = 'dark' | 'light' | 'aurora' | 'rose';
type DayKey = 'one' | 'two';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
type IconName =
  | 'arrow' | 'bolt' | 'brain' | 'calendar' | 'check' | 'chevron-down'
  | 'circle' | 'clapper' | 'code' | 'copy' | 'cursor' | 'globe' | 'image'
  | 'layers' | 'link' | 'menu' | 'moon' | 'play' | 'rocket' | 'share'
  | 'spark' | 'sun' | 'target' | 'tool' | 'users' | 'wand' | 'x'
  | 'shield' | 'book' | 'chart' | 'message' | 'star' | 'zap' | 'award';

const paths: Record<IconName, ReactNode> = {
  arrow:       <path d="M5 12h14m-6-6 6 6-6 6" />,
  bolt:        <path d="m13 2-8 12h6l-1 8 9-13h-6L13 2Z" />,
  brain:       <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8M8.5 8.5 12 12l3.5-3.5" /></>,
  calendar:    <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  check:       <path d="m5 12 4 4L19 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  circle:      <circle cx="12" cy="12" r="8" />,
  clapper:     <><path d="M4 7h16v13H4zM4 7l3-4h13v4M4 12h16M9 3l3 4m2-4 3 4" /></>,
  code:        <><path d="m8 9-3 3 3 3m8-6 3 3-3 3" /><path d="M14 5 10 19" /></>,
  copy:        <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  cursor:      <path d="m5 3 13 8-6 1 3 6-3 2-3-6-4 4V3Z" />,
  globe:       <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  image:       <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 16-5-5L5 20" /></>,
  layers:      <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  link:        <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.2-1.2" /></>,
  menu:        <path d="M4 7h16M4 12h16M4 17h16" />,
  moon:        <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
  play:        <path d="m9 7 7 5-7 5V7Z" />,
  rocket:      <><path d="M14 4c2.3-2.3 5.3-2 6-2-.1.7.3 3.7-2 6l-7 7-5-5 8-6Z" /><path d="M9 12 5 12l-2 3 5 1M12 15v4l-3 2-1-5" /><circle cx="15" cy="7" r="1" /></>,
  share:       <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
  spark:       <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />,
  sun:         <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  target:      <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></>,
  tool:        <><path d="m14.7 6.3 3-3 3 3-3 3" /><path d="m17.7 6.3-8.4 8.4-4-4-2 2 4 4-3 3 3 3 3-3 4 4 2-2-4-4 8.4-8.4" /></>,
  users:       <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8m5 8.7v-1.5a3.5 3.5 0 0 0-2.6-3.4" /></>,
  wand:        <><path d="m4 20 11-11M14 4l1 2m2 1 2 1m-8-3 1 2m2 1 2 1" /><path d="m5 14-1 1m3 2-1 1m-3-7 2 1" /></>,
  x:           <path d="m6 6 12 12M18 6 6 18" />,
  shield:      <><path d="M12 3 4 7v6c0 5 3.8 9.3 8 10 4.2-.7 8-5 8-10V7l-8-4Z" /></>,
  book:        <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  chart:       <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>,
  message:     <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
  star:        <path d="m12 2 3.1 6.3L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2Z" />,
  zap:         <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" />,
  award:       <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number; key?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ─── DATA ───────────────────────────────────────────────────────────────────
const toolStack = [
  { short: 'G', name: 'Google AI Studio', label: 'Gemini / Prompt Lab', icon: 'brain' as IconName, tone: 'blue', copy: 'ایده، تحقیق، پرامپت و نمونه‌سازی سریع با Gemini.' },
  { short: 'C', name: 'Claude', label: 'Strategy / Copy', icon: 'spark' as IconName, tone: 'orange', copy: 'استراتژی، سناریو، متن‌های دقیق و فکر کردن کنار AI.' },
  { short: 'E', name: 'Emergent', label: 'Vibe Coding', icon: 'code' as IconName, tone: 'purple', copy: 'تبدیل توضیح ساده‌ی شما به یک وب‌اپ آماده‌ی استفاده.' },
  { short: 'H', name: 'Higgsfield', label: 'AI Film Direction', icon: 'clapper' as IconName, tone: 'pink', copy: 'ساخت و کارگردانی ویدیوهای حرفه‌ای با حرکت و حس.' },
  { short: 'K', name: 'Kling AI', label: 'Video Generation', icon: 'play' as IconName, tone: 'green', copy: 'تولید شات‌های ویدیویی برای کمپین و شبکه‌های اجتماعی.' },
  { short: 'S', name: 'AI Storyboard', label: 'Visual Planning', icon: 'layers' as IconName, tone: 'yellow', copy: 'استوری‌بورد بصری برای اتصال سناریو، تصویر و ویدیو.' },
];

const plans: Record<DayKey, { title: string; date: string; description: string; items: { time: string; title: string; detail: string; tag: string; icon: IconName }[] }> = {
  one: {
    title: 'روز اول / ایده تا محتوای تصویری',
    date: '۹:۰۰ تا ۱۸:۰۰',
    description: 'یک موتور تولید محتوا می‌سازید: از استراتژی و پرامپت تا استوری‌بورد و ویدیوی نهایی.',
    items: [
      { time: '۰۹:۰۰', title: 'نقشه‌ی ایده و بازار', detail: 'انتخاب مسئله، مخاطب و خروجیِ قابل فروش با کمک Gemini.', tag: 'Google AI Studio', icon: 'target' },
      { time: '۱۰:۳۰', title: 'پرامپت‌نویسی کاربردی', detail: 'ساخت Prompt System برای تحقیق، ایده‌پردازی و کپی‌رایتینگ.', tag: 'Gemini + Claude', icon: 'wand' },
      { time: '۱۳:۰۰', title: 'سناریو و استوری‌بورد', detail: 'تبدیل یک پیام به سناریوی کوتاه، شات‌لیست و برد تصویری.', tag: 'Claude + AI Studio', icon: 'layers' },
      { time: '۱۵:۰۰', title: 'تولید ویدیوی AI', detail: 'کارگردانی شات‌ها، حرکت دوربین و ساخت ویدیوی کمپین.', tag: 'Higgsfield + Kling', icon: 'clapper' },
      { time: '۱۷:۱۵', title: 'خروجی روز اول', detail: 'یک مینی‌کمپین شامل پیام، استوری‌بورد و ویدیوی قابل انتشار.', tag: 'Content Kit', icon: 'rocket' },
    ],
  },
  two: {
    title: 'روز دوم / ایده تا وب‌اپ بدون کد',
    date: '۹:۰۰ تا ۱۸:۰۰',
    description: 'ایده‌ی خود را به یک وب‌سایت یا اپلیکیشن کوچک متصل به کمپین محتوایی‌تان تبدیل می‌کنید.',
    items: [
      { time: '۰۹:۰۰', title: 'طراحی تجربه و جریان کاربر', detail: 'تعریف صفحه‌ها، مسیر کاربر و قابلیت‌های ضروری محصول.', tag: 'Claude', icon: 'cursor' },
      { time: '۱۰:۱۵', title: 'Vibe Coding در عمل', detail: 'نوشتن خواسته با زبان ساده و ساخت نسخه‌ی اول محصول.', tag: 'Emergent', icon: 'code' },
      { time: '۱۳:۰۰', title: 'ظاهر، محتوا و هویت بصری', detail: 'اتصال تصاویر، متن‌ها و ویدیوی روز اول به صفحه‌ی محصول.', tag: 'Gemini + Content Kit', icon: 'image' },
      { time: '۱۵:۰۰', title: 'تست، اصلاح و انتشار', detail: 'تست سناریوهای واقعی، اصلاح با پرامپت و آماده‌سازی لینک دمو.', tag: 'Emergent', icon: 'tool' },
      { time: '۱۷:۱۵', title: 'دمو دی و نقشه‌ی ادامه', detail: 'نمایش خروجی نهایی، دریافت بازخورد و برنامه‌ی رشد پس از دوره.', tag: 'Launch Plan', icon: 'rocket' },
    ],
  },
};

const outcomes = [
  { title: 'سیستم تولید محتوا', description: 'سناریو، استوری‌بورد، تصاویر و یک ویدیوی کوتاه برای برند یا ایده‌ی خودتان.', icon: 'clapper' as IconName, accent: 'coral' },
  { title: 'وب‌سایت یا مینی‌اپ', description: 'یک محصول تعاملی منتشرشده؛ ساخته‌شده با توضیح شما، نه با نوشتن کد.', icon: 'globe' as IconName, accent: 'blue' },
  { title: 'Prompt Playbook', description: 'پرامپت‌های آزموده‌شده برای تکرار، توسعه و تحویل پروژه به مشتری.', icon: 'spark' as IconName, accent: 'purple' },
];

// ─── NEW: Modules Data ───────────────────────────────────────────────────────
const modules = [
  {
    num: '۰۱', color: 'blue', icon: 'brain' as IconName,
    title: 'Prompt Engineering',
    desc: 'یاد می‌گیری پرامپت‌هایی بنویسی که هر بار خروجی دقیق، قابل تکرار و قابل فروش تحویل بدهند.',
    tags: ['Gemini', 'Claude', 'System Prompt'],
  },
  {
    num: '۰۲', color: 'coral', icon: 'clapper' as IconName,
    title: 'AI Content Engine',
    desc: 'یک خط تولید محتوا برای برند یا پروژه‌ات می‌سازی: از ایده تا متن، از متن تا ویدیو.',
    tags: ['Higgsfield', 'Kling AI', 'Storyboard'],
  },
  {
    num: '۰۳', color: 'purple', icon: 'code' as IconName,
    title: 'Vibe Coding',
    desc: 'با زبان ساده و بدون یک خط کد، نسخه‌ی اول محصول دیجیتالت را در همان روز لانچ می‌کنی.',
    tags: ['Emergent', 'No-Code', 'Live Deploy'],
  },
  {
    num: '۰۴', color: 'green', icon: 'layers' as IconName,
    title: 'Visual Storytelling',
    desc: 'استوری‌بورد و داستان بصری پروژه‌ات را با AI می‌سازی و به صفحات محصولت وصل می‌کنی.',
    tags: ['AI Studio', 'Claude', 'Brand Kit'],
  },
  {
    num: '۰۵', color: 'pink', icon: 'chart' as IconName,
    title: 'Campaign Strategy',
    desc: 'مسیر تبدیل مخاطب به مشتری را طراحی می‌کنی؛ با استفاده از AI برای تحلیل و تصمیم.',
    tags: ['Claude', 'Gemini', 'Funnel Design'],
  },
  {
    num: '۰۶', color: 'yellow', icon: 'rocket' as IconName,
    title: 'Launch & Grow',
    desc: 'پروژه‌ات را منتشر می‌کنی، بازخورد واقعی می‌گیری و نقشه‌ی رشد بعد از دوره را می‌سازی.',
    tags: ['Demo Day', 'Feedback', 'Growth Plan'],
  },
];

// ─── NEW: FAQ Data ────────────────────────────────────────────────────────────
const faqs = [
  { q: 'آیا نیاز به دانش برنامه‌نویسی دارم؟', a: 'نه. VibeLab دقیقاً برای کسانی طراحی شده که می‌خواهند بسازند اما کد بلد نیستند. تمام ابزارها با زبان طبیعی کار می‌کنند.' },
  { q: 'خروجی نهایی دوره چیست؟', a: 'یک سیستم تولید محتوا (استوری‌بورد + ویدیو) و یک وب‌سایت یا مینی‌اپ واقعی منتشرشده با لینک دمو.' },
  { q: 'آیا می‌توانم به‌صورت آنلاین شرکت کنم؟', a: 'بله. دوره به‌صورت حضوری و آنلاین هم‌زمان برگزار می‌شود. شرکت‌کنندگان آنلاین به همه‌ی ابزارها و جلسات دسترسی کامل دارند.' },
  { q: 'ابزارها رایگان هستند؟', a: 'بیشتر ابزارها پلن رایگان دارند. در دوره یاد می‌گیری چه پلنی برای هر مرحله کافی است و کجا ارتقا لازم است.' },
  { q: 'بعد از دوره چه اتفاقی می‌افتد؟', a: 'به گروه آکادمی VibeLab دسترسی داری، Prompt Playbook شخصی‌ات را داری و می‌توانی از مسیر رشد پیشنهادی استفاده کنی.' },
  { q: 'ظرفیت دوره چقدر است؟', a: 'حداکثر ۳۰ نفر برای بازخورد شخصی واقعی. ثبت‌نام زودهنگام ضروری است.' },
];

// ─── NEW: Testimonials ────────────────────────────────────────────────────────
const testimonials = [
  {
    text: 'قبل از VibeLab فکر می‌کردم ساختن یه وب‌اپ یعنی باید کد یاد بگیرم. اما اول دوره با Emergent لندینگ خودم رو داشتم!',
    name: 'سارا محمدی', role: 'طراح گرافیک', initial: 'س', color: '#8c64e9',
  },
  {
    text: 'کمپین محتوایی‌ام رو با Higgsfield و Kling ساختم. کیفیتی که می‌دن باورنکردنیه. بهترین ۲ روزی بود که سرمایه‌گذاری کردم.',
    name: 'علی رضایی', role: 'فریلنسر مارکتینگ', initial: 'ع', color: '#5368ea',
  },
  {
    text: 'Prompt Playbook‌ای که ساختیم رو الان هر روز توی کارم استفاده می‌کنم. وقت تولید محتوام ۷۰٪ کم شده.',
    name: 'نیلوفر احمدی', role: 'مدیر محتوا', initial: 'ن', color: '#38b58a',
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string; key?: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={`faq-${q.substring(0, 5)}`} className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <Icon name="chevron-down" size={18} />
      </button>
      <div className="faq-answer">{a}</div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<DayKey>('one');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('vibelab-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'aurora' || saved === 'rose') setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem('vibelab-theme', theme);
  }, [theme]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
      }
    } catch { /* ignore */ }
    setTimeout(() => setShareStatus('idle'), 3000);
  };

  const navItems = [
    { href: '#tools', label: 'جعبه‌ابزار AI' },
    { href: '#modules', label: 'ماژول‌ها' },
    { href: '#syllabus', label: 'طرح درس' },
    { href: '#outcomes', label: 'خروجی‌ها' },
    { href: '#faq', label: 'سؤالات' },
  ];

  const currentPlan = plans[activeDay];

  return (
    <main dir="rtl" className={`vibe-site ${theme}`}>
      {/* Background Atmospheric Glows from Immersive UI theme */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* ─── HEADER ─── */}
      <header id="app-header" className="vibe-header">
        <div className="vibe-container vibe-nav-row">
          {/* Brand */}
          <a href="#top" className="vibe-brand">
            <div className="vibe-logo">
              <i>V</i>
              <b />
            </div>
            <span>
              <strong>VibeLab</strong>
              <small>AI BOOTCAMP</small>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="vibe-desktop-nav">
            {navItems.map(item => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className="vibe-nav-actions">
            {/* Theme Picker */}
            <div className="site-theme-picker">
              <button className={`dark-dot${theme === 'dark' ? ' active' : ''}`} onClick={() => setTheme('dark')} title="تم تیره" />
              <button className={`light-dot${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')} title="تم روشن" />
              <button className={`aurora-dot${theme === 'aurora' ? ' active' : ''}`} onClick={() => setTheme('aurora')} title="اورورا" />
              <button className={`rose-dot${theme === 'rose' ? ' active' : ''}`} onClick={() => setTheme('rose')} title="رز" />
            </div>

            {/* Share */}
            <button className="share-button" onClick={handleShare}>
              <Icon name={shareStatus === 'copied' ? 'check' : 'copy'} size={14} />
              {shareStatus === 'copied' ? 'کپی شد!' : 'کپی لینک'}
            </button>

            {/* Mobile Menu Toggle */}
            <button className="icon-button vibe-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name={menuOpen ? 'x' : 'menu'} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="vibe-mobile-nav" style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'var(--header)', backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--line)', zIndex: 50,
            padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            {navItems.map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                padding: '10px 0', fontSize: '13px', fontWeight: 700,
                color: 'var(--muted)', borderBottom: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {item.label}
                <Icon name="arrow" size={15} />
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* ─── HERO ─── */}
      <div id="top" className="vibe-hero">
        <div className="hero-grid" />
        <div className="hero-light hero-light-a" />
        <div className="hero-light hero-light-b" />

        <div className="vibe-container vibe-hero-layout">
          {/* Copy */}
          <div className="hero-copy">
            <div className="vibe-pill">
              <i />
              ماراتن عملی حضوری / آنلاین
            </div>
            <h1>
              ایده‌ات را به <span>محتوا و وب‌اپ</span><br />
              تبدیل کن؛ بدون نوشتن کد.
            </h1>
            <p>
              یک تجربه‌ی فشرده‌ی دو روزه برای ساختن با AI. از سناریو و ویدیو تا یک وب‌سایت
              یا مینی‌اپ واقعی؛ فقط با زبان خودت و ابزارهای درست.
            </p>
            <div className="hero-cta-row">
              <a href="#enroll" className="vibe-primary">
                <Icon name="rocket" size={17} />
                رزرو جایگاه
                <Icon name="arrow" size={15} />
              </a>
              <a href="#syllabus" className="vibe-secondary">
                <Icon name="calendar" size={16} />
                مشاهده‌ی طرح درس
              </a>
            </div>
            <div className="hero-trust">
              <span><Icon name="calendar" size={13} /><b>۲ روز</b> / ۱۶ ساعت</span>
              <i />
              <span><Icon name="tool" size={13} /><b>۶ ابزار AI</b></span>
              <i />
              <span><Icon name="users" size={13} /><b>ظرفیت ۳۰ نفر</b></span>
            </div>
          </div>

          {/* Workspace Card */}
          <div className="hero-workspace">
            <div className="workspace-glow" />
            <div className="workflow-card">
              <div className="workflow-card-top">
                <div className="workflow-dots"><i /><i /><i /></div>
                <b>MY VIBE PROJECT</b>
                <span>•••</span>
              </div>
              <div className="workflow-title">
                <div>
                  <small>یک ایده، دو خروجی</small>
                  <b>کافه‌ی سبزِ من</b>
                </div>
                <em>در حال ساخت</em>
              </div>
              <div className="workflow-path">
                <span>
                  <span style={{ color: '#94a4ff' }}><Icon name="brain" size={16} /></span>
                  <b>ایده</b>
                  <small>Gemini</small>
                </span>
                <i />
                <span>
                  <span style={{ color: '#f5a764' }}><Icon name="clapper" size={16} /></span>
                  <b>محتوا</b>
                  <small>Higgsfield</small>
                </span>
                <i />
                <span>
                  <span style={{ color: '#7dffc5' }}><Icon name="globe" size={16} /></span>
                  <b>وب‌اپ</b>
                  <small>Emergent</small>
                </span>
              </div>
              <div className="workflow-preview">
                <div className="preview-badge">GOOD<br />THINGS<br />GROW</div>
                <div>
                  <small>خروجی آماده</small>
                  <b>لندینگ + ویدیوی کمپین</b>
                </div>
              </div>
              <div className="workflow-card-foot">
                <span>
                  <Icon name="check" size={13} />
                  ۴ وظیفه انجام شد
                </span>
                <b>مشاهده‌ی پروژه <Icon name="arrow" size={12} /></b>
              </div>
            </div>

            <div className="hero-floating-tag hero-tag-claude">
              <strong>✦ Claude</strong>
              <small>Strategize</small>
            </div>
            <div className="hero-floating-tag hero-tag-emergent">
              <strong>&lt;/&gt; Emergent</strong>
              <small>Build it</small>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="vibe-container" style={{ paddingBottom: '32px' }}>
          <div className="hero-metrics">
            <div className="hero-metric">
              <b>۰</b>
              <span>خط کد لازم نیست</span>
            </div>
            <div className="hero-metric">
              <b>۲</b>
              <span>خروجی واقعی نهایی</span>
            </div>
            <div className="hero-metric">
              <b>۶</b>
              <span>ابزار حرفه‌ای AI</span>
            </div>
            <div className="hero-metric">
              <b>۱</b>
              <span>پروژه از خود شما</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TOOLS SECTION ─── */}
      <div id="tools" className="tools-section">
        <div className="vibe-container">
          <div className="section-intro centered">
            <p className="vibe-eyebrow"><Icon name="tool" size={14} /> روی ابزارها مسلط می‌شویم</p>
            <h2>جعبه‌ابزار یک <span>Vibe Maker</span></h2>
            <p>
              اینجا قرار نیست ابزارها را حفظ کنید؛ یاد می‌گیرید چگونه آن‌ها را
              در یک خط تولید واقعی کنار هم بچینید.
            </p>
          </div>

          <div className="tool-grid">
            {toolStack.map((tool, idx) => (
              <article key={tool.name} className={`tool-card ${tool.tone}`}>
                <div className="tool-card-header">
                  <div className="tool-mark">{tool.short}</div>
                  <span className="tool-number">۰{idx + 1}</span>
                </div>
                <div className="tool-card-label">{tool.label}</div>
                <h3>{tool.name}</h3>
                <p>{tool.copy}</p>
              </article>
            ))}
          </div>

          <div className="tool-note">
            <b>ترکیب، مهم‌تر از ابزار است.</b> یاد می‌گیرید از Claude برای فکر کردن،
            از Gemini برای ایده‌پردازی، از Higgsfield و Kling برای روایت تصویری
            و از Emergent برای ساخت محصول استفاده کنید.
          </div>
        </div>
      </div>

      {/* ─── BUILD / DUAL TRACK SECTION ─── */}
      <div className="build-section">
        <div className="vibe-container build-layout">
          <div className="build-copy">
            <p className="vibe-eyebrow coral"><Icon name="bolt" size={14} /> یک جریان کار، دو مسیر</p>
            <h2>محتوا و محصول را<br /><span>جدا یاد نمی‌گیری.</span></h2>
            <p>
              در بازار امروز، وب‌سایت بدون داستان دیده نمی‌شود و محتوا بدون مقصد
              تبدیل نمی‌کند. در VibeLab این دو را با هم می‌سازید.
            </p>
            <div className="build-checks">
              <span><i><Icon name="check" size={11} /></i> پرامپت‌ها را به فرآیند تکرارپذیر تبدیل می‌کنیم</span>
              <span><i><Icon name="check" size={11} /></i> محتوا را به صفحه و تجربه‌ی قابل تبدیل وصل می‌کنیم</span>
              <span><i><Icon name="check" size={11} /></i> در پایان، یک لینک واقعی برای ارائه دارید</span>
            </div>
          </div>

          <div className="dual-lab">
            <article className="lab-card content-lab">
              <div className="lab-icon"><Icon name="clapper" size={22} /></div>
              <p>TRACK 01</p>
              <h3>Content Engine</h3>
              <ul>
                <li>ایده و پیام برند</li>
                <li>سناریو و استوری‌بورد</li>
                <li>ویدیوی AI با Kling / Higgsfield</li>
              </ul>
              <span className="lab-result">خروجی: Content Kit</span>
            </article>

            <article className="lab-card product-lab">
              <div className="lab-icon"><Icon name="globe" size={22} /></div>
              <p>TRACK 02</p>
              <h3>Vibe Product</h3>
              <ul>
                <li>معماری تجربه و صفحه‌ها</li>
                <li>ساخت با زبان طبیعی</li>
                <li>تست و انتشار نسخه‌ی اول</li>
              </ul>
              <span className="lab-result">خروجی: Live Web App</span>
            </article>

            <div className="lab-final">
              <div className="lab-final-icon"><Icon name="rocket" size={20} /></div>
              <div>
                <small>ترکیب نهایی</small>
                <b>کمپین + محصول قابل ارائه</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODULES SECTION (NEW) ─── */}
      <div id="modules" className="modules-section">
        <div className="vibe-container">
          <div className="section-intro">
            <p className="vibe-eyebrow purple"><Icon name="layers" size={14} /> ماژول‌های دوره</p>
            <h2>۶ ماژول، <span>یک پروژه‌ی واقعی</span></h2>
            <p>
              هر ماژول یک قطعه از پازل پروژه‌ی نهایی‌ات است.
              با پایان هر روز، یک خروجی ملموس در دست داری.
            </p>
          </div>

          <div className="modules-grid">
            {modules.map(mod => (
              <article key={mod.num} className="module-card">
                <div className="module-card-icon" style={{
                  background: mod.color === 'blue' ? 'rgba(59, 130, 246, 0.12)' :
                    mod.color === 'coral' ? 'rgba(249, 115, 22, 0.12)' :
                    mod.color === 'purple' ? 'rgba(139, 92, 246, 0.12)' :
                    mod.color === 'green' ? 'rgba(16, 185, 129, 0.12)' :
                    mod.color === 'pink' ? 'rgba(236, 72, 153, 0.12)' :
                    'rgba(234, 179, 8, 0.12)',
                  color: mod.color === 'blue' ? 'var(--blue)' :
                    mod.color === 'coral' ? 'var(--coral)' :
                    mod.color === 'purple' ? 'var(--purple)' :
                    mod.color === 'green' ? 'var(--green)' :
                    mod.color === 'pink' ? 'var(--pink)' :
                    'var(--yellow)',
                }}>
                  <Icon name={mod.icon} size={22} />
                </div>
                <div className="module-card-num">MODULE {mod.num}</div>
                <h3>{mod.title}</h3>
                <p>{mod.desc}</p>
                <div className="module-card-tags">
                  {mod.tags.map(t => <span key={t} className="module-tag">{t}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SYLLABUS ─── */}
      <div id="syllabus" className="syllabus-section">
        <div className="vibe-container">
          <div className="syllabus-heading">
            <div>
              <p className="vibe-eyebrow"><Icon name="calendar" size={14} /> طرح درس شفاف و عملی</p>
              <h2>دو روز برای ساختن<br /><span>اولین خروجی جدی شما</span></h2>
            </div>
            <p>هر بخش با یک ابزار مشخص، تمرین در لحظه و یک قطعه از پروژه‌ی نهایی پیش می‌رود.</p>
          </div>

          <div className="day-tabs">
            <button
              className={`day-tab${activeDay === 'one' ? ' active' : ''}`}
              onClick={() => setActiveDay('one')}
            >
              روز اول — Content Engine
            </button>
            <button
              className={`day-tab${activeDay === 'two' ? ' active' : ''}`}
              onClick={() => setActiveDay('two')}
            >
              روز دوم — Vibe Product
            </button>
          </div>

          <div className="lesson-card">
            <div className="lesson-header">
              <div>
                <span>برنامه‌ی {activeDay === 'one' ? 'روز اول' : 'روز دوم'}</span>
                <h3>{currentPlan.title}</h3>
                <p>{currentPlan.description}</p>
              </div>
              <div className="lesson-hours">
                <Icon name="calendar" size={18} />
                <b>{currentPlan.date}</b>
                <small>با استراحت و کلینیک پروژه</small>
              </div>
            </div>

            <div className="lesson-list">
              {currentPlan.items.map((item, idx) => (
                <article key={item.time} className="lesson-item">
                  <time>{item.time}</time>
                  <div className={`lesson-icon${idx === 0 ? ' first' : ''}`}>
                    <Icon name={item.icon} size={17} />
                  </div>
                  <div className="lesson-copy">
                    <div>
                      <h4>{item.title}</h4>
                      <em>{item.tag}</em>
                    </div>
                    <p>{item.detail}</p>
                  </div>
                  <span className="lesson-order">۰{idx + 1}</span>
                </article>
              ))}
            </div>

            <div className="lesson-note">
              <Icon name="spark" size={16} />
              <span><b>پروژه‌ی شخصی‌ات را بیاور.</b> در تمام تمرین‌ها روی ایده، کسب‌وکار یا نمونه‌کار خودت کار می‌کنی.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TESTIMONIALS (NEW) ─── */}
      <div className="testimonials-section">
        <div className="vibe-container">
          <div className="section-intro centered">
            <p className="vibe-eyebrow green"><Icon name="star" size={14} /> نظر شرکت‌کنندگان</p>
            <h2>چه کسانی <span>VibeLab</span> را توصیه می‌کنند؟</h2>
          </div>
          <div className="testi-grid">
            {testimonials.map(t => (
              <div key={t.name} className="testi-card">
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star" size={14} />)}
                </div>
                <p className="testi-text">«{t.text}»</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: t.color }}>{t.initial}</div>
                  <div className="testi-author-info">
                    <b>{t.name}</b>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── OUTCOMES ─── */}
      <div id="outcomes" className="outcomes-section">
        <div className="vibe-container">
          <div className="section-intro centered">
            <p className="vibe-eyebrow coral"><Icon name="target" size={14} /> فقط آموزش نیست</p>
            <h2>در پایان چه چیزی <span>دستت است؟</span></h2>
          </div>

          <div className="outcome-grid">
            {outcomes.map((o, idx) => (
              <article key={o.title} className={`outcome-card ${o.accent}`}>
                <span className="outcome-number">۰{idx + 1}</span>
                <div className="outcome-icon">
                  <span><Icon name={o.icon} size={24} /></span>
                </div>
                <h3>{o.title}</h3>
                <p>{o.description}</p>
                <span className="outcome-line" />
              </article>
            ))}
          </div>

          <div className="share-strip">
            <b>لینک این صفحه را برای شریک یا هم‌تیمی‌ات بفرست.</b>
            <p>روی «کپی لینک» بزن؛ لینک همین صفحه در کلیپ‌بوردت قرار می‌گیرد.</p>
            <button className="share-button" onClick={handleShare} style={{ margin: '0 auto' }}>
              <Icon name={shareStatus === 'copied' ? 'check' : 'share'} size={14} />
              {shareStatus === 'copied' ? 'کپی شد! ✓' : 'کپی لینک صفحه'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── FAQ (NEW) ─── */}
      <div id="faq" className="faq-section">
        <div className="vibe-container faq-layout">
          <div className="faq-copy">
            <p className="vibe-eyebrow green"><Icon name="message" size={14} /> سؤالات متداول</p>
            <h2>همه چیز درباره‌ی<br /><span>VibeLab</span></h2>
            <p>اگر سؤالی داری که اینجا نیست، از طریق گروه تلگرام بپرس.</p>
          </div>
          <div className="faq-list">
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* ─── ENROLL ─── */}
      <div id="enroll" className="enroll-section">
        <div className="vibe-container" style={{ textAlign: 'center' }}>
          <div className="enroll-mini-logo">V</div>
          <h2>با یک ایده وارد شو؛<br />با یک <span>لینک واقعی</span> بیرون برو.</h2>
          <p>
            VibeLab برای تولیدکننده‌ها، فریلنسرها، صاحبان کسب‌وکار و هر کسی است
            که می‌خواهد با هوش مصنوعی سریع‌تر بسازد.
          </p>
          <div className="enroll-actions">
            <a href="https://t.me/+TrS3ViVv_zn3c8ls" className="enroll-button" target="_blank" rel="noreferrer">
              رزرو جایگاه و سنجش مسیر
              <Icon name="arrow" size={17} />
            </a>
            <a href="https://t.me/+TrS3ViVv_zn3c8ls" className="enroll-telegram" target="_blank" rel="noreferrer">
              <Icon name="share" size={16} />
              پیوستن به گروه آکادمی
            </a>
          </div>
          <div className="enroll-trust">
            <span><Icon name="users" size={14} /> ظرفیت محدود برای بازخورد واقعی</span>
            <span><Icon name="globe" size={14} /> قابل شرکت به‌صورت آنلاین</span>
            <span><Icon name="award" size={14} /> گواهی‌نامه‌ی پایان دوره</span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer id="app-footer" className="vibe-footer">
        <div className="vibe-container footer-row">
          <p>© ۱۴۰۴ VibeLab — ساخته‌شده با ❤️ و AI</p>
          <div className="footer-links">
            <a href="#tools">ابزارها</a>
            <a href="#modules">ماژول‌ها</a>
            <a href="#syllabus">طرح درس</a>
            <a href="#faq">سؤالات</a>
            <a href="https://t.me/+TrS3ViVv_zn3c8ls" target="_blank" rel="noreferrer">تلگرام</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
