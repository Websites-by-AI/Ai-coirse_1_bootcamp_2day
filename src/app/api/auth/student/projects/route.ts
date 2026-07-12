import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createStudentProject, listStudentProjects } from "@/lib/projects";
import { getStudentFromSession, STUDENT_COOKIE_NAME } from "@/lib/student";

async function currentStudent() {
  const cookieStore = await cookies();
  return getStudentFromSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
}

export async function GET() {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "برای دیدن پروژه‌ها وارد حساب شوید." }, { status: 401 });
  return NextResponse.json({ ok: true, projects: await listStudentProjects(student.id) });
}

export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "برای ثبت پروژه وارد حساب شوید." }, { status: 401 });
  try {
    const body = (await request.json()) as { name?: unknown; description?: unknown; githubUrl?: unknown; deploymentUrl?: unknown };
    if (typeof body.name !== "string" || typeof body.description !== "string" || typeof body.githubUrl !== "string" || typeof body.deploymentUrl !== "string") return NextResponse.json({ error: "تمام لینک‌ها و اطلاعات پروژه لازم است." }, { status: 400 });
    const project = await createStudentProject(student.id, { name: body.name, description: body.description, githubUrl: body.githubUrl, deploymentUrl: body.deploymentUrl });
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ثبت پروژه ناموفق بود." }, { status: 400 });
  }
}
