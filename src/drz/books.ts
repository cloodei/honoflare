import { z } from "zod/v4"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { Context } from "hono"
import { type Ctx } from "../ctx-types"
import { booksTable } from "../db/schema"

/**
 * List all books
*/
export async function listBooks(c: Context<Ctx, never, {}>) {
  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    const books = await db.select({
      title: booksTable.title,
      author: booksTable.author,
      content: booksTable.content,
      category: booksTable.category,
      publish_date: booksTable.publish_date,
    }).from(booksTable);

    await db.$client.end();
    return c.json(books);
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Get a book by ID, return an empty object if not found
*/
export async function getBookById(c: Context<Ctx, never, {}>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    const book = await db.select({
      title: booksTable.title,
      author: booksTable.author,
      content: booksTable.content,
      category: booksTable.category,
      publish_date: booksTable.publish_date,
    }).from(booksTable).where(eq(booksTable.id, id));

    await db.$client.end();
    return c.json(book[0] || {});
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Create a new book
*/
export async function createBook(c: Context<Ctx, never, {}>) {
  const body = await c.req.json();
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

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.insert(booksTable).values(parsed.data);
    await db.$client.end();

    return c.json({ message: "Successful" }, 201);
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Update a book by ID
*/
export async function updateBook(c: Context<Ctx, never, {}>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const body = await c.req.json();
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

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.update(booksTable).set(parsed.data).where(eq(booksTable.id, id));
    await db.$client.end();

    return c.json({ message: "Successful" });
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

/**
 * Delete a book by ID
*/
export async function deleteBook(c: Context<Ctx, never, {}>) {
  const id = Number(c.req.param("id"));
  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const db = drizzle(c.env.HYPERDRIVE.connectionString);
  try {
    await db.delete(booksTable).where(eq(booksTable.id, id));
    await db.$client.end();

    return c.json({ message: "Successful" });
  }
  catch (error) {
    await db.$client.end();
    return c.json({ error: "Internal Server Error" }, 500);
  }
}

