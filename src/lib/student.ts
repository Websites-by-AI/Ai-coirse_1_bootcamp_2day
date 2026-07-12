import { randomBytes } from "crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, studentAssessments, studentSessions, studentUsers } from "@/db/schema";
import { hashPassword, isModernPasswordHash, passwordMatches } from "@/lib/password";
import { assessStudentFit, type AssessmentInput, type AssessmentResult } from "@/lib/assessment";
import { ensureDemoProject } from "@/lib/projects";
import { ensureDemoResume } from "@/lib/profile";

export const STUDENT_COOKIE_NAME = "vibelab_student_session";
export const DEMO_STUDENT = {
  fullName: "سارا فرهمند",
  email: "demo.student@vibelab.ir",
  phone: "۰۹۱۲ ۵۵۵ ۴۰۸۲",
  password: "VibeStudent2025!",
};

export type StudentAssessmentView = AssessmentResult & {
  id: number;
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  projectIdea: string;
  createdAt: string;
};

export type StudentProfile = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
};

export type GoogleStudentIdentity = {
  subject: string;
  email: string;
  name: string;
};

export async function ensureDemoStudent() {
  await db
    .insert(studentUsers)
    .values({
      fullName: DEMO_STUDENT.fullName,
      email: DEMO_STUDENT.email,
      phone: DEMO_STUDENT.phone,
      passwordHash: hashPassword(DEMO_STUDENT.password),
    })
    .onConflictDoNothing();

  const [student] = await db
    .select({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone })
    .from(studentUsers)
    .where(eq(studentUsers.email, DEMO_STUDENT.email))
    .limit(1);
  if (!student) throw new Error("حساب دمو ایجاد نشد.");

  const [assessment] = await db
    .select({ id: studentAssessments.id })
    .from(studentAssessments)
    .where(eq(studentAssessments.userId, student.id))
    .limit(1);

  if (!assessment) {
    const demoInput: AssessmentInput = {
      goal: "ساخت وب‌سایت یا مینی‌اپ برای ایده‌ام",
      experienceLevel: "با ابزارهای AI کمی کار کرده‌ام",
      weeklyHours: 7,
      projectIdea: "می‌خواهم برای یک کسب‌وکار خانگی، یک لندینگ ساده و یک ویدیوی کوتاه معرفی بسازم تا سفارش‌های محلی بیشتری دریافت کنم.",
    };
    const result = await assessStudentFit(demoInput);
    await db.insert(studentAssessments).values({
      userId: student.id,
      goal: demoInput.goal,
      experienceLevel: demoInput.experienceLevel,
      weeklyHours: demoInput.weeklyHours,
      projectIdea: demoInput.projectIdea,
      score: result.score,
      fitLevel: result.fitLevel,
      recommendation: result.recommendation,
      analysisSource: result.analysisSource,
    });
    await db
      .insert(enrollments)
      .values({
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        track: "ماراتن دو روزه VibeLab",
        status: "تأیید شده",
        source: "حساب آزمایشی",
      })
      .onConflictDoNothing();
  }

  await ensureDemoProject(student.id);
  await ensureDemoResume(student.id, student.fullName);
  return student;
}

export async function createStudentSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await db.insert(studentSessions).values({ token, userId, expiresAt });
  return { token, expiresAt };
}

export async function getStudentFromSession(token?: string): Promise<StudentProfile | null> {
  if (!token) return null;
  const [student] = await db
    .select({
      id: studentUsers.id,
      fullName: studentUsers.fullName,
      email: studentUsers.email,
      phone: studentUsers.phone,
    })
    .from(studentSessions)
    .innerJoin(studentUsers, eq(studentSessions.userId, studentUsers.id))
    .where(and(eq(studentSessions.token, token), gt(studentSessions.expiresAt, new Date())))
    .limit(1);
  return student ?? null;
}

export async function authenticateGoogleStudent(identity: GoogleStudentIdentity): Promise<StudentProfile> {
  const email = identity.email.trim().toLowerCase();
  const [subjectUser] = await db
    .select({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone })
    .from(studentUsers)
    .where(eq(studentUsers.googleSubject, identity.subject))
    .limit(1);
  if (subjectUser) return subjectUser;

  const [emailUser] = await db
    .select({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone })
    .from(studentUsers)
    .where(eq(studentUsers.email, email))
    .limit(1);
  if (emailUser) {
    const [updated] = await db
      .update(studentUsers)
      .set({ googleSubject: identity.subject, authProvider: "google", fullName: identity.name || emailUser.fullName })
      .where(eq(studentUsers.id, emailUser.id))
      .returning({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone });
    return updated;
  }

  const [created] = await db
    .insert(studentUsers)
    .values({
      fullName: identity.name || "کاربر VibeLab",
      email,
      phone: "تکمیل نشده",
      passwordHash: hashPassword(randomBytes(32).toString("hex")),
      googleSubject: identity.subject,
      authProvider: "google",
    })
    .returning({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone });
  return created;
}

export async function authenticateStudent(email: string, password: string): Promise<StudentProfile | null> {
  await ensureDemoStudent();
  const [student] = await db
    .select({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone, passwordHash: studentUsers.passwordHash })
    .from(studentUsers)
    .where(eq(studentUsers.email, email.trim().toLowerCase()))
    .limit(1);
  if (!student || !passwordMatches(password, student.passwordHash)) return null;
  if (!isModernPasswordHash(student.passwordHash)) {
    await db.update(studentUsers).set({ passwordHash: hashPassword(password) }).where(eq(studentUsers.id, student.id));
  }
  return { id: student.id, fullName: student.fullName, email: student.email, phone: student.phone };
}

