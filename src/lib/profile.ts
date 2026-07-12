import nodemailer from "nodemailer";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectAnalyses, studentProfiles, studentProjects, studentResumes, studentUsers, resumeEmails } from "@/db/schema";
import { runConfiguredAiJson } from "@/lib/ai";

export type ProfileView = { headline: string; bio: string; skills: string; portfolioUrl: string | null; isPublic: boolean };
export type ResumeView = { fileName: string | null; mimeType: string | null; contentText: string; score: number; review: string; analysisSource: string; updatedAt: string | null };
export type PublicProfileView = { id: number; fullName: string; headline: string; bio: string; skills: string; portfolioUrl: string | null; projects: { name: string; description: string; deploymentUrl: string; screenshotUrl: string | null; estimatedMin: number | null; estimatedMax: number | null }[] };

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function defaultProfile(name: string): ProfileView {
  return { headline: "سازنده‌ی محصول با AI", bio: `${name} در مسیر ساخت محصول، محتوا و تجربه‌های دیجیتال با هوش مصنوعی است.`, skills: "Google AI Studio، Claude، Vibe Coding، تولید محتوا", portfolioUrl: null, isPublic: true };
}

function toProfile(row: typeof studentProfiles.$inferSelect): ProfileView {
  return { headline: row.headline, bio: row.bio, skills: row.skills, portfolioUrl: row.portfolioUrl, isPublic: row.isPublic };
}

function toResume(row?: typeof studentResumes.$inferSelect): ResumeView {
  return { fileName: row?.fileName ?? null, mimeType: row?.mimeType ?? null, contentText: row?.contentText ?? "", score: row?.score ?? 0, review: row?.review ?? "", analysisSource: row?.analysisSource ?? "not_analyzed", updatedAt: row?.updatedAt?.toISOString() ?? null };
}

export async function ensureStudentProfile(userId: number, fullName: string) {
  const [existing] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(studentProfiles).values({ userId, ...defaultProfile(fullName) }).returning();
  return created;
}

export async function ensureDemoResume(userId: number, fullName: string) {
  await ensureStudentProfile(userId, fullName);
  const [existing] = await db.select({ id: studentResumes.id }).from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  if (existing) return;
  const profile: ProfileView = { headline: "سازنده‌ی محصول و محتوای AI", bio: "سارا فرهمند به کسب‌وکارهای کوچک کمک می‌کند تا با AI، محتوای بهتر و نسخه‌ی اول محصول دیجیتال خود را سریع‌تر بسازند.", skills: "Google AI Studio، Claude، Next.js، Vibe Coding، تولید ویدیو با AI", portfolioUrl: "https://nextjs.org/", isPublic: true };
  await updateStudentProfile(userId, fullName, profile);
  const fallback = fallbackResumeAnalysis(profile, "سارا فرهمند | سازنده‌ی محصول AI\nپروژه: ساخت لندینگ و ویدیوی معرفی برای کسب‌وکارهای محلی.\nمهارت‌ها: تحقیق با Gemini، سناریونویسی با Claude، ساخت رابط با Next.js و انتشار محصول.");
  await db.insert(studentResumes).values({ userId, fileName: "demo-vibelab-resume.txt", mimeType: "text/plain", fileData: Buffer.from("نمونه رزومه VibeLab").toString("base64"), contentText: "سارا فرهمند | سازنده‌ی محصول AI\n\nخلاصه: به کسب‌وکارهای کوچک کمک می‌کنم تا با AI، محتوا و محصول دیجیتال بسازند.\n\nپروژه‌ها:\n- لندینگ و ویدیوی معرفی برای برند محلی\n- پنل محتوایی با Next.js و ابزارهای AI\n\nمهارت‌ها: Google AI Studio، Claude، Next.js، Vibe Coding، سناریونویسی و تولید محتوا.", score: fallback.score, review: fallback.review, analysisSource: "demo", updatedAt: new Date() });
}

export async function getStudentProfileData(userId: number, fullName: string) {
  const profile = await ensureStudentProfile(userId, fullName);
  const [resume] = await db.select().from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  return { profile: toProfile(profile), resume: toResume(resume) };
}

