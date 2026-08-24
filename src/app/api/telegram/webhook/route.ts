import { NextRequest } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";
import { generateLearningPlan } from "@/lib/learning-planner";

export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id?: number;
  text?: string;
  chat?: { id?: number; type?: string; username?: string; first_name?: string; last_name?: string };
  from?: { id?: number; username?: string; first_name?: string; last_name?: string; language_code?: string };
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: TelegramMessage;
  from?: { id?: number; username?: string; first_name?: string; last_name?: string; language_code?: string };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

const BOT_URL = "https://t.me/ai_vibelab_bot";
const CHANNEL_URL = "https://t.me/vibelab_channel";
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
    const message = update.message ?? update.callback_query?.message;
    const user = update.message?.from ?? update.callback_query?.from;
    const text = update.message?.text ?? update.callback_query?.data ?? "";
    if (!db || !message?.chat?.id) return;
    await db
      .prepare("INSERT INTO vibelab_telegram_events (update_id, chat_id, username, first_name, text, command) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(update.update_id ?? null, message.chat.id, user?.username ?? message.chat.username ?? null, user?.first_name ?? message.chat.first_name ?? null, text, command)
      .run();
  } catch {
    // Logging should never break Telegram delivery.
  }
}

function mainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "مسیر شغلی", callback_data: "masir" },
        { text: "تحلیل رزومه", callback_data: "resume_plan" },
      ],
      [
        { text: "کارآموزی", callback_data: "internship" },
        { text: "موسیقی AI", callback_data: "music" },
      ],
      [
        { text: "مدرسه اسنپی", url: `${SITE_URL}/school-snap` },
        { text: "کانال آموزش", url: CHANNEL_URL },
      ],
      [
        { text: "ثبت‌نام در سایت", url: `${SITE_URL}/register` },
      ],
    ],
  };
}

function compactIntro() {
  return "سلام 👋\nمن ربات VibeLab هستم. اینجا داخل خود تلگرام می‌تونم مسیر شغلی، کارآموزی، تحلیل رزومه و برنامه یادگیری رو خلاصه کنم.\n\nکانال آموزش‌ها: https://t.me/vibelab_channel\n\nبرای شروع یکی از گزینه‌ها رو بزن؛ لینک‌ها فقط وقتی لازم باشه نمایش داده می‌شن.";
}

function callbackReply(data?: string) {
  switch (data) {
    case "masir":
      return "MASIR یعنی از رزومه تا اولین پروژه:\n۱) تحلیل رزومه\n۲) دوره هدفمند\n۳) معلم محلی مثل اسنپ\n۴) مدرک بین‌المللی\n۵) بازار کار ایران و جهان\n\nاگر می‌خوای مسیرت رو بسازم، یک رزومه/معرفی کوتاه همینجا بفرست.";
    case "resume_plan":
      return "رزومه یا معرفی کوتاهت رو همینجا بفرست.\nمثلاً بنویس: مهارت‌ها، تجربه، علاقه به طراحی سایت یا تولید محتوا، شهر/محله و هدفت برای کار.";
    case "internship":
      return "مدل اسنپی کارآموزی VibeLab:\n\n۱) رزومه/معرفی کوتاه می‌فرستی.\n۲) AI مسیرت را مشخص می‌کند: طراحی سایت، تولید محتوا، رزومه، کاریابی یا Vibe Coding.\n۳) نزدیک‌ترین نقطه آموزشی مثل اسنپ پیشنهاد می‌شود.\n۴) اگر در یک نقطه حداقل ۴ نفر تکمیل شوند، جلسه حضوری هماهنگ می‌شود؛ اگر کمتر باشد آنلاین/هیبرید است.\n\nنقاط فعلی: نارمک هفت‌حوض، تهرانپارس، ونک/میرداماد، انقلاب، سعادت‌آباد/پونک، کرج.\n\n۳۰ دقیقه اول رایگان است. بعد هزینه فضای کار اشتراکی/صندلی/اتاق جلسه با کارآموز یا گروه است.\n\nبرای شروع، همینجا رزومه کوتاهت را بفرست یا /learning را بزن.";
    case "music":
      return "ماژول AI Music در حال آماده‌سازی است. گزینه‌های امن‌تر: ACE-Step/HuggingFace، fal.ai، WaveSpeed و MiniMax. هدف: تست آهنگ فارسی با شعر کاربر.";
    default:
      return compactIntro();
  }
}

