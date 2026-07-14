import { NextRequest, NextResponse } from "next/server";
import { getAuthSettingsStatus, requestOrigin } from "@/lib/auth-settings";
import { getRuntimeStatus } from "@/lib/runtime-status";
import { isDatabaseConfigured, probeDatabase } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const databaseReachable = isDatabaseConfigured ? await probeDatabase() : false;
  const runtime = getRuntimeStatus({
    databaseReachable: isDatabaseConfigured ? databaseReachable : null,
  });
  const status = getAuthSettingsStatus(requestOrigin(request));

  return NextResponse.json({
    ok: true,
    auth: status,
    runtime,
    demo: {
      student: {
        email: "demo.student@vibelab.ir",
        password: "VibeStudent2025!",
      },
      admin: {
        username: "admin@vibelab.ir",
        password: "VibeLab2025!",
      },
    },
    cloudflare: {
      rootDirectoryMustBeEmpty: true,
      nodejsCompatIsRuntimeFlagNotRoot: true,
      doNotPutNodejsCompatInRootDirectory: true,
      doNotRequireDatabaseSecretForLanding: true,
      recommendedHost: "Vercel + Supabase",
    },
  });
}