export async function updateStudentProfile(userId: number, fullName: string, input: Partial<ProfileView>) {
  await ensureStudentProfile(userId, fullName);
  const values: Partial<typeof studentProfiles.$inferInsert> = { updatedAt: new Date() };
  if (typeof input.headline === "string") values.headline = input.headline.trim().slice(0, 180) || "سازنده‌ی محصول با AI";
  if (typeof input.bio === "string") values.bio = input.bio.trim().slice(0, 3_000);
  if (typeof input.skills === "string") values.skills = input.skills.trim().slice(0, 1_200);
  if (typeof input.portfolioUrl === "string") values.portfolioUrl = input.portfolioUrl.trim() || null;
  if (typeof input.isPublic === "boolean") values.isPublic = input.isPublic;
  const [updated] = await db.update(studentProfiles).set(values).where(eq(studentProfiles.userId, userId)).returning();
  return toProfile(updated);
}

function fallbackResumeAnalysis(profile: ProfileView, resumeText: string) {
  const skills = profile.skills.split(/[،,\n]/).map((item) => item.trim()).filter(Boolean);
  const measurableResults = (resumeText.match(/(درصد|کاربر|مشتری|فروش|درآمد|بهبود|خروجی|نسخه|تحویل)/g) ?? []).length;
  const sections = (resumeText.match(/(خلاصه|پروژه|مهارت|تجربه|تحصیل)/g) ?? []).length;
  const textQuality = Math.min(28, Math.floor(resumeText.length / 24));
  const score = Math.min(94, 18 + textQuality + Math.min(24, skills.length * 4) + (profile.portfolioUrl ? 10 : 0) + Math.min(14, measurableResults * 3) + Math.min(10, sections * 2));
  const missing = [resumeText.length < 250 ? "نمونه‌کار و نتیجه‌های قابل‌اندازه‌گیری را دقیق‌تر بنویسید" : "نمونه‌کار و خروجی‌ها را حفظ کنید", measurableResults < 2 ? "حداقل یک خروجی قابل‌اندازه‌گیری مثل تعداد کاربر، زمان تحویل یا نتیجه‌ی پروژه اضافه کنید" : "نتیجه‌های قابل‌اندازه‌گیری را حفظ کنید", skills.length < 3 ? "حداقل سه مهارت یا ابزار اصلی را اضافه کنید" : "مهارت‌ها واضح هستند", !profile.portfolioUrl ? "لینک پنل پروژه یا نمونه‌کار آنلاین را اضافه کنید" : "لینک نمونه‌کار اضافه شده است"];
  return { score, review: `رزومه برای نمایش در فضای VibeLab آماده است. ${missing.join(". ")}. پیشنهاد: برای هر پروژه، مسئله، ابزار AI استفاده‌شده و خروجی نهایی را در یک جمله ذکر کنید.`, analysisSource: "heuristic" };
}

function parseAiResume(content: string, fallback: ReturnType<typeof fallbackResumeAnalysis>) {
  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim()) as { score?: unknown; review?: unknown };
    return { score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : fallback.score, review: typeof parsed.review === "string" && parsed.review.length > 30 ? parsed.review.slice(0, 1_400) : fallback.review, analysisSource: "ai" };
  } catch { return fallback; }
}

export async function analyzeAndSaveResume(userId: number, fullName: string, input: { profile: ProfileView; resumeText: string }) {
  const profile = await updateStudentProfile(userId, fullName, input.profile);
  const text = input.resumeText.trim().slice(0, 15_000);
  const fallback = fallbackResumeAnalysis(profile, text);
  const ai = await runConfiguredAiJson(`رزومه‌ی یک سازنده‌ی محصول AI را فقط برای بهبود ارائه‌ی حرفه‌ای بررسی کن. پاسخ فقط JSON باشد: {"score":0-100,"review":"متن فارسی کاربردی، بدون ادعای استخدام یا تضمین"}. نام: ${fullName}\nعنوان: ${profile.headline}\nمعرفی: ${profile.bio}\nمهارت‌ها: ${profile.skills}\nلینک نمونه‌کار: ${profile.portfolioUrl ?? "ندارد"}\nمتن رزومه: ${text}`, "resume_review").catch(() => null);
  const result = ai ? parseAiResume(ai.content, fallback) : fallback;
  const [existing] = await db.select().from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  const values = { contentText: text, score: result.score, review: result.review, analysisSource: result.analysisSource, updatedAt: new Date() };
  const [resume] = existing ? await db.update(studentResumes).set(values).where(eq(studentResumes.userId, userId)).returning() : await db.insert(studentResumes).values({ userId, ...values }).returning();
  return { profile, resume: toResume(resume) };
}

