import { NextResponse } from "next/server";
import { authenticateStudent, createStudentSession, STUDENT_COOKIE_NAME } from "@/lib/student";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "ایمیل و رمز عبور را وارد کنید." }, { status: 400 });
    }
    const student = await authenticateStudent(body.email, body.password);
    if (!student) return NextResponse.json({ error: "ایمیل یا رمز عبور درست نیست." }, { status: 401 });
    const session = await createStudentSession(student.id);
    const response = NextResponse.json({ ok: true, student });
    response.cookies.set({ name: STUDENT_COOKIE_NAME, value: session.token, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: session.expiresAt, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "ورود به حساب کاربری ناموفق بود." }, { status: 500 });
  }
}
