import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminFromSession, updateEnrollmentStatus } from "@/lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const admin = await getAdminFromSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!admin) return NextResponse.json({ error: "نشست شما منقضی شده است." }, { status: 401 });

  const { id } = await context.params;
  const enrollmentId = Number(id);
  const body = (await request.json()) as { status?: unknown };
  const status = typeof body.status === "string" ? body.status : "";

  if (!Number.isInteger(enrollmentId)) {
    return NextResponse.json({ error: "شناسه ثبت‌نام نامعتبر است." }, { status: 400 });
  }

  try {
    const enrollment = await updateEnrollmentStatus(enrollmentId, status);
    if (!enrollment) return NextResponse.json({ error: "ثبت‌نام پیدا نشد." }, { status: 404 });
    return NextResponse.json({ ok: true, enrollment });
  } catch {
    return NextResponse.json({ error: "وضعیت انتخاب‌شده معتبر نیست." }, { status: 400 });
  }
}
