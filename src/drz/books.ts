import { Context } from "hono"
import { dbClient } from "../db/db"
import { booksTable } from "../db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod/v4"

/**
 * List all books
*/
export async function listBooks(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const books = await db.select().from(booksTable);
  await sql.end();

  return c.json(books);
}

/**
 * Get a book by ID, return an empty object if not found
*/
export async function getBookById(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const book = await db.select().from(booksTable).where(eq(booksTable.id, id));
  await sql.end();

  return c.json(book[0] || {});
}

/**
 * Create a new book
*/
export async function createBook(c: Context) {
  const [{ db, sql }, body] = await Promise.all([
    dbClient(c.env.HYPERDRIVE.connectionString),
    c.req.json()
  ]);

  const parsed = z.object({
    title: z.string().min(1).max(128),
    author: z.string().min(1).max(128),
    content: z.string().optional(),
    category: z.string().min(1).max(128),
    publish_date: z.string(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.insert(booksTable).values(parsed.data);
  await sql.end();

  return c.json({ message: "Successful" }, 201);
}

/**
 * Update a book by ID
*/
export async function updateBook(c: Context) {
  const [{ db, sql }, body] = await Promise.all([
    dbClient(c.env.HYPERDRIVE.connectionString),
    c.req.json()
  ]);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const parsed = z.object({
    title: z.string().min(1).max(128),
    author: z.string().min(1).max(128),
    content: z.string().optional(),
    category: z.string().min(1).max(128),
    publish_date: z.string(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.update(booksTable).set(parsed.data).where(eq(booksTable.id, id));
  await sql.end();

  return c.json({ message: "Successful" });
}

/**
 * Delete a book by ID
*/
export async function deleteBook(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  await db.delete(booksTable).where(eq(booksTable.id, id));
  await sql.end();

  return c.json({ message: "Successful" });
}

