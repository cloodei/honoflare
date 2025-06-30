import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export async function dbClient(conn: string) {
  const sql = new Client({ connectionString: conn });
  await sql.connect();
  
  const db = drizzle(sql);

  return { db, sql };
}
