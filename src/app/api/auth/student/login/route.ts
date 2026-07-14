import { NextResponse } from "next/server";
import { authenticateStudent, createStudentSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { authCookieOptions } from "@/lib/auth-settings";
import { isDatabaseConfigured } from "@/db";

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "دیتابیس تنظیم نشده است. سایت در حالت نمایشی است. برای ورود واقعی DATABASE_URL را روی Vercel/Supabase ست کنید.",
        demoMode: true,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "ایمیل و رمز عبور را وارد کنید." }, { status: 400 });
    }
    const student = await authenticateStudent(body.email, body.password);
    if (!student) return NextResponse.json({ error: "ایمیل یا رمز عبور درست نیست." }, { status: 401 });
    const session = await createStudentSession(student.id);
    const response = NextResponse.json({ ok: true, student });
    response.cookies.set({
      name: STUDENT_COOKIE_NAME,
      value: session.token,
      ...authCookieOptions(session.expiresAt),
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ورود به حساب کاربری ناموفق بود.",
      },
      { status: 500 },
    );
  }
}
