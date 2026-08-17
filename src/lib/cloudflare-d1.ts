import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
  run: () => Promise<unknown>;
};

export type D1DatabaseBinding = {
  prepare: (query: string) => D1PreparedStatement;
  batch?: (statements: D1PreparedStatement[]) => Promise<unknown[]>;
  exec?: (query: string) => Promise<unknown>;
};

type CloudflareEnv = {
  VIBELAB_DB?: D1DatabaseBinding;
};

export async function getVibelabD1(): Promise<D1DatabaseBinding | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnv;
    return env.VIBELAB_DB ?? null;
  } catch {
    return null;
  }
}
