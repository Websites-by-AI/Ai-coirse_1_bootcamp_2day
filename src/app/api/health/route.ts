import { isDatabaseConfigured, probeDatabase } from "@/db";
import { getRuntimeStatus } from "@/lib/runtime-status";
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

export async function GET() {
  const [databaseReachable, cloudflareD1Reachable] = await Promise.all([
    isDatabaseConfigured ? probeDatabase() : Promise.resolve(false),
    probeCloudflareD1(),
  ]);
  const runtime = getRuntimeStatus({
    databaseReachable: isDatabaseConfigured ? databaseReachable : null,
    cloudflareD1Reachable,
  });

  return Response.json(
    {
      ok: true,
      site: "up",
      database: {
        configured: isDatabaseConfigured || cloudflareD1Reachable,
        provider: cloudflareD1Reachable ? "cloudflare-d1" : isDatabaseConfigured ? "postgres" : null,
        reachable: cloudflareD1Reachable || (isDatabaseConfigured ? databaseReachable : false),
        postgres: {
          configured: isDatabaseConfigured,
          reachable: databaseReachable,
        },
        cloudflareD1: {
          binding: "VIBELAB_DB",
          reachable: cloudflareD1Reachable,
        },
      },
      demoMode: runtime.demoMode,
      summary: runtime.summary,
    },
    { status: 200 },
  );
}
