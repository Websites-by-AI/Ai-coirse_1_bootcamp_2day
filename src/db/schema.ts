import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 120 }).notNull(),
    passwordHash: varchar("password_hash", { length: 128 }).notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    googleSubject: varchar("google_subject", { length: 255 }),
    authProvider: varchar("auth_provider", { length: 32 }).notNull().default("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("admin_users_username_unique").on(table.username),
    uniqueIndex("admin_users_google_subject_unique").on(table.googleSubject),
  ],
);

export const adminSessions = pgTable("admin_sessions", {
  token: varchar("token", { length: 128 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentUsers = pgTable(
  "student_users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 140 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    passwordHash: varchar("password_hash", { length: 128 }).notNull(),
    googleSubject: varchar("google_subject", { length: 255 }),
    authProvider: varchar("auth_provider", { length: 32 }).notNull().default("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("student_users_email_unique").on(table.email),
    uniqueIndex("student_users_google_subject_unique").on(table.googleSubject),
  ],
);

export const studentSessions = pgTable("student_sessions", {
  token: varchar("token", { length: 128 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => studentUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => studentUsers.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 180 }).notNull().default("سازنده‌ی محصول با AI"),
    bio: text("bio").notNull().default(""),
    skills: text("skills").notNull().default(""),
    portfolioUrl: varchar("portfolio_url", { length: 500 }),
    isPublic: boolean("is_public").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("student_profiles_user_unique").on(table.userId)],
);

export const studentResumes = pgTable(
  "student_resumes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => studentUsers.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }),
    mimeType: varchar("mime_type", { length: 120 }),
    fileData: text("file_data"),
    contentText: text("content_text").notNull().default(""),
    score: integer("score").notNull().default(0),
    review: text("review").notNull().default(""),
    analysisSource: varchar("analysis_source", { length: 32 }).notNull().default("not_analyzed"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("student_resumes_user_unique").on(table.userId)],
);

export const resumeEmails = pgTable("resume_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => studentUsers.id, { onDelete: "cascade" }),
  recipient: varchar("recipient", { length: 160 }).notNull(),
  subject: varchar("subject", { length: 220 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("queued"),
  error: varchar("error", { length: 360 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentAssessments = pgTable("student_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => studentUsers.id, { onDelete: "cascade" }),
  goal: varchar("goal", { length: 160 }).notNull(),
  experienceLevel: varchar("experience_level", { length: 64 }).notNull(),
  weeklyHours: integer("weekly_hours").notNull(),
  projectIdea: text("project_idea").notNull(),
  score: integer("score").notNull(),
  fitLevel: varchar("fit_level", { length: 40 }).notNull(),
  recommendation: text("recommendation").notNull(),
  analysisSource: varchar("analysis_source", { length: 32 }).notNull().default("rule_based"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentProjects = pgTable("student_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => studentUsers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 140 }).notNull(),
  description: text("description").notNull(),
  githubUrl: varchar("github_url", { length: 500 }).notNull(),
  deploymentUrl: varchar("deployment_url", { length: 500 }).notNull(),
  screenshotUrl: varchar("screenshot_url", { length: 1000 }),
  lastScanStatus: varchar("last_scan_status", { length: 32 }).notNull().default("not_scanned"),
  lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectAnalyses = pgTable("project_analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => studentProjects.id, { onDelete: "cascade" }),
  codeScore: integer("code_score").notNull(),
  productScore: integer("product_score").notNull(),
  marketScore: integer("market_score").notNull(),
  estimatedMin: integer("estimated_min").notNull(),
  estimatedMax: integer("estimated_max").notNull(),
  currency: varchar("currency", { length: 16 }).notNull().default("تومان"),
  report: text("report").notNull(),
  scanSummary: text("scan_summary").notNull(),
  analysisSource: varchar("analysis_source", { length: 32 }).notNull().default("heuristic"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 140 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    track: varchar("track", { length: 80 }).notNull().default("ماراتن دو روزه VibeLab"),
    status: varchar("status", { length: 32 }).notNull().default("جدید"),
    source: varchar("source", { length: 80 }).notNull().default("سایت VibeLab"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("enrollments_email_unique").on(table.email)],
);

export const aiProviderConfigs = pgTable(
  "ai_provider_configs",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    secretSource: varchar("secret_source", { length: 16 }).notNull().default("vault"),
    environmentVariable: varchar("environment_variable", { length: 120 }),
    keyCiphertext: text("key_ciphertext"),
    keyFingerprint: varchar("key_fingerprint", { length: 32 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    monthlyTokenLimit: integer("monthly_token_limit").notNull().default(1000000),
    warningThreshold: integer("warning_threshold").notNull().default(80),
    tokensUsed: integer("tokens_used").notNull().default(0),
    lastStatus: varchar("last_status", { length: 32 }).notNull().default("not_tested"),
    lastError: varchar("last_error", { length: 360 }),
    lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("ai_provider_configs_label_unique").on(table.label)],
);

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id")
    .notNull()
    .references(() => aiProviderConfigs.id, { onDelete: "cascade" }),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  source: varchar("source", { length: 100 }).notNull().default("application"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const educationCourses = pgTable("education_courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  provider: varchar("provider", { length: 40 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 1000 }),
  language: varchar("language", { length: 10 }).notNull().default("fa"),
  isFree: integer("is_free").notNull().default(1),
  category: varchar("category", { length: 60 }).notNull().default("general"),
  externalId: varchar("external_id", { length: 120 }),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
