import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    messenger: "bale",
    status: "placeholder-ready",
    tokenConfigured: Boolean(process.env.BALE_BOT_TOKEN?.trim()),
    note: "برای فعال‌سازی کامل، توکن ربات بله و ساختار webhook بله باید به‌صورت Cloudflare Secret تنظیم شود.",
  });
}

export async function POST(request: NextRequest) {
  const token = process.env.BALE_BOT_TOKEN?.trim();
  if (!token) return Response.json({ ok: false, error: "BALE_BOT_TOKEN is not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  // TODO: پیاده‌سازی ارسال پاسخ بله بعد از دریافت مستندات/توکن نهایی.
  return Response.json({ ok: true, received: Boolean(body) });
}
