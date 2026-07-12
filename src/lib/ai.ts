import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiProviderConfigs, aiUsageEvents } from "@/db/schema";

export const AI_PROVIDER_OPTIONS = [
  { id: "openai", name: "OpenAI", defaultModel: "gpt-4.1-mini", environmentVariable: "OPENAI_API_KEY" },
  { id: "anthropic", name: "Anthropic / Claude", defaultModel: "claude-sonnet-4-5", environmentVariable: "ANTHROPIC_API_KEY" },
  { id: "gemini", name: "Google Gemini", defaultModel: "gemini-2.5-flash", environmentVariable: "GEMINI_API_KEY" },
] as const;

export type AiProviderId = (typeof AI_PROVIDER_OPTIONS)[number]["id"];
export type AiAlert = { severity: "info" | "warning" | "critical"; text: string };

export type AiProviderDashboardItem = {
  id: number;
  provider: AiProviderId;
  providerName: string;
  label: string;
  model: string;
  keyFingerprint: string;
  secretSource: "vault" | "environment";
  environmentVariable: string | null;
  monthlyTokenLimit: number;
  warningThreshold: number;
  tokensUsed: number;
  usagePercent: number;
  lastStatus: string;
  lastError: string | null;
  lastTestedAt: string | null;
  isWarning: boolean;
  isOverLimit: boolean;
};

function vaultKey() {
  const secret = process.env.AI_KEYS_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("AI key vault is not configured.");
  return createHash("sha256").update(secret).digest();
}

