import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aiProviderConfigs, aiUsageEvents } from "@/db/schema";

export type AssessmentInput = {
  goal: string;
  experienceLevel: string;
  weeklyHours: number;
  projectIdea: string;
};

export type AssessmentResult = {
  score: number;
  fitLevel: "آماده برای ماراتن" | "نیازمند آماده‌سازی کوتاه" | "پیشنهاد مسیر مقدماتی";
  recommendation: string;
  analysisSource: "ai" | "rule_based";
};

function ruleBasedAssessment(input: AssessmentInput): AssessmentResult {
  let score = 42;
  if (input.weeklyHours >= 8) score += 25;
  else if (input.weeklyHours >= 5) score += 17;
  else if (input.weeklyHours >= 3) score += 8;

  if (input.experienceLevel === "پروژه یا تجربه‌ی کاری داشته‌ام") score += 17;
  else if (input.experienceLevel === "با ابزارهای AI کمی کار کرده‌ام") score += 13;
  else if (input.experienceLevel === "تازه شروع کرده‌ام") score += 8;

  if (input.projectIdea.trim().length >= 60) score += 11;
  else if (input.projectIdea.trim().length >= 25) score += 6;

  if (input.goal.includes("وب") || input.goal.includes("اپ") || input.goal.includes("محتوا") || input.goal.includes("فریلنس")) score += 5;
  score = Math.min(100, score);

  if (score >= 75) {
    return {
      score,
      fitLevel: "آماده برای ماراتن",
      recommendation: "هدف روشن، زمان تمرین مناسب و ایده‌ی قابل‌ساختی دارید. ماراتن دو روزه برای تبدیل ایده‌تان به Content Kit و نسخه‌ی اول وب‌اپ مناسب است. پیش از شروع، یک نمونه از کسب‌وکار یا مخاطب هدف خود را آماده کنید.",
      analysisSource: "rule_based",
    };
  }
  if (score >= 55) {
    return {
      score,
      fitLevel: "نیازمند آماده‌سازی کوتاه",
      recommendation: "پتانسیل خوبی برای شرکت در ماراتن دارید. برای نتیجه‌ی بهتر، پیش از شروع یک ساعت برای مشخص‌کردن مخاطب، پیام اصلی و سه قابلیت ضروری ایده‌تان وقت بگذارید؛ منتور در روز اول مسیر را با شما هم‌راستا می‌کند.",
      analysisSource: "rule_based",
    };
  }
  return {
    score,
    fitLevel: "پیشنهاد مسیر مقدماتی",
    recommendation: "این ماراتن فشرده است و برای گرفتن خروجی واقعی به زمان تمرین بیشتری نیاز دارید. ابتدا با یک تمرین کوتاه Google AI Studio و یک ایده‌ی کوچک شروع کنید، سپس با هدف و زمان روشن‌تر وارد ماراتن شوید. این یک پیشنهاد آموزشی است، نه تصمیم قطعی درباره‌ی توانایی شما.",
    analysisSource: "rule_based",
  };
}

function parseAiResult(content: string, fallback: AssessmentResult): AssessmentResult {
  try {
    const normalized = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(normalized) as { score?: unknown; fitLevel?: unknown; recommendation?: unknown };
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : fallback.score;
    const validLevels = ["آماده برای ماراتن", "نیازمند آماده‌سازی کوتاه", "پیشنهاد مسیر مقدماتی"];
    const fitLevel = typeof parsed.fitLevel === "string" && validLevels.includes(parsed.fitLevel) ? parsed.fitLevel as AssessmentResult["fitLevel"] : fallback.fitLevel;
    const recommendation = typeof parsed.recommendation === "string" && parsed.recommendation.trim().length > 20 ? parsed.recommendation.trim().slice(0, 700) : fallback.recommendation;
    return { score, fitLevel, recommendation, analysisSource: "ai" };
  } catch {
    return fallback;
  }
}

