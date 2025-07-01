import { Context } from "hono";
import { pgClient } from "../db/db";

/**
 * List all users borrowing which books with borrow date
*/
export async function listBorrows(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const borrows = await sql.query(
    'SELECT user_name, book_title, borrow_date FROM "BORROW" br ' +
    'INNER JOIN "USERS" u ON br.user_id = u.id ' +
    'INNER JOIN "BOOKS" bk ON br.book_id = bk.id'
  );

  await sql.end();
  return c.json(borrows.rows);
}

/**
 * Get a borrow by user ID and book ID, return an empty object if not found
*/
export async function getBorrowById(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);

  const userId = Number(c.req.param("userId"));
  if (isNaN(userId) || userId > 0x7FFFFFFF || userId < 0) {
    return c.json({ error: "Invalid User ID" }, 400);
  }

  const bookId = Number(c.req.param("bookId"));
  if (isNaN(bookId) || bookId > 0x7FFFFFFF || bookId < 0) {
    return c.json({ error: "Invalid Book ID" }, 400);
  }

  const borrow = await sql.query(
    'SELECT user_name, book_title, borrow_date FROM "BORROW" br ' +
    'INNER JOIN "USERS" u ON br.user_id = u.id ' +
    'INNER JOIN "BOOKS" bk ON br.book_id = bk.id ' +
    'WHERE br.user_id = $1 AND br.book_id = $2',
    [userId, bookId]
  );

  await sql.end();
  return c.json(borrow.rows[0] || {});
}

/**
 * List all users borrowed book ID
*/
export async function getBorrowByUserId(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const userId = Number(c.req.param("userId"));

  if (isNaN(userId) || userId > 0x7FFFFFFF || userId < 0) {
    return c.json({ error: "Invalid User ID" }, 400);
  }

  const borrow = await sql.query(
    'SELECT user_name, book_title, borrow_date FROM "BORROW" br ' +
    'INNER JOIN "USERS" u ON br.user_id = u.id ' +
    'INNER JOIN "BOOKS" bk ON br.book_id = bk.id ' +
    'WHERE br.user_id = $1',
    [userId]
  );

  await sql.end();
  return c.json(borrow.rows);
}

/**
 * List all books borrowed by user ID
*/
export async function getBorrowByBookId(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId) || bookId > 0x7FFFFFFF || bookId < 0) {
    return c.json({ error: "Invalid Book ID" }, 400);
  }

  const borrow = await sql.query(
    'SELECT user_name, book_title, borrow_date FROM "BORROW" br ' +
    'INNER JOIN "USERS" u ON br.user_id = u.id ' +
    'INNER JOIN "BOOKS" bk ON br.book_id = bk.id ' +
    'WHERE br.book_id = $1',
    [bookId]
  );

  await sql.end();
  return c.json(borrow.rows);
}

/**
 * Create a new borrow
*/
export async function createBorrow(c: Context) {
  const sql = await pgClient(c.env.HYPERDRIVE.connectionString);
  const body = await c.req.json();

  if (!body.user_id || !body.book_id || !body.borrow_date) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const borrow = await sql.query(
    'INSERT INTO "BORROW" (user_id, book_id, borrow_date) VALUES ($1, $2, $3) RETURNING *',
    [body.user_id, body.book_id, body.borrow_date]
  );

  await sql.end();
  return c.json(borrow.rows[0]);
}
