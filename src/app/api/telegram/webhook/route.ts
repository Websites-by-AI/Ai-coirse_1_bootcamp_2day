import { NextRequest } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";
import { generateLearningPlan } from "@/lib/learning-planner";
import { analyzeResumeWithRag } from "@/lib/resume-rag";
import { getBotChannelUrl, getBotSiteUrl } from "@/lib/bot-settings";

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

async function mainKeyboard() {
  return {
    keyboard: [
      ["🧭 مسیر شغلی", "🧾 تحلیل رزومه"],
      ["🎓 کارآموزی", "🏫 مدرسه اسنپی"],
      ["📣 کانال و پست‌ها", "🎵 موسیقی AI"],
      ["🧑‍💻 کارتابل کارآموز", "🌐 لینک‌های سایت"],
    ],
    resize_keyboard: true,
    persistent: true,
    one_time_keyboard: false,
    input_field_placeholder: "رزومه یا یکی از دکمه‌های پایین را انتخاب کن...",
  };
}

async function linkKeyboard() {
  const siteUrl = await getBotSiteUrl();
  const channelUrl = await getBotChannelUrl();
  return {
    inline_keyboard: [
      [
        { text: "ثبت‌نام در سایت ↗", url: `${siteUrl}/register` },
        { text: "کانال آموزش ↗", url: channelUrl },
      ],
    ],
  };
}

async function compactIntro() {
  const channelUrl = await getBotChannelUrl();
  return `سلام 👋
من ربات VibeLab هستم. اینجا داخل خود تلگرام می‌تونم مسیر شغلی، کارآموزی، تحلیل رزومه و برنامه یادگیری رو خلاصه کنم.

کانال آموزش‌ها: ${channelUrl}

برای شروع یکی از گزینه‌های پایین را بزن؛ لینک‌ها فقط وقتی لازم باشد نمایش داده می‌شوند.`;
}

function starterQuestions(source = "آگهی") {
  return `برای شروع منظم از ${source}، لطفاً همین یک پیام را با جواب کوتاه پر کن:\n\n۱) نام و سن:\n۲) شهر/محله: مثلا نارمک، تهرانپارس، کرج\n۳) وضعیت فعلی: دانش‌آموز، دانشجو، کارجو، فریلنسر؟\n۴) هدف اصلی: طراحی سایت، تولید محتوا، کنکور/درس، کاریابی، یا هر دو؟\n۵) مهارت‌هایی که بلدی:\n۶) نمونه‌کار/پیج/لینک اگر داری:\n۷) زمان آزاد در هفته:\n۸) ترجیح جلسه: حضوری، آنلاین یا ترکیبی؟\n۹) اگر حضوری: حاضر هستی هزینه فضای کار اشتراکی/کلاس را سهمی پرداخت کنی؟\n۱۰) می‌خواهی در تیم ۴ نفره محلی شرکت کنی؟\n\nبعد از ارسال، من مسیر آموزشی + مسیر بازاریابی + نقطه نزدیک + مربی پیشنهادی را داخل همین چت می‌دهم.`;
}

