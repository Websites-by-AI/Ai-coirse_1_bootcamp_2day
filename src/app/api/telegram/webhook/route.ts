import { NextRequest } from "next/server";
import { getVibelabD1 } from "@/lib/cloudflare-d1";
import { generateLearningPlan } from "@/lib/learning-planner";
import { analyzeResumeWithRag } from "@/lib/resume-rag";
import { getBotChannelUrl, getBotSiteUrl } from "@/lib/bot-settings";
import { joinLocalGroup, listLocalGroups, type LocalGroup } from "@/lib/local-groups";

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
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_telegram_user_state (
    chat_id INTEGER PRIMARY KEY,
    interaction_count INTEGER NOT NULL DEFAULT 0,
    channel_nudged INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return db;
}

async function logTelegramEvent(update: TelegramUpdate, command: string | null) {
  try {
    const db = await ensureTelegramTables();
    const message = update.message ?? update.callback_query?.message;
    const user = update.message?.from ?? update.callback_query?.from;
    const text = update.message?.text ?? update.callback_query?.data ?? "";
    if (!db || !message?.chat?.id) return false;
    await db
      .prepare("INSERT INTO vibelab_telegram_events (update_id, chat_id, username, first_name, text, command) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(update.update_id ?? null, message.chat.id, user?.username ?? message.chat.username ?? null, user?.first_name ?? message.chat.first_name ?? null, text, command)
      .run();
    await db
      .prepare(`INSERT INTO vibelab_telegram_user_state (chat_id, interaction_count, updated_at)
        VALUES (?, 1, ?)
        ON CONFLICT(chat_id) DO UPDATE SET interaction_count = interaction_count + 1, updated_at = excluded.updated_at`)
      .bind(message.chat.id, new Date().toISOString())
      .run();
    const state = await db.prepare("SELECT interaction_count, channel_nudged FROM vibelab_telegram_user_state WHERE chat_id = ?").bind(message.chat.id).first<{ interaction_count: number; channel_nudged: number }>();
    if (state && state.interaction_count >= 3 && state.channel_nudged === 0) {
      await db.prepare("UPDATE vibelab_telegram_user_state SET channel_nudged = 1, updated_at = ? WHERE chat_id = ?").bind(new Date().toISOString(), message.chat.id).run();
      return true;
    }
    return false;
  } catch {
    // Logging should never break Telegram delivery.
    return false;
  }
}

function bottomKeyboard() {
  return {
    keyboard: [["☰ باز کردن منو"]],
    resize_keyboard: true,
    persistent: true,
    one_time_keyboard: false,
    input_field_placeholder: "برای دیدن گزینه‌ها، منو را باز کن یا رزومه‌ات را بنویس...",
  };
}

function menuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🧾 تحلیل رزومه", callback_data: "resume_plan" }, { text: "🗓 دوره فشرده دو روزه", callback_data: "two_day" }],
      [{ text: "📣 بازاریابی و گرفتن پروژه", callback_data: "marketing" }, { text: "📝 متن آماده مشتری", callback_data: "templates" }],
      [{ text: "👥 گروه محلی ۴ نفره", callback_data: "local_groups" }, { text: "🏫 مربی و فضای نزدیک", callback_data: "school_snap" }],
      [{ text: "❔ راهنما", callback_data: "help" }],
    ],
  };
}

function backKeyboard() {
  return { inline_keyboard: [[{ text: "‹ بازگشت به منو", callback_data: "menu_home" }]] };
}

function groupKeyboard(groups: LocalGroup[]) {
  return {
    inline_keyboard: [
      ...groups.map((group) => [{ text: `عضویت در ${group.title} · ${group.memberCount}/${group.capacity}`, callback_data: `group_join:${group.id}` }]),
      [{ text: "‹ بازگشت به منو", callback_data: "menu_home" }],
    ],
  };
}

function formatGroups(groups: LocalGroup[]) {
  return `گروه‌های محلی در حال تشکیل:\n\n${groups.map((group) => `• ${group.title}\n${group.track} · ${group.memberCount}/${group.capacity} نفر\n${group.status === "ready_for_coordination" ? "✅ آماده هماهنگی حضوری" : "⏳ در صف تکمیل گروه"}`).join("\n\n")}\n\nیک گروه را انتخاب کن. وقتی ظرفیت به ۴ نفر برسد، هماهنگ‌کننده زمان و فضای حضوری را اعلام می‌کند.`;
}

async function compactIntro() {
  return `سلام 👋
من ربات VibeLab هستم.

از منوی پایین می‌تونی مسیر شغلی، تحلیل رزومه، کارآموزی، مدرسه اسنپی، پروژه مشتری یا آموزش امروز را انتخاب کنی.

برای ورود به سایت از دکمه Menu تلگرام استفاده کن؛ لینک‌ها داخل چت تکرار نمی‌شوند.`;
}

