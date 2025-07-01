import { Client } from "pg";
import { drizzle } from "drizzle-orm/postgres-js";

export async function dbClient(connectionString: string) {
  return drizzle(connectionString);
}

export async function pgClient(connectionString: string) {
  const sql = new Client({ connectionString });
  await sql.connect();

  return sql;
}
