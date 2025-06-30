import { Context } from "hono";
import { dbClient } from "../db/db";
import { usersTable } from "../db/schema";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";

/**
 * List all users
*/
export async function listUsers(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const users = await db.select().from(usersTable);
  await sql.end();

  return c.json(users);
}

/**
 * Get a user by ID, return an empty object if not found
*/
export async function getUserById(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const user = await db.select().from(usersTable).where(eq(usersTable.id, id));
  await sql.end();

  return c.json(user[0] || {});
}

/**
 * Create a new user
*/
export async function createUser(c: Context) {
  const [{ db, sql }, body] = await Promise.all([
    dbClient(c.env.HYPERDRIVE.connectionString),
    c.req.json()
  ]);

  const parsed = z.object({
    name: z.string().min(1).max(128),
    email: z.email().max(128),
    password: z.string().min(8).max(128),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.insert(usersTable).values(parsed.data);
  await sql.end();

  return c.json({ message: "Successful" }, 201);
}

/**
 * Update a user by ID
*/
export async function updateUser(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const body = await c.req.json();

  const parsed = z.object({
    name: z.string().min(1).max(128),
    email: z.email().max(128),
    password: z.string().min(8).max(128),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id));
  await sql.end();

  return c.json({ message: "Successful" });
}

/**
 * Delete a user by ID
*/
export async function deleteUser(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  await sql.end();

  return c.json({ message: "Successful" });
}

