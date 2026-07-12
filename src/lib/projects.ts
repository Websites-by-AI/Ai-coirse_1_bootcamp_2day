import { lookup } from "dns/promises";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectAnalyses, studentProjects } from "@/db/schema";
import { runConfiguredAiJson } from "@/lib/ai";

export type ProjectAnalysisView = { id: number; codeScore: number; productScore: number; marketScore: number; estimatedMin: number; estimatedMax: number; currency: string; report: string; scanSummary: string; analysisSource: string; createdAt: string };
export type ProjectView = { id: number; name: string; description: string; githubUrl: string; deploymentUrl: string; screenshotUrl: string | null; lastScanStatus: string; lastScannedAt: string | null; createdAt: string; analysis: ProjectAnalysisView | null };

type ScanData = { owner: string; repo: string; fileCount: number; sourceFiles: number; tech: string[]; readme: boolean; siteTitle: string; siteDescription: string; siteStatus: number; deploymentHost: string };

function isPrivateAddress(address: string) {
  const value = address.toLowerCase();
  return value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80") || value.startsWith("127.") || value.startsWith("10.") || value.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(value) || value === "0.0.0.0";
}

async function validatePublicUrl(value: string, allowedGithub = false) {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("لینک واردشده معتبر نیست."); }
  if (url.protocol !== "https:") throw new Error("برای امنیت، فقط لینک HTTPS پذیرفته می‌شود.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("آدرس‌های محلی یا داخلی مجاز نیستند.");
  if (allowedGithub && host !== "github.com" && host !== "www.github.com") throw new Error("لینک کد باید یک repository عمومی در github.com باشد.");
  const records = await lookup(host, { all: true, verbatim: true }).catch(() => []);
  if (!records.length || records.some((record) => isPrivateAddress(record.address))) throw new Error("این میزبان عمومی و قابل اسکن نیست.");
  return url;
}

function parseGithub(url: URL) {
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repo) throw new Error("لینک GitHub باید به شکل github.com/owner/repository باشد.");
  return { owner, repo: repo.replace(/\.git$/, "") };
}

async function publicFetch(url: URL) {
  let current = url;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await validatePublicUrl(current.toString());
    const response = await fetch(current, { headers: { "User-Agent": "VibeLab-Project-Scanner/1.0", Accept: "text/html,application/xhtml+xml" }, redirect: "manual", signal: AbortSignal.timeout(15_000) });
    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      current = new URL(response.headers.get("location")!, current);
      continue;
    }
    const html = (await response.text()).slice(0, 180_000);
    return { status: response.status, html, host: current.hostname };
  }
  throw new Error("تعداد redirectهای لینک انتشار بیش از حد است.");
}

