import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateAiProvider } from "@/lib/ai";
import { ADMIN_COOKIE_NAME, getAdminFromSession } from "@/lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  const { id } = await context.params;
  const providerId = Number(id);
  if (!Number.isInteger(providerId)) return NextResponse.json({ error: "شناسه اتصال نامعتبر است." }, { status: 400 });

  try {
    const body = (await request.json()) as { label?: unknown; model?: unknown; monthlyTokenLimit?: unknown; warningThreshold?: unknown; tokensUsed?: unknown };
    const provider = await updateAiProvider(providerId, {
      label: typeof body.label === "string" ? body.label : undefined,
      model: typeof body.model === "string" ? body.model : undefined,
      monthlyTokenLimit: typeof body.monthlyTokenLimit === "number" ? body.monthlyTokenLimit : undefined,
      warningThreshold: typeof body.warningThreshold === "number" ? body.warningThreshold : undefined,
      tokensUsed: typeof body.tokensUsed === "number" ? body.tokensUsed : undefined,
    });
    if (!provider) return NextResponse.json({ error: "اتصال API پیدا نشد." }, { status: 404 });
    return NextResponse.json({ ok: true, provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تغییرات ذخیره نشد." }, { status: 400 });
  }
}
