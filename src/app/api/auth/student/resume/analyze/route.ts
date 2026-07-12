import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";
import { analyzeAndSaveResume, type ProfileView } from "@/lib/profile";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  if (!student) return NextResponse.json({ error: "وارد حساب کاربری شوید." }, { status: 401 });
  try {
    const body = (await request.json()) as { profile?: Partial<ProfileView>; resumeText?: unknown };
    if (!body.profile || typeof body.resumeText !== "string") return NextResponse.json({ error: "ورودی تحلیل کامل نیست." }, { status: 400 });
    const profile: ProfileView = { headline: typeof body.profile.headline === "string" ? body.profile.headline : "", bio: typeof body.profile.bio === "string" ? body.profile.bio : "", skills: typeof body.profile.skills === "string" ? body.profile.skills : "", portfolioUrl: typeof body.profile.portfolioUrl === "string" ? body.profile.portfolioUrl : null, isPublic: typeof body.profile.isPublic === "boolean" ? body.profile.isPublic : true };
    const result = await analyzeAndSaveResume(student.id, student.fullName, { profile, resumeText: body.resumeText });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "تحلیل رزومه ناموفق بود." }, { status: 400 });
  }
}
