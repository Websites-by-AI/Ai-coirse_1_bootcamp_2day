import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/lib/admin";

const STATE_COOKIE = "vibelab_student_google_state";

function requestOrigin(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host).split(",")[0].trim();
  const forwardedProtocol = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  return `${host.endsWith(".e2b.app") ? "https" : forwardedProtocol}://${host}`;
}

function redirectUri(request: NextRequest) {
  return process.env.GOOGLE_STUDENT_REDIRECT_URI ?? `${requestOrigin(request)}/api/auth/student/google/callback`;
}

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) return NextResponse.redirect(new URL("/register?authError=google_not_configured", requestOrigin(request)));

  const state = randomBytes(24).toString("hex");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set({ name: STATE_COOKIE, value: state, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
