import { NextResponse } from "next/server";
import { createStudentSession, registerStudent, STUDENT_COOKIE_NAME } from "@/lib/student";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: unknown;
      email?: unknown;
      phone?: unknown;
      password?: unknown;
      goal?: unknown;
      experienceLevel?: unknown;
      weeklyHours?: unknown;
      projectIdea?: unknown;
      turnstileToken?: unknown;
    };
    const fields = [body.fullName, body.email, body.phone, body.password, body.goal, body.experienceLevel, body.projectIdea];
    if (fields.some((field) => typeof field !== "string") || typeof body.weeklyHours !== "number") {
      return NextResponse.json({ error: "همه‌ی اطلاعات ضروری را وارد کنید." }, { status: 400 });
    }

    const verification = await verifyTurnstile(
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    );
    if (!verification.ok) return NextResponse.json({ error: verification.message }, { status: 403 });

    const result = await registerStudent({
      fullName: body.fullName as string,
      email: body.email as string,
      phone: body.phone as string,
      password: body.password as string,
      assessment: {
        goal: body.goal as string,
        experienceLevel: body.experienceLevel as string,
        weeklyHours: body.weeklyHours as number,
        projectIdea: body.projectIdea as string,
      },
    });
    const session = await createStudentSession(result.student.id);
    const response = NextResponse.json({ ok: true, ...result });
    response.cookies.set({ name: STUDENT_COOKIE_NAME, value: session.token, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: session.expiresAt, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ثبت‌نام انجام نشد؛ دوباره تلاش کنید." }, { status: 400 });
  }
}
