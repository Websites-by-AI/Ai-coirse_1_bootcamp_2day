import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { importResumeFile } from "@/lib/profile";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  if (!student) return NextResponse.json({ error: "وارد حساب کاربری شوید." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "فایل رزومه را انتخاب کنید." }, { status: 400 });
    const resume = await importResumeFile(student.id, student.fullName, file);
    return NextResponse.json({ ok: true, resume });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "آپلود رزومه ناموفق بود." }, { status: 400 });
  }
}
