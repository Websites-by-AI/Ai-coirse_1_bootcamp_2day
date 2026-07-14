/**
 * اسکریپت پر کردن دیتابیس با دوره‌های آموزشی
 * اجرا: npx tsx scripts/seed-courses.mjs
 */
import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { educationCourses } from "../src/db/schema.ts";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const courses = [
  {
    title: "آموزش هوش مصنوعی و یادگیری ماشین",
    description: "مسیر جامع یادگیری مفاهیم پایه تا پیشرفته AI و ML به زبان فارسی.",
    provider: "faradars",
    url: "https://faradars.org/artificial-intelligence-and-machine-learning",
    thumbnailUrl: "",
    language: "fa",
    isFree: 0,
    category: "ai",
  },
  {
    title: "آموزش پایتون برای Data Science",
    description: "یادگیری پایتون، کتابخانه‌های NumPy، Pandas و مصورسازی داده.",
    provider: "faradars",
    url: "https://faradars.org/python-programming",
    language: "fa",
    isFree: 0,
    category: "coding",
  },
  {
    title: "آموزش طراحی رابط کاربری UI/UX",
    description: "اصول طراحی تجربه کاربری، وایرفریم، پروتوتایپ و تست کاربری.",
    provider: "faradars",
    url: "https://faradars.org/ui-ux-design",
    language: "fa",
    isFree: 0,
    category: "design",
  },
  {
    title: "Google AI Essentials",
    description: "دوره رایگان گوگل برای درک مبانی هوش مصنوعی و کاربردهای عملی آن.",
    provider: "coursera",
    url: "https://www.coursera.org/google-ai",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "ChatGPT Prompt Engineering for Developers",
    description: "بهترین منبع آموزش مهندسی پرامپت با Andrew Ng و OpenAI.",
    provider: "deeplearning",
    url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "Fast.ai Practical Deep Learning",
    description: "یادگیری عمیق عملی برای کدنویسان؛ از صفر تا مدل‌های واقعی.",
    provider: "fastai",
    url: "https://course.fast.ai/",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "CS50 AI with Python (Harvard)",
    description: "دوره معروف هاروارد برای هوش مصنوعی با پایتون.",
    provider: "harvard",
    url: "https://cs50.harvard.edu/ai/",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "YouTube: AI Jason / Prompt Engineering",
    description: "ویدیوهای رایگان و به‌روز درباره ابزارهای AI و پرامپت‌نویسی.",
    provider: "youtube",
    url: "https://www.youtube.com/@AIJasonZ",
    language: "en",
    isFree: 1,
    category: "ai",
  },
  {
    title: "YouTube: Fireship AI Tutorials",
    description: "آموزش‌های سریع و فشرده درباره AI، Next.js و ابزارهای مدرن.",
    provider: "youtube",
    url: "https://www.youtube.com/@Fireship",
    language: "en",
    isFree: 1,
    category: "coding",
  },
];

async function seed() {
  console.log("🌱 شروع seed دوره‌های آموزشی...");
  for (const course of courses) {
    try {
      await db.insert(educationCourses).values(course).onConflictDoNothing();
      console.log(`✅ ${course.title}`);
    } catch (err) {
      console.error(`❌ خطا در ${course.title}:`, err.message);
    }
  }
  console.log("🏁 Seed تمام شد!");
  await pool.end();
}

seed();
