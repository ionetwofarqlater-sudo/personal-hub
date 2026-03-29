import postgres from "postgres";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof postgres> | undefined };

export const sql =
  globalForDb.db ??
  postgres(process.env.DATABASE_URL!, {
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 10,
    idle_timeout: 30
  });

if (process.env.NODE_ENV !== "production") globalForDb.db = sql;
