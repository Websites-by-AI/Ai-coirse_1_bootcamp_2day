import { randomBytes } from "crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { hashPassword, isModernPasswordHash, passwordMatches } from "@/lib/password";
import { ensureDemoStudent } from "@/lib/student";
import { adminSessions, adminUsers, enrollments, studentAssessments, studentUsers } from "@/db/schema";

export const ADMIN_COOKIE_NAME = "vibelab_admin_session";
export const DEMO_ADMIN = {
  username: "admin@vibelab.ir",
  password: "VibeLab2025!",
  displayName: "مدیر VibeLab",
};

export type DashboardEnrollment = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  track: string;
  status: string;
  source: string;
  createdAt: string;
};

export type DashboardAssessment = {
  id: number;
  fullName: string;
  email: string;
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  score: number;
  fitLevel: string;
  recommendation: string;
  analysisSource: string;
  createdAt: string;
};

export type GoogleIdentity = {
  subject: string;
  email: string;
  name: string;
};

export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function isGoogleAuthConfigured() {
  return Boolean(isGoogleOAuthConfigured() && process.env.GOOGLE_ADMIN_EMAILS);
}

function googleAdminEmails() {
  return (process.env.GOOGLE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function ensureDemoData() {
  await db
    .insert(adminUsers)
    .values({
      username: DEMO_ADMIN.username,
      passwordHash: hashPassword(DEMO_ADMIN.password),
      displayName: DEMO_ADMIN.displayName,
    })
    .onConflictDoNothing();

  await db
    .insert(enrollments)
    .values([
      {
        fullName: "نگار مرادی",
        email: "negar.moradi@example.com",
        phone: "۰۹۱۲ ۴۳۲ ۸۷۱۰",
        track: "ماراتن دو روزه VibeLab",
        status: "تأیید شده",
        source: "فرم سایت",
      },
      {
        fullName: "سامان توکلی",
        email: "saman.tavakoli@example.com",
        phone: "۰۹۳۵ ۷۲۱ ۲۹۴۰",
        track: "ماراتن دو روزه VibeLab",
        status: "در انتظار",
        source: "تلگرام",
      },
      {
        fullName: "مهتاب احمدی",
        email: "mahtab.ahmadi@example.com",
        phone: "۰۹۱۰ ۶۱۲ ۳۵۷۹",
        track: "ماراتن دو روزه VibeLab",
        status: "جدید",
        source: "اشتراک‌گذاری سایت",
      },
      {
        fullName: "پارسا سلیمانی",
        email: "parsa.soleimani@example.com",
        phone: "۰۹۰۲ ۵۹۶ ۴۸۳۰",
        track: "ماراتن دو روزه VibeLab",
        status: "جدید",
        source: "فرم سایت",
      },
    ])
    .onConflictDoNothing();
}

export async function authenticateAdmin(username: string, password: string) {
  await ensureDemoData();
  const normalizedUsername = username.trim().toLowerCase();
  const [user] = await db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      passwordHash: adminUsers.passwordHash,
      displayName: adminUsers.displayName,
    })
    .from(adminUsers)
    .where(eq(adminUsers.username, normalizedUsername))
    .limit(1);

  if (!user || !passwordMatches(password, user.passwordHash)) return null;
  if (!isModernPasswordHash(user.passwordHash)) {
    await db.update(adminUsers).set({ passwordHash: hashPassword(password) }).where(eq(adminUsers.id, user.id));
  }
  return user;
}

export async function authenticateGoogleAdmin(identity: GoogleIdentity) {
  const email = identity.email.trim().toLowerCase();
  if (!googleAdminEmails().includes(email)) return null;

  const [googleUser] = await db
    .select({ id: adminUsers.id, username: adminUsers.username, displayName: adminUsers.displayName })
    .from(adminUsers)
    .where(eq(adminUsers.googleSubject, identity.subject))
    .limit(1);
  if (googleUser) return googleUser;

  const [existingEmailUser] = await db
    .select({ id: adminUsers.id, username: adminUsers.username, displayName: adminUsers.displayName })
    .from(adminUsers)
    .where(eq(adminUsers.username, email))
    .limit(1);

  if (existingEmailUser) {
    const [updated] = await db
      .update(adminUsers)
      .set({ googleSubject: identity.subject, authProvider: "google", displayName: identity.name || existingEmailUser.displayName })
      .where(eq(adminUsers.id, existingEmailUser.id))
      .returning({ id: adminUsers.id, username: adminUsers.username, displayName: adminUsers.displayName });
    return updated;
  }

  const [created] = await db
    .insert(adminUsers)
    .values({
      username: email,
      passwordHash: hashPassword(randomBytes(32).toString("hex")),
      displayName: identity.name || email,
      googleSubject: identity.subject,
      authProvider: "google",
    })
    .returning({ id: adminUsers.id, username: adminUsers.username, displayName: adminUsers.displayName });
  return created;
}

export async function createAdminSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await db.insert(adminSessions).values({ token, userId, expiresAt });
  return { token, expiresAt };
}

export async function getAdminFromSession(token?: string) {
  if (!token) return null;
  const [session] = await db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      displayName: adminUsers.displayName,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.token, token), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return session ?? null;
}

export async function deleteAdminSession(token?: string) {
  if (!token) return;
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function getDashboardData() {
  await ensureDemoData();
  await ensureDemoStudent();
  await db.execute(sql`select 1`);
  const [rows, assessmentRows, studentRows] = await Promise.all([
    db.select().from(enrollments).orderBy(desc(enrollments.createdAt)),
    db
      .select({
        id: studentAssessments.id,
        fullName: studentUsers.fullName,
        email: studentUsers.email,
        goal: studentAssessments.goal,
        experienceLevel: studentAssessments.experienceLevel,
        weeklyHours: studentAssessments.weeklyHours,
        score: studentAssessments.score,
        fitLevel: studentAssessments.fitLevel,
        recommendation: studentAssessments.recommendation,
        analysisSource: studentAssessments.analysisSource,
        createdAt: studentAssessments.createdAt,
      })
      .from(studentAssessments)
      .innerJoin(studentUsers, eq(studentAssessments.userId, studentUsers.id))
      .orderBy(desc(studentAssessments.createdAt))
      .limit(12),
    db.select({ id: studentUsers.id }).from(studentUsers),
  ]);
  const registrations: DashboardEnrollment[] = rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    track: row.track,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  }));

  const assessments: DashboardAssessment[] = assessmentRows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    goal: row.goal,
    experienceLevel: row.experienceLevel,
    weeklyHours: row.weeklyHours,
    score: row.score,
    fitLevel: row.fitLevel,
    recommendation: row.recommendation,
    analysisSource: row.analysisSource,
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    registrations,
    assessments,
    stats: {
      total: registrations.length,
      pending: registrations.filter((item) => item.status === "در انتظار").length,
      confirmed: registrations.filter((item) => item.status === "تأیید شده").length,
      newLeads: registrations.filter((item) => item.status === "جدید").length,
      students: studentRows.length,
      readyStudents: assessments.filter((item) => item.fitLevel === "آماده برای ماراتن").length,
    },
  };
}

export async function updateEnrollmentStatus(id: number, status: string) {
  const allowedStatuses = ["جدید", "در انتظار", "تأیید شده", "لغو شده"];
  if (!allowedStatuses.includes(status)) throw new Error("Invalid enrollment status");

  const [updated] = await db
    .update(enrollments)
    .set({ status })
    .where(eq(enrollments.id, id))
    .returning({
      id: enrollments.id,
      status: enrollments.status,
    });
  return updated ?? null;
}
