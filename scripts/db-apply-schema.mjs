import { readFile } from "node:fs/promises";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env.local or pass it before running this script.");
  process.exit(1);
}

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
});

try {
  await pool.query(schema);
  console.log("Applied db/schema.sql successfully.");
} finally {
  await pool.end();
}
