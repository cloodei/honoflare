import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { Context } from "hono";
import { drizzle } from "drizzle-orm/postgres-js";
import { type Ctx } from "../ctx-types";
import { usersTable } from "../db/schema";

/**
 * List all users
*/
export async function listUsers(c: Context<Ctx, never, {}>) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);

  try {
    const users = await db.select({
      name: usersTable.name,
      email: usersTable.email,
      trang_thai: usersTable.trang_thai,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at,
    }).from(usersTable);

    await db.$client.end();
    return c.json(users);
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Get a user by ID, return an empty object if not found
*/
export async function getUserById(c: Context<Ctx, never, {}>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    const user = await db.select({
      name: usersTable.name,
      email: usersTable.email,
      trang_thai: usersTable.trang_thai,
      created_at: usersTable.created_at,
      updated_at: usersTable.updated_at,
    }).from(usersTable).where(eq(usersTable.id, id));

    await db.$client.end();
    return c.json(user[0] || {});
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Create a new user
*/
export async function createUser(c: Context<Ctx, never, {}>) {
  const body = await c.req.json();
  const parsed = z.object({
    name: z.string().min(1).max(128),
    email: z.email().max(128),
    password: z.string().min(8).max(128),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.insert(usersTable).values(parsed.data);
    await db.$client.end();

    return c.json({ message: "Successful" }, 201);
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Update a user by ID
*/
export async function updateUser(c: Context<Ctx, never, {}>) {
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

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id));
    await db.$client.end();

    return c.json({ message: "Successful" });
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Delete a user by ID
*/
export async function deleteUser(c: Context<Ctx, never, {}>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    await db.$client.end();

    return c.json({ message: "Successful" });
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

