import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const DEFAULT_SITE_URL = "https://v2.vibelab.ir";

async function ensureBotSettingsTable() {
  const db = await getVibelabD1();
  if (!db) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS vibelab_bot_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db
    .prepare("INSERT OR IGNORE INTO vibelab_bot_settings (key, value) VALUES ('site_url', ?)")
    .bind(DEFAULT_SITE_URL)
    .run();
  return db;
}

export async function getBotSetting(key: string, fallback = "") {
  const db = await ensureBotSettingsTable();
  if (!db) return fallback;
  const row = await db.prepare("SELECT value FROM vibelab_bot_settings WHERE key = ? LIMIT 1").bind(key).first<{ value: string }>();
  return row?.value || fallback;
}

export async function setBotSetting(key: string, value: string) {
  const db = await ensureBotSettingsTable();
  if (!db) throw new Error("Cloudflare D1 is not available");
  await db
    .prepare(`INSERT INTO vibelab_bot_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
    .bind(key, value, new Date().toISOString())
    .run();
  return { key, value };
}

export async function getBotSiteUrl() {
  const value = await getBotSetting("site_url", process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
  return value.replace(/\/$/, "");
}

export async function getBotChannelUrl() {
  return getBotSetting("telegram_channel_url", "https://t.me/vibelab_channel");
}
