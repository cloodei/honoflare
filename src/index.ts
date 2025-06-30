import { z } from 'zod/v4';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/postgres-js';
import { Hyperdrive } from '@cloudflare/workers-types';
import { booksTable, usersTable } from './db/schema';
import postgres from 'postgres';

type Bindings = {
  HYPERDRIVE: Hyperdrive;
}
const app = new Hono<{ Bindings: Bindings }>()

app.get("/api/users", async c => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const users = await db.select().from(usersTable);
  await sql.end();

  return c.json(users);
})

app.post("/api/users", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const body = await c.req.json();

  const parsed = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  }).safeParse(body);

  if (!parsed.success) {
    await sql.end();
    
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.insert(usersTable).values(parsed.data);
  await sql.end();

  return c.json({ message: "Successful" }, 201);
})

app.get("/api/users/:id", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const id = c.req.param("id");

  const user = await db.select().from(usersTable).where(eq(usersTable.id, Number(id)));
  await sql.end();

  return c.json(user[0] || {});
})

app.put("/api/users/:id", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const id = c.req.param("id");
  const body = await c.req.json();

  await db.update(usersTable).set({
    name: body.name,
    email: body.email,
    password: body.password,
  }).where(eq(usersTable.id, Number(id)));

  await sql.end();

  return c.json({ message: "Successful" });
})


app.get("/api/books", async c => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const books = await db.select().from(booksTable);
  await sql.end();

  return c.json(books);
})

app.post("/api/books", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const body = await c.req.json();

  const parsed = z.object({
    title: z.string(),
    author: z.string(),
    content: z.string().optional(),
    category: z.string(),
    publish_date: z.string(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.insert(booksTable).values(parsed.data);
  await sql.end();

  return c.json({ message: "Successful" }, 201);
})

app.get("/api/books/:id", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const id = c.req.param("id");

  const book = await db.select().from(booksTable).where(eq(booksTable.id, Number(id)));
  await sql.end();

  return c.json(book[0] || {});
})

app.put("/api/books/:id", async (c) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false
  });
  const db = drizzle(sql);
  const id = c.req.param("id");
  const body = await c.req.json();

  await db.update(booksTable).set({
    title: body.title,
    author: body.author,
    content: body.content,
    category: body.category,
    publish_date: body.publish_date,
  }).where(eq(booksTable.id, Number(id)));

  await sql.end();

  return c.json({ message: "Successful" });
})


export default app
