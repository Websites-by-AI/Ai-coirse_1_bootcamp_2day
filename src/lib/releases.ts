export type ReleaseNote = {
  version: string;
  date: string;
  current?: boolean;
  title: string;
  changes: string[];
  sourceRef: string;
};

export const APP_RELEASES: ReleaseNote[] = [
  {
    version: "v1.9.0",
    date: "۱۴۰۵/۰۴/۲۱",
    current: true,
    title: "Admin Recovery, AI Setup & Theme Pack",
    changes: [
      "ورود مستقیم و قابل‌کلیک حساب دمو ادمین اضافه شد.",
      "مرکز راه‌اندازی Vercel، Cloudflare، SMTP و AI Provider به پنل افزوده شد.",
      "تاریخچه نسخه‌ها و وضعیت GitHub به پنل اضافه شد.",
      "تم‌های رنگی سایت به حالت‌های روشن، شفق و رز اضافه شد."],
    sourceRef: "workspace / release-v1.9.0",
  },
  {
    version: "v1.8.0",
    date: "۱۴۰۵/۰۴/۲۱",
    title: "Portfolio, Resume & Project Analysis",
    changes: ["پنل پروژه و قیمت‌گذاری اضافه شد.", "پروفایل عمومی، رزومه، upload و outbox ایمیل اضافه شد.", "اسکرین‌شات نسخه آنلاین پروژه و اسکن GitHub اضافه شد."],
    sourceRef: "workspace / release-v1.8.0",
  },
  {
    version: "v1.7.0",
    date: "۱۴۰۵/۰۴/۲۱",
    title: "User Journey & AI Fit Scanner",
    changes: ["ثبت‌نام و ورود کاربر اضافه شد.", "تحلیل مناسب‌بودن کاربر و fallback آموزشی اضافه شد.", "کنترل‌سنتر API، token و هشدارها اضافه شد."],
    sourceRef: "workspace / release-v1.7.0",
  },
];

export function githubRepositoryUrl() {
  const configured = process.env.GITHUB_REPOSITORY_URL?.trim();
  return configured?.startsWith("https://github.com/") ? configured : null;
}
