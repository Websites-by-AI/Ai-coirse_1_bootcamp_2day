import { isDatabaseConfigured, probeDatabase } from "@/db";
import { getRuntimeStatus } from "@/lib/runtime-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseReachable = isDatabaseConfigured ? await probeDatabase() : false;
  const runtime = getRuntimeStatus({ databaseReachable: isDatabaseConfigured ? databaseReachable : null });

  return Response.json(
    {
      ok: true,
      site: "up",
      database: {
        configured: isDatabaseConfigured,
        reachable: databaseReachable,
      },
      demoMode: runtime.demoMode,
      summary: runtime.summary,
    },
    { status: 200 },
  );
}
