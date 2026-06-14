import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env/server";
import * as schema from "./schema";

function normalizeConnectionString(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return raw.replace(/([?&])sslmode=[^&]+(&|$)/, (_, sep, tail) =>
      tail === "&" ? sep : sep === "?" ? "" : "",
    );
  }
}

const connectionString = normalizeConnectionString(env.DATABASE_URL);
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: isLocal ? false : { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export type Database = typeof db;
