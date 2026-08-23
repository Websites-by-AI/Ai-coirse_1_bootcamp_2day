import { randomBytes } from "crypto";
import { hashPassword, passwordMatches } from "@/lib/password";
import { getVibelabD1, type D1DatabaseBinding } from "@/lib/cloudflare-d1";
import type { DashboardAssessment, DashboardEnrollment, DashboardInternshipApplication, DashboardStudentUser } from "@/lib/admin";

export const D1_DEMO_ADMIN = {
  username: "admin@vibelab.ir",
  password: "VibeLab2025!",
  displayName: "مدیر VibeLab",
};

let schemaReady = false;

function nowIso() {
  return new Date().toISOString();
}

async function ensureD1AdminSchema(db: D1DatabaseBinding) {
  if (schemaReady) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_admin_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vibelab_admin_users(id) ON DELETE CASCADE
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_student_admin_status (
    user_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'جدید',
    track TEXT NOT NULL DEFAULT 'ماراتن دو روزه VibeLab',
    source TEXT NOT NULL DEFAULT 'ثبت‌نام Cloudflare D1',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_vibelab_admin_sessions_user ON vibelab_admin_sessions(user_id)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_internship_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    track TEXT NOT NULL,
    location_id TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    portfolio_url TEXT,
    availability TEXT,
    status TEXT NOT NULL DEFAULT 'جدید',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  schemaReady = true;
}

async function d1() {
  const db = await getVibelabD1();
  if (!db) return null;
  await ensureD1AdminSchema(db);
  return db;
}

export async function d1EnsureAdmin() {
  const db = await d1();
  if (!db) return undefined;
  const username = D1_DEMO_ADMIN.username.toLowerCase();
  const existing = await db
    .prepare("SELECT id, username, display_name FROM vibelab_admin_users WHERE username = ? LIMIT 1")
    .bind(username)
    .first<{ id: number; username: string; display_name: string }>();
  if (existing) return { id: existing.id, username: existing.username, displayName: existing.display_name };

  await db
    .prepare("INSERT INTO vibelab_admin_users (username, password_hash, display_name, updated_at) VALUES (?, ?, ?, ?)")
    .bind(username, hashPassword(D1_DEMO_ADMIN.password), D1_DEMO_ADMIN.displayName, nowIso())
    .run();

  const created = await db
    .prepare("SELECT id, username, display_name FROM vibelab_admin_users WHERE username = ? LIMIT 1")
    .bind(username)
    .first<{ id: number; username: string; display_name: string }>();
  if (!created) throw new Error("حساب مدیر در Cloudflare D1 ساخته نشد.");
  return { id: created.id, username: created.username, displayName: created.display_name };
}

export async function d1AuthenticateAdmin(username: string, password: string) {
  const db = await d1();
  if (!db) return undefined;
  await d1EnsureAdmin();
  const row = await db
    .prepare("SELECT id, username, password_hash, display_name FROM vibelab_admin_users WHERE username = ? LIMIT 1")
    .bind(username.trim().toLowerCase())
    .first<{ id: number; username: string; password_hash: string; display_name: string }>();
  if (!row || !passwordMatches(password, row.password_hash)) return null;
  return { id: row.id, username: row.username, displayName: row.display_name };
}

export async function d1CreateAdminSession(userId: number) {
  const db = await d1();
  if (!db) return undefined;
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await db
    .prepare("INSERT OR REPLACE INTO vibelab_admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, userId, expiresAt.toISOString())
    .run();
  return { token, expiresAt };
}

export async function d1GetAdminFromSession(token?: string) {
  if (!token) return null;
  const db = await d1();
  if (!db) return undefined;
  const row = await db
    .prepare(`SELECT u.id, u.username, u.display_name
      FROM vibelab_admin_sessions s
      JOIN vibelab_admin_users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
      LIMIT 1`)
    .bind(token, nowIso())
    .first<{ id: number; username: string; display_name: string }>();
  return row ? { id: row.id, username: row.username, displayName: row.display_name } : null;
}

export async function d1DeleteAdminSession(token?: string) {
  if (!token) return false;
  const db = await d1();
  if (!db) return false;
  await db.prepare("DELETE FROM vibelab_admin_sessions WHERE token = ?").bind(token).run();
  return true;
}

export async function d1GetDashboardData() {
  const db = await d1();
  if (!db) return undefined;
  await d1EnsureAdmin();

  const usersResult = await db
    .prepare(`SELECT
        u.id, u.full_name, u.email, u.phone, u.auth_provider, u.created_at,
        COALESCE(s.status, 'جدید') AS status,
        COALESCE(s.track, 'ماراتن دو روزه VibeLab') AS track,
        COALESCE(s.source, 'ثبت‌نام Cloudflare D1') AS source
      FROM vibelab_student_users u
      LEFT JOIN vibelab_student_admin_status s ON s.user_id = u.id
      ORDER BY u.id DESC`)
    .all<{ id: number; full_name: string; email: string; phone: string; auth_provider: string; created_at: string; status: string; track: string; source: string }>();

  const assessmentResult = await db
    .prepare(`SELECT
        a.id, u.full_name, u.email, a.goal, a.experience_level, a.weekly_hours,
        a.score, a.fit_level, a.recommendation, a.analysis_source, a.created_at
      FROM vibelab_student_assessments a
      JOIN vibelab_student_users u ON u.id = a.user_id
      ORDER BY a.id DESC
      LIMIT 24`)
    .all<{ id: number; full_name: string; email: string; goal: string; experience_level: string; weekly_hours: number; score: number; fit_level: string; recommendation: string; analysis_source: string; created_at: string }>();

  const internshipResult = await db
    .prepare(`SELECT id, full_name, email, phone, track, location_id, resume_text, portfolio_url, availability, status, created_at
      FROM vibelab_internship_applications
      ORDER BY id DESC
      LIMIT 20`)
    .all<{ id: number; full_name: string; email: string; phone: string; track: string; location_id: string; resume_text: string; portfolio_url: string | null; availability: string | null; status: string; created_at: string }>();

  const internshipApplications: DashboardInternshipApplication[] = (internshipResult.results ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    track: row.track,
    locationId: row.location_id,
    resumeText: row.resume_text,
    portfolioUrl: row.portfolio_url,
    availability: row.availability,
    status: row.status,
    createdAt: row.created_at,
  }));

  const users: DashboardStudentUser[] = (usersResult.results ?? []).map((row) => ({ 
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    authProvider: row.auth_provider || "password",
    status: row.status,
    createdAt: row.created_at,
  }));

  const registrations: DashboardEnrollment[] = (usersResult.results ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    track: row.track,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  }));

  const assessments: DashboardAssessment[] = (assessmentResult.results ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    goal: row.goal,
    experienceLevel: row.experience_level,
    weeklyHours: row.weekly_hours,
    score: row.score,
    fitLevel: row.fit_level,
    recommendation: row.recommendation,
    analysisSource: row.analysis_source,
    createdAt: row.created_at,
  }));

  return {
    registrations,
    assessments,
    users,
    internshipApplications,
    stats: {
      total: registrations.length,
      pending: registrations.filter((item) => item.status === "در انتظار").length,
      confirmed: registrations.filter((item) => item.status === "تأیید شده").length,
      newLeads: registrations.filter((item) => item.status === "جدید").length,
      students: users.length,
      readyStudents: assessments.filter((item) => item.fitLevel === "آماده برای ماراتن").length,
    },
  };
}

export async function d1UpdateEnrollmentStatus(id: number, status: string) {
  const db = await d1();
  if (!db) return undefined;
  await db
    .prepare(`INSERT INTO vibelab_student_admin_status (user_id, status, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`)
    .bind(id, status, nowIso())
    .run();
  return { id, status };
}
