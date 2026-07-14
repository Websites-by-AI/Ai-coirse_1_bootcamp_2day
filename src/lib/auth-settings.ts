import type { NextRequest } from "next/server";

export type AuthSettingsStatus = {
  studentPasswordLogin: boolean;
  studentGoogleLogin: boolean;
  studentGoogleRegistration: boolean;
  adminPasswordLogin: boolean;
  adminGoogleLogin: boolean;
  turnstileEnabled: boolean;
  databaseConfigured: boolean;
  googleClientIdConfigured: boolean;
  googleClientSecretConfigured: boolean;
  googleAdminEmailsConfigured: boolean;
  googleAdminRedirectUri: string | null;
  googleStudentRedirectUri: string | null;
  missingForStudentGoogle: string[];
  missingForAdminGoogle: string[];
  setupHints: string[];
};

function nonEmpty(value: string | undefined | null) {
  return Boolean(value && value.trim());
}

export function requestOrigin(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host
  )
    .split(",")[0]
    .trim();

  const forwardedProtocol = (
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "")
  )
    .split(",")[0]
    .trim();

  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol =
    host.endsWith(".e2b.app") || host.endsWith(".pages.dev") || host.endsWith(".workers.dev")
      ? "https"
      : isLocalhost
        ? "http"
        : forwardedProtocol || "https";

  return `${protocol}://${host}`;
}

export function isGoogleOAuthConfigured() {
  return nonEmpty(process.env.GOOGLE_CLIENT_ID) && nonEmpty(process.env.GOOGLE_CLIENT_SECRET);
}

export function isGoogleAdminAuthConfigured() {
  return isGoogleOAuthConfigured() && nonEmpty(process.env.GOOGLE_ADMIN_EMAILS);
}

export function googleAdminEmails() {
  return (process.env.GOOGLE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function googleAdminRedirectUri(request: NextRequest) {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${requestOrigin(request)}/api/auth/google/callback`
  );
}

export function googleStudentRedirectUri(request: NextRequest) {
  return (
    process.env.GOOGLE_STUDENT_REDIRECT_URI?.trim() ||
    `${requestOrigin(request)}/api/auth/student/google/callback`
  );
}

export function safeStudentReturnTo(value: string | null | undefined) {
  if (!value) return "/register";
  if (!value.startsWith("/") || value.startsWith("//")) return "/register";
  if (value.startsWith("/api")) return "/register";
  return value;
}

export function safeAdminReturnTo(value: string | null | undefined) {
  if (!value) return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  return value;
}

export function getAuthSettingsStatus(baseUrl?: string): AuthSettingsStatus {
  const origin = baseUrl?.replace(/\/$/, "") || "";
  const studentGoogle = isGoogleOAuthConfigured();
  const adminGoogle = isGoogleAdminAuthConfigured();
  const missingForStudentGoogle: string[] = [];
  const missingForAdminGoogle: string[] = [];

  if (!nonEmpty(process.env.GOOGLE_CLIENT_ID)) missingForStudentGoogle.push("GOOGLE_CLIENT_ID");
  if (!nonEmpty(process.env.GOOGLE_CLIENT_SECRET)) missingForStudentGoogle.push("GOOGLE_CLIENT_SECRET");

  if (!nonEmpty(process.env.GOOGLE_CLIENT_ID)) missingForAdminGoogle.push("GOOGLE_CLIENT_ID");
  if (!nonEmpty(process.env.GOOGLE_CLIENT_SECRET)) missingForAdminGoogle.push("GOOGLE_CLIENT_SECRET");
  if (!nonEmpty(process.env.GOOGLE_ADMIN_EMAILS)) missingForAdminGoogle.push("GOOGLE_ADMIN_EMAILS");

  const googleAdminRedirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    (origin ? `${origin}/api/auth/google/callback` : null);
  const googleStudentRedirectUri =
    process.env.GOOGLE_STUDENT_REDIRECT_URI?.trim() ||
    (origin ? `${origin}/api/auth/student/google/callback` : null);

  const setupHints: string[] = [];
  if (!studentGoogle) {
    setupHints.push(
      "برای ورود/ثبت‌نام Google کاربر، GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET را در Environment Variables تنظیم کنید.",
    );
  }
  if (!adminGoogle) {
    setupHints.push(
      "برای ورود Google ادمین، علاوه بر OAuth باید GOOGLE_ADMIN_EMAILS (لیست ایمیل‌های مجاز، جدا با ویرگول) را هم بگذارید.",
    );
  }
  if (studentGoogle) {
    setupHints.push(
      "در Google Cloud Console → Credentials → OAuth Client، هر دو Redirect URI کاربر و ادمین را دقیقاً اضافه کنید.",
    );
  }
  if (!nonEmpty(process.env.DATABASE_URL)) {
    setupHints.push("DATABASE_URL برای ذخیره حساب و session الزامی است.");
  }

  return {
    studentPasswordLogin: true,
    studentGoogleLogin: studentGoogle,
    studentGoogleRegistration: studentGoogle,
    adminPasswordLogin: true,
    adminGoogleLogin: adminGoogle,
    turnstileEnabled: nonEmpty(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && nonEmpty(process.env.TURNSTILE_SECRET_KEY),
    databaseConfigured: nonEmpty(process.env.DATABASE_URL),
    googleClientIdConfigured: nonEmpty(process.env.GOOGLE_CLIENT_ID),
    googleClientSecretConfigured: nonEmpty(process.env.GOOGLE_CLIENT_SECRET),
    googleAdminEmailsConfigured: nonEmpty(process.env.GOOGLE_ADMIN_EMAILS),
    googleAdminRedirectUri,
    googleStudentRedirectUri,
    missingForStudentGoogle,
    missingForAdminGoogle,
    setupHints,
  };
}

export function authCookieOptions(expires?: Date) {
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.FORCE_SECURE_COOKIES === "true" ||
    process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    path: "/",
    ...(expires ? { expires } : {}),
  };
}
