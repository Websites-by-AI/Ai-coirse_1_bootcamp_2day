import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool, PoolConfig } from "pg";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

type DbGlobal = typeof globalThis & {
  __vibelabPgPool?: Pool;
  __vibelabDb?: NodePgDatabase;
};

const globalForDb = globalThis as DbGlobal;

function buildPoolConfig(connectionString: string): PoolConfig {
  const isLocal =
    connectionString.includes("127.0.0.1") ||
    connectionString.includes("localhost");

  const forceSsl =
    process.env.DATABASE_SSL === "true" ||
    process.env.DATABASE_SSL === "1" ||
    /sslmode=(require|verify-full|verify-ca)/i.test(connectionString) ||
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com");

  return {
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    ssl: !isLocal && forceSsl ? { rejectUnauthorized: false } : undefined,
  };
}

function createDb() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  // Cloudflare/OpenNext bundling cannot resolve pg's optional pg-cloudflare entry.
  // Keep full Postgres support for Node hosts (Vercel/local). On Cloudflare, skip DB.
  const isCloudflareWorker =
    typeof (globalThis as { CloudFlare?: unknown }).CloudFlare !== "undefined" ||
    process.env.CF_PAGES === "1" ||
    process.env.CLOUDFLARE === "1" ||
    process.env.NEXT_PUBLIC_FORCE_DEMO === "1";

  if (isCloudflareWorker) return null;

  try {
    // Dynamic require keeps `pg` out of static OpenNext analysis when possible.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    const pool = globalForDb.__vibelabPgPool ?? new Pool(buildPoolConfig(databaseUrl));
    const database = globalForDb.__vibelabDb ?? drizzle(pool);

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__vibelabPgPool = pool;
      globalForDb.__vibelabDb = database;
    }

    return { pool, db: database };
  } catch {
    return null;
  }
}

const instance = createDb();

export const pool = instance?.pool ?? null;

export function getDb() {
  if (!instance?.db) {
    throw new Error(
      "DATABASE_URL is not configured or database driver is unavailable in this runtime.",
    );
  }
  return instance.db;
}

export const db = new Proxy({} as NodePgDatabase, {
  get(_target, property, receiver) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(real, property, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export async function probeDatabase(): Promise<boolean> {
  if (!instance?.db) return false;
  try {
    const { sql } = await import("drizzle-orm");
    await instance.db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
