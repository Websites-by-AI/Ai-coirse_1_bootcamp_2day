import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

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

type DbGlobal = typeof globalThis & {
  __vibelabPgPool?: Pool;
  __vibelabDb?: NodePgDatabase;
};

const globalForDb = globalThis as DbGlobal;

function createDb() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  const pool =
    globalForDb.__vibelabPgPool ?? new Pool(buildPoolConfig(databaseUrl));
  const database = globalForDb.__vibelabDb ?? drizzle(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__vibelabPgPool = pool;
    globalForDb.__vibelabDb = database;
  }

  return { pool, db: database };
}

const instance = createDb();

export const pool = instance?.pool ?? null;

/**
 * Lazy database accessor. Throws a friendly error only when a feature
 * actually needs the DB — importing this module never crashes the app.
 */
export function getDb() {
  if (!instance?.db) {
    throw new Error(
      "DATABASE_URL is not configured. Site runs in demo/preview mode without database features.",
    );
  }
  return instance.db;
}

/**
 * Backward-compatible export used across the codebase.
 * Accessing methods when DB is missing will throw at call-time, not import-time.
 */
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
