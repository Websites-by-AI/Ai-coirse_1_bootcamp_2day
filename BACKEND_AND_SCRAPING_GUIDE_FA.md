# راهنمای بک‌اند و جمع‌آوری داده‌های آموزشی (یوتیوب، فرادرس، دوره‌های رایگان)

> این سند به فارسی توضیح می‌دهد: (۱) بهترین بک‌اند برای استقرار روی Vercel چیست، (۲) چگونه داده‌های واقعی دوره‌ها را از یوتیوب، فرادرس و سایت‌های دیگر جمع‌آوری کنیم.

---

## ۱. بهترین بک‌اند برای Vercel

پروژه VibeLab شما **Next.js App Router** است و از **Drizzle ORM + PostgreSQL** استفاده می‌کند. برای Vercel بهترین گزینه‌ها:

### گزینه اول: Supabase (توصیه‌شده)
- **چرا:** PostgreSQL واقعی، داشبورد عالی، احراز هویت داخلی (اختیاری)، استوریج برای فایل‌ها
- **قیمت:** طرح رایگان ۵۰۰ مگابایت دیتابیس دارد
- **اتصال:** `postgresql://postgres:[pass]@db.xxx.supabase.co:5432/postgres`
- **نکته مهم:** در طرح رایگان Supabase، اتصال مستقیم TCP گاهی قطع می‌شود. بهتر است از **Connection Pooler** استفاده کنید:
  ```
  postgresql://postgres:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

### گزینه دوم: Neon
- **چرا:** PostgreSQL Serverless، اتصال HTTP-compatible با `@neondatabase/serverless`
- **مزیت:** برای Cloudflare Workers هم کار می‌کند (برخلاف `pg` معمولی)
- **اتصال:** `postgresql://[user]:[pass]@[host]/neondb?sslmode=require`

### گزینه سوم: Railway / Render
- **چرا:** Node.js کامل، هیچ محدودیتی برای TCP یا فایل‌سیستم ندارید
- **معایب:** پلن رایگان Railway دیگر وجود ندارد؛ Render کندتر است

### نتیجه‌گیری
| نیاز شما | بهترین گزینه |
|----------|-------------|
| پروژه آموزشی/استارتاپ کوچک | **Supabase** |
| نیاز به Edge/Worker در آینده | **Neon** |
| بودجه صفر + سادگی | **Supabase Pooler** |

---

## ۲. جمع‌آوری داده از یوتیوب، فرادرس و سایت‌های دوره رایگان

### ⚠️ هشدار مهم قبل از شروع
- **فرادرس:** اسکرپینگ خودکار سایت فرادرس ممکن است نقض قوانین استفاده (Terms of Service) باشد. روش امن‌تر استفاده از **API رسمی** یا **دسته‌بندی دستی (Manual Curation)** است.
- **یوتیوب:** API رسمی رایگان دارد و محدودیت مشخصی دارد.
- **Coursera / edX:** API دارند اما نیازمند ثبت‌نام توسعه‌دهنده هستند.

---

## ۳. دریافت داده از YouTube (روش رسمی و امن)

### گام ۱: دریافت API Key از Google Cloud
1. به [Google Cloud Console](https://console.cloud.google.com/) بروید.
2. یک پروژه بسازید.
3. **YouTube Data API v3** را فعال کنید.
4. از بخش **Credentials** یک **API Key** بسازید.

### گام ۲: API Route برای جستجوی ویدیوهای آموزشی

```typescript
// src/app/api/education/youtube/route.ts
import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "آموزش هوش مصنوعی فارسی";
  const maxResults = Math.min(50, Math.max(1, Number(searchParams.get("max") || "10")));

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YouTube API Key تنظیم نشده است." }, { status: 500 });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("relevanceLanguage", "fa");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "خطای YouTube API" }, { status: res.status });
    }

    const videos = (data.items || []).map((item: any) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      url: `https://youtube.com/watch?v=${item.id?.videoId}`,
    }));

    return NextResponse.json({ videos, total: videos.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "خطای ناشناخته" }, { status: 500 });
  }
}
```

### گام ۳: متغیر محیطی
```env
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### تست
```
GET /api/education/youtube?q=vibe+coding&max=5
```

---

## ۴. دریافت داده از فرادرس (روش امن: RSS/Feed یا Manual Curation)

### چرا اسکرپینگ مستقیم خطرناک است؟
- فرادرس از **Cloudflare** و **WAF** استفاده می‌کند.
- درخواست‌های خودکار بلاک می‌شوند.
- ممکن است IP شما مسدود شود.

### روش پیشنهادی: Manual Curation + به‌روزرسانی دوره‌ای
بهترین روش برای سایت‌های آموزشی ایرانی این است که:
1. لیست دوره‌ها را **دستی** جمع‌آوری کنید.
2. در دیتابیس خودتان ذخیره کنید.
3. هر چند وقت یک بار (مثلاً ماهی یک بار) بررسی کنید و لینک‌های جدید اضافه کنید.

### جدول دیتابیس برای دوره‌ها

```typescript
// اضافه کردن به src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const educationCourses = pgTable("education_courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  provider: varchar("provider", { length: 40 }).notNull(), // faradars | youtube | coursera | other
  url: varchar("url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1000 }),
  language: varchar("language", { length: 10 }).notNull().default("fa"), // fa | en
  isFree: integer("is_free").notNull().default(1), // 1 = free, 0 = paid
  category: varchar("category", { length: 60 }).notNull().default("general"), // ai | coding | design
  externalId: varchar("external_id", { length: 120 }), // YouTube video ID or Faradars course ID
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### اسکریپت seed برای پر کردن دیتابیس

```typescript
// scripts/seed-courses.ts
import { db } from "@/db";
import { educationCourses } from "@/db/schema";

