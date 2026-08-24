import { NextResponse } from "next/server";
import { createBotOrder, getBotOrder, recordBotSimulatorEvent } from "@/lib/bot-simulator";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { platform?: unknown; action?: unknown; payload?: Record<string, unknown>; orderType?: unknown; trackingCode?: unknown };
    const platform = body.platform === "bale" ? "bale" : "telegram";
    const action = typeof body.action === "string" ? body.action : "unknown";

    if (action === "create_order") {
      const result = await createBotOrder({ platform, action, orderType: typeof body.orderType === "string" ? body.orderType : "سفارش سایت/کارآموزی", payload: body.payload });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "track_order") {
      const code = typeof body.trackingCode === "string" ? body.trackingCode : "";
      const order = code ? await getBotOrder(code) : null;
      await recordBotSimulatorEvent({ platform, action, payload: { trackingCode: code } });
      return NextResponse.json({ ok: true, order });
    }

    const result = await recordBotSimulatorEvent({ platform, action, payload: body.payload });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در شبیه‌ساز ربات" }, { status: 400 });
  }
}
