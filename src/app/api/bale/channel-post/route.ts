import { NextRequest, NextResponse } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

const SITE_URL = "https://v2.vibelab.ir";

const baleTemplates = [
  {
    title: "مدرسه اسنپی VibeLab",
    text: "مدل جدید VibeLab برای دانش‌آموز، مربی و مدرسه آماده شد: دانش‌آموز هدف و رزومه را می‌دهد، AI مسیر را پیشنهاد می‌دهد و نزدیک‌ترین مدرسه/فضای آموزشی و مربی مناسب نمایش داده می‌شود.",
    cta: `${SITE_URL}/school-snap`,
  },
  {
    title: "کارآموزی طراحی سایت و تولید محتوا",
    text: "اگر می‌خواهی با AI سایت بسازی یا تولید محتوا را پروژه‌محور یاد بگیری، مدل کارآموزی نقطه‌ای VibeLab فعال است. اگر گروه یک نقطه به ۴ نفر برسد حضوری، و اگر کمتر باشد آنلاین/هیبرید برگزار می‌شود.",
    cta: `${SITE_URL}/internship`,
  },
  {
    title: "مسیر آموزشی از روی رزومه",
    text: "رزومه یا معرفی کوتاهت را وارد کن تا مسیر آموزشی، ویدیوهای رایگان، منابع فارسی، برنامه دو روزه، نقطه آموزشی و مربی مناسب پیشنهاد شود.",
    cta: `${SITE_URL}/learning-plan`,
  },
];

function botToken() {
  return process.env.BALE_BOT_TOKEN?.trim();
}

function channelId() {
  return process.env.BALE_CHANNEL_ID?.trim();
}

function postSecret() {
  return process.env.BALE_CHANNEL_POST_SECRET?.trim() || process.env.TELEGRAM_CHANNEL_POST_SECRET?.trim();
}

function formatPost(template: (typeof baleTemplates)[number]) {
  return `🚀 ${template.title}\n\n${template.text}\n\n🔗 ${template.cta}\n\n#VibeLab #AI #کارآموزی #مدرسه_اسنپی #مسیر`;
}

async function ensureTable() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_bale_channel_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    cta_url TEXT,
    provider_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_at TEXT
  )`).run();
  return db;
}

async function logPost(input: { title: string; body: string; ctaUrl?: string; messageId?: string; status: string; error?: string }) {
  try {
    const db = await ensureTable();
    if (!db) return;
    await db
      .prepare("INSERT INTO vibelab_bale_channel_posts (channel_id, title, body, cta_url, provider_message_id, status, error, posted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(channelId() ?? null, input.title, input.body, input.ctaUrl ?? null, input.messageId ?? null, input.status, input.error ?? null, input.status === "posted" ? new Date().toISOString() : null)
      .run();
  } catch {
    // Ignore logging failures.
  }
}

async function sendBalePost(text: string) {
  const token = botToken();
  const chatId = channelId();
  if (!token) throw new Error("BALE_BOT_TOKEN is not configured");
  if (!chatId) throw new Error("BALE_CHANNEL_ID is not configured");

  // Bale Bot API is Telegram-like. If your bot provider uses a different base URL, set BALE_API_BASE.
  const base = process.env.BALE_API_BASE?.trim() || "https://tapi.bale.ai";
  const response = await fetch(`${base}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: false }),
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; result?: { message_id?: string | number }; description?: string };
  if (!response.ok || data.ok === false) throw new Error(data.description || `Bale HTTP ${response.status}`);
  return data.result?.message_id ? String(data.result.message_id) : null;
}

function checkAuth(request: NextRequest) {
  const secret = postSecret();
  if (!secret) return false;
  return request.headers.get("x-vibelab-bale-secret") === secret || request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    messenger: "bale",
    channelConfigured: Boolean(channelId()),
    botConfigured: Boolean(botToken()),
    postingSecretConfigured: Boolean(postSecret()),
    templates: baleTemplates.map((item) => ({ title: item.title, cta: item.cta })),
    note: "POST with x-vibelab-bale-secret. Use dryRun=true to preview. Set BALE_BOT_TOKEN and BALE_CHANNEL_ID to publish.",
  });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { templateIndex?: number; title?: string; text?: string; cta?: string; dryRun?: boolean };
  const template = typeof body.templateIndex === "number" ? baleTemplates[Math.abs(body.templateIndex) % baleTemplates.length] : baleTemplates[new Date().getDate() % baleTemplates.length];
  const selected = {
    title: body.title?.trim() || template.title,
    text: body.text?.trim() || template.text,
    cta: body.cta?.trim() || template.cta,
  };
  const postText = formatPost({ title: selected.title, text: selected.text, cta: selected.cta });

  if (body.dryRun) {
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, status: "dry_run" });
    return NextResponse.json({ ok: true, dryRun: true, messenger: "bale", text: postText });
  }

  try {
    const messageId = await sendBalePost(postText);
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, messageId: messageId ?? undefined, status: "posted" });
    return NextResponse.json({ ok: true, messenger: "bale", messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bale post failed";
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, status: "failed", error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
