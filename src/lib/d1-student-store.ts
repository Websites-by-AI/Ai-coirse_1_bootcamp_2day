import { hashPassword, passwordMatches } from "@/lib/password";
import { getVibelabD1, type D1DatabaseBinding } from "@/lib/cloudflare-d1";
import type { AssessmentInput, AssessmentResult } from "@/lib/assessment";
import type { StudentAssessmentView, StudentProfile } from "@/lib/student";

export type D1AuthResult = StudentProfile | null | undefined;

let schemaReady = false;

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function rowToStudent(row: { id: number; full_name: string; email: string; phone: string }): StudentProfile {
  return { id: row.id, fullName: row.full_name, email: row.email, phone: row.phone };
}

function rowToAssessment(row: {
  id: number;
  goal: string;
  experience_level: string;
  weekly_hours: number;
  project_idea: string;
  score: number;
  fit_level: string;
  recommendation: string;
  analysis_source: string;
  created_at: string;
}): StudentAssessmentView {
  return {
    id: row.id,
    goal: row.goal,
    experienceLevel: row.experience_level,
    weeklyHours: row.weekly_hours,
    projectIdea: row.project_idea,
    score: row.score,
    fitLevel: row.fit_level as AssessmentResult["fitLevel"],
    recommendation: row.recommendation,
    analysisSource: row.analysis_source === "ai" ? "ai" : "rule_based",
    createdAt: row.created_at,
  };
}

async function ensureD1Schema(db: D1DatabaseBinding) {
  if (schemaReady) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_student_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    google_subject TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'password',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_student_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_student_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    weekly_hours INTEGER NOT NULL,
    project_idea TEXT NOT NULL,
    score INTEGER NOT NULL,
    fit_level TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    analysis_source TEXT NOT NULL DEFAULT 'rule_based',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vibelab_student_users(id) ON DELETE CASCADE
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_vibelab_student_sessions_user ON vibelab_student_sessions(user_id)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_vibelab_student_assessments_user ON vibelab_student_assessments(user_id, created_at DESC)`).run();
  schemaReady = true;
}

async function d1() {
  const db = await getVibelabD1();
  if (!db) return null;
  await ensureD1Schema(db);
  return db;
}

export async function d1FindStudentByEmail(email: string) {
  const db = await d1();
  if (!db) return undefined;
  const row = await db
    .prepare("SELECT id, full_name, email, phone FROM vibelab_student_users WHERE email = ? LIMIT 1")
    .bind(normalizeEmail(email))
    .first<{ id: number; full_name: string; email: string; phone: string }>();
  return row ? rowToStudent(row) : null;
}

export async function d1RegisterStudent(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  assessment: AssessmentInput;
  analysis: AssessmentResult;
}) {
  const db = await d1();
  if (!db) return undefined;
  const email = normalizeEmail(input.email);
  const existing = await d1FindStudentByEmail(email);
  if (existing) throw new Error("با این ایمیل قبلاً حساب کاربری ساخته شده است. از ورود استفاده کنید.");

  await db
    .prepare("INSERT INTO vibelab_student_users (full_name, email, phone, password_hash, updated_at) VALUES (?, ?, ?, ?, ?)")
    .bind(input.fullName.trim(), email, input.phone.trim(), hashPassword(input.password), nowIso())
    .run();

  const student = await d1FindStudentByEmail(email);
  if (!student) throw new Error("حساب کاربری در دیتابیس Cloudflare ساخته نشد.");
  const assessment = await d1CreateAssessment(student.id, input.assessment, input.analysis);
  if (!assessment) throw new Error("ارزیابی کاربر در دیتابیس Cloudflare ذخیره نشد.");
  return { student, assessment };
}

export async function d1EnsureDemoStudent(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  assessment: AssessmentInput;
  analysis: AssessmentResult;
}) {
  const db = await d1();
  if (!db) return undefined;
  const existing = await d1FindStudentByEmail(input.email);
  if (existing) return existing;
  const created = await d1RegisterStudent(input);
  return created?.student;
}

export async function d1AuthenticateStudent(email: string, password: string): Promise<D1AuthResult> {
  const db = await d1();
  if (!db) return undefined;
  const row = await db
    .prepare("SELECT id, full_name, email, phone, password_hash FROM vibelab_student_users WHERE email = ? LIMIT 1")
    .bind(normalizeEmail(email))
    .first<{ id: number; full_name: string; email: string; phone: string; password_hash: string }>();
  if (!row || !passwordMatches(password, row.password_hash)) return null;
  return rowToStudent(row);
}

export async function d1CreateStudentSession(userId: number, token: string, expiresAt: Date) {
  const db = await d1();
  if (!db) return false;
  await db
    .prepare("INSERT OR REPLACE INTO vibelab_student_sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, userId, expiresAt.toISOString())
    .run();
  return true;
}

export async function d1GetStudentFromSession(token?: string): Promise<StudentProfile | null | undefined> {
  if (!token) return null;
  const db = await d1();
  if (!db) return undefined;
  const row = await db
    .prepare(`SELECT u.id, u.full_name, u.email, u.phone
      FROM vibelab_student_sessions s
      JOIN vibelab_student_users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
      LIMIT 1`)
    .bind(token, nowIso())
    .first<{ id: number; full_name: string; email: string; phone: string }>();
  return row ? rowToStudent(row) : null;
}

export async function d1DeleteStudentSession(token?: string) {
  if (!token) return false;
  const db = await d1();
  if (!db) return false;
  await db.prepare("DELETE FROM vibelab_student_sessions WHERE token = ?").bind(token).run();
  return true;
}

export async function d1CreateAssessment(userId: number, input: AssessmentInput, analysis: AssessmentResult) {
  const db = await d1();
  if (!db) return undefined;
  await db
    .prepare(`INSERT INTO vibelab_student_assessments
      (user_id, goal, experience_level, weekly_hours, project_idea, score, fit_level, recommendation, analysis_source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(userId, input.goal, input.experienceLevel, input.weeklyHours, input.projectIdea, analysis.score, analysis.fitLevel, analysis.recommendation, analysis.analysisSource, nowIso())
    .run();
  return d1GetLatestAssessment(userId);
}

export async function d1GetLatestAssessment(userId: number) {
  const db = await d1();
  if (!db) return undefined;
  const row = await db
    .prepare(`SELECT id, goal, experience_level, weekly_hours, project_idea, score, fit_level, recommendation, analysis_source, created_at
      FROM vibelab_student_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1`)
    .bind(userId)
    .first<{
      id: number;
      goal: string;
      experience_level: string;
      weekly_hours: number;
      project_idea: string;
      score: number;
      fit_level: string;
      recommendation: string;
      analysis_source: string;
      created_at: string;
    }>();
  return row ? rowToAssessment(row) : null;
}
