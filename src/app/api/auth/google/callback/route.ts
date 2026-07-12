import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateGoogleAdmin, createAdminSession, isGoogleAuthConfigured } from "@/lib/admin";

const STATE_COOKIE = "vibelab_google_oauth_state";
const RETURN_TO_COOKIE = "vibelab_google_oauth_return";

function safeReturnTo(value?: string) {
  return value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set({ name: STATE_COOKIE, value: "", expires: new Date(0), path: "/" });
  response.cookies.set({ name: RETURN_TO_COOKIE, value: "", expires: new Date(0), path: "/" });
}

function requestOrigin(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host).split(",")[0].trim();
  const forwardedProtocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  const protocol = host.endsWith(".e2b.app") ? "https" : forwardedProtocol;
  return `${protocol}://${host}`;
}

function failure(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(new URL(`/admin?authError=${encodeURIComponent(reason)}`, requestOrigin(request)));
  clearOAuthCookies(response);
  return response;
}

function redirectUri(request: NextRequest) {
  return process.env.GOOGLE_REDIRECT_URI ?? `${requestOrigin(request)}/api/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) return failure(request, "google_not_configured");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const googleError = request.nextUrl.searchParams.get("error");
  if (googleError) return failure(request, "google_cancelled");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  const returnTo = safeReturnTo(cookieStore.get(RETURN_TO_COOKIE)?.value);
  if (!code || !state || !expectedState || state !== expectedState) return failure(request, "google_state_invalid");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri(request),
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
    const profile = (await profileResponse.json().catch(() => ({}))) as { sub?: string; email?: string; name?: string; email_verified?: boolean | string };
    if (!profileResponse.ok || !profile.sub || !profile.email || !(profile.email_verified === true || profile.email_verified === "true")) {
      return failure(request, "google_profile_failed");
    }

    const admin = await authenticateGoogleAdmin({ subject: profile.sub, email: profile.email, name: profile.name ?? profile.email });
    if (!admin) return failure(request, "google_not_allowed");

    const session = await createAdminSession(admin.id);
    const response = NextResponse.redirect(new URL(returnTo, requestOrigin(request)));
    response.cookies.set({ name: ADMIN_COOKIE_NAME, value: session.token, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: session.expiresAt, path: "/" });
    clearOAuthCookies(response);
    return response;
  } catch {
    return failure(request, "google_connection_failed");
  }
}
