'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'aurora' | 'rose';
type DayKey = 'one' | 'two';
type ShareStatus = 'idle' | 'copied' | 'shared' | 'temporary';
type IconName = 'arrow' | 'bolt' | 'brain' | 'calendar' | 'check' | 'chevron' | 'circle' | 'clapper' | 'code' | 'copy' | 'cursor' | 'globe' | 'image' | 'layers' | 'link' | 'menu' | 'moon' | 'play' | 'rocket' | 'share' | 'spark' | 'sun' | 'target' | 'tool' | 'users' | 'wand' | 'x';

const icons: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z" />,
  brain: <><path d="M9.5 4.5a3 3 0 0 1 5 0 3.5 3.5 0 0 1 4.3 4.5 3.5 3.5 0 0 1-.5 6.7A3.5 3.5 0 0 1 15 20H9a3.5 3.5 0 0 1-3.3-4.3 3.5 3.5 0 0 1-.5-6.7A3.5 3.5 0 0 1 9.5 4.5Z" /><path d="M12 4v16m-4-8h8M8.5 8.5 12 12l3.5-3.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  circle: <circle cx="12" cy="12" r="8" />,
  clapper: <><path d="M4 7h16v13H4zM4 7l3-4h13v4M4 12h16M9 3l3 4m2-4 3 4" /></>,
  code: <><path d="m8 9-3 3 3 3m8-6 3 3-3 3" /><path d="M14 5 10 19" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  cursor: <path d="m5 3 13 8-6 1 3 6-3 2-3-6-4 4V3Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 16-5-5L5 20" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.2-1.2" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
  play: <path d="m9 7 7 5-7 5V7Z" />,
  rocket: <><path d="M14 4c2.3-2.3 5.3-2 6-2-.1.7.3 3.7-2 6l-7 7-5-5 8-6Z" /><path d="M9 12 5 12l-2 3 5 1M12 15v4l-3 2-1-5" /><circle cx="15" cy="7" r="1" /></>,
  share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5m-8 7 8 5" /></>,
  spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2" /></>,
  tool: <><path d="m14.7 6.3 3-3 3 3-3 3" /><path d="m17.7 6.3-8.4 8.4-4-4-2 2 4 4-3 3 3 3 3-3 4 4 2-2-4-4 8.4-8.4" /></>,
  users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20" /><circle cx="9.5" cy="7" r="3.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8m5 8.7v-1.5a3.5 3.5 0 0 0-2.6-3.4" /></>,
  wand: <><path d="m4 20 11-11M14 4l1 2m2 1 2 1m-8-3 1 2m2 1 2 1" /><path d="m5 14-1 1m3 2-1 1m-3-7 2 1" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

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

