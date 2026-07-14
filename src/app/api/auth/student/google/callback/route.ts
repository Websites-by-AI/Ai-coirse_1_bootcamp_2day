import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/lib/admin";
import {
  authenticateGoogleStudent,
  createStudentSession,
  STUDENT_COOKIE_NAME,
} from "@/lib/student";
import {
  authCookieOptions,
  googleStudentRedirectUri,
  requestOrigin,
  safeStudentReturnTo,
} from "@/lib/auth-settings";

const STATE_COOKIE = "vibelab_student_google_state";
const RETURN_TO_COOKIE = "vibelab_student_google_return";

function failure(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(`/register?authError=${encodeURIComponent(reason)}`, requestOrigin(request)),
  );
  response.cookies.set({ name: STATE_COOKIE, value: "", expires: new Date(0), path: "/" });
  response.cookies.set({ name: RETURN_TO_COOKIE, value: "", expires: new Date(0), path: "/" });
  return response;
}

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) return failure(request, "google_not_configured");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) return failure(request, "google_cancelled");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const returnTo = safeStudentReturnTo(cookieStore.get(RETURN_TO_COOKIE)?.value);
  if (!code || !state || !expectedState || state !== expectedState) {
    return failure(request, "google_state_invalid");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleStudentRedirectUri(request),
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const token = (await tokenResponse.json().catch(() => ({}))) as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) return failure(request, "google_token_failed");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(12_000),
    });
    const profile = (await profileResponse.json().catch(() => ({}))) as {
      sub?: string;
      email?: string;
      name?: string;
      email_verified?: boolean | string;
    };
    if (
      !profileResponse.ok ||
      !profile.sub ||
      !profile.email ||
      !(profile.email_verified === true || profile.email_verified === "true")
    ) {
      return failure(request, "google_profile_failed");
    }

    const student = await authenticateGoogleStudent({
      subject: profile.sub,
      email: profile.email,
      name: profile.name ?? profile.email,
    });
    const session = await createStudentSession(student.id);
    const destination = returnTo === "/register" ? "/register?google=1" : returnTo;
    const response = NextResponse.redirect(new URL(destination, requestOrigin(request)));
    response.cookies.set({
      name: STUDENT_COOKIE_NAME,
      value: session.token,
      ...authCookieOptions(session.expiresAt),
    });
    response.cookies.set({ name: STATE_COOKIE, value: "", expires: new Date(0), path: "/" });
    response.cookies.set({ name: RETURN_TO_COOKIE, value: "", expires: new Date(0), path: "/" });
    return response;
  } catch {
    return failure(request, "google_connection_failed");
  }
}
