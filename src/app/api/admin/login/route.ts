import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateAdmin, createAdminSession } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });
    }

    const user = await authenticateAdmin(username, password);
    if (!user) {
      return NextResponse.json({ error: "نام کاربری یا رمز عبور درست نیست." }, { status: 401 });
    }

    const session = await createAdminSession(user.id);
    const response = NextResponse.json({ ok: true, displayName: user.displayName });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "اتصال به پنل برقرار نشد. دوباره تلاش کنید." }, { status: 500 });
  }
}