function encryptApiKey(apiKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", vaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptApiKey(ciphertext: string) {
  const [ivValue, tagValue, encryptedValue] = ciphertext.split(".");
  if (!ivValue || !tagValue || !encryptedValue) throw new Error("Stored API key is invalid.");
  const decipher = createDecipheriv("aes-256-gcm", vaultKey(), Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64")), decipher.final()]).toString("utf8");
}

function providerOption(provider: string) {
  return AI_PROVIDER_OPTIONS.find((item) => item.id === provider) ?? null;
}

function fingerprint(apiKey: string) {
  return `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}`;
}

function safeError(message: string) {
  return message.replace(/[A-Za-z0-9_-]{18,}/g, "[redacted]").slice(0, 330);
}

export async function ensureEnvironmentProviders() {
  for (const option of AI_PROVIDER_OPTIONS) {
    const apiKey = process.env[option.environmentVariable];
    if (!apiKey) continue;
    const label = `${option.name} (محیط)`;
    await db
      .insert(aiProviderConfigs)
      .values({
        provider: option.id,
        label,
        secretSource: "environment",
        environmentVariable: option.environmentVariable,
        keyFingerprint: fingerprint(apiKey),
        model: option.defaultModel,
      })
      .onConflictDoNothing();
  }
}

function serializeProvider(row: typeof aiProviderConfigs.$inferSelect): AiProviderDashboardItem {
  const option = providerOption(row.provider);
  const usagePercent = row.monthlyTokenLimit > 0 ? Math.round((row.tokensUsed / row.monthlyTokenLimit) * 100) : 0;
  return {
    id: row.id,
    provider: (option?.id ?? "openai") as AiProviderId,
    providerName: option?.name ?? row.provider,
    label: row.label,
    model: row.model,
    keyFingerprint: row.keyFingerprint,
    secretSource: row.secretSource === "environment" ? "environment" : "vault",
    environmentVariable: row.environmentVariable,
    monthlyTokenLimit: row.monthlyTokenLimit,
    warningThreshold: row.warningThreshold,
    tokensUsed: row.tokensUsed,
    usagePercent,
    lastStatus: row.lastStatus,
    lastError: row.lastError,
    lastTestedAt: row.lastTestedAt?.toISOString() ?? null,
    isWarning: usagePercent >= row.warningThreshold,
    isOverLimit: usagePercent >= 100,
  };
}

export async function getAiDashboardData() {
  await ensureEnvironmentProviders();
  const rows = await db.select().from(aiProviderConfigs).orderBy(desc(aiProviderConfigs.createdAt));
  const providers = rows.map(serializeProvider);
  const alerts: AiAlert[] = [];
  for (const provider of providers) {
    if (provider.isOverLimit) {
      alerts.push({ severity: "critical", text: `${provider.label}: سقف ماهانه‌ی توکن رد شده است.` });
    } else if (provider.isWarning) {
      alerts.push({ severity: "warning", text: `${provider.label}: مصرف به ${provider.usagePercent}٪ از سقف رسیده است.` });
    } else if (provider.lastStatus === "error") {
      alerts.push({ severity: "warning", text: `${provider.label}: آخرین تست اتصال ناموفق بوده است.` });
    }
  }
  if (providers.length === 0) alerts.unshift({ severity: "info", text: "هیچ API هوش مصنوعی تنظیم نشده است؛ از بخش افزودن اتصال شروع کنید." });
  return { providers, alerts };
}

export async function addAiProvider(input: { provider: string; label: string; apiKey: string; model?: string; monthlyTokenLimit?: number; warningThreshold?: number }) {
  const option = providerOption(input.provider);
  if (!option) throw new Error("ارائه‌دهنده‌ی انتخاب‌شده پشتیبانی نمی‌شود.");
  const label = input.label.trim() || option.name;
  const apiKey = input.apiKey.trim();
  if (apiKey.length < 8) throw new Error("کلید API معتبر نیست.");
  const tokenLimit = Math.max(1_000, Math.min(1_000_000_000, Math.round(input.monthlyTokenLimit ?? 1_000_000)));
  const warningThreshold = Math.max(50, Math.min(100, Math.round(input.warningThreshold ?? 80)));

  const [provider] = await db
    .insert(aiProviderConfigs)
    .values({
      provider: option.id,
      label,
      secretSource: "vault",
      keyCiphertext: encryptApiKey(apiKey),
      keyFingerprint: fingerprint(apiKey),
      model: input.model?.trim() || option.defaultModel,
      monthlyTokenLimit: tokenLimit,
      warningThreshold,
    })
    .returning();
  return serializeProvider(provider);
}

export async function updateAiProvider(id: number, input: { label?: string; model?: string; monthlyTokenLimit?: number; warningThreshold?: number; tokensUsed?: number }) {
  const changes: Partial<typeof aiProviderConfigs.$inferInsert> = { updatedAt: new Date() };
  if (typeof input.label === "string" && input.label.trim()) changes.label = input.label.trim();
  if (typeof input.model === "string" && input.model.trim()) changes.model = input.model.trim();
  if (typeof input.monthlyTokenLimit === "number") changes.monthlyTokenLimit = Math.max(1_000, Math.min(1_000_000_000, Math.round(input.monthlyTokenLimit)));
  if (typeof input.warningThreshold === "number") changes.warningThreshold = Math.max(50, Math.min(100, Math.round(input.warningThreshold)));
  if (typeof input.tokensUsed === "number") changes.tokensUsed = Math.max(0, Math.min(1_000_000_000, Math.round(input.tokensUsed)));

  const [provider] = await db.update(aiProviderConfigs).set(changes).where(eq(aiProviderConfigs.id, id)).returning();
  return provider ? serializeProvider(provider) : null;
}

async function resolveProviderKey(row: typeof aiProviderConfigs.$inferSelect) {
  if (row.secretSource === "environment") {
    if (!row.environmentVariable) throw new Error("نام متغیر محیطی API مشخص نشده است.");
    const apiKey = process.env[row.environmentVariable];
    if (!apiKey) throw new Error(`${row.environmentVariable} در محیط production تنظیم نشده است.`);
    return apiKey;
  }
  if (!row.keyCiphertext) throw new Error("کلید رمزنگاری‌شده‌ی API پیدا نشد.");
  return decryptApiKey(row.keyCiphertext);
}

async function probeProvider(provider: string, apiKey: string) {
  const signal = AbortSignal.timeout(12_000);
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${apiKey}` }, signal });
    const payload = (await response.json().catch(() => ({}))) as { data?: unknown[]; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `OpenAI پاسخ ${response.status} داد.`);
    return `اتصال OpenAI برقرار است؛ ${payload.data?.length ?? 0} مدل در دسترس است.`;
  }
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/models", { headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, signal });
    const payload = (await response.json().catch(() => ({}))) as { data?: unknown[]; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `Anthropic پاسخ ${response.status} داد.`);
    return `اتصال Anthropic برقرار است؛ ${payload.data?.length ?? 0} مدل در دسترس است.`;
  }
  if (provider === "gemini") {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", { headers: { "x-goog-api-key": apiKey }, signal });
    const payload = (await response.json().catch(() => ({}))) as { models?: unknown[]; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? `Gemini پاسخ ${response.status} داد.`);
    return `اتصال Gemini برقرار است؛ ${payload.models?.length ?? 0} مدل در دسترس است.`;
  }
  throw new Error("ارائه‌دهنده ناشناخته است.");
}

export async function testAiProvider(id: number) {
  const [row] = await db.select().from(aiProviderConfigs).where(eq(aiProviderConfigs.id, id)).limit(1);
  if (!row) throw new Error("اتصال API پیدا نشد.");

  try {
    const message = await probeProvider(row.provider, await resolveProviderKey(row));
    const [updated] = await db.update(aiProviderConfigs).set({ lastStatus: "connected", lastError: null, lastTestedAt: new Date(), updatedAt: new Date() }).where(eq(aiProviderConfigs.id, id)).returning();
    return { provider: serializeProvider(updated), message };
  } catch (error) {
    const message = safeError(error instanceof Error ? error.message : "تست اتصال ناموفق بود.");
    const [updated] = await db.update(aiProviderConfigs).set({ lastStatus: "error", lastError: message, lastTestedAt: new Date(), updatedAt: new Date() }).where(eq(aiProviderConfigs.id, id)).returning();
    return { provider: serializeProvider(updated), message };
  }
}

export async function runConfiguredAiJson(prompt: string, source: string) {
  const [provider] = await db.select().from(aiProviderConfigs).where(eq(aiProviderConfigs.lastStatus, "connected")).limit(1);
  if (!provider || provider.tokensUsed >= provider.monthlyTokenLimit) return null;
  const apiKey = await resolveProviderKey(provider);
  const signal = AbortSignal.timeout(25_000);
  let content = "";
  let inputTokens = 0;
  let outputTokens = 0;

  if (provider.provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: provider.model, temperature: 0.2, max_tokens: 500, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Return strict JSON only." }, { role: "user", content: prompt }] }), signal });
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? "OpenAI analysis failed");
    content = payload.choices?.[0]?.message?.content ?? ""; inputTokens = payload.usage?.prompt_tokens ?? 0; outputTokens = payload.usage?.completion_tokens ?? 0;
  } else if (provider.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }, body: JSON.stringify({ model: provider.model, max_tokens: 500, temperature: 0.2, messages: [{ role: "user", content: prompt }] }), signal });
    const payload = (await response.json()) as { content?: { text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? "Anthropic analysis failed");
    content = payload.content?.[0]?.text ?? ""; inputTokens = payload.usage?.input_tokens ?? 0; outputTokens = payload.usage?.output_tokens ?? 0;
  } else if (provider.provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent`, { method: "POST", headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ generationConfig: { temperature: 0.2, maxOutputTokens: 500, responseMimeType: "application/json" }, contents: [{ parts: [{ text: prompt }] }] }), signal });
    const payload = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? "Gemini analysis failed");
    content = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ""; inputTokens = payload.usageMetadata?.promptTokenCount ?? 0; outputTokens = payload.usageMetadata?.candidatesTokenCount ?? 0;
  } else return null;

  await db.insert(aiUsageEvents).values({ providerId: provider.id, inputTokens, outputTokens, source });
  await db.update(aiProviderConfigs).set({ tokensUsed: provider.tokensUsed + inputTokens + outputTokens, updatedAt: new Date() }).where(eq(aiProviderConfigs.id, provider.id));
  return { content, providerLabel: provider.label };
}

export async function recordAiUsage(providerId: number, inputTokens: number, outputTokens: number, source = "application") {
  const incoming = Math.max(0, Math.round(inputTokens));
  const outgoing = Math.max(0, Math.round(outputTokens));
  await db.insert(aiUsageEvents).values({ providerId, inputTokens: incoming, outputTokens: outgoing, source });
  const [row] = await db.select().from(aiProviderConfigs).where(eq(aiProviderConfigs.id, providerId)).limit(1);
  if (!row) throw new Error("AI provider not found");
  const [updated] = await db.update(aiProviderConfigs).set({ tokensUsed: row.tokensUsed + incoming + outgoing, updatedAt: new Date() }).where(eq(aiProviderConfigs.id, providerId)).returning();
  return serializeProvider(updated);
}
