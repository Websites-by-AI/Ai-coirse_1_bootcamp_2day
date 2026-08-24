import { NextRequest, NextResponse } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

const CHANNEL_ID = "@vibelab_channel";
const CHANNEL_URL = "https://t.me/vibelab_channel";
const SITE_URL = "https://v2.vibelab.ir";

const postTemplates = [
  {
    title: "مسیر امروز VibeLab",
    text: "اگر می‌خواهی با AI وارد بازار کار شوی، از رزومه شروع کن. رزومه‌ات را وارد کن تا مسیر آموزش، ویدیو، مربی و نقطه آموزشی پیشنهادی بگیری.",
    cta: `${SITE_URL}/learning-plan`,
  },
  {
    title: "کارآموزی طراحی سایت با AI",
    text: "در VibeLab می‌توانی با مدل کارآموزی نقطه‌ای، ساخت لندینگ و سایت معرفی را تمرین کنی. ۳۰ دقیقه اول آشنایی رایگان است و بعد هزینه فضای کار اشتراکی با کارآموز است.",
    cta: `${SITE_URL}/internship`,
  },
  {
    title: "کارآموزی تولید محتوا با AI",
    text: "از سناریو و کپشن تا ویدیو کوتاه و تقویم محتوا؛ مسیر تولید محتوا با AI برای ساخت نمونه‌کار واقعی طراحی شده است.",
    cta: `${SITE_URL}/internship`,
  },
  {
    title: "MASIR — از رزومه تا اولین پروژه",
    text: "مسیر پنج مرحله دارد: تحلیل رزومه، دوره هدفمند، معلم محلی مثل اسنپ، مدرک معتبر و اتصال به بازار کار ایران و جهان.",
    cta: `${SITE_URL}/masir`,
  },
  {
    title: "ربات VibeLab",
    text: "داخل ربات تلگرام، یک معرفی کوتاه از خودت بفرست تا مسیر آموزشی، نقطه پیشنهادی، مربی و برنامه دو روزه را خلاصه دریافت کنی.",
    cta: "https://t.me/ai_vibelab_bot",
  },
];

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim();
}

function postSecret() {
  return process.env.TELEGRAM_CHANNEL_POST_SECRET?.trim() || process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
}

function formatPost(template: (typeof postTemplates)[number]) {
  return `🚀 ${template.title}\n\n${template.text}\n\n🔗 ${template.cta}\n\n#VibeLab #AI #کارآموزی #رزومه #مسیر`;
}

async function ensureTable() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_channel_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    cta_url TEXT,
    telegram_message_id INTEGER,
    status TEXT NOT NULL DEFAULT 'draft',
    error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_at TEXT
  )`).run();
  return db;
}

async function logPost(input: { title: string; body: string; ctaUrl?: string; messageId?: number; status: string; error?: string }) {
  try {
    const db = await ensureTable();
    if (!db) return;
    await db
      .prepare("INSERT INTO vibelab_channel_posts (channel_id, title, body, cta_url, telegram_message_id, status, error, posted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(CHANNEL_ID, input.title, input.body, input.ctaUrl ?? null, input.messageId ?? null, input.status, input.error ?? null, input.status === "posted" ? new Date().toISOString() : null)
      .run();
  } catch {
    // Ignore logging failures.
  }
}

async function sendChannelPost(text: string) {
  const token = botToken();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      disable_web_page_preview: false,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; result?: { message_id?: number }; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram HTTP ${response.status}`);
  return data.result?.message_id ?? null;
}

function checkAuth(request: NextRequest) {
  const secret = postSecret();
  if (!secret) return false;
  const header = request.headers.get("x-vibelab-channel-secret");
  const query = request.nextUrl.searchParams.get("secret");
  return header === secret || query === secret;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    channel: CHANNEL_ID,
    channelUrl: CHANNEL_URL,
    botConfigured: Boolean(botToken()),
    postingSecretConfigured: Boolean(postSecret()),
    templates: postTemplates.map((item) => ({ title: item.title, cta: item.cta })),
    note: "POST to this endpoint with x-vibelab-channel-secret to publish. Use dryRun=true to preview.",
  });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { templateIndex?: number; title?: string; text?: string; cta?: string; dryRun?: boolean };
  const template = typeof body.templateIndex === "number" ? postTemplates[Math.abs(body.templateIndex) % postTemplates.length] : null;
  const selected = {
    title: body.title?.trim() || template?.title || postTemplates[new Date().getDate() % postTemplates.length].title,
    text: body.text?.trim() || template?.text || postTemplates[new Date().getDate() % postTemplates.length].text,
    cta: body.cta?.trim() || template?.cta || postTemplates[new Date().getDate() % postTemplates.length].cta,
  };
  const postText = formatPost({ title: selected.title, text: selected.text, cta: selected.cta });

  if (body.dryRun) {
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, status: "dry_run" });
    return NextResponse.json({ ok: true, dryRun: true, channel: CHANNEL_ID, text: postText });
  }

  try {
    const messageId = await sendChannelPost(postText);
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, messageId: messageId ?? undefined, status: "posted" });
    return NextResponse.json({ ok: true, channel: CHANNEL_ID, messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telegram post failed";
    await logPost({ title: selected.title, body: postText, ctaUrl: selected.cta, status: "failed", error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
