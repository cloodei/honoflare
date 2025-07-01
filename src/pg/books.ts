import { Context } from "hono";
import { pgClient } from "../db/db";
import { z } from "zod/v4";

/**
 * List all books
*/
export async function listBooks(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const res = await sql.query('SELECT * FROM "BOOKS"');

  await sql.end();
  return c.json(res.rows);
}

/**
 * Get a book by ID, return an empty object if not found
*/
export async function getBookById(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const book = await sql.query('SELECT * FROM "BOOKS" WHERE id = $1', [id]);
  await sql.end();

  return c.json(book.rows[0] || {});
}

/**
 * Create a new book
*/
export async function createBook(c: Context) {
  const [sql, body] = await Promise.all([
    pgClient(c.env.HYPERDRIVE.connectionString),
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

  if (parsed.data.content) {
    await sql.query(
      'INSERT INTO "BOOKS" (title, author, content, category, publish_date) VALUES ($1, $2, $3, $4, $5)',
      [parsed.data.title, parsed.data.author, parsed.data.content, parsed.data.category, parsed.data.publish_date]
    );
  }
  else {
    await sql.query(
      'INSERT INTO "BOOKS" (title, author, category, publish_date) VALUES ($1, $2, $3, $4)',
      [parsed.data.title, parsed.data.author, parsed.data.category, parsed.data.publish_date]
    );
  }

  await sql.end();
  return c.json({ message: "Successful" }, 201);
}

/**
 * Update a book by ID
*/
export async function updateBook(c: Context) {
  const [sql, body] = await Promise.all([
    pgClient(c.env.HYPERDRIVE.connectionString),
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

  if (parsed.data.content) {
    await sql.query(
      'UPDATE "BOOKS" SET title = $2, author = $3, content = $4, category = $5, publish_date = $6 WHERE id = $1',
      [id, parsed.data.title, parsed.data.author, parsed.data.content, parsed.data.category, parsed.data.publish_date]
    );
  }
  else {
    await sql.query(
      'UPDATE "BOOKS" SET title = $2, author = $3, category = $4, publish_date = $5 WHERE id = $1',
      [id, parsed.data.title, parsed.data.author, parsed.data.category, parsed.data.publish_date]
    );
  }

  await sql.end();
  return c.json({ message: "Successful" });
}

/**
 * Delete a book by ID
*/
export async function deleteBook(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const id = Number(c.req.param("id"));

  if (isNaN(id) || id > 0x7FFFFFFF || id <= 0) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  await sql.query('DELETE FROM "BOOKS" WHERE id = $1', [id]);
  await sql.end();

  return c.json({ message: "Successful" });
}
