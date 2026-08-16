import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { hashPassword, passwordMatches } from "@/lib/password";

export type DemoStudentRecord = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  googleSubject?: string | null;
  authProvider?: string;
};

export type DemoAssessmentRecord = {
  id: number;
  userId: number;
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  projectIdea: string;
  score: number;
  fitLevel: string;
  recommendation: string;
  analysisSource: string;
  createdAt: string;
};

export type DemoProjectAnalysisRecord = {
  id: number;
  projectId: number;
  codeScore: number;
  productScore: number;
  marketScore: number;
  estimatedMin: number;
  estimatedMax: number;
  currency: string;
  report: string;
  scanSummary: string;
  analysisSource: string;
  createdAt: string;
};

export type DemoProjectRecord = {
  id: number;
  userId: number;
  name: string;
  description: string;
  githubUrl: string;
  deploymentUrl: string;
  screenshotUrl: string | null;
  lastScanStatus: string;
  lastScannedAt: string | null;
  createdAt: string;
};

export type DemoProfileRecord = {
  userId: number;
  headline: string;
  bio: string;
  skills: string;
  portfolioUrl: string | null;
  isPublic: boolean;
  updatedAt: string;
};

export type DemoResumeRecord = {
  userId: number;
  fileName: string | null;
  mimeType: string | null;
  fileData: string | null;
  contentText: string;
  score: number;
  review: string;
  analysisSource: string;
  updatedAt: string | null;
};

type DemoSessionRecord = { token: string; userId: number; expiresAt: string };

type DemoStore = {
  nextStudentId: number;
  nextAssessmentId: number;
  nextProjectId: number;
  nextAnalysisId: number;
  students: DemoStudentRecord[];
  sessions: DemoSessionRecord[];
  assessments: DemoAssessmentRecord[];
  projects: DemoProjectRecord[];
  analyses: DemoProjectAnalysisRecord[];
  profiles: DemoProfileRecord[];
  resumes: DemoResumeRecord[];
};

const STORE_PATH = join(process.cwd(), "data", "vibelab-demo-store.json");

type DemoGlobal = typeof globalThis & { __vibelabDemoStore?: DemoStore };
const demoGlobal = globalThis as DemoGlobal;

function initialStore(): DemoStore {
  return {
    nextStudentId: 1,
    nextAssessmentId: 1,
    nextProjectId: 1,
    nextAnalysisId: 1,
    students: [],
    sessions: [],
    assessments: [],
    projects: [],
    analyses: [],
    profiles: [],
    resumes: [],
  };
}

function loadStore(): DemoStore {
  if (demoGlobal.__vibelabDemoStore) return demoGlobal.__vibelabDemoStore;
  try {
    if (existsSync(STORE_PATH)) {
      const parsed = JSON.parse(readFileSync(STORE_PATH, "utf8")) as DemoStore;
      demoGlobal.__vibelabDemoStore = { ...initialStore(), ...parsed };
      return demoGlobal.__vibelabDemoStore;
    }
  } catch {
    // Ignore corrupted demo data and start clean.
  }
  demoGlobal.__vibelabDemoStore = initialStore();
  return demoGlobal.__vibelabDemoStore;
}

export function getDemoStore() {
  return loadStore();
}

