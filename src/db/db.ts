import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export async function dbClient(connectionString: string) {
  const sql = new Client({ connectionString });
  await sql.connect();
  
  const db = drizzle(sql);

  return { db, sql };
}

export async function pgClient(connectionString: string) {
  const sql = new Client({ connectionString });
  await sql.connect();

  return sql;
}