function replyFor(text: string, message?: TelegramMessage) {
  const normalized = text.trim().toLowerCase();
  if (normalized.startsWith("/start") || normalized.startsWith("/menu")) return compactIntro();
  if (normalized.startsWith("/help")) {
    return "دستورها:\n/start شروع\n/menu نمایش منوی ربات\n/internship کارآموزی\n/learning تحلیل رزومه و مسیر آموزش\n/masir مسیر شغلی\n/music موسیقی AI\n/health وضعیت سایت";
  }
  if (normalized.startsWith("/internship")) return callbackReply("internship");
  if (normalized.startsWith("/learning") || normalized.startsWith("/masir")) return callbackReply("resume_plan");
  if (normalized.startsWith("/music")) return callbackReply("music");
  if (normalized.startsWith("/health")) return "وضعیت فعلی: سایت روی Cloudflare D1 فعال است ✅";

  if (text.trim().length >= 60) {
    const plan = generateLearningPlan({
      fullName: message?.from?.first_name || message?.chat?.first_name || "کاربر تلگرام",
      email: `${message?.from?.id ?? message?.chat?.id ?? "telegram"}@telegram.local`,
      phone: "telegram",
      resumeText: text,
      goal: text,
      cityPreference: text.includes("کرج") ? "کرج" : text.includes("نارمک") ? "نارمک" : "تهران",
    });
    const hub = plan.hubs[0];
    const mentor = plan.mentors[0];
    return `مسیر پیشنهادی تو: ${plan.track}\n\nاولین تمرین: ${plan.firstVideo.title}\nمنبع: ${plan.firstVideo.source}\n\nنقطه آموزشی پیشنهادی: ${hub.title}\nهزینه فضا: ${hub.coworkingCost}\n\nمربی پیشنهادی: ${mentor.name}\n${mentor.specialty}\n\nبرنامه دو روزه:\n${plan.twoDayProgram.map((item) => `• ${item.day}: ${item.title}`).join("\n")}\n\nبرای نسخه کامل و ذخیره برنامه: ${SITE_URL}/learning-plan`;
  }

  return "متن کوتاهه. برای ساخت مسیر، یک رزومه/معرفی حداقل چند خطی بفرست: مهارت‌ها، تجربه، شهر/محله و هدفت.";
}

async function telegram(method: string, payload: Record<string, unknown>) {
  const botToken = token();
  if (!botToken) return null;
  return fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);
}

async function sendMessage(chatId: number, text: string, withKeyboard = true) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: withKeyboard ? mainKeyboard() : undefined,
    disable_web_page_preview: true,
  });
}

async function answerCallbackQuery(callbackQueryId: string) {
  await telegram("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

export async function GET() {
  return Response.json({
    ok: true,
    bot: "ai_vibelab_bot",
    botUrl: BOT_URL,
    webhook: "ready",
    mode: "in-bot-flow",
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

  const callback = update.callback_query;
  if (callback) {
    const chatId = callback.message?.chat?.id;
    const command = callback.data ? `callback:${callback.data}` : "callback";
    await logTelegramEvent(update, command);
    await answerCallbackQuery(callback.id);
    if (typeof chatId === "number") await sendMessage(chatId, callbackReply(callback.data), true);
    return Response.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text ?? "";
  const command = text.trim().startsWith("/") ? text.trim().split(/\s+/)[0].toLowerCase() : null;

  await logTelegramEvent(update, command);
  if (typeof chatId === "number") await sendMessage(chatId, replyFor(text, message), true);

  return Response.json({ ok: true });
}