async function scanProject(githubUrl: string, deploymentUrl: string): Promise<ScanData> {
  const github = await validatePublicUrl(githubUrl, true);
  const { owner, repo } = parseGithub(github);
  const repoResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "VibeLab-Project-Scanner/1.0" }, signal: AbortSignal.timeout(15_000) });
  const repoData = (await repoResponse.json().catch(() => ({}))) as { default_branch?: string; message?: string };
  if (!repoResponse.ok || !repoData.default_branch) throw new Error(repoData.message ?? "repository عمومی GitHub قابل خواندن نیست.");
  const treeResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(repoData.default_branch)}?recursive=1`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "VibeLab-Project-Scanner/1.0" }, signal: AbortSignal.timeout(15_000) });
  const treeData = (await treeResponse.json().catch(() => ({}))) as { tree?: { path?: string; type?: string }[] };
  if (!treeResponse.ok || !treeData.tree) throw new Error("فهرست فایل‌های repository قابل دریافت نیست.");
  const paths = treeData.tree.filter((file) => file.type === "blob").map((file) => file.path ?? "");
  const sourceFiles = paths.filter((path) => /\.(tsx|ts|jsx|js|vue|svelte|py|go|php|rb|java|cs)$/i.test(path)).length;
  const tech = [paths.some((path) => path.endsWith("next.config.ts") || path.endsWith("next.config.js")) ? "Next.js" : "", paths.some((path) => path.endsWith("vite.config.ts") || path.endsWith("vite.config.js")) ? "Vite" : "", paths.some((path) => path.endsWith("package.json")) ? "Node.js" : "", paths.some((path) => /tailwind\.config/.test(path)) ? "Tailwind" : "", paths.some((path) => path.endsWith("drizzle.config.json")) ? "PostgreSQL / Drizzle" : ""].filter(Boolean);
  const deployed = await publicFetch(await validatePublicUrl(deploymentUrl));
  const title = deployed.html.match(/<title[^>]*>([^<]{1,160})<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "عنوان پیدا نشد";
  const description = deployed.html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,240})/i)?.[1]?.trim() ?? "توضیح صفحه پیدا نشد";
  return { owner, repo, fileCount: paths.length, sourceFiles, tech, readme: paths.some((path) => /^readme/i.test(path)), siteTitle: title, siteDescription: description, siteStatus: deployed.status, deploymentHost: deployed.host };
}

function fallbackAnalysis(project: { name: string; description: string }, scan: ScanData) {
  const codeScore = Math.min(94, 36 + Math.min(28, scan.sourceFiles * 2) + Math.min(14, scan.tech.length * 4) + (scan.readme ? 8 : 0));
  const productScore = scan.siteStatus >= 200 && scan.siteStatus < 400 ? Math.min(90, 50 + (scan.siteTitle !== "عنوان پیدا نشد" ? 15 : 0) + (scan.siteDescription !== "توضیح صفحه پیدا نشد" ? 12 : 0) + Math.min(12, project.description.length / 12)) : 35;
  const marketScore = Math.min(88, 38 + Math.min(25, project.description.length / 8) + (scan.tech.length > 2 ? 12 : 4));
  const base = 7_000_000 + codeScore * 70_000 + productScore * 55_000 + marketScore * 35_000;
  return { codeScore: Math.round(codeScore), productScore: Math.round(productScore), marketScore: Math.round(marketScore), estimatedMin: Math.round(base / 500_000) * 500_000, estimatedMax: Math.round((base * 1.55) / 500_000) * 500_000, report: `کد عمومی ${scan.owner}/${scan.repo} شامل ${scan.sourceFiles.toLocaleString("fa-IR")} فایل کد و ${scan.tech.length.toLocaleString("fa-IR")} نشانه‌ی فنی است. نسخه‌ی انتشار روی ${scan.deploymentHost} با پاسخ ${scan.siteStatus} بررسی شد. این بازه یک تخمین آموزشی برای اجرای پروژه با سطح فعلی است و جایگزین پیشنهاد رسمی یا قرارداد نیست.`, analysisSource: "heuristic" };
}

function screenshotUrlFor(deploymentUrl: string) {
  return `https://image.thum.io/get/width/1200/crop/675/noanimate/${deploymentUrl}`;
}

function parseAi(content: string, fallback: ReturnType<typeof fallbackAnalysis>) {
  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim()) as Partial<typeof fallback>;
    const number = (value: unknown, current: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : current;
    const price = (value: unknown, current: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(1_000_000, Math.round(value / 500_000) * 500_000) : current;
    return { codeScore: number(parsed.codeScore, fallback.codeScore), productScore: number(parsed.productScore, fallback.productScore), marketScore: number(parsed.marketScore, fallback.marketScore), estimatedMin: price(parsed.estimatedMin, fallback.estimatedMin), estimatedMax: price(parsed.estimatedMax, fallback.estimatedMax), report: typeof parsed.report === "string" && parsed.report.length > 40 ? parsed.report.slice(0, 900) : fallback.report, analysisSource: "ai" };
  } catch { return fallback; }
}

function toView(project: typeof studentProjects.$inferSelect, analysis?: typeof projectAnalyses.$inferSelect): ProjectView {
  return { id: project.id, name: project.name, description: project.description, githubUrl: project.githubUrl, deploymentUrl: project.deploymentUrl, screenshotUrl: project.screenshotUrl, lastScanStatus: project.lastScanStatus, lastScannedAt: project.lastScannedAt?.toISOString() ?? null, createdAt: project.createdAt.toISOString(), analysis: analysis ? { id: analysis.id, codeScore: analysis.codeScore, productScore: analysis.productScore, marketScore: analysis.marketScore, estimatedMin: analysis.estimatedMin, estimatedMax: analysis.estimatedMax, currency: analysis.currency, report: analysis.report, scanSummary: analysis.scanSummary, analysisSource: analysis.analysisSource, createdAt: analysis.createdAt.toISOString() } : null };
}

export async function listStudentProjects(userId: number) {
  const projects = await db.select().from(studentProjects).where(eq(studentProjects.userId, userId)).orderBy(desc(studentProjects.createdAt));
  const analyses = await db.select().from(projectAnalyses).orderBy(desc(projectAnalyses.createdAt));
  return projects.map((project) => toView(project, analyses.find((analysis) => analysis.projectId === project.id)));
}

