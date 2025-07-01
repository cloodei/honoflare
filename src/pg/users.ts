import { z } from "zod/v4";
import { Context } from "hono";
import { pgClient } from "../db/db";
import { type Ctx } from "../ctx-types";

/**
 * List all users
*/
export async function listUsers(c: Context<Ctx, never, {}>) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const res = await sql.query('SELECT * FROM "USERS"');

  await sql.end();
  return c.json(res.rows);
}

/**
 * Get a user by ID, return an empty object if not found
*/
export async function getUserById(c: Context<Ctx, never, {}>) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const user = await sql.query('SELECT * FROM "USERS" WHERE id = $1', [id]);
  await sql.end();

  return c.json(user.rows[0] || {});
}

/**
 * Create a new user
*/
export async function createUser(c: Context<Ctx, never, {}>) {
  const [sql, body] = await Promise.all([
    pgClient(c.env.HYPERDRIVE.connectionString),
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

  await sql.query(
    'INSERT INTO "USERS" (name, email, password) VALUES ($1, $2, $3)',
    [parsed.data.name, parsed.data.email, parsed.data.password]
  );
  await sql.end();

  return c.json({ message: "Successful" }, 201);
}

/**
 * Update a user by ID
*/
export async function updateUser(c: Context<Ctx, never, {}>) {
  const [sql, body] = await Promise.all([
    pgClient(c.env.HYPERDRIVE.connectionString),
    c.req.json()
  ]);

  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const parsed = z.object({
    name: z.string().min(1).max(128),
    email: z.email().max(128),
    password: z.string().min(8).max(128),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await sql.query(
    'UPDATE "USERS" SET name = $2, email = $3 WHERE id = $1',
    [id, parsed.data.name, parsed.data.email]
  );
  await sql.end();

  return c.json({ message: "Successful" });
}

/**
 * Delete a user by ID
*/
export async function deleteUser(c: Context<Ctx, never, {}>) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  await sql.query('DELETE FROM "USERS" WHERE id = $1', [id]);
  await sql.end();

  return c.json({ message: "Successful" });
}
