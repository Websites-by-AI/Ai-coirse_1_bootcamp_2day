import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { getStudentProfileData, updateStudentProfile } from "@/lib/profile";

async function currentStudent() {
  const cookieStore = await cookies();
  return getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
}

export async function GET() {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "وارد حساب کاربری شوید." }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await getStudentProfileData(student.id, student.fullName)) });
}

export async function PUT(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "وارد حساب کاربری شوید." }, { status: 401 });
  try {
    const body = (await request.json()) as { headline?: unknown; bio?: unknown; skills?: unknown; portfolioUrl?: unknown; isPublic?: unknown };
    const profile = await updateStudentProfile(student.id, student.fullName, { headline: typeof body.headline === "string" ? body.headline : undefined, bio: typeof body.bio === "string" ? body.bio : undefined, skills: typeof body.skills === "string" ? body.skills : undefined, portfolioUrl: typeof body.portfolioUrl === "string" ? body.portfolioUrl : undefined, isPublic: typeof body.isPublic === "boolean" ? body.isPublic : undefined });
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ذخیره پروفایل ناموفق بود." }, { status: 400 });
  }
}
