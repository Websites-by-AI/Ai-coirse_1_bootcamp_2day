import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { scanStudentProject } from "@/lib/projects";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const cookieStore = await cookies();
  const student = await getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  if (!student) return NextResponse.json({ error: "برای اسکن پروژه وارد حساب شوید." }, { status: 401 });
  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ error: "شناسه پروژه معتبر نیست." }, { status: 400 });
  try {
    const project = await scanStudentProject(student.id, projectId);
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "اسکن پروژه ناموفق بود." }, { status: 400 });
  }
}
