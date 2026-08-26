import { getVibelabD1 } from "@/lib/cloudflare-d1";
import { baseResources, learningHubs, mentors } from "@/lib/learning-data";

export type ResumeRagInput = {
  fullName: string;
  resumeText: string;
  goal: string;
  cityPreference?: string;
};

export type ResumeRagInsight = {
  provider: "huggingface_rag" | "local_rag";
  model: string | null;
  summary: string;
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  retrievedSources: { title: string; category: string; url?: string }[];
  error?: string;
};

type KnowledgeDocument = {
  id: string;
  title: string;
  category: string;
  content: string;
  url?: string;
};

function knowledgeDocuments(): KnowledgeDocument[] {
  const resources = baseResources.map((item, index) => ({
    id: `resource-${index}`,
    title: item.title,
    category: item.source,
    content: `${item.title}. ${item.reason}. سطح: ${item.level}.`,
    url: item.url,
  }));
  const hubs = learningHubs.map((item) => ({
    id: `hub-${item.id}`,
    title: item.title,
    category: "نقطه آموزشی",
    content: `${item.city} ${item.area}. مناسب برای ${item.bestFor}. هزینه فضا: ${item.coworkingCost}. هزینه مربی: ${item.mentorSessionCost}.`,
  }));
  const mentorDocs = mentors.map((item) => ({
    id: `mentor-${item.id}`,
    title: item.name,
    category: "مربی",
    content: `${item.specialty}. شهر: ${item.city}. مناسب برای ${item.bestFor}. هزینه: ${item.dayRate}.`,
  }));
  const pathways: KnowledgeDocument[] = [
    {
      id: "path-website",
      title: "مسیر طراحی سایت با AI",
      category: "مسیر آموزشی",
      content: "تحلیل نیاز مشتری، ساخت لندینگ، Vibe Coding، Cloudflare Workers، فرم D1، SEO محلی و ساخت نمونه‌کار قابل ارائه.",
    },
    {
      id: "path-content",
      title: "مسیر تولید محتوا با AI",
      category: "مسیر آموزشی",
      content: "تحقیق مخاطب، prompt system، سناریو، کپشن، استوری‌بورد، ویدیو کوتاه، تقویم محتوا و پرزنت مشتری.",
    },
    {
      id: "path-market",
      title: "مسیر بازاریابی و گرفتن پروژه",
      category: "بازار کار",
      content: "پیام معرفی، لیست مشتری محلی، پیشنهاد قیمت، نمونه‌کار، آگهی دیوار و شیپور، پونیشا، جابینجا، لینکدین و برنامه ۷ روزه جذب پروژه.",
    },
    {
      id: "path-school",
      title: "مدرسه اسنپی و گروه محلی",
      category: "مدل حضور",
      content: "پس از تحلیل رزومه، نزدیک‌ترین نقطه آموزشی و مربی پیشنهاد می‌شود. با رسیدن حداقل ۴ نفر در منطقه، جلسه حضوری هماهنگ می‌شود؛ در غیر این صورت آنلاین یا هیبرید برگزار می‌شود.",
    },
  ];
  return [...resources, ...hubs, ...mentorDocs, ...pathways];
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\u0600-\u06ff\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function retrieve(query: string, limit = 7) {
  const queryTerms = new Set(tokenize(query));
  return knowledgeDocuments()
    .map((doc) => {
      const content = `${doc.title} ${doc.content}`.toLowerCase();
      let score = 0;
      for (const term of queryTerms) if (content.includes(term)) score += 1;
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, "fa"))
    .slice(0, limit)
    .map(({ doc }) => doc);
}

async function persistKnowledge() {
  try {
    const db = await getVibelabD1();
    if (!db) return;
    await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      url TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    for (const document of knowledgeDocuments()) {
      await db
        .prepare("INSERT OR REPLACE INTO vibelab_rag_documents (id, title, category, content, url, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(document.id, document.title, document.category, document.content, document.url ?? null, new Date().toISOString())
        .run();
    }
  } catch {
    // Local in-memory knowledge still provides a reliable fallback.
  }
}

function localInsight(input: ResumeRagInput, docs: KnowledgeDocument[]): ResumeRagInsight {
  const text = `${input.resumeText} ${input.goal}`;
  const hasProject = /پروژه|نمونه.?کار|سایت|لندینگ|github|گیتهاب/i.test(text);
  const hasContent = /محتوا|کپشن|سناریو|ویدیو|اینستاگرام/i.test(text);
  const hasExperience = /تجربه|کار|فریلنس|مشتری/i.test(text);
  const strengths = [
    hasProject ? "نشانه‌ای از علاقه یا تجربه ساخت پروژه دارد." : "آمادگی تعریف اولین پروژه کوچک را دارد.",
    hasContent ? "مسیر تولید محتوا برای او قابل استفاده است." : "می‌تواند با مسیر طراحی سایت یا نمونه‌کار شروع کند.",
  ];
  const gaps = [
    !hasProject ? "نمونه‌کار یا لینک پروژه آنلاین نیاز به تکمیل دارد." : "توضیح مسئله، ابزار و نتیجه پروژه باید شفاف‌تر شود.",
    !hasExperience ? "پیام معرفی و برنامه جذب اولین مشتری پیشنهاد می‌شود." : "نتیجه‌های قابل اندازه‌گیری تجربه‌ها را به رزومه اضافه کند.",
  ];
  return {
    provider: "local_rag",
    model: null,
    summary: `بر اساس رزومه و منابع داخلی VibeLab، مسیر پیشنهادی برای ${input.fullName} ترکیبی از ساخت نمونه‌کار، آموزش هدفمند و آماده‌سازی برای بازار کار است.`,
    strengths,
    gaps,
    nextActions: [
      "یک ویدیوی شروع از منابع پیشنهادی تماشا کن.",
      "یک خروجی کوچک شامل سایت، Content Kit یا پروژه نمونه بساز.",
      "رزومه و پیام معرفی را برای گرفتن پروژه تکمیل کن.",
    ],
    retrievedSources: docs.map((doc) => ({ title: doc.title, category: doc.category, url: doc.url })),
  };
}

function parseJson(content: string) {
  const cleaned = content.replace(/```json|```/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as { summary?: unknown; strengths?: unknown; gaps?: unknown; nextActions?: unknown };
  } catch {
    return null;
  }
}

export async function analyzeResumeWithRag(input: ResumeRagInput): Promise<ResumeRagInsight> {
  const docs = retrieve(`${input.resumeText} ${input.goal} ${input.cityPreference ?? ""}`);
  void persistKnowledge();
  const fallback = localInsight(input, docs);
  const hfToken = process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_HUB_TOKEN?.trim();
  const model = process.env.HF_RAG_MODEL?.trim() || "Qwen/Qwen2.5-7B-Instruct";
  if (!hfToken) return fallback;

  const context = docs.map((doc, index) => `${index + 1}. [${doc.category}] ${doc.title}: ${doc.content}`).join("\n");
  const prompt = `شما مشاور آموزشی و کاریابی VibeLab هستید. فقط با توجه به رزومه و منابع بازیابی‌شده، یک پیشنهاد شخصی‌سازی‌شده فارسی بده. پاسخ فقط JSON معتبر باشد:
{"summary":"...","strengths":["..."],"gaps":["..."],"nextActions":["..."]}

نام: ${input.fullName}
هدف: ${input.goal}
شهر/محله: ${input.cityPreference ?? "نامشخص"}
رزومه/معرفی: ${input.resumeText}

منابع بازیابی‌شده:
${context}

قواعد: حداکثر ۳ مورد برای هر لیست؛ هیچ وعده استخدام یا درآمد قطعی نده؛ پیشنهادها عملی و کوتاه باشند.`;

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You return strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.25,
        max_tokens: 700,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const payload = (await response.json().catch(() => ({}))) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || `HF HTTP ${response.status}`);
    const parsed = parseJson(payload.choices?.[0]?.message?.content ?? "");
    if (!parsed) throw new Error("HF returned invalid JSON");
    const list = (value: unknown, fallbackList: string[]) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 3) : fallbackList;
    return {
      provider: "huggingface_rag",
      model,
      summary: typeof parsed.summary === "string" && parsed.summary.length > 20 ? parsed.summary.slice(0, 900) : fallback.summary,
      strengths: list(parsed.strengths, fallback.strengths),
      gaps: list(parsed.gaps, fallback.gaps),
      nextActions: list(parsed.nextActions, fallback.nextActions),
      retrievedSources: fallback.retrievedSources,
    };
  } catch (error) {
    return { ...fallback, error: error instanceof Error ? error.message.slice(0, 200) : "HF RAG unavailable" };
  }
}
