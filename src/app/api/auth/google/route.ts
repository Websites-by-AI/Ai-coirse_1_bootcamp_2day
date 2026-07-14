import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  authCookieOptions,
  googleAdminRedirectUri,
  isGoogleAdminAuthConfigured,
  requestOrigin,
  safeAdminReturnTo,
} from "@/lib/auth-settings";

const STATE_COOKIE = "vibelab_google_oauth_state";
const RETURN_TO_COOKIE = "vibelab_google_oauth_return";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  if (!isGoogleAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin?authError=google_not_configured", origin));
  }

  const state = randomBytes(24).toString("hex");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", googleAdminRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  const cookieBase = authCookieOptions();
  response.cookies.set({ name: STATE_COOKIE, value: state, ...cookieBase, maxAge: 600 });
  response.cookies.set({
    name: RETURN_TO_COOKIE,
    value: safeAdminReturnTo(request.nextUrl.searchParams.get("returnTo")),
    ...cookieBase,
    maxAge: 600,
  });
  return response;
}