async function callbackReply(data?: string) {
  const siteUrl = await getBotSiteUrl();
  const channelUrl = await getBotChannelUrl();
  switch (data) {
    case "classified_start": return starterQuestions("آگهی دیوار/شیپور");
    case "starter_questions": return starterQuestions("شروع VibeLab");
    case "masir": return "MASIR یعنی از رزومه تا اولین پروژه:\n۱) تحلیل رزومه\n۲) دوره هدفمند\n۳) معلم محلی مثل اسنپ\n۴) مدرک معتبر\n۵) بازار کار ایران و جهان\n\nاگر می‌خوای مسیرت رو بسازم، یک رزومه/معرفی کوتاه همینجا بفرست.";
    case "resume_plan": return "رزومه یا معرفی کوتاهت رو همینجا بفرست.\nمثلاً بنویس: مهارت‌ها، تجربه، علاقه به طراحی سایت یا تولید محتوا، شهر/محله و هدفت برای کار.";
    case "internship": return "مدل اسنپی کارآموزی VibeLab:\n\n۱) رزومه/معرفی کوتاه می‌فرستی.\n۲) AI مسیرت را مشخص می‌کند.\n۳) دو مسیر می‌گیری: مسیر آموزشی + مسیر بازاریابی و گرفتن پروژه.\n۴) نزدیک‌ترین نقطه آموزشی پیشنهاد می‌شود.\n۵) اگر در یک نقطه ۴ نفر تکمیل شوند، حضوری؛ در غیر این صورت آنلاین/هیبرید یا گفت‌وگوی کوتاه انسانی در گروه تلگرام.\n\nبرای شروع، همینجا رزومه کوتاهت را بفرست یا /learning را بزن.";
    case "school_snap": return `مدرسه اسنپی VibeLab:\nدانش‌آموز، مربی و مدرسه را به هم وصل می‌کند؛ هزینه مربی و فضا شفاف است.\n\nلینک کامل: ${siteUrl}/school-snap`;
    case "channel": return `کانال VibeLab News برای پست‌های خودکار آموزش و کارآموزی فعال است:\n${channelUrl}`;
    case "music": return "ماژول AI Music در حال آماده‌سازی است. گزینه‌های امن‌تر: ACE-Step/HuggingFace، fal.ai، WaveSpeed و MiniMax.";
    default: return compactIntro();
  }
}

