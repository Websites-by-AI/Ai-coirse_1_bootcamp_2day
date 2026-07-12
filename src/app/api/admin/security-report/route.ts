import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminFromSession } from "@/lib/admin";
import { getSecurityReport } from "@/lib/security";

export async function GET() {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  try {
    return NextResponse.json({ ok: true, report: await getSecurityReport() });
  } catch {
    return NextResponse.json({ error: "اجرای گزارش امنیتی ناموفق بود." }, { status: 500 });
  }
}
