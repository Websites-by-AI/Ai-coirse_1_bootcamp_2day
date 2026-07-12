import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { assessStudentFit } from "@/lib/assessment";
import { ADMIN_COOKIE_NAME, getAdminFromSession } from "@/lib/admin";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  try {
    const body = (await request.json()) as { goal?: unknown; experienceLevel?: unknown; weeklyHours?: unknown; projectIdea?: unknown };
    if (typeof body.goal !== "string" || typeof body.experienceLevel !== "string" || typeof body.weeklyHours !== "number" || typeof body.projectIdea !== "string") {
      return NextResponse.json({ error: "ورودی تست کامل نیست." }, { status: 400 });
    }
    if (body.projectIdea.trim().length < 15 || body.weeklyHours < 1 || body.weeklyHours > 80) {
      return NextResponse.json({ error: "ایده باید حداقل ۱۵ کاراکتر و زمان بین ۱ تا ۸۰ ساعت باشد." }, { status: 400 });
    }
    const result = await assessStudentFit({ goal: body.goal, experienceLevel: body.experienceLevel, weeklyHours: body.weeklyHours, projectIdea: body.projectIdea });
    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json({ error: "اجرای تست تحلیل ناموفق بود." }, { status: 500 });
  }
}
