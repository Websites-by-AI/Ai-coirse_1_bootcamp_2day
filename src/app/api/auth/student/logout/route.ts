import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteStudentSession, STUDENT_COOKIE_NAME } from "@/lib/student";

export async function POST() {
  const cookieStore = await cookies();
  await deleteStudentSession(cookieStore.get(STUDENT_COOKIE_NAME)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: STUDENT_COOKIE_NAME, value: "", httpOnly: true, sameSite: "lax", expires: new Date(0), path: "/" });
  return response;
}
