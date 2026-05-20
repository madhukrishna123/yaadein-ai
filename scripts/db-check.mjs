import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
});

try {
  const result = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('customers', 'restoration_jobs', 'payments', 'messages', 'events')
    order by table_name
  `);
  const tables = result.rows.map((row) => row.table_name);
  console.log(`Database connected. Found tables: ${tables.join(", ") || "none"}`);
  if (tables.length < 5) {
    console.error("Expected 5 Yaadein AI tables. Run npm run db:schema.");
    process.exitCode = 1;
  }
} finally {
  await pool.end();
}
