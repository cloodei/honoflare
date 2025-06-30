import { Context } from "hono";
import { booksTable, borrowTable, usersTable } from "../db/schema";
import { dbClient } from "../db/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";

/**
 * List all users borrowing which books with borrow date
*/
export async function listBorrows(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const borrows = await db.select({
    user_name: usersTable.name,
    book_title: booksTable.title,
    borrow_date: borrowTable.borrow_date,
  })
    .from(borrowTable)
    .innerJoin(usersTable, eq(borrowTable.user_id, usersTable.id))
    .innerJoin(booksTable, eq(borrowTable.book_id, booksTable.id));
  await sql.end();

  return c.json(borrows);
}

/**
 * Get a borrow by user ID and book ID, return an empty object if not found
*/
export async function getBorrowById(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const userId = Number(c.req.param("userId"));
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(userId) || userId > 0x7FFFFFFF || userId <= 0) {
    return c.json({ error: "Invalid User ID" }, 400);
  }

  if (isNaN(bookId) || bookId > 0x7FFFFFFF || bookId <= 0) {
    return c.json({ error: "Invalid Book ID" }, 400);
  }

  const borrow = await db.select({
    user_name: usersTable.name,
    book_title: booksTable.title,
    borrow_date: borrowTable.borrow_date,
  })
    .from(borrowTable)
    .innerJoin(usersTable, eq(borrowTable.user_id, usersTable.id))
    .innerJoin(booksTable, eq(borrowTable.book_id, booksTable.id))
    .where(and(eq(borrowTable.user_id, userId), eq(borrowTable.book_id, bookId)));
  await sql.end();

  return c.json(borrow[0] || {});
}

/**
 * List all books borrowed by user ID
*/
export async function getBorrowByUserId(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const userId = Number(c.req.param("userId"));

  if (isNaN(userId) || userId > 0x7FFFFFFF || userId <= 0) {
    return c.json({ error: "Invalid User ID" }, 400);
  }

  const borrow = await db.select({
    user_name: usersTable.name,
    book_title: booksTable.title,
    borrow_date: borrowTable.borrow_date,
  })
    .from(borrowTable)
    .innerJoin(usersTable, eq(borrowTable.user_id, usersTable.id))
    .innerJoin(booksTable, eq(borrowTable.book_id, booksTable.id))
    .where(eq(borrowTable.user_id, userId));
  await sql.end();

  return c.json(borrow);
}

/**
 * List all users borrowed book ID
*/
export async function getBorrowByBookId(c: Context) {
  const { db, sql } = await dbClient(c.env.HYPERDRIVE.connectionString);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId) || bookId > 0x7FFFFFFF || bookId <= 0) {
    return c.json({ error: "Invalid Book ID" }, 400);
  }

  const borrow = await db.select({
    user_name: usersTable.name,
    book_title: booksTable.title,
    borrow_date: borrowTable.borrow_date,
  })
    .from(borrowTable)
    .innerJoin(usersTable, eq(borrowTable.user_id, usersTable.id))
    .innerJoin(booksTable, eq(borrowTable.book_id, booksTable.id))
    .where(eq(borrowTable.book_id, bookId));
  await sql.end();

  return c.json(borrow);
}

/**
 * Create a new borrow
*/
export async function createBorrow(c: Context) {
  const [{ db, sql }, body] = await Promise.all([
    dbClient(c.env.HYPERDRIVE.connectionString),
    c.req.json()
  ]);

  const parsed = z.object({
    user_id: z.number(),
    book_id: z.number(),
    borrow_date: z.string(),
  }).safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }

  await db.insert(borrowTable).values(parsed.data);
  await sql.end();

  return c.json({ message: "Successful" }, 201);
}
