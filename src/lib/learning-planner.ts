import { getVibelabD1 } from "@/lib/cloudflare-d1";
import { analyzeResumeWithRag, type ResumeRagInsight } from "@/lib/resume-rag";
import { baseResources, learningHubs, mentors, type LearningResource } from "@/lib/learning-data";

export type LearningPlanInput = {
  fullName: string;
  email: string;
  phone: string;
  resumeText: string;
  goal: string;
  cityPreference: string;
};

function includesAny(text: string, words: string[]) {
  const value = text.toLowerCase();
  return words.some((word) => value.includes(word.toLowerCase()));
}

function inferTrack(resumeText: string, goal: string) {
  const text = `${resumeText} ${goal}`;
  const content = includesAny(text, ["محتوا", "کپشن", "اینستاگرام", "ویدیو", "سناریو", "تولید"]);
  const web = includesAny(text, ["سایت", "وب", "لندینگ", "کدنویسی", "فرانت", "وردپرس", "فروشگاه"]);
  const startup = includesAny(text, ["استارتاپ", "pitch", "سرمایه", "فراخوان", "شتابدهنده"]);
  if (web && content) return "طراحی سایت + تولید محتوا";
  if (web) return "طراحی سایت با AI";
  if (content) return "تولید محتوا با AI";
  if (startup) return "استارتاپ و Pitch با AI";
  return "مسیر پایه AI و رزومه";
}

function recommendResources(track: string): LearningResource[] {
  const extra: LearningResource[] = [];
  if (track.includes("سایت")) {
    extra.push(
      { source: "YouTube", title: "آموزش ساخت سایت با AI و Next.js", url: "https://www.youtube.com/results?search_query=AI+website+builder+Next.js+Persian", reason: "برای ساخت نمونه سایت سریع", level: "میانی" },
      { source: "Aparat", title: "طراحی سایت با هوش مصنوعی", url: "https://www.aparat.com/result/%D8%B7%D8%B1%D8%A7%D8%AD%DB%8C_%D8%B3%D8%A7%DB%8C%D8%AA_%D8%A8%D8%A7_%D9%87%D9%88%D8%B4_%D9%85%D8%B5%D9%86%D9%88%D8%B9%DB%8C", reason: "ویدیوهای فارسی برای شروع عملی", level: "شروع" },
    );
  }
  if (track.includes("محتوا")) {
    extra.push(
      { source: "YouTube", title: "AI Content Creation فارسی", url: "https://www.youtube.com/results?search_query=AI+content+creation+Persian", reason: "برای تولید محتوا، کپشن و سناریو", level: "شروع" },
      { source: "Faradars", title: "آموزش تولید محتوا و بازاریابی دیجیتال", url: "https://faradars.org/search?query=%D8%AA%D9%88%D9%84%DB%8C%D8%AF%20%D9%85%D8%AD%D8%AA%D9%88%D8%A7", reason: "مسیر فارسی ساختارمند", level: "میانی" },
    );
  }
  return [...extra, ...baseResources].slice(0, 8);
}

function recommendHubs(cityPreference: string) {
  const city = cityPreference.trim();
  const preferred = learningHubs.filter((hub) => hub.city.includes(city) || hub.title.includes(city) || hub.area.includes(city));
  return [...preferred, ...learningHubs.filter((hub) => !preferred.includes(hub))].slice(0, 5);
}

function recommendMentors(track: string, cityPreference: string) {
  const city = cityPreference.trim();
  return mentors
    .map((mentor) => {
      let score = 0;
      if (track.includes("سایت") && (mentor.specialty.includes("سایت") || mentor.specialty.includes("Vibe"))) score += 3;
      if (track.includes("محتوا") && (mentor.specialty.includes("محتوا") || mentor.specialty.includes("ویدیو"))) score += 3;
      if (track.includes("استارتاپ") && mentor.specialty.includes("Pitch")) score += 3;
      if (city && mentor.city.includes(city)) score += 2;
      return { mentor, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.mentor)
    .slice(0, 10);
}

function buildTwoDayProgram(track: string) {
  return [
    { day: "روز اول صبح", title: "تحلیل رزومه، انتخاب مسیر و نقشه پروژه", output: "مسیر شخصی، هدف بازار و brief پروژه" },
    { day: "روز اول عصر", title: track.includes("محتوا") ? "ساخت Content Kit و سناریو" : "طراحی ساختار سایت و صفحه فروش", output: track.includes("محتوا") ? "کپشن، سناریو، استوری‌بورد" : "wireframe، متن صفحه، CTA" },
    { day: "روز دوم صبح", title: track.includes("سایت") ? "ساخت سایت/لندینگ با AI" : "تولید ویدیو/محتوای نمونه", output: track.includes("سایت") ? "لینک نسخه اولیه سایت" : "نمونه ویدیو یا پست آماده" },
    { day: "روز دوم عصر", title: "رزومه، پروفایل عمومی و برنامه کاریابی", output: "رزومه، پیام معرفی و برنامه ۷ روزه جذب پروژه" },
  ];
}

export function generateLearningPlan(input: LearningPlanInput) {
  const track = inferTrack(input.resumeText, input.goal);
  const resources = recommendResources(track);
  const hubs = recommendHubs(input.cityPreference || "تهران");
  const selectedMentors = recommendMentors(track, input.cityPreference || "تهران");
  const twoDayProgram = buildTwoDayProgram(track);
  const firstVideo = resources.find((item) => item.source === "YouTube" || item.source === "Aparat") ?? resources[0];
  const summary = `بر اساس رزومه و هدف شما، مسیر پیشنهادی «${track}» است. پیشنهاد می‌شود اول ویدیوی آغازین را ببینید، سپس نزدیک‌ترین نقطه آموزشی را انتخاب کنید و در دوره دو روزه خروجی قابل ارائه بسازید.`;
  return { track, summary, firstVideo, resources, hubs, mentors: selectedMentors, twoDayProgram };
}

async function ensureLearningPlanTable() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_learning_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    goal TEXT NOT NULL,
    city_preference TEXT,
    resume_text TEXT NOT NULL,
    recommended_track TEXT NOT NULL,
    plan_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return db;
}

export async function createLearningPlan(input: LearningPlanInput) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const resumeText = input.resumeText.trim();
  if (fullName.length < 2) throw new Error("نام را کامل وارد کنید.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ایمیل معتبر نیست.");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("شماره تماس معتبر نیست.");
  if (resumeText.length < 60) throw new Error("رزومه یا معرفی کوتاه را کامل‌تر وارد کنید.");

  const plan = generateLearningPlan({ ...input, fullName, email, phone, resumeText });
  const rag = await analyzeResumeWithRag({ fullName, resumeText, goal: input.goal, cityPreference: input.cityPreference });
  const enrichedPlan = { ...plan, rag };
  const db = await ensureLearningPlanTable();
  if (db) {
    await db
      .prepare("INSERT INTO vibelab_learning_plans (full_name, email, phone, goal, city_preference, resume_text, recommended_track, plan_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(fullName, email, phone, input.goal, input.cityPreference || null, resumeText.slice(0, 5000), plan.track, JSON.stringify(enrichedPlan))
      .run();
  }
  return enrichedPlan;
}
