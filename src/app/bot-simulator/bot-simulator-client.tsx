"use client";

import { FormEvent, useState } from "react";

type Platform = "telegram" | "bale";
type Message = { role: "bot" | "user"; text: string };

const quickActions = [
  { id: "order", label: "🚀 ثبت سفارش مرحله‌به‌مرحله" },
  { id: "internship", label: "🎓 ارسال رزومه کارآموزی ۴ نفره" },
  { id: "track", label: "📍 پیگیری سفارش‌ها با شماره رهگیری" },
  { id: "consult", label: "🧠 مشاوره هوشمند با AI" },
  { id: "booking", label: "📅 رزرو وقت مشاوره آنلاین" },
  { id: "login", label: "🔐 دریافت کد ورود به سایت" },
];

function intro(platform: Platform): Message[] {
  return [
    { role: "bot", text: `سلام 👋 من دستیار هوشمند VibeLab در ${platform === "telegram" ? "تلگرام" : "بله"} هستم.` },
    { role: "bot", text: "می‌تونم سفارش سایت، کارآموزی، تحلیل رزومه، مشاوره و پیگیری سفارش رو داخل همین چت شبیه‌سازی کنم." },
  ];
}

export default function BotSimulatorClient() {
  const [platform, setPlatform] = useState<Platform>("telegram");
  const [messages, setMessages] = useState<Message[]>(intro("telegram"));
  const [input, setInput] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const switchPlatform = (next: Platform) => {
    setPlatform(next);
    setMessages(intro(next));
  };

  const record = async (action: string, payload?: Record<string, unknown>, orderType?: string) => {
    const response = await fetch("/api/bot-simulator/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, action, payload, orderType }),
    });
    return response.json() as Promise<{ trackingCode?: string; order?: { status?: string; order_type?: string; created_at?: string } | null }>;
  };

  const add = (items: Message[]) => setMessages((old) => [...old, ...items]);

  const handleAction = async (id: string) => {
    if (id === "order") {
      const result = await record("create_order", { source: "bot_simulator" }, "طراحی سایت / تولید محتوا");
      if (result.trackingCode) setTrackingCode(result.trackingCode);
      add([
        { role: "user", text: "ثبت سفارش مرحله‌به‌مرحله" },
        { role: "bot", text: "مرحله ۱: نوع سفارش را انتخاب کن: طراحی سایت، تولید محتوا، رزومه، مدرسه اسنپی یا AI Music." },
        { role: "bot", text: `یک سفارش نمونه ثبت شد. شماره رهگیری: ${result.trackingCode ?? "VL-DEMO"}` },
      ]);
      return;
    }
    if (id === "internship") {
      await record("internship_resume_flow");
      add([
        { role: "user", text: "ارسال رزومه کارآموزی" },
        { role: "bot", text: "رزومه یا معرفی کوتاهت را بفرست. اگر در یک منطقه ۴ نفر آماده شوند، جلسه حضوری هماهنگ می‌شود؛ اگر کمتر باشند، آنلاین/هیبرید است." },
      ]);
      return;
    }
    if (id === "track") {
      const result = trackingCode ? await record("track_order", { trackingCode }, undefined) : null;
      add([
        { role: "user", text: "پیگیری سفارش" },
        { role: "bot", text: result?.order ? `وضعیت ${trackingCode}: ${result.order.status}` : "شماره رهگیری را وارد کن؛ مثل VL-2026-ABC123" },
      ]);
      return;
    }
    if (id === "consult") {
      await record("ai_consultation");
      add([{ role: "bot", text: "برای مشاوره AI، هدف، مهارت‌ها و شهر/محله را بنویس تا مسیر و مربی پیشنهاد شود." }]);
      return;
    }
    if (id === "booking") {
      await record("booking_request");
      add([{ role: "bot", text: "رزرو مشاوره: ۳۰ دقیقه اول رایگان است. زمان پیشنهادی‌ات را بنویس تا در ادمین ثبت شود." }]);
      return;
    }
    if (id === "login") {
      await record("login_code_request");
      add([{ role: "bot", text: "کد ورود نمونه: 248913 — در نسخه واقعی این کد با OTP امن ارسال می‌شود." }]);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await record("free_text", { text });
    const isResume = text.length > 60;
    add([
      { role: "user", text },
      { role: "bot", text: isResume ? "متن دریافت شد. مسیر احتمالی: طراحی سایت + تولید محتوا. پیشنهاد: اول /learning-plan را کامل کن، سپس نزدیک‌ترین نقطه آموزشی را انتخاب کن." : "پیام ثبت شد. اگر رزومه/معرفی کامل‌تری بفرستی، مسیر دقیق‌تری پیشنهاد می‌دهم." },
    ]);
  };

  return (
    <section className="bot-sim-app">
      <div className="bot-sim-controls">
        <button className={platform === "telegram" ? "active" : ""} onClick={() => switchPlatform("telegram")}>ربات تلگرام ✈️</button>
        <button className={platform === "bale" ? "active" : ""} onClick={() => switchPlatform("bale")}>بازوی بله 🌿</button>
        <button onClick={() => setMessages(intro(platform))}>شروع دوباره</button>
      </div>
      <div className="bot-sim-links">
        <a href="https://t.me/ai_vibelab_bot" target="_blank" rel="noreferrer">✈️ باز کردن ربات در تلگرام</a>
        <a href="/channels#bale-setup">🌿 پیام‌رسان بله</a>
        <a href="/">🌐 وب‌سایت اصلی</a>
      </div>
      <div className="bot-sim-layout">
        <aside>{quickActions.map((action) => <button key={action.id} onClick={() => handleAction(action.id)}>{action.label}</button>)}</aside>
        <div className="bot-phone">
          <div className="bot-phone-top"><span>9:41</span><b>● ● 100%</b></div>
          <header><span>W</span><div><b>دستیار هوشمند Websites by AI</b><small>{platform === "telegram" ? "ربات تلگرام" : "بازوی بله"} · آنلاین</small></div></header>
          <div className="bot-chat">{messages.map((m, i) => <p key={i} className={m.role}>{m.text}</p>)}</div>
          <form onSubmit={submit}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="پیام یا دستور بنویسید (مثلاً: /order)…" /><button>➤</button></form>
        </div>
      </div>
    </section>
  );
}