export default function AcademyHome() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<DayKey>('one');
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    const saved = window.localStorage.getItem('vibelab-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'aurora' || saved === 'rose') setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    window.localStorage.setItem('vibelab-theme', theme);
  }, [theme]);

  const sharePage = async () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.hash = '';
    currentUrl.search = '';
    const url = currentUrl.toString();
    const isTemporaryPreview = currentUrl.hostname.endsWith('.e2b.app');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VibeLab | ماراتن AI بدون کد', text: 'ماراتن ۲ روزه‌ی ساخت محتوا و وب‌اپ با هوش مصنوعی', url });
        setShareStatus(isTemporaryPreview ? 'temporary' : 'shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareStatus(isTemporaryPreview ? 'temporary' : 'copied');
      } else {
        window.prompt('لینک جاری صفحه را کپی کنید:', url);
        setShareStatus(isTemporaryPreview ? 'temporary' : 'copied');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus(isTemporaryPreview ? 'temporary' : 'copied');
      } catch {
        setShareStatus('idle');
      }
    }
    window.setTimeout(() => setShareStatus('idle'), 3500);
  };

  const navItems = [
    { href: '#tools', label: 'جعبه‌ابزار AI' },
    { href: '#syllabus', label: 'طرح درس دو روزه' },
    { href: '#outcomes', label: 'خروجی‌های شما' },
    { href: '/panel', label: 'پنل کاربر' },
  ];
  const currentPlan = plans[activeDay];

  return (
    <main dir="rtl" className={`vibe-site ${theme}`}>
      <header className="vibe-header">
        <div className="vibe-container vibe-nav-row">
          <a href="#top" className="vibe-brand" aria-label="VibeLab نورا">
            <span className="vibe-logo"><i>V</i><b /></span>
            <span><strong>VibeLab</strong><small>BY NOORA ACADEMY</small></span>
          </a>
          <nav className="vibe-desktop-nav" aria-label="ناوبری اصلی">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="vibe-nav-actions">
            <button className="share-button" onClick={sharePage} aria-label="اشتراک‌گذاری لینک صفحه"><Icon name={shareStatus === 'idle' ? 'share' : 'check'} size={16} /><span>{shareStatus === 'temporary' ? 'لینک preview موقت است' : shareStatus === 'shared' ? 'به‌اشتراک گذاشته شد' : shareStatus === 'copied' ? 'لینک کپی شد' : 'اشتراک لینک'}</span></button>
            <div className="site-theme-picker" aria-label="انتخاب تم سایت"><button className={theme === 'dark' ? 'active dark-dot' : 'dark-dot'} onClick={() => setTheme('dark')} title="تم شب" aria-label="تم شب" /><button className={theme === 'light' ? 'active light-dot' : 'light-dot'} onClick={() => setTheme('light')} title="تم روشن" aria-label="تم روشن" /><button className={theme === 'aurora' ? 'active aurora-dot' : 'aurora-dot'} onClick={() => setTheme('aurora')} title="تم شفق" aria-label="تم شفق" /><button className={theme === 'rose' ? 'active rose-dot' : 'rose-dot'} onClick={() => setTheme('rose')} title="تم رز" aria-label="تم رز" /></div>
            <button className="icon-button vibe-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="نمایش منو" aria-expanded={menuOpen}><Icon name={menuOpen ? 'x' : 'menu'} size={20} /></button>
          </div>
        </div>
        {menuOpen && <nav className="vibe-mobile-nav">{navItems.map((item) => <a href={item.href} onClick={() => setMenuOpen(false)} key={item.href}>{item.label}<Icon name="arrow" size={16} /></a>)}<button onClick={sharePage}><Icon name="share" size={16} /> اشتراک‌گذاری صفحه</button></nav>}
      </header>

      <section id="top" className="vibe-hero">
        <div className="hero-grid" /><div className="hero-light hero-light-a" /><div className="hero-light hero-light-b" />
        <div className="vibe-container vibe-hero-layout">
          <div className="hero-copy">
            <div className="vibe-pill"><i /> ماراتن عملی حضوری / آنلاین</div>
            <h1>ایده‌ات را به <span>محتوا و وب‌اپ</span><br />تبدیل کن؛ بدون نوشتن کد.</h1>
            <p>یک تجربه‌ی فشرده‌ی دو روزه برای ساختن با AI. از سناریو و ویدیو تا یک وب‌سایت یا مینی‌اپ واقعی؛ فقط با زبان خودت و ابزارهای درست.</p>
            <div className="hero-cta-row"><a className="vibe-primary" href="/register"><Icon name="rocket" size={18} /> ثبت‌نام و سنجش مسیر <Icon name="arrow" size={18} /></a><button className="vibe-secondary" onClick={sharePage}><Icon name="link" size={17} /> ارسال برای هم‌تیمی</button></div>
            <div className="hero-trust"><span><Icon name="calendar" size={16} /><b>۲ روز کامل</b> / ۱۶ ساعت ساخت</span><i /><span><Icon name="tool" size={16} /><b>۶ ابزار AI</b> / یک گردش‌کار</span></div>
          </div>
          <div className="hero-workspace" aria-label="نمایش گردش‌کار ابزارهای هوش مصنوعی">
            <div className="workspace-glow" />
            <div className="orbit orbit-one"><span>Claude</span><span>Gemini</span></div>
            <div className="orbit orbit-two"><span>Kling</span><span>Higgsfield</span></div>
            <div className="workflow-card">
              <div className="workflow-top"><span className="workflow-dots"><i /><i /><i /></span><b>MY VIBE PROJECT</b><span>•••</span></div>
              <div className="workflow-body">
                <div className="workflow-title"><span className="mini-spark"><Icon name="spark" size={18} /></span><div><small>یک ایده، دو خروجی</small><b>کافه‌ی سبزِ من</b></div><em>در حال ساخت</em></div>
                <div className="workflow-path"><div className="path-step complete"><span><Icon name="brain" size={16} /></span><b>ایده</b><small>Gemini</small></div><i /><div className="path-step complete"><span><Icon name="clapper" size={16} /></span><b>محتوا</b><small>Higgsfield</small></div><i /><div className="path-step current"><span><Icon name="globe" size={16} /></span><b>وب‌اپ</b><small>Emergent</small></div></div>
                <div className="workflow-preview"><div className="coffee-photo"><span>GOOD<br />THINGS<br />GROW</span></div><div><small>خروجی آماده</small><b>لندینگ + ویدیوی کمپین</b><p><i /><i /><i /><i /></p></div></div>
              </div>
              <div className="workflow-bottom"><span><Icon name="check" size={14} /> ۴ وظیفه انجام شد</span><b>مشاهده‌ی پروژه <Icon name="arrow" size={14} /></b></div>
            </div>
            <div className="floating-tool tool-claude"><strong>✦</strong><span>Claude<br /><small>Strategize</small></span></div>
            <div className="floating-tool tool-emergent"><strong>&lt;/&gt;</strong><span>Emergent<br /><small>Build it</small></span></div>
          </div>
        </div>
        <div className="vibe-container hero-metrics"><div><b>۰</b><span>خط کد لازم نیست</span></div><div><b>۲</b><span>خروجی واقعی نهایی</span></div><div><b>۶</b><span>ابزار حرفه‌ای AI</span></div><div><b>۱</b><span>پروژه از خود شما</span></div></div>
      </section>

      <section id="tools" className="tools-section">
        <div className="vibe-container">
          <div className="section-intro centered"><div className="vibe-eyebrow"><Icon name="tool" size={15} /> روی ابزارها مسلط می‌شویم</div><h2>جعبه‌ابزار یک <span>Vibe Maker</span></h2><p>اینجا قرار نیست ابزارها را حفظ کنید؛ یاد می‌گیرید چگونه آن‌ها را در یک خط تولید واقعی کنار هم بچینید.</p></div>
          <div className="tool-grid">{toolStack.map((tool, index) => <article className={`tool-card ${tool.tone}`} key={tool.name}><div className="tool-card-top"><span className="tool-mark">{tool.short}</span><span className="tool-number">۰{index + 1}</span></div><div className="tool-icon"><Icon name={tool.icon} size={21} /></div><p>{tool.label}</p><h3>{tool.name}</h3><span className="tool-rule" /><small>{tool.copy}</small></article>)}</div>
          <div className="tool-note"><span><Icon name="layers" size={19} /></span><p><b>ترکیب، مهم‌تر از ابزار است.</b> یاد می‌گیرید از Claude برای فکر کردن، از Gemini برای ایده‌پردازی، از Higgsfield و Kling برای روایت تصویری و از Emergent برای ساخت محصول استفاده کنید.</p></div>
        </div>
      </section>

      <section className="build-section">
        <div className="vibe-container build-layout">
          <div className="build-copy"><div className="vibe-eyebrow coral"><Icon name="bolt" size={15} /> یک جریان کار، دو مسیر</div><h2>محتوا و محصول را<br /><span>جدا یاد نمی‌گیری.</span></h2><p>در بازار امروز، وب‌سایت بدون داستان دیده نمی‌شود و محتوا بدون مقصد تبدیل نمی‌کند. در VibeLab این دو را با هم می‌سازید.</p><div className="build-checks"><span><i><Icon name="check" size={13} /></i> پرامپت‌ها را به فرآیند تکرارپذیر تبدیل می‌کنیم</span><span><i><Icon name="check" size={13} /></i> محتوا را به صفحه و تجربه‌ی قابل تبدیل وصل می‌کنیم</span><span><i><Icon name="check" size={13} /></i> در پایان، یک لینک واقعی برای ارائه دارید</span></div></div>
          <div className="dual-lab"><div className="lab-connector"><i /><i /><i /></div><article className="lab-card content-lab"><span className="lab-icon"><Icon name="clapper" size={22} /></span><p>TRACK 01</p><h3>Content Engine</h3><ul><li>ایده و پیام برند</li><li>سناریو و استوری‌بورد</li><li>ویدیوی AI با Kling / Higgsfield</li></ul><span className="lab-result">خروجی: Content Kit</span></article><article className="lab-card product-lab"><span className="lab-icon"><Icon name="globe" size={22} /></span><p>TRACK 02</p><h3>Vibe Product</h3><ul><li>معماری تجربه و صفحه‌ها</li><li>ساخت با زبان طبیعی</li><li>تست و انتشار نسخه‌ی اول</li></ul><span className="lab-result">خروجی: Live Web App</span></article><div className="lab-final"><span><Icon name="rocket" size={17} /></span><div><small>ترکیب نهایی</small><b>کمپین + محصول قابل ارائه</b></div></div></div>
        </div>
      </section>

      <section id="syllabus" className="syllabus-section">
        <div className="vibe-container"><div className="syllabus-heading"><div><div className="vibe-eyebrow"><Icon name="calendar" size={15} /> طرح درس شفاف و عملی</div><h2>دو روز برای ساختن<br /><span>اولین خروجی جدی شما</span></h2></div><p>هر بخش با یک ابزار مشخص، تمرین در لحظه و یک قطعه از پروژه‌ی نهایی پیش می‌رود.</p></div>
          <div className="syllabus-tabs"><button className={activeDay === 'one' ? 'active' : ''} onClick={() => setActiveDay('one')}><span>۰۱</span><div><small>روز اول</small><b>محتوا و روایت تصویری</b></div><Icon name="clapper" size={20} /></button><button className={activeDay === 'two' ? 'active' : ''} onClick={() => setActiveDay('two')}><span>۰۲</span><div><small>روز دوم</small><b>وب‌اپ و Vibe Coding</b></div><Icon name="globe" size={20} /></button></div>
          <div className="lesson-card"><div className="lesson-header"><div><span>برنامه‌ی {activeDay === 'one' ? 'روز اول' : 'روز دوم'}</span><h3>{currentPlan.title}</h3><p>{currentPlan.description}</p></div><div className="lesson-hours"><Icon name="calendar" size={18} /><b>{currentPlan.date}</b><small>با استراحت و کلینیک پروژه</small></div></div><div className="lesson-list">{currentPlan.items.map((item, index) => <article className="lesson-item" key={item.time}><time>{item.time}</time><span className={`lesson-icon ${index === 0 ? 'first' : ''}`}><Icon name={item.icon} size={17} /></span><div className="lesson-copy"><div><h4>{item.title}</h4><em>{item.tag}</em></div><p>{item.detail}</p></div><span className="lesson-order">۰{index + 1}</span></article>)}</div><div className="lesson-footer"><span><Icon name="spark" size={17} /> <b>پروژه‌ی شخصی‌ات را بیاور.</b> در تمام تمرین‌ها روی ایده، کسب‌وکار یا نمونه‌کار خودت کار می‌کنی.</span><button onClick={() => setActiveDay(activeDay === 'one' ? 'two' : 'one')}>مشاهده‌ی {activeDay === 'one' ? 'روز دوم' : 'روز اول'} <Icon name="arrow" size={16} /></button></div></div>
        </div>
      </section>

      <section id="outcomes" className="outcomes-section">
        <div className="vibe-container"><div className="section-intro centered"><div className="vibe-eyebrow coral"><Icon name="target" size={15} /> فقط آموزش نیست</div><h2>در پایان چه چیزی <span>دستت است؟</span></h2></div><div className="outcome-grid">{outcomes.map((outcome, index) => <article className={`outcome-card ${outcome.accent}`} key={outcome.title}><span className="outcome-number">۰{index + 1}</span><span className="outcome-icon"><Icon name={outcome.icon} size={24} /></span><h3>{outcome.title}</h3><p>{outcome.description}</p><span className="outcome-line" /></article>)}</div><div className="share-strip"><div className="share-strip-icon"><Icon name="share" size={21} /></div><div><b>لینک این صفحه را برای شریک یا هم‌تیمی‌ات بفرست.</b><p>روی «کپی لینک» بزن؛ لینک همین صفحه در کلیپ‌بوردت قرار می‌گیرد.</p></div><button onClick={sharePage}><Icon name={shareStatus === 'idle' ? 'copy' : 'check'} size={17} /> {shareStatus === 'temporary' ? 'لینک preview موقت است' : shareStatus === 'copied' ? 'لینک کپی شد' : shareStatus === 'shared' ? 'ارسال شد' : 'کپی لینک صفحه'}</button></div></div>
      </section>

      <section className="enroll-section"><div className="enroll-orb orb-a" /><div className="enroll-orb orb-b" /><div className="vibe-container enroll-content"><span className="enroll-mini-logo">V</span><h2>با یک ایده وارد شو؛<br />با یک <span>لینک واقعی</span> بیرون برو.</h2><p>VibeLab برای تولیدکننده‌ها، فریلنسرها، صاحبان کسب‌وکار و هر کسی است که می‌خواهد با هوش مصنوعی سریع‌تر بسازد.</p><div className="enroll-actions"><a href="/register" className="enroll-button">رزرو جایگاه و سنجش مسیر <Icon name="arrow" size={18} /></a><a href="https://t.me/+TrS3ViVv_zn3c8ls" className="enroll-telegram" target="_blank" rel="noreferrer"><Icon name="share" size={17} /> پیوستن به گروه آکادمی</a></div><div className="enroll-features"><span><Icon name="users" size={15} /> ظرفیت محدود برای بازخورد واقعی</span><i /><span><Icon name="globe" size={15} /> قابل شرکت به‌صورت آنلاین</span></div></div></section>

      <footer className="vibe-footer"><div className="vibe-container footer-layout"><div><a href="#top" className="vibe-brand"><span className="vibe-logo"><i>V</i><b /></span><span><strong>VibeLab</strong><small>BY NOORA ACADEMY</small></span></a><p>ماراتن ساخت محتوا و محصول با هوش مصنوعی؛ بدون نیاز به کدنویسی.</p></div><div className="footer-columns"><div><b>مسیر ماراتن</b><a href="#tools">جعبه‌ابزار AI</a><a href="#syllabus">طرح درس دو روزه</a><a href="#outcomes">خروجی‌های نهایی</a></div><div><b>تلگرام آکادمی</b><a href="https://t.me/+TrS3ViVv_zn3c8ls" target="_blank" rel="noreferrer">گروه گفت‌وگو و همراهی</a><a href="https://t.me/+pzdlrF_TRDRjMmU0" target="_blank" rel="noreferrer">کانال اطلاع‌رسانی</a><a href="mailto:hello@noora.academy">hello@noora.academy</a><a href="tel:+982188885255" dir="ltr">۰۲۱ - ۸۸۸۸ ۵۲۵۵</a></div></div><button className="footer-share" onClick={sharePage}><Icon name="share" size={17} /> اشتراک‌گذاری سایت</button></div><div className="vibe-container footer-bottom"><span>© ۱۴۰۳ VibeLab by Noora Academy</span><span>ساخته‌شده برای کسانی که می‌خواهند بسازند.</span></div></footer>
    </main>
  );
}