export async function createStudentProject(userId: number, input: { name: string; description: string; githubUrl: string; deploymentUrl: string }) {
  if (input.name.trim().length < 3 || input.description.trim().length < 20) throw new Error("نام پروژه و توضیح حداقل ۲۰ کاراکتری لازم است.");
  const github = await validatePublicUrl(input.githubUrl, true);
  const deployment = await validatePublicUrl(input.deploymentUrl);
  const [project] = await db.insert(studentProjects).values({ userId, name: input.name.trim(), description: input.description.trim(), githubUrl: github.toString(), deploymentUrl: deployment.toString() }).returning();
  return toView(project);
}

export async function scanStudentProject(userId: number, projectId: number) {
  const [project] = await db.select().from(studentProjects).where(and(eq(studentProjects.id, projectId), eq(studentProjects.userId, userId))).limit(1);
  if (!project) throw new Error("پروژه پیدا نشد یا دسترسی ندارید.");
  try {
    const scan = await scanProject(project.githubUrl, project.deploymentUrl);
    const fallback = fallbackAnalysis(project, scan);
    const ai = await runConfiguredAiJson(`پروژه‌ی وب زیر را برای قیمت‌گذاری آموزشی تحلیل کن. فقط JSON معتبر بده: {"codeScore":0-100,"productScore":0-100,"marketScore":0-100,"estimatedMin":عدد تومان,"estimatedMax":عدد تومان,"report":"۳ تا ۵ جمله فارسی"}. نام: ${project.name}\nتوضیح: ${project.description}\nاسکن GitHub: ${scan.sourceFiles} فایل کد از ${scan.fileCount} فایل؛ تکنولوژی‌ها: ${scan.tech.join(", ") || "نامشخص"}; README: ${scan.readme}\nنسخه انتشار: status ${scan.siteStatus}; title: ${scan.siteTitle}; description: ${scan.siteDescription}`, "project_pricing_scan").catch(() => null);
    const result = ai ? parseAi(ai.content, fallback) : fallback;
    const summary = `GitHub: ${scan.owner}/${scan.repo} · ${scan.sourceFiles} فایل کد · ${scan.tech.join("، ") || "فناوری مشخص نشد"} · Deploy: ${scan.deploymentHost} (${scan.siteStatus})`;
    const [analysis] = await db.insert(projectAnalyses).values({ projectId: project.id, codeScore: result.codeScore, productScore: result.productScore, marketScore: result.marketScore, estimatedMin: result.estimatedMin, estimatedMax: result.estimatedMax, report: result.report, scanSummary: summary, analysisSource: result.analysisSource }).returning();
    const [updated] = await db.update(studentProjects).set({ lastScanStatus: "completed", lastScannedAt: new Date(), screenshotUrl: screenshotUrlFor(project.deploymentUrl) }).where(eq(studentProjects.id, project.id)).returning();
    return toView(updated, analysis);
  } catch (error) {
    await db.update(studentProjects).set({ lastScanStatus: "error", lastScannedAt: new Date() }).where(eq(studentProjects.id, project.id));
    throw error;
  }
}

export async function ensureDemoProject(userId: number) {
  const [existing] = await db.select({ id: studentProjects.id, screenshotUrl: studentProjects.screenshotUrl }).from(studentProjects).where(and(eq(studentProjects.userId, userId), eq(studentProjects.githubUrl, "https://github.com/vercel/next.js"))).limit(1);
  if (existing) {
    if (!existing.screenshotUrl) await db.update(studentProjects).set({ screenshotUrl: screenshotUrlFor("https://nextjs.org/") }).where(eq(studentProjects.id, existing.id));
    return;
  }
  const [project] = await db.insert(studentProjects).values({ userId, name: "نمونه‌ی VibeLab — لندینگ و پنل AI", description: "نمونه‌ی تمرینی یک محصول محتوایی و پنل کاربری مبتنی بر Next.js برای نمایش مسیر ساخت، داشبورد و تجربه‌ی تعاملی.", githubUrl: "https://github.com/vercel/next.js", deploymentUrl: "https://nextjs.org/", screenshotUrl: screenshotUrlFor("https://nextjs.org/"), lastScanStatus: "demo_ready", lastScannedAt: new Date() }).returning();
  const fallback = { codeScore: 88, productScore: 86, marketScore: 76, estimatedMin: 24_000_000, estimatedMax: 42_000_000, report: "این یک پروژه‌ی نمونه برای نمایش چرخه‌ی اسکن GitHub، بررسی انتشار و تخمین قیمت است. در پروژه‌ی واقعی، قیمت به scope، طراحی، محتوا، APIها، زمان تحویل و پشتیبانی وابسته است.", analysisSource: "demo" };
  await db.insert(projectAnalyses).values({ projectId: project.id, ...fallback, scanSummary: "نمونه‌ی عمومی: GitHub vercel/next.js · انتشار: nextjs.org · داده‌ی نمایشی برای تست پنل" });
}
