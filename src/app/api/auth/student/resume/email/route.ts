import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { emailStudentResume } from "@/lib/profile";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  if (!student) return NextResponse.json({ error: "وارد حساب کاربری شوید." }, { status: 401 });
  try {
    const body = (await request.json()) as { recipient?: unknown; subject?: unknown; message?: unknown };
    if (typeof body.recipient !== "string" || typeof body.subject !== "string" || typeof body.message !== "string") return NextResponse.json({ error: "گیرنده، موضوع و پیام لازم است." }, { status: 400 });
    return NextResponse.json({ ok: true, ...(await emailStudentResume(student.id, student.fullName, { recipient: body.recipient, subject: body.subject, message: body.message })) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ارسال رزومه ناموفق بود." }, { status: 400 });
  }
}
