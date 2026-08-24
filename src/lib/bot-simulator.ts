import { randomBytes } from "crypto";
import { getVibelabD1 } from "@/lib/cloudflare-d1";

export type BotSimulatorEventInput = {
  platform: "telegram" | "bale";
  action: string;
  payload?: Record<string, unknown>;
};

async function ensureBotSimulatorTables() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_bot_simulator_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    action TEXT NOT NULL,
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_bot_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL,
    order_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ثبت اولیه',
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  return db;
}

export function makeTrackingCode() {
  return `VL-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function recordBotSimulatorEvent(input: BotSimulatorEventInput) {
  const db = await ensureBotSimulatorTables();
  if (!db) return { stored: false };
  await db
    .prepare("INSERT INTO vibelab_bot_simulator_events (platform, action, payload_json) VALUES (?, ?, ?)")
    .bind(input.platform, input.action, input.payload ? JSON.stringify(input.payload) : null)
    .run();
  return { stored: true };
}

export async function createBotOrder(input: BotSimulatorEventInput & { orderType: string }) {
  const db = await ensureBotSimulatorTables();
  const trackingCode = makeTrackingCode();
  if (!db) return { stored: false, trackingCode };
  await db
    .prepare("INSERT INTO vibelab_bot_orders (tracking_code, platform, order_type, payload_json) VALUES (?, ?, ?, ?)")
    .bind(trackingCode, input.platform, input.orderType, input.payload ? JSON.stringify(input.payload) : null)
    .run();
  return { stored: true, trackingCode };
}

export async function getBotOrder(trackingCode: string) {
  const db = await ensureBotSimulatorTables();
  if (!db) return null;
  return db
    .prepare("SELECT tracking_code, platform, order_type, status, created_at FROM vibelab_bot_orders WHERE tracking_code = ? LIMIT 1")
    .bind(trackingCode.trim().toUpperCase())
    .first<{ tracking_code: string; platform: string; order_type: string; status: string; created_at: string }>();
}
