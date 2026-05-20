import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | undefined;

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: shouldUseSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
  });

  return pool;
}

function shouldUseSsl(databaseUrl: string) {
  if (databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")) return false;
  if (databaseUrl.includes("sslmode=disable")) return false;
  return true;
}

export async function query<T extends pg.QueryResultRow>(text: string, values: unknown[] = []) {
  const result = await getPool().query<T>(text, values);
  return result;
}
