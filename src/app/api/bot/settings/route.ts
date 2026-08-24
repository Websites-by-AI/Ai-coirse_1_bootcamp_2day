import { NextRequest, NextResponse } from "next/server";
import { getBotChannelUrl, getBotSiteUrl, setBotSetting } from "@/lib/bot-settings";

export const dynamic = "force-dynamic";

function canWrite(request: NextRequest) {
  const secret = process.env.BOT_SETTINGS_SECRET?.trim() || process.env.TELEGRAM_CHANNEL_POST_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("x-vibelab-settings-secret") === secret || request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    siteUrl: await getBotSiteUrl(),
    telegramChannelUrl: await getBotChannelUrl(),
    note: "Bot links are read from Cloudflare D1. Change site_url in vibelab_bot_settings to switch to the main domain later.",
  });
}

export async function POST(request: NextRequest) {
  if (!canWrite(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { siteUrl?: unknown; telegramChannelUrl?: unknown };
  const updates: Record<string, string> = {};
  if (typeof body.siteUrl === "string" && /^https:\/\//.test(body.siteUrl.trim())) {
    updates.siteUrl = (await setBotSetting("site_url", body.siteUrl.trim().replace(/\/$/, ""))).value;
  }
  if (typeof body.telegramChannelUrl === "string" && /^https:\/\//.test(body.telegramChannelUrl.trim())) {
    updates.telegramChannelUrl = (await setBotSetting("telegram_channel_url", body.telegramChannelUrl.trim())).value;
  }
  return NextResponse.json({ ok: true, updates, siteUrl: await getBotSiteUrl(), telegramChannelUrl: await getBotChannelUrl() });
}