async function runAiAnalysis(provider: typeof aiProviderConfigs.$inferSelect, apiKey: string, input: AssessmentInput, fallback: AssessmentResult) {
  const prompt = `شما مشاور آموزشی ماراتن دو روزه VibeLab هستید. فقط بر اساس اطلاعات زیر، مناسب‌بودن کاربر برای دوره را تحلیل کنید. هیچ ادعای استخدام، سلامت یا توانایی ذاتی نکنید. پاسخ فقط JSON معتبر و بدون markdown باشد: {"score": عدد 0 تا 100, "fitLevel": یکی از «آماده برای ماراتن»، «نیازمند آماده‌سازی کوتاه»، «پیشنهاد مسیر مقدماتی»، "recommendation": متن فارسی 2 تا 4 جمله‌ای، مثبت و عملی}.
هدف: ${input.goal}
سطح تجربه: ${input.experienceLevel}
ساعت قابل‌اختصاص در هفته: ${input.weeklyHours}
ایده پروژه: ${input.projectIdea}`;
  const signal = AbortSignal.timeout(20_000);

  if (provider.provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: provider.model, temperature: 0.2, max_tokens: 350, messages: [{ role: "system", content: "You return strict JSON only." }, { role: "user", content: prompt }] }),
      signal,
    });
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `OpenAI پاسخ ${response.status} داد.`);
    return { result: parseAiResult(payload.choices?.[0]?.message?.content ?? "", fallback), inputTokens: payload.usage?.prompt_tokens ?? 0, outputTokens: payload.usage?.completion_tokens ?? 0 };
  }

  if (provider.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: provider.model, max_tokens: 350, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
      signal,
    });
    const payload = (await response.json()) as { content?: { text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `Anthropic پاسخ ${response.status} داد.`);
    return { result: parseAiResult(payload.content?.[0]?.text ?? "", fallback), inputTokens: payload.usage?.input_tokens ?? 0, outputTokens: payload.usage?.output_tokens ?? 0 };
  }

  if (provider.provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ generationConfig: { temperature: 0.2, maxOutputTokens: 350, responseMimeType: "application/json" }, contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      signal,
    });
    const payload = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `Gemini پاسخ ${response.status} داد.`);
    return { result: parseAiResult(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "", fallback), inputTokens: payload.usageMetadata?.promptTokenCount ?? 0, outputTokens: payload.usageMetadata?.candidatesTokenCount ?? 0 };
  }

  throw new Error("ارائه‌دهنده پشتیبانی نمی‌شود.");
}

function decryptStoredKey(ciphertext: string) {
  const { createDecipheriv, createHash } = require("crypto") as typeof import("crypto");
  const secret = process.env.AI_KEYS_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("AI vault پیکربندی نشده است.");
  const [ivValue, tagValue, encryptedValue] = ciphertext.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("کلید ذخیره‌شده معتبر نیست.");
  const key = createHash("sha256").update(secret).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64")), decipher.final()]).toString("utf8");
}

function resolveKey(provider: typeof aiProviderConfigs.$inferSelect) {
  if (provider.secretSource === "environment") {
    if (!provider.environmentVariable) throw new Error("متغیر محیطی تعریف نشده است.");
    const apiKey = process.env[provider.environmentVariable];
    if (!apiKey) throw new Error("کلید محیطی در production پیدا نشد.");
    return apiKey;
  }
  if (!provider.keyCiphertext) throw new Error("کلید vault پیدا نشد.");
  return decryptStoredKey(provider.keyCiphertext);
}

export async function assessStudentFit(input: AssessmentInput): Promise<AssessmentResult> {
  const fallback = ruleBasedAssessment(input);
  const [provider] = await db
    .select()
    .from(aiProviderConfigs)
    .where(eq(aiProviderConfigs.lastStatus, "connected"))
    .limit(1);

  if (!provider) return fallback;
  if (provider.monthlyTokenLimit > 0 && provider.tokensUsed >= provider.monthlyTokenLimit) return fallback;

  try {
    const analysis = await runAiAnalysis(provider, resolveKey(provider), input, fallback);
    await db.insert(aiUsageEvents).values({ providerId: provider.id, inputTokens: analysis.inputTokens, outputTokens: analysis.outputTokens, source: "student_fit_assessment" });
    await db.update(aiProviderConfigs).set({ tokensUsed: provider.tokensUsed + analysis.inputTokens + analysis.outputTokens, updatedAt: new Date() }).where(eq(aiProviderConfigs.id, provider.id));
    return analysis.result;
  } catch {
    return fallback;
  }
}