export function saveDemoStore() {
  const store = loadStore();
  try {
    mkdirSync(dirname(STORE_PATH), { recursive: true });
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch {
    // Serverless read-only filesystems can still use the in-memory store for the current instance.
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function studentView(student: DemoStudentRecord) {
  return { id: student.id, fullName: student.fullName, email: student.email, phone: student.phone };
}

export function findDemoStudentByEmail(email: string) {
  return loadStore().students.find((student) => student.email === normalizeEmail(email)) ?? null;
}

export function createDemoStudent(input: { fullName: string; email: string; phone: string; password: string }) {
  const store = loadStore();
  const student: DemoStudentRecord = {
    id: store.nextStudentId++,
    fullName: input.fullName.trim(),
    email: normalizeEmail(input.email),
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    authProvider: "password",
  };
  store.students.push(student);
  saveDemoStore();
  return student;
}

export function authenticateDemoStudent(email: string, password: string) {
  const student = findDemoStudentByEmail(email);
  if (!student || !passwordMatches(password, student.passwordHash)) return null;
  return studentView(student);
}

export function upsertDemoSession(token: string, userId: number, expiresAt: Date) {
  const store = loadStore();
  store.sessions = store.sessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now());
  store.sessions.push({ token, userId, expiresAt: expiresAt.toISOString() });
  saveDemoStore();
}

export function getDemoStudentFromSession(token?: string) {
  if (!token) return null;
  const store = loadStore();
  const session = store.sessions.find((item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now());
  if (!session) return null;
  const student = store.students.find((item) => item.id === session.userId);
  return student ? studentView(student) : null;
}

export function deleteDemoSession(token?: string) {
  if (!token) return;
  const store = loadStore();
  store.sessions = store.sessions.filter((item) => item.token !== token);
  saveDemoStore();
}

export function ensureDemoProfile(userId: number, fullName: string): DemoProfileRecord {
  const store = loadStore();
  let profile = store.profiles.find((item) => item.userId === userId);
  if (!profile) {
    profile = {
      userId,
      headline: "سازنده‌ی محصول با AI",
      bio: `${fullName} در مسیر ساخت محصول، محتوا و تجربه‌های دیجیتال با هوش مصنوعی است.`,
      skills: "Google AI Studio، Claude، Vibe Coding، تولید محتوا",
      portfolioUrl: null,
      isPublic: true,
      updatedAt: new Date().toISOString(),
    };
    store.profiles.push(profile);
    saveDemoStore();
  }
  return profile;
}

export function ensureDemoResumeRecord(userId: number, fullName: string): DemoResumeRecord {
  const store = loadStore();
  let resume = store.resumes.find((item) => item.userId === userId);
  if (!resume) {
    resume = {
      userId,
      fileName: "demo-vibelab-resume.txt",
      mimeType: "text/plain",
      fileData: Buffer.from("نمونه رزومه VibeLab").toString("base64"),
      contentText: `${fullName} | سازنده‌ی محصول AI\n\nخلاصه: با کمک ابزارهای AI، محتوا، لندینگ و نسخه‌ی اول محصول دیجیتال می‌سازم.\n\nپروژه‌ها:\n- لندینگ و ویدیوی معرفی برای برند محلی\n- پنل محتوایی با Next.js و ابزارهای AI\n\nمهارت‌ها: Google AI Studio، Claude، Next.js، Vibe Coding و تولید محتوا.`,
      score: 82,
      review: "رزومه برای نمایش در فضای VibeLab آماده است. برای هر پروژه، مسئله، ابزار AI استفاده‌شده و خروجی نهایی را شفاف‌تر بنویسید.",
      analysisSource: "demo",
      updatedAt: new Date().toISOString(),
    };
    store.resumes.push(resume);
    saveDemoStore();
  }
  return resume;
}

export function ensureDemoProjectRecord(userId: number) {
  const store = loadStore();
  const existing = store.projects.find((project) => project.userId === userId && project.githubUrl === "https://github.com/vercel/next.js");
  if (existing) return existing;
  const now = new Date().toISOString();
  const project: DemoProjectRecord = {
    id: store.nextProjectId++,
    userId,
    name: "نمونه‌ی VibeLab — لندینگ و پنل AI",
    description: "نمونه‌ی تمرینی یک محصول محتوایی و پنل کاربری مبتنی بر Next.js برای نمایش مسیر ساخت، داشبورد و تجربه‌ی تعاملی.",
    githubUrl: "https://github.com/vercel/next.js",
    deploymentUrl: "https://nextjs.org/",
    screenshotUrl: "https://image.thum.io/get/width/1200/crop/675/noanimate/https://nextjs.org/",
    lastScanStatus: "demo_ready",
    lastScannedAt: now,
    createdAt: now,
  };
  store.projects.push(project);
  store.analyses.push({
    id: store.nextAnalysisId++,
    projectId: project.id,
    codeScore: 88,
    productScore: 86,
    marketScore: 76,
    estimatedMin: 24_000_000,
    estimatedMax: 42_000_000,
    currency: "تومان",
    report: "این یک پروژه‌ی نمونه برای نمایش چرخه‌ی اسکن GitHub، بررسی انتشار و تخمین قیمت است. در پروژه‌ی واقعی، قیمت به scope، طراحی، محتوا، APIها، زمان تحویل و پشتیبانی وابسته است.",
    scanSummary: "نمونه‌ی عمومی: GitHub vercel/next.js · انتشار: nextjs.org · داده‌ی نمایشی برای تست پنل",
    analysisSource: "demo",
    createdAt: now,
  });
  saveDemoStore();
  return project;
}
