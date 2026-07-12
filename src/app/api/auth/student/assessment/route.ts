import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAssessmentForStudent, getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  if (!student) return NextResponse.json({ error: "برای ادامه وارد حساب کاربری شوید." }, { status: 401 });

  try {
    const body = (await request.json()) as { goal?: unknown; experienceLevel?: unknown; weeklyHours?: unknown; projectIdea?: unknown; turnstileToken?: unknown };
    if (typeof body.goal !== "string" || typeof body.experienceLevel !== "string" || typeof body.weeklyHours !== "number" || typeof body.projectIdea !== "string") {
      return NextResponse.json({ error: "اطلاعات مسیرسنج کامل نیست." }, { status: 400 });
    }
    const verification = await verifyTurnstile(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    );
    if (!verification.ok) return NextResponse.json({ error: verification.message }, { status: 403 });

    const assessment = await createAssessmentForStudent(student.id, {
      goal: body.goal,
      experienceLevel: body.experienceLevel,
      weeklyHours: body.weeklyHours,
      projectIdea: body.projectIdea,
    });
    return NextResponse.json({ ok: true, assessment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تحلیل مسیر ناموفق بود." }, { status: 400 });
  }
}
