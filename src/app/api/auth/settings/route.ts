import { NextRequest, NextResponse } from "next/server";
import { getAuthSettingsStatus, requestOrigin } from "@/lib/auth-settings";
import { getRuntimeStatus } from "@/lib/runtime-status";
import { isDatabaseConfigured, probeDatabase } from "@/db";
import { getVibelabD1 } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

async function probeCloudflareD1() {
  try {
    const d1 = await getVibelabD1();
    if (!d1) return false;
    await d1.prepare("SELECT 1 AS ok").first();
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const [databaseReachable, cloudflareD1Reachable] = await Promise.all([
    isDatabaseConfigured ? probeDatabase() : Promise.resolve(false),
    probeCloudflareD1(),
  ]);
  const runtime = getRuntimeStatus({
    databaseReachable: isDatabaseConfigured ? databaseReachable : null,
    cloudflareD1Reachable,
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
      d1Binding: "VIBELAB_DB",
      recommendedHost: "Cloudflare Workers + D1",
    },
  });
}
