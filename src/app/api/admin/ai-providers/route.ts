import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addAiProvider } from "@/lib/ai";
import { ADMIN_COOKIE_NAME, getAdminFromSession } from "@/lib/admin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  try {
    const body = (await request.json()) as { provider?: unknown; label?: unknown; apiKey?: unknown; model?: unknown; monthlyTokenLimit?: unknown; warningThreshold?: unknown };
    if (typeof body.provider !== "string" || typeof body.label !== "string" || typeof body.apiKey !== "string") {
      return NextResponse.json({ error: "اطلاعات اتصال کامل نیست." }, { status: 400 });
    }
    const provider = await addAiProvider({
      provider: body.provider,
      label: body.label,
      apiKey: body.apiKey,
      model: typeof body.model === "string" ? body.model : undefined,
      monthlyTokenLimit: typeof body.monthlyTokenLimit === "number" ? body.monthlyTokenLimit : undefined,
      warningThreshold: typeof body.warningThreshold === "number" ? body.warningThreshold : undefined,
    });
    return NextResponse.json({ ok: true, provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "اتصال API ذخیره نشد." }, { status: 400 });
  }
}