export async function importResumeFile(userId: number, fullName: string, file: File) {
  if (file.size === 0 || file.size > MAX_RESUME_BYTES) throw new Error("فایل رزومه باید بین ۱ بایت تا ۵ مگابایت باشد.");
  const allowed = ["text/plain", "text/markdown", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowed.includes(file.type) && !/\.(txt|md|pdf|docx)$/i.test(file.name)) throw new Error("فقط فایل‌های TXT، MD، PDF و DOCX پذیرفته می‌شوند.");
  await ensureStudentProfile(userId, fullName);
  const data = Buffer.from(await file.arrayBuffer());
  const isText = file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name);
  const text = isText ? data.toString("utf8").slice(0, 15_000) : "";
  const [existing] = await db.select().from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  const values = { fileName: file.name.slice(0, 255), mimeType: file.type || "application/octet-stream", fileData: data.toString("base64"), contentText: text || existing?.contentText || "", updatedAt: new Date() };
  const [resume] = existing ? await db.update(studentResumes).set(values).where(eq(studentResumes.userId, userId)).returning() : await db.insert(studentResumes).values({ userId, ...values }).returning();
  return toResume(resume);
}

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}

export async function emailStudentResume(userId: number, fullName: string, input: { recipient: string; subject: string; message: string }) {
  if (!/^\S+@\S+\.\S+$/.test(input.recipient)) throw new Error("ایمیل گیرنده معتبر نیست.");
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  const [resume] = await db.select().from(studentResumes).where(eq(studentResumes.userId, userId)).limit(1);
  if (!profile || !resume) throw new Error("ابتدا پروفایل و رزومه را تکمیل کنید.");
  const subject = input.subject.trim().slice(0, 220) || `رزومه ${fullName}`;
  const message = input.message.trim().slice(0, 3_000) || `رزومه و پروفایل ${fullName} از VibeLab ارسال شده است.`;
  const [outbox] = await db.insert(resumeEmails).values({ userId, recipient: input.recipient.trim().toLowerCase(), subject, message, status: smtpReady() ? "sending" : "queued_smtp_configuration" }).returning();
  if (!smtpReady()) return { status: "queued_smtp_configuration", detail: "SMTP تنظیم نشده است؛ درخواست در صف ثبت شد و پس از تنظیم SMTP قابل ارسال خواهد بود." };
  try {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true", auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
    const attachment = resume.fileData ? [{ filename: resume.fileName ?? "resume.txt", content: Buffer.from(resume.fileData, "base64"), contentType: resume.mimeType ?? undefined }] : [{ filename: "resume.txt", content: resume.contentText, contentType: "text/plain; charset=utf-8" }];
    await transporter.sendMail({ from: process.env.SMTP_FROM!, to: outbox.recipient, subject, text: `${message}\n\n${fullName}\n${profile.headline}\n${profile.bio}\nمهارت‌ها: ${profile.skills}\nنمونه‌کار: ${profile.portfolioUrl ?? "-"}`, attachments: attachment });
    await db.update(resumeEmails).set({ status: "sent", sentAt: new Date(), error: null }).where(eq(resumeEmails.id, outbox.id));
    return { status: "sent", detail: "رزومه با موفقیت ارسال شد." };
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 330) : "ارسال SMTP ناموفق بود.";
    await db.update(resumeEmails).set({ status: "failed", error: detail }).where(eq(resumeEmails.id, outbox.id));
    throw new Error("ارسال ایمیل ناموفق بود؛ تنظیمات SMTP را بررسی کنید.");
  }
}

export async function getPublicProfile(userId: number): Promise<PublicProfileView | null> {
  const [user] = await db.select({ id: studentUsers.id, fullName: studentUsers.fullName }).from(studentUsers).where(eq(studentUsers.id, userId)).limit(1);
  const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  if (!user || !profile || !profile.isPublic) return null;
  const projects = await db.select().from(studentProjects).where(eq(studentProjects.userId, userId)).orderBy(desc(studentProjects.createdAt));
  const analyses = await db.select().from(projectAnalyses).orderBy(desc(projectAnalyses.createdAt));
  return { id: user.id, fullName: user.fullName, ...toProfile(profile), projects: projects.map((project) => { const analysis = analyses.find((item) => item.projectId === project.id); return { name: project.name, description: project.description, deploymentUrl: project.deploymentUrl, screenshotUrl: project.screenshotUrl, estimatedMin: analysis?.estimatedMin ?? null, estimatedMax: analysis?.estimatedMax ?? null }; }) };
}
