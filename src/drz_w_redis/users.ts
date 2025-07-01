import { Hyperdrive } from "@cloudflare/workers-types";
import { Context } from "hono";
import { dbClient } from "../db/db";
import { Redis } from "@upstash/redis";
import { z } from "zod/v4";
import { usersTable } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export async function listUsers(c: Context<{ Bindings: { HYPERDRIVE: Hyperdrive } }>) {
  const client = Redis.fromEnv();
  const cached = await client.get("users");

  if (cached) {
    return c.text(cached as string, 200, { "Content-Type": "application/json" });
  }

  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const res = JSON.stringify(await db.select({
    name: usersTable.name,
    email: usersTable.email,
    trang_thai: usersTable.trang_thai,
    created_at: usersTable.created_at,
    updated_at: usersTable.updated_at,
  }).from(usersTable));

  await Promise.all([
    sql.end(),
    client.set("users", res, {
      ex: 60 * 60,
    })
  ]);

  return c.text(res, 200, { "Content-Type": "application/json" });
}

export async function getUserById(c: Context<{ Bindings: { HYPERDRIVE: Hyperdrive } }>) {
  const client = Redis.fromEnv();
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const cached = await client.get("users:" + id);
  if (cached) {
    return c.text(cached as string, 200, { "Content-Type": "application/json" });
  }

  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const row = JSON.stringify((await db.select({
    name: usersTable.name,
    email: usersTable.email,
    trang_thai: usersTable.trang_thai,
    created_at: usersTable.created_at,
    updated_at: usersTable.updated_at,
  }).from(usersTable).where(eq(usersTable.id, id)))[0] || {});

  await Promise.all([
    sql.end(),
    client.set("users:" + id, row, {
      ex: 60 * 60,
    })
  ]);

  return c.text(row, 200, { "Content-Type": "application/json" });
}

export async function createUser(c: Context<{ Bindings: { HYPERDRIVE: Hyperdrive } }>) {
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
  
  await Promise.all([
    db.insert(usersTable).values(parsed.data),
    Redis.fromEnv().del("users")
  ])

  await sql.end();
  return c.text("Successful", 201);
}

export async function updateUser(c: Context<{ Bindings: { HYPERDRIVE: Hyperdrive } }>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

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

  await Promise.all([
    db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)),
    Redis.fromEnv().del("users", "users:" + id)
  ]);

  await sql.end();
  return c.text("Successful");
}

export async function deleteUser(c: Context<{ Bindings: { HYPERDRIVE: Hyperdrive } }>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);

  await Promise.all([
    db.delete(usersTable).where(eq(usersTable.id, id)),
    Redis.fromEnv().del("users", "users:" + id),
  ]);

  await sql.end();
  return c.text("Successful");
}

