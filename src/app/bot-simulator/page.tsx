import type { Metadata } from "next";
import BotSimulatorClient from "./bot-simulator-client";

export const metadata: Metadata = {
  title: "شبیه‌ساز ربات تلگرام و بله | VibeLab",
  description: "شبیه‌ساز تعاملی ربات هوشمند ثبت سفارش، کارآموزی، رزومه، مشاوره، پیگیری و پست خودکار کانال در تلگرام و بله.",
};

export default function BotSimulatorPage() {
  return (
    <main dir="rtl" className="bot-sim-page">
      <section className="bot-sim-hero">
        <div className="bot-sim-container">
          <p>شبیه‌ساز تعاملی · متصل به سرورلس و دیتابیس Cloudflare D1</p>
          <h1>ربات هوشمند ثبت سفارش و کارآموزی در تلگرام و بله</h1>
          <span>
            این شبیه‌ساز عملکرد واقعی ربات تلگرام و بازوی بله را با دکمه‌های تعاملی، ثبت سفارش ۴ مرحله‌ای، ارسال رزومه کارآموزی، استعلام وضعیت و مشاوره نمایش می‌دهد.
          </span>
        </div>
      </section>
      <div className="bot-sim-container"><BotSimulatorClient /></div>
    </main>
  );
}