const courses = [
  {
    title: "آموزش هوش مصنوعی و یادگیری ماشین",
    description: "مسیر جامع یادگیری مفاهیم پایه تا پیشرفته AI و ML به زبان فارسی.",
    provider: "faradars",
    url: "https://faradars.org/artificial-intelligence-and-machine-learning",
    thumbnailUrl: "https://faradars.org/wp-content/uploads/ai-ml.jpg",
    language: "fa",
    isFree: 0,
    category: "ai",
  },
  {
    title: "آموزش پایتون برای Data Science",
    description: "یادگیری پایتون، NumPy، Pandas و مصورسازی داده.",
    provider: "faradars",
    url: "https://faradars.org/python-programming",
    language: "fa",
    isFree: 0,
    category: "coding",
  },
  {
    title: "Google AI Essentials",
    description: "دوره رایگان گوگل برای درک مبانی هوش مصنوعی.",
    provider: "coursera",
    url: "https://www.coursera.org/google-ai",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "ChatGPT Prompt Engineering for Developers",
    description: "بهترین منبع آموزش مهندسی پرامپت با Andrew Ng.",
    provider: "deeplearning",
    url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
    language: "en",
    isFree: 1,
    category: "ai",
  },
];

async function seed() {
  for (const course of courses) {
    await db.insert(educationCourses).values(course).onConflictDoNothing();
  }
  console.log("Courses seeded!");
}

seed();
```

---

## ۵. اسکرپینگ هوشمند سایت‌های رایگان (با رعایت قوانین)

### سایت‌هایی که اسکرپینگ آن‌ها آسان‌تر و کم‌خطرتر است:
- **YouTube:** API رسمی دارد (توضیح داده شد)
- **GitHub Topics:** API رسمی دارد
- **Coursera:** بخشی از داده‌ها public است
- **سایت‌های دولتی/آموزشی:** معمولاً محدودیت کمتری دارند

### مثال: اسکرپینگ ساده یک صفحه استاتیک

```typescript
// src/app/api/education/scrape/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio"; // npm install cheerio

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "آدرس URL الزامی است." }, { status: 400 });
  }

  // فقط دامنه‌های مجاز
  const allowedDomains = ["example.edu", "ocw.mit.edu", "cs50.harvard.edu"];
  const domain = new URL(targetUrl).hostname.replace("www.", "");
  if (!allowedDomains.includes(domain)) {
    return NextResponse.json({ error: "این دامنه مجاز نیست." }, { status: 403 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VibeLabBot/1.0; +https://yourdomain.com/bot)",
      },
      next: { revalidate: 86400 }, // کش ۲۴ ساعته
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // استخراج عنوان و توضیحات
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";
    const headings = $("h1, h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .slice(0, 5);

    return NextResponse.json({ title, description, headings, source: targetUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "خطا" }, { status: 500 });
  }
}
```

### نصب cheerio
```bash
npm install cheerio
```

---

## ۶. معماری پیشنهادی برای بخش آموزش

```
┌─────────────────┐
│   Next.js App   │
│   (Vercel)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────────┐
│Supabase│  │ YouTube   │
│PostgreSQL  │ Data API  │
└───┬───┘  └───────────┘
    │
┌───▼───────────────┐
│ education_courses │
│ (جدول دوره‌ها)    │
└───────────────────┘
```

### گردش کار:
1. **دوره‌های ثابت** (فرادرس، Coursera) → در دیتابیس ذخیره می‌شوند.
2. **ویدیوهای یوتیوب** → از API زنده گرفته می‌شوند (کش ۱ ساعته).
3. **اسکرپینگ** → فقط برای سایت‌های مجاز و با رعایت `robots.txt`.

---

## ۷. نصب و راه‌اندازی در پروژه

### گام ۱: نصب پکیج‌ها
```bash
npm install cheerio
```

### گام ۲: اضافه کردن متغیرهای محیطی
```env
# .env.local
DATABASE_URL=postgresql://...
AI_KEYS_ENCRYPTION_SECRET=...
YOUTUBE_API_KEY=AIzaSy...
```

### گام ۳: اجرای migration
```bash
npx drizzle-kit push
```

### گام ۴: پر کردن دیتابیس
```bash
npx tsx scripts/seed-courses.ts
```

---

## ۸. چک‌لیست نهایی

- [ ] Supabase/Neon ساخته و `DATABASE_URL` در Vercel ست شده
- [ ] `AI_KEYS_ENCRYPTION_SECRET` حداقل ۳۲ کاراکتر است
- [ ] `YOUTUBE_API_KEY` از Google Cloud گرفته شده
- [ ] جدول `education_courses` به schema اضافه و push شده
- [ ] دوره‌های فرادرس و رایگان در دیتابیس seed شده‌اند
- [ ] API Route یوتیوب تست شده
- [ ] صفحه `/education` به دیتابیس متصل شده (با Server Component)

---

**سوالات متداول:**

**Q: آیا می‌توانم فرادرس را اسکرپ کنم؟**
A: از نظر فنی بله، اما از نظر قانونی و اخلاقی توصیه نمی‌شود. بهتر است لینک‌ها را دستی جمع‌آوری کنید یا از API رسمی (در صورت وجود) استفاده کنید.

**Q: یوتیوب API محدودیت دارد؟**
A: بله، روزانه ۱۰,۰۰۰ unit quota دارد. برای یک سایت آموزشی کوچک کاملاً کافی است.

**Q: بهترین روش کش‌کردن چیست؟**
A: در Next.js App Router از `fetch(..., { next: { revalidate: 3600 } })` استفاده کنید. داده‌های ثابت (فرادرس) را در PostgreSQL نگه دارید.

---

**موفق باشید! 🎓**