async function replyFor(text: string, message?: TelegramMessage) {
  const normalized = text.trim().toLowerCase();
  const siteUrl = await getBotSiteUrl();
  const channelUrl = await getBotChannelUrl();
  if (normalized.startsWith("/start") || normalized.startsWith("/menu")) return compactIntro();
  if (normalized.startsWith("/help")) {
    return "دستورها:\n/start شروع\n/menu نمایش منوی ربات\n/divar سوالات مخصوص ورودی دیوار/شیپور\n/internship کارآموزی\n/school مدرسه اسنپی دانش‌آموز و مربی\n/learning تحلیل رزومه و مسیر آموزش\n/masir مسیر شغلی\n/music موسیقی AI\n/health وضعیت سایت";
  }
  if (normalized.startsWith("/divar") || normalized.startsWith("/sheypoor") || normalized.startsWith("/classified") || text.includes("دیوار") || text.includes("شیپور")) return starterQuestions("آگهی دیوار/شیپور");
  if (normalized.startsWith("/internship") || text.includes("کارآموزی")) return await callbackReply("internship");
  if (normalized.startsWith("/school") || text.includes("مدرسه اسنپی")) return await callbackReply("school_snap");
  if (normalized.startsWith("/learning") || normalized.startsWith("/masir") || text.includes("تحلیل رزومه") || text.includes("مسیر شغلی")) return await callbackReply("resume_plan");
  if (normalized.startsWith("/music") || text.includes("موسیقی")) return await callbackReply("music");
  if (text.includes("کانال") || text.includes("پست")) return await callbackReply("channel");
  if (text.includes("کارتابل")) return `کارتابل کارآموزی:\n${siteUrl}/internship-desk\n\nدر این صفحه تسک‌های هفتگی، ویدیوهای آموزشی، پروژه فروشگاهی، گروه ۴ نفره و فضای کار اشتراکی را می‌بینی.`;
  if (text.includes("لینک")) return `لینک‌های مهم VibeLab:\nسایت: ${siteUrl}\nثبت‌نام: ${siteUrl}/register\nکارتابل: ${siteUrl}/internship-desk\nمدرسه اسنپی: ${siteUrl}/school-snap\nکانال: ${channelUrl}`;
  if (normalized.startsWith("/health")) return "وضعیت فعلی: سایت روی Cloudflare D1 فعال است ✅";

  if (text.trim().length >= 60) {
    const wantsTeam = /۴|4|تیم|گروه|حضوری|محلی/.test(text);
    const marketingPath = /پروژه|درآمد|فریلنس|کار|مشتری|بازار|دیوار|شیپور/.test(text)
      ? "مسیر بازاریابی: پیام معرفی + لیست مشتری محلی + پیشنهاد قیمت + برنامه ۷ روزه جذب پروژه."
      : "مسیر بازاریابی: بعد از ساخت نمونه‌کار، پیام معرفی و برنامه جذب پروژه آماده می‌شود.";
    const plan = generateLearningPlan({
      fullName: message?.from?.first_name || message?.chat?.first_name || "کاربر تلگرام",
      email: `${message?.from?.id ?? message?.chat?.id ?? "telegram"}@telegram.local`,
      phone: "telegram",
      resumeText: text,
      goal: text,
      cityPreference: text.includes("کرج") ? "کرج" : text.includes("نارمک") ? "نارمک" : "تهران",
    });
    const rag = await analyzeResumeWithRag({
      fullName: message?.from?.first_name || message?.chat?.first_name || "کاربر تلگرام",
      resumeText: text,
      goal: text,
      cityPreference: text.includes("کرج") ? "کرج" : text.includes("نارمک") ? "نارمک" : "تهران",
    });
    const hub = plan.hubs[0];
    const mentor = plan.mentors[0];
    return `مسیر پیشنهادی تو: ${plan.track}\n\nتحلیل RAG: ${rag.provider === "huggingface_rag" ? "HuggingFace فعال" : "منابع داخلی VibeLab"}\n${rag.summary}\n\n۱) مسیر آموزشی:\nاولین تمرین: ${plan.firstVideo.title}\nمنبع: ${plan.firstVideo.source}\n\n۲) مسیر بازاریابی:\n${marketingPath}\n\n۳) نقطه آموزشی پیشنهادی:\n${hub.title}\nهزینه فضا: ${hub.coworkingCost}\n\n۴) مربی پیشنهادی:\n${mentor.name}\n${mentor.specialty}\n\n۵) وضعیت جلسه:\n${wantsTeam ? "برای جلسه حضوری، اگر ۴ نفر در همین منطقه آماده شوند هماهنگ می‌کنیم؛ تا آن زمان گروه تلگرام/آنلاین فعال است." : "فعلاً آنلاین/هیبرید پیشنهاد می‌شود؛ اگر ۴ نفر در منطقه تو تکمیل شود، حضوری می‌کنیم."}\n\nبرنامه دو روزه:\n${plan.twoDayProgram.map((item) => `• ${item.day}: ${item.title}`).join("\n")}\n\nبرای ثبت رسمی و ذخیره کامل: ${siteUrl}/apply?source=telegram&utm_source=telegram&utm_medium=bot&utm_campaign=ai_internship`;
  }

  return `متن کوتاهه. برای ساخت مسیر منظم، این سوال‌ها را جواب بده:\n\n${starterQuestions("شروع")}`;
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
    reply_markup: withKeyboard ? await mainKeyboard() : undefined,
    disable_web_page_preview: true,
  });
}

async function sendLinkButtons(chatId: number) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "دسترسی سریع — فقط اگر می‌خواهی از سایت یا کانال ادامه بدهی:",
    reply_markup: await linkKeyboard(),
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
    if (typeof chatId === "number") await sendMessage(chatId, await callbackReply(callback.data), true);
    return Response.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text ?? "";
  const command = text.trim().startsWith("/") ? text.trim().split(/\s+/)[0].toLowerCase() : null;

  await logTelegramEvent(update, command);
  if (typeof chatId === "number") {
    await sendMessage(chatId, await replyFor(text, message), true);
    if (command === "/start" || command === "/menu") await sendLinkButtons(chatId);
  }

  return Response.json({ ok: true });
}
