import { NextResponse } from "next/server";
import { createStudentSession, ensureDemoStudent, getLatestStudentAssessment, STUDENT_COOKIE_NAME } from "@/lib/student";

export async function POST() {
  try {
    const student = await ensureDemoStudent();
    const assessment = await getLatestStudentAssessment(student.id);
    if (!assessment) return NextResponse.json({ error: "نتیجه‌ی حساب دمو آماده نشد." }, { status: 500 });

    const session = await createStudentSession(student.id);
    const response = NextResponse.json({ ok: true, student, assessment });
    response.cookies.set({ name: STUDENT_COOKIE_NAME, value: session.token, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: session.expiresAt, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "ورود به حساب دمو ناموفق بود." }, { status: 500 });
  }
}