function starterQuestions(source = "آگهی") {
  return `برای شروع منظم از ${source}، لطفاً همین یک پیام را با جواب کوتاه پر کن:\n\n۱) نام و سن:\n۲) شهر/محله: مثلا نارمک، تهرانپارس، کرج\n۳) وضعیت فعلی: دانش‌آموز، دانشجو، کارجو، فریلنسر؟\n۴) هدف اصلی: طراحی سایت، تولید محتوا، کنکور/درس، کاریابی، یا هر دو؟\n۵) مهارت‌هایی که بلدی:\n۶) نمونه‌کار/پیج/لینک اگر داری:\n۷) زمان آزاد در هفته:\n۸) ترجیح جلسه: حضوری، آنلاین یا ترکیبی؟\n۹) اگر حضوری: حاضر هستی هزینه فضای کار اشتراکی/کلاس را سهمی پرداخت کنی؟\n۱۰) می‌خواهی در تیم ۴ نفره محلی شرکت کنی؟\n\nبعد از ارسال، من مسیر آموزشی + مسیر بازاریابی + نقطه نزدیک + مربی پیشنهادی را داخل همین چت می‌دهم.`;
}

async function callbackReply(data?: string) {
  const channelUrl = await getBotChannelUrl();
  switch (data) {
    case "menu_home": return "یک بخش را انتخاب کن:";
    case "local_groups": return formatGroups(await listLocalGroups());
    case "classified_start": return starterQuestions("آگهی دیوار/شیپور");
    case "starter_questions": return starterQuestions("شروع VibeLab");
    case "masir": return "MASIR یعنی از رزومه تا اولین پروژه:\n۱) تحلیل رزومه\n۲) دوره هدفمند\n۳) معلم محلی مثل اسنپ\n۴) مدرک معتبر\n۵) بازار کار ایران و جهان\n\nاگر می‌خوای مسیرت رو بسازم، یک رزومه/معرفی کوتاه همینجا بفرست.";
    case "resume_plan": return "رزومه یا معرفی کوتاهت رو همینجا بفرست.\nمثلاً بنویس: مهارت‌ها، تجربه، علاقه به طراحی سایت یا تولید محتوا، شهر/محله و هدفت برای کار.";
    case "internship":
    case "two_day": return "دوره فشرده دو روزه VibeLab:\n\nروز اول: ساخت سایت/لندینگ با AI، ساخت CTA، فرم سفارش و اتصال اولیه D1.\nروز دوم: تولید محتوا، SEO، آگهی دیوار/شیپور، پیام معرفی و برنامه جذب اولین مشتری.\n\nخروجی: یک نمونه‌کار زنده + متن معرفی + برنامه بازاریابی ۷ روزه.\n\nابتدا رزومه یا معرفی کوتاهت را بفرست تا مسیر مناسب خودت تنظیم شود.";
    case "school_snap": return "مدل مدرسه اسنپی:\nسیستم بر اساس رزومه، هدف و شهر، مربی و نقطه نزدیک را پیشنهاد می‌دهد. هزینه مربی و فضای کار شفاف است. اگر یک گروه به ۴ نفر برسد، جلسه حضوری هماهنگ می‌شود؛ در غیر این صورت آنلاین/هیبرید است.";
    case "channel": return `کانال VibeLab News برای آموزش‌ها، تسک‌ها و فرصت‌های کارآموزی فعال است: ${channelUrl}`;
    case "client_project": return "پروژه مشتری این هفته:\n• لندینگ کلینیک\n• سایت آموزشگاه\n• فروشگاه محلی\n• Content Kit رستوران\n• بات ثبت سفارش\n\nرزومه یا مهارت‌هایت را بفرست تا مناسب‌ترین پروژه را پیشنهاد بدهم.";
    case "marketing": return "مسیر بازاریابی دو روزه:\n۱) انتخاب یک خدمت: سایت، محتوا یا بات سفارش.\n۲) ساخت نمونه‌کار زنده.\n۳) نوشتن پیام معرفی و قیمت اولیه.\n۴) انتشار آگهی/ارسال پیام به ۱۰ مشتری هدف.\n۵) پیگیری روزانه و ثبت نتیجه در کارتابل.";
    case "templates": return "متن آماده برای مشتری:\n\nسلام، من در حال ساخت نمونه‌کارهای طراحی سایت و تولید محتوا با AI هستم. می‌توانم برای کسب‌وکار شما یک لندینگ ساده، فرم دریافت سفارش و محتوای اولیه آماده کنم. اگر مایل باشید یک پیشنهاد کوتاه و نمونه اولیه متناسب با کار شما ارسال می‌کنم.\n\nاین متن را با نام کسب‌وکار و خدمت موردنظر شخصی‌سازی کن.";
    case "today_learning": return "آموزش امروز:\nیک Hero، یک CTA و یک فرم ثبت سفارش برای لندینگ پروژه‌ات بساز. بعد در چت بنویس: «تسک لندینگ انجام شد».";
    case "help": return "راهنما:\nتحلیل رزومه = مسیر شخصی‌سازی‌شده\nدوره دو روزه = سایت + بازاریابی\nبازاریابی = گرفتن اولین مشتری\nمتن آماده = پیام معرفی مشتری\nگروه محلی = تشکیل کلاس ۴ نفره\n\nبرای سایت، از Menu تلگرام استفاده کن.";
    case "music": return "ماژول AI Music در حال آماده‌سازی است. گزینه‌های امن‌تر: ACE-Step/HuggingFace، fal.ai، WaveSpeed و MiniMax.";
    default: return compactIntro();
  }
}