export async function deleteStudentSession(token?: string) {
  if (!token) return;
  await db.delete(studentSessions).where(eq(studentSessions.token, token));
}

export async function getLatestStudentAssessment(userId: number): Promise<StudentAssessmentView | null> {
  const [assessment] = await db
    .select()
    .from(studentAssessments)
    .where(eq(studentAssessments.userId, userId))
    .orderBy(desc(studentAssessments.createdAt))
    .limit(1);
  if (!assessment) return null;
  return {
    id: assessment.id,
    goal: assessment.goal,
    experienceLevel: assessment.experienceLevel,
    weeklyHours: assessment.weeklyHours,
    projectIdea: assessment.projectIdea,
    score: assessment.score,
    fitLevel: assessment.fitLevel as AssessmentResult["fitLevel"],
    recommendation: assessment.recommendation,
    analysisSource: assessment.analysisSource === "ai" ? "ai" : "rule_based",
    createdAt: assessment.createdAt.toISOString(),
  };
}

export async function createAssessmentForStudent(userId: number, input: AssessmentInput) {
  if (input.projectIdea.trim().length < 15) throw new Error("ایده یا مسئله‌ی پروژه را کمی کامل‌تر بنویسید.");
  if (!Number.isInteger(input.weeklyHours) || input.weeklyHours < 1 || input.weeklyHours > 80) throw new Error("زمان هفتگی را بین ۱ تا ۸۰ ساعت وارد کنید.");

  const [student] = await db
    .select({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone })
    .from(studentUsers)
    .where(eq(studentUsers.id, userId))
    .limit(1);
  if (!student) throw new Error("حساب کاربری پیدا نشد.");

  const analysis = await assessStudentFit(input);
  const [assessment] = await db
    .insert(studentAssessments)
    .values({
      userId,
      goal: input.goal,
      experienceLevel: input.experienceLevel,
      weeklyHours: input.weeklyHours,
      projectIdea: input.projectIdea,
      score: analysis.score,
      fitLevel: analysis.fitLevel,
      recommendation: analysis.recommendation,
      analysisSource: analysis.analysisSource,
    })
    .returning({ id: studentAssessments.id, createdAt: studentAssessments.createdAt });

  await db
    .insert(enrollments)
    .values({ fullName: student.fullName, email: student.email, phone: student.phone, track: "ماراتن دو روزه VibeLab", status: "جدید", source: "ارزیابی مناسب‌بودن" })
    .onConflictDoNothing();

  return {
    ...analysis,
    id: assessment.id,
    goal: input.goal,
    experienceLevel: input.experienceLevel,
    weeklyHours: input.weeklyHours,
    projectIdea: input.projectIdea,
    createdAt: assessment.createdAt.toISOString(),
  };
}

export async function registerStudent(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  assessment: AssessmentInput;
}) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  if (fullName.length < 2) throw new Error("نام و نام خانوادگی را کامل وارد کنید.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ایمیل واردشده معتبر نیست.");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("شماره تماس معتبر نیست.");
  if (input.password.length < 8) throw new Error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
  if (input.assessment.projectIdea.trim().length < 15) throw new Error("ایده یا مسئله‌ی پروژه را کمی کامل‌تر بنویسید.");
  if (!Number.isInteger(input.assessment.weeklyHours) || input.assessment.weeklyHours < 1 || input.assessment.weeklyHours > 80) throw new Error("زمان هفتگی را بین ۱ تا ۸۰ ساعت وارد کنید.");

  const [existing] = await db.select({ id: studentUsers.id }).from(studentUsers).where(eq(studentUsers.email, email)).limit(1);
  if (existing) throw new Error("با این ایمیل قبلاً حساب کاربری ساخته شده است. از ورود استفاده کنید.");

  const [student] = await db
    .insert(studentUsers)
    .values({ fullName, email, phone, passwordHash: hashPassword(input.password) })
    .returning({ id: studentUsers.id, fullName: studentUsers.fullName, email: studentUsers.email, phone: studentUsers.phone });

  const analysis = await assessStudentFit(input.assessment);
  const [assessment] = await db
    .insert(studentAssessments)
    .values({
      userId: student.id,
      goal: input.assessment.goal,
      experienceLevel: input.assessment.experienceLevel,
      weeklyHours: input.assessment.weeklyHours,
      projectIdea: input.assessment.projectIdea,
      score: analysis.score,
      fitLevel: analysis.fitLevel,
      recommendation: analysis.recommendation,
      analysisSource: analysis.analysisSource,
    })
    .returning({ id: studentAssessments.id, createdAt: studentAssessments.createdAt });

  await db
    .insert(enrollments)
    .values({ fullName, email, phone, track: "ماراتن دو روزه VibeLab", status: "جدید", source: "ارزیابی مناسب‌بودن" })
    .onConflictDoNothing();

  return {
    student,
    assessment: {
      ...analysis,
      id: assessment.id,
      goal: input.assessment.goal,
      experienceLevel: input.assessment.experienceLevel,
      weeklyHours: input.assessment.weeklyHours,
      projectIdea: input.assessment.projectIdea,
      createdAt: assessment.createdAt.toISOString(),
    },
  };
}
