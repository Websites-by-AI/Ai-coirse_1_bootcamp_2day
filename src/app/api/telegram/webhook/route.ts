import { NextRequest } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  text?: string;
  chat?: { id?: number; type?: string; username?: string; first_name?: string; last_name?: string };
  from?: { id?: number; username?: string; first_name?: string; last_name?: string; language_code?: string };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

const BOT_URL = "https://t.me/ai_vibelab_bot";
const SITE_URL = "https://v2.vibelab.ir";

function token() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim();
}

function webhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
}

async function ensureTelegramTables() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_telegram_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    update_id INTEGER,
    chat_id INTEGER,
    username TEXT,
    first_name TEXT,
    text TEXT,
    command TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return db;
}

async function logTelegramEvent(update: TelegramUpdate, command: string | null) {
  try {
    const db = await ensureTelegramTables();
    const message = update.message;
    if (!db || !message?.chat?.id) return;
    await db
      .prepare("INSERT INTO vibelab_telegram_events (update_id, chat_id, username, first_name, text, command) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(update.update_id ?? null, message.chat.id, message.from?.username ?? message.chat.username ?? null, message.from?.first_name ?? message.chat.first_name ?? null, message.text ?? "", command)
      .run();
  } catch {
    // Logging should never break Telegram delivery.
  }
}

function keyboard() {
  return {
    inline_keyboard: [
      [
        { text: "ثبت‌نام VibeLab", url: `${SITE_URL}/register` },
        { text: "پنل کاربر", url: `${SITE_URL}/panel` },
      ],
      [
        { text: "سایت اصلی", url: SITE_URL },
        { text: "مسیر استارتاپ", url: `${SITE_URL}/#startup-calls` },
      ],
    ],
  };
}

function replyFor(text: string) {
  const normalized = text.trim().toLowerCase();
  if (normalized.startsWith("/start")) {
    return "سلام 👋\nبه ربات VibeLab خوش آمدی.\nاینجا می‌توانی سریع به ثبت‌نام، پنل کاربر، مسیر رزومه و برنامه ساخت محتوا/وب‌سایت با AI دسترسی داشته باشی.";
  }
  if (normalized.startsWith("/help")) {
    return "دستورها:\n/start شروع\n/register لینک ثبت‌نام\n/panel پنل کاربر\n/startup مسیر فراخوان‌ها و استارتاپ\n/music برنامه اتصال AI Music\n/health وضعیت سایت";
  }
  if (normalized.startsWith("/register")) return `ثبت‌نام و سنجش مسیر:\n${SITE_URL}/register`;
  if (normalized.startsWith("/panel")) return `پنل کاربر و رزومه/پروژه:\n${SITE_URL}/panel`;
  if (normalized.startsWith("/startup")) return `مسیر استارتاپ، فراخوان‌ها و آماده‌سازی UAE/Canada/Global:\n${SITE_URL}/#startup-calls`;
  if (normalized.startsWith("/music")) return "ماژول AI Music در حال آماده‌سازی است: ACE-Step/HuggingFace، fal.ai، WaveSpeed، MiniMax و Mureka برای تست آهنگ فارسی بررسی شده‌اند.";
  if (normalized.startsWith("/health")) return `وضعیت سایت و دیتابیس:\n${SITE_URL}/api/health`;
  return "پیامت ثبت شد ✅\nبرای شروع از دکمه‌ها استفاده کن یا /help را بفرست.";
}

async function sendMessage(chatId: number, text: string) {
  const botToken = token();
  if (!botToken) return;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: keyboard(),
      disable_web_page_preview: false,
    }),
  }).catch(() => null);
}

export async function GET() {
  return Response.json({
    ok: true,
    bot: "ai_vibelab_bot",
    botUrl: BOT_URL,
    webhook: "ready",
    tokenConfigured: Boolean(token()),
    secretConfigured: Boolean(webhookSecret()),
  });
}

export async function POST(request: NextRequest) {
  const expectedSecret = webhookSecret();
  if (expectedSecret && request.headers.get("x-telegram-bot-api-secret-token") !== expectedSecret) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text ?? "";
  const command = text.trim().startsWith("/") ? text.trim().split(/\s+/)[0].toLowerCase() : null;

  await logTelegramEvent(update, command);
  if (typeof chatId === "number") await sendMessage(chatId, replyFor(text));

  return Response.json({ ok: true });
}
