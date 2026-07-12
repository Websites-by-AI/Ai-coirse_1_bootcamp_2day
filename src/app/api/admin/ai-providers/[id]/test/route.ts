import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { testAiProvider } from "@/lib/ai";
import { ADMIN_COOKIE_NAME, getAdminFromSession } from "@/lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  const { id } = await context.params;
  const providerId = Number(id);
  if (!Number.isInteger(providerId)) return NextResponse.json({ error: "شناسه اتصال نامعتبر است." }, { status: 400 });

  try {
    const result = await testAiProvider(providerId);
    return NextResponse.json({ ok: result.provider.lastStatus === "connected", ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تست اتصال ناموفق بود." }, { status: 400 });
  }
}