async function replyFor(text: string, message?: TelegramMessage) {
  const normalized = text.trim().toLowerCase();
  const siteUrl = await getBotSiteUrl();
  if (normalized.startsWith("/start") || normalized.startsWith("/menu")) return compactIntro();
  if (normalized.startsWith("/help")) {
    return "دستورها:\n/start شروع\n/menu نمایش منوی ربات\n/divar سوالات مخصوص ورودی دیوار/شیپور\n/internship کارآموزی\n/school مدرسه اسنپی دانش‌آموز و مربی\n/learning تحلیل رزومه و مسیر آموزش\n/masir مسیر شغلی\n/music موسیقی AI\n/health وضعیت سایت";
  }
  if (normalized.startsWith("/divar") || normalized.startsWith("/sheypoor") || normalized.startsWith("/classified") || text.includes("دیوار") || text.includes("شیپور")) return starterQuestions("آگهی دیوار/شیپور");
  if (normalized.startsWith("/internship") || text.includes("کارآموزی") || text.includes("دوره فشرده")) return await callbackReply("two_day");
  if (normalized.startsWith("/school") || text.includes("مدرسه اسنپی") || text.includes("مربی و فضای")) return await callbackReply("school_snap");
  if (normalized.startsWith("/learning") || normalized.startsWith("/masir") || text.includes("تحلیل رزومه") || text.includes("مسیر شغلی")) return await callbackReply("resume_plan");
  if (text.includes("گروه محلی")) return formatGroups(await listLocalGroups());
  if (text.includes("بازاریابی")) return await callbackReply("marketing");
  if (text.includes("متن آماده")) return await callbackReply("templates");
  if (text.includes("پروژه مشتری")) return await callbackReply("client_project");
  if (text.includes("آموزش امروز")) return await callbackReply("today_learning");
  if (text.includes("راهنما") || normalized.startsWith("/help")) return await callbackReply("help");
  if (normalized.startsWith("/music") || text.includes("موسیقی")) return await callbackReply("music");
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
    reply_markup: withKeyboard ? bottomKeyboard() : undefined,
    disable_web_page_preview: true,
  });
}

async function sendMenuPanel(chatId: number) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "یک بخش را انتخاب کن:",
    reply_markup: menuKeyboard(),
    disable_web_page_preview: true,
  });
}

async function editMenuPanel(chatId: number, messageId: number, text: string, home = false, customKeyboard?: Record<string, unknown>) {
  await telegram("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: customKeyboard ?? (home ? menuKeyboard() : backKeyboard()),
    disable_web_page_preview: true,
  });
}

async function sendChannelNudge(chatId: number) {
  const channelUrl = await getBotChannelUrl();
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "برای دریافت تمرین‌های روزانه، فرصت‌های کارآموزی و زمان جلسات گروهی، به کانال آموزش VibeLab هم ملحق شو.",
    reply_markup: { inline_keyboard: [[{ text: "عضویت در کانال آموزش", url: channelUrl }]] },
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
    const messageId = callback.message?.message_id;
    const command = callback.data ? `callback:${callback.data}` : "callback";
    const suggestChannel = await logTelegramEvent(update, command);
    await answerCallbackQuery(callback.id);
    if (typeof chatId === "number" && typeof messageId === "number") {
      if (callback.data?.startsWith("group_join:")) {
        const groupId = callback.data.slice("group_join:".length);
        const group = await joinLocalGroup({ groupId, chatId, username: callback.from?.username, firstName: callback.from?.first_name });
        const status = group.status === "ready_for_coordination"
          ? "✅ گروه کامل شد؛ درخواست هماهنگی جلسه حضوری برای مدیر ثبت می‌شود."
          : `⏳ درخواست عضویت ثبت شد. گروه اکنون ${group.memberCount}/${group.capacity} نفر است؛ تا تکمیل ظرفیت، آموزش آنلاین/گفت‌وگوی کوتاه فعال می‌ماند.`;
        await editMenuPanel(chatId, messageId, `${group.title}\n${group.track}\n\n${status}`, false);
      } else if (callback.data === "local_groups") {
        const groups = await listLocalGroups();
        await editMenuPanel(chatId, messageId, formatGroups(groups), false, groupKeyboard(groups));
      } else {
        await editMenuPanel(chatId, messageId, await callbackReply(callback.data), callback.data === "menu_home");
      }
    }
    if (suggestChannel && typeof chatId === "number") await sendChannelNudge(chatId);
    return Response.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text ?? "";
  const command = text.trim().startsWith("/") ? text.trim().split(/\s+/)[0].toLowerCase() : null;

  const suggestChannel = await logTelegramEvent(update, command);
  if (typeof chatId === "number") {
    if (text.includes("باز کردن منو") || command === "/menu") {
      await sendMenuPanel(chatId);
    } else {
      await sendMessage(chatId, await replyFor(text, message), true);
    }
    if (suggestChannel) await sendChannelNudge(chatId);
  }

  return Response.json({ ok: true });
}
