// src/config/db.config.ts
import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.PGDB_URL;
if (!databaseUrl) {
  throw new Error("Missing PGDB_URL in environment variables");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("error", err => {
  console.error("🔥 Unexpected error on idle client:", err);
  process.exit(-1);
});

/**
 * Executes a parameterized SQL query using the connection pool.
 *
 * @param text - SQL query string
 * @param params - Query parameter values
 * @returns A promise that resolves to the query result
 */
export async function query(
  text: string,
  params: any[] = []
): Promise<QueryResult> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV !== "production") {
    console.log("📄 Query executed", { text, duration, rows: result.rowCount });
  }

  return result;
}

/**
 * Acquires a PostgreSQL client for advanced use (e.g., transactions).
 *
 * @returns An object containing the connected client and a release function
 */
export async function getClient(): Promise<{
  client: PoolClient;
  done: () => void;
}> {
  const client = await pool.connect();
  const done = () => client.release();

  const rawQuery: typeof client.query = client.query.bind(client);

  client.query = (async (
    ...args: Parameters<PoolClient['query']>
  ): Promise<QueryResult> => {
    const start = Date.now();
    const result = await (rawQuery as (...args: any[]) => Promise<QueryResult>)(...args);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== "production") {
      const sql =
        typeof args[0] === "string"
          ? args[0]
          : (args[0] && typeof args[0] === "object" && "text" in args[0])
            ? (args[0] as { text: string }).text
            : "";
      console.log("📄 Client query", { text: sql, duration, rows: result.rowCount });
    }

    return result;
  }) as typeof client.query;

  return { client, done };
}

/**
 * The underlying connection pool for direct access.
 */
export default pool;
